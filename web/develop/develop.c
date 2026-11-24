/* The core of the browser build of the GRKU picture modules: what the camera
   core gives a module (settings, the time and the shot of the picture, the
   scratch), the memory of the planes, and the pixel work around the modules
   (src/develop/develop.worker.ts):

   - dev_color8 / dev_color16: the film look of a strip of pixels, as the
     camera records it: 8-bit RGB of a JPEG through the look table that
     src/develop/look.ts builds (the Standard development undone, then the
     preview table of the look), or 16-bit linear RGB of a RAW photo through
     the preview table itself, then 4:2:2 YCbCr, BT.601 full range, as the
     camera's JPEG holds it;
   - dev_screennail: the 720-pixel screennail, on which Glow and Diffusion find
     the lights;
   - dev_downscale, dev_blend, dev_rgba: smaller pictures, the credit line,
     and RGBA pixels for the screen.

   The planes keep the stored (sensor) orientation of the picture, with
   `turns` quarter turns to show it upright, as on the camera. */
#include "develop.h"

/* ---- memory --------------------------------------------------------------- */

extern unsigned char __heap_base;
static u32 heap_top;

/* `bytes` more bytes of memory, 16-byte aligned, or 0 when the browser gives
   no more. dev_free returns all of it for the next picture. */
__attribute__((export_name("dev_alloc"))) u32 dev_alloc(u32 bytes)
{
    if (!heap_top) heap_top = (u32)&__heap_base;
    u32 at = (heap_top + 15U) & ~15U, end = at + bytes;
    if (end < at) return 0;
    u32 have = (u32)__builtin_wasm_memory_size(0) * 65536U;
    if (end > have && __builtin_wasm_memory_grow(0, (end - have + 65535U) / 65536U) == (__SIZE_TYPE__)-1) return 0;
    heap_top = end;
    return at;
}

__attribute__((export_name("dev_free"))) void dev_free(void) { heap_top = 0; }

/* ---- the core of the modules ------------------------------------------------ */

static u32 settings[DEVELOP_SETTINGS];
static u8 scratch[GRKU_PLANE_SCRATCH] __attribute__((aligned(16)));
PictureSet develop_set;
static GrkuDateTime now = {2026, 1, 1, 12, 0, 0, 0};
static GrkuShot shot;
static u8 white[3] = {255, 255, 255};

/* Setting k of each module is handle DEVELOP_SETTING_BASE + k. The used
   settings (CORE.GRAIN, CORE.GRAIN_SIZE of Grain) have handles of their own
   above them; the glue gives their values as arguments. */
const GrkuContext grku_self = {DEVELOP_SETTING_BASE, DEVELOP_SETTINGS - DEVELOP_SETTING_BASE - 4U, 0, {DEVELOP_SETTINGS - 4U, DEVELOP_SETTINGS - 3U}};

u32 setting_get(u32 handle) { return handle < DEVELOP_SETTINGS ? settings[handle] : 0; }
void setting_set(u32 handle, u32 value)
{
    if (handle < DEVELOP_SETTINGS) settings[handle] = value;
}
void local_time(GrkuDateTime *out) { *out = now; }
u32 divide(u32 n, u32 d) { return d ? n / d : 0; }
void picture_white(const PictureSet *set, u8 out[3])
{
    (void)set;
    out[0] = white[0];
    out[1] = white[1];
    out[2] = white[2];
}
void picture_shot(const PictureSet *set, GrkuShot *out)
{
    u32 size = out->size < sizeof(GrkuShot) ? out->size : sizeof(GrkuShot);
    (void)set;
    if (size < 8) return;
    GrkuShot copy = shot;
    copy.size = size;
    __builtin_memcpy(out, &copy, size);
}

/* The time of the picture (the date of Date Imprint), from its EXIF. */
__attribute__((export_name("dev_time"))) void dev_time(u32 year, u32 month, u32 day, u32 hour, u32 minute, u32 second)
{
    now = (GrkuDateTime){(u16)year, (u8)month, (u8)day, (u8)hour, (u8)minute, (u8)second, 0};
}

/* The shot of the picture from its EXIF: ISO, the f-number x 10, the
   exposure time in microseconds, and the APEX values in 1/256 EV. `known` 0
   tells that the picture has none. */
__attribute__((export_name("dev_shot"))) void dev_shot(u32 known, u32 iso, u32 f_number, u32 exposure_us, s32 av, s32 tv, s32 sv, s32 scene_ev)
{
    __builtin_memset(&shot, 0, sizeof shot);
    shot.size = sizeof shot;
    if (!known) return;
    shot.known = GRKU_SHOT_EXPOSURE | GRKU_SHOT_TAKEN;
    shot.iso = (u16)iso;
    shot.f_number = (u16)f_number;
    shot.exposure_us = exposure_us;
    shot.av = av;
    shot.tv = tv;
    shot.sv = sv;
    shot.scene_ev = scene_ev;
    shot.taken = now;
}

/* The white of the look (picture_white): its output for input white. */
__attribute__((export_name("dev_white"))) void dev_white(u32 r, u32 g, u32 b)
{
    white[0] = (u8)r;
    white[1] = (u8)g;
    white[2] = (u8)b;
}

/* The picture set of the next module calls: the main plane w x h at y (luma)
   and c (CbCr, 4:2:2, pitch w), and the screennail sw x sh (none for sy 0). */
__attribute__((export_name("dev_set"))) PictureSet *dev_set(u32 y, u32 c, u32 w, u32 h, u32 sy, u32 sc, u32 sw, u32 sh, u32 turns, u32 mono)
{
    __builtin_memset(&develop_set, 0, sizeof develop_set);
    develop_set.planes[0] = (Plane){y, c, w, h, w, 0, 0, 0, w, h};
    develop_set.count = 1;
    if (sy) {
        develop_set.planes[1] = (Plane){sy, sc, sw, sh, sw, 0, 0, 0, sw, sh};
        develop_set.count = 2;
    }
    develop_set.scratch = scratch;
    develop_set.turns = turns & 3U;
    develop_set.mono = mono;
    return &develop_set;
}

/* ---- pixels ----------------------------------------------------------------- */

static inline u8 clamp8(int v) { return v < 0 ? 0 : v > 255 ? 255 : (u8)v; }

/* One pair of RGB pixels into a pair of luma samples and their CbCr, as the
   camera's JPEG (and landing-render.c): BT.601, full range. */
static inline void pair_ycc(const int *a, const int *b, u8 *luma, u8 *cbcr)
{
    luma[0] = clamp8((77 * a[0] + 150 * a[1] + 29 * a[2] + 128) >> 8);
    luma[1] = clamp8((77 * b[0] + 150 * b[1] + 29 * b[2] + 128) >> 8);
    int cb = -43 * a[0] - 85 * a[1] + 128 * a[2] + -43 * b[0] - 85 * b[1] + 128 * b[2];
    int cr = 128 * a[0] - 107 * a[1] - 21 * a[2] + 128 * b[0] - 107 * b[1] - 21 * b[2];
    cbcr[0] = clamp8(128 + ((cb / 2 + 128) >> 8));
    cbcr[1] = clamp8(128 + ((cr / 2 + 128) >> 8));
}

/* The look of 8-bit RGB: `lut` holds n x n x n RGB entries, red fastest, each
   the output x 256 for the input (r, g, b) x 255 / (n - 1). Trilinear. */
static inline void look8(const u16 *lut, u32 n, u32 r, u32 g, u32 b, int *out)
{
    /* The grid position of each level in 1/65536: level x (n - 1) / 255. */
    u32 pr = r * (n - 1U) * 257U, pg = g * (n - 1U) * 257U, pb = b * (n - 1U) * 257U;
    u32 ir = pr >> 16, ig = pg >> 16, ib = pb >> 16;
    if (ir > n - 2U) ir = n - 2U;
    if (ig > n - 2U) ig = n - 2U;
    if (ib > n - 2U) ib = n - 2U;
    float fr = (float)(pr - (ir << 16)) * (1.0f / 65536.0f), fg = (float)(pg - (ig << 16)) * (1.0f / 65536.0f),
          fb = (float)(pb - (ib << 16)) * (1.0f / 65536.0f);
    u32 sg = n * 3U, sb = n * n * 3U;
    const u16 *t = lut + ir * 3U + ig * sg + ib * sb;
    for (u32 c = 0; c < 3; ++c) {
        const u16 *q = t + c;
        float c00 = q[0] + (q[3] - (float)q[0]) * fr;
        float c10 = q[sg] + (q[sg + 3] - (float)q[sg]) * fr;
        float c01 = q[sb] + (q[sb + 3] - (float)q[sb]) * fr;
        float c11 = q[sb + sg] + (q[sb + sg + 3] - (float)q[sb + sg]) * fr;
        float c0 = c00 + (c10 - c00) * fg, c1 = c01 + (c11 - c01) * fg;
        int v = (int)((c0 + (c1 - c0) * fb) * (1.0f / 256.0f) + 0.5f);
        out[c] = v < 0 ? 0 : v > 255 ? 255 : v;
    }
}

/* Rows `top` to `top` + rows - 1 of the main plane from RGBA pixels of its
   width, through the look table `lut` (look8). */
__attribute__((export_name("dev_color8"))) void dev_color8(const u8 *rgba, u32 top, u32 rows, const u16 *lut, u32 n)
{
    const Plane *p = &develop_set.planes[0];
    for (u32 y = 0; y < rows; ++y) {
        const u8 *src = rgba + (u32)y * p->width * 4U;
        u8 *luma = (u8 *)(p->y + (top + y) * p->pitch), *cbcr = (u8 *)(p->c + (top + y) * p->pitch);
        for (u32 x = 0; x + 1U < p->width; x += 2U) {
            int a[3], b[3];
            look8(lut, n, src[0], src[1], src[2], a);
            look8(lut, n, src[4], src[5], src[6], b);
            pair_ycc(a, b, luma + x, cbcr + x);
            src += 8;
        }
    }
}

/* The same from 16-bit linear RGB (a RAW development) through a preview
   table of the site: `size` points on each axis, red fastest, 8-bit, over
   the sRGB coordinate of each level, whose grid index and weight `low` and
   `weight` give for each of the 65536 levels (preview/lut.ts). As
   applyLinearLut: the result rounds half to even, as a Uint8ClampedArray. */
__attribute__((export_name("dev_color16"))) void dev_color16(const u16 *rgb, u32 top, u32 rows, const u8 *table, u32 size, const u16 *low, const float *weight)
{
    const Plane *p = &develop_set.planes[0];
    u32 s1 = size * 3U, s2 = size * size * 3U;
    for (u32 y = 0; y < rows; ++y) {
        const u16 *src = rgb + (u32)y * p->width * 3U;
        u8 *luma = (u8 *)(p->y + (top + y) * p->pitch), *cbcr = (u8 *)(p->c + (top + y) * p->pitch);
        for (u32 x = 0; x + 1U < p->width; x += 2U) {
            int px[2][3];
            for (u32 k = 0; k < 2; ++k, src += 3) {
                u32 r = src[0], g = src[1], b = src[2];
                double fr = weight[r], fg = weight[g], fb = weight[b];
                const u8 *t = table + low[r] * 3U + low[g] * s1 + low[b] * s2;
                for (u32 c = 0; c < 3; ++c) {
                    const u8 *q = t + c;
                    double c00 = q[0] + (q[3] - q[0]) * fr;
                    double c10 = q[s1] + (q[s1 + 3] - q[s1]) * fr;
                    double c01 = q[s2] + (q[s2 + 3] - q[s2]) * fr;
                    double c11 = q[s2 + s1] + (q[s2 + s1 + 3] - q[s2 + s1]) * fr;
                    double c0 = c00 + (c10 - c00) * fg, c1 = c01 + (c11 - c01) * fg;
                    double v = __builtin_rint(c0 + (c1 - c0) * fb);
                    px[k][c] = v < 0 ? 0 : v > 255 ? 255 : (int)v;
                }
            }
            pair_ycc(px[0], px[1], luma + x, cbcr + x);
        }
    }
}

/* The screennail (plane 1) from the main plane (plane 0): the mean of the
   main pixels under each of its pixels, luma per pixel and chroma per pair,
   as the promo renders and landing-render.c make it. */
__attribute__((export_name("dev_screennail"))) void dev_screennail(void)
{
    const Plane *m = &develop_set.planes[0], *s = &develop_set.planes[1];
    if (develop_set.count < 2) return;
    u32 w = m->width, h = m->height, sw = s->width, sh = s->height;
    for (u32 y = 0; y < sh; ++y)
        for (u32 x = 0; x + 1U < sw; x += 2U) {
            u32 x0 = x * w / sw, x1 = (x + 2U) * w / sw, y0 = y * h / sh, y1 = (y + 1U) * h / sh;
            u32 xm = (x + 1U) * w / sw;
            u32 l0 = 0, l1 = 0, cb = 0, cr = 0, n0 = 0, n1 = 0, nc = 0;
            if (y1 <= y0) y1 = y0 + 1U;
            for (u32 yy = y0; yy < y1; ++yy) {
                const u8 *row = (const u8 *)(m->y + yy * m->pitch), *crow = (const u8 *)(m->c + yy * m->pitch);
                for (u32 xx = x0; xx < x1; ++xx) {
                    if (xx < xm) { l0 += row[xx]; ++n0; } else { l1 += row[xx]; ++n1; }
                }
                for (u32 xx = x0 & ~1U; xx < x1; xx += 2U) {
                    cb += crow[xx];
                    cr += crow[xx + 1U];
                    ++nc;
                }
            }
            if (!n0) n0 = 1;
            if (!n1) { l1 = l0; n1 = n0; }
            if (!nc) nc = 1;
            ((u8 *)(s->y + y * s->pitch))[x] = (u8)((2U * l0 + n0) / (2U * n0));
            ((u8 *)(s->y + y * s->pitch))[x + 1U] = (u8)((2U * l1 + n1) / (2U * n1));
            ((u8 *)(s->c + y * s->pitch))[x] = (u8)((2U * cb + nc) / (2U * nc));
            ((u8 *)(s->c + y * s->pitch))[x + 1U] = (u8)((2U * cr + nc) / (2U * nc));
        }
}

/* One channel of `sw` x `sh` samples, `ss` bytes apart and rows `sp` bytes
   apart, area-resampled to `dw` x `dh` samples `ds` bytes apart, rows `dp`
   apart. `acc` holds dw floats. */
static void resample(const u8 *src, u32 sw, u32 sh, u32 ss, u32 sp, u8 *dst, u32 dw, u32 dh, u32 ds, u32 dp, float *acc)
{
    float fx = (float)sw / (float)dw, fy = (float)sh / (float)dh;
    for (u32 y = 0; y < dh; ++y) {
        float top = (float)y * fy, bottom = top + fy;
        u32 y0 = (u32)top, y1 = (u32)bottom;
        if (y1 >= sh) y1 = sh - 1U;
        for (u32 x = 0; x < dw; ++x) acc[x] = 0;
        float total = 0;
        for (u32 yy = y0; yy <= y1; ++yy) {
            float wy = (yy + 1U < bottom ? (float)(yy + 1U) : bottom) - (yy > top ? (float)yy : top);
            if (wy <= 0) continue;
            total += wy;
            const u8 *row = src + yy * sp;
            for (u32 x = 0; x < dw; ++x) {
                float left = (float)x * fx, right = left + fx, sum = 0;
                u32 x0 = (u32)left, x1 = (u32)right;
                if (x1 >= sw) x1 = sw - 1U;
                for (u32 xx = x0; xx <= x1; ++xx) {
                    float wx = (xx + 1U < right ? (float)(xx + 1U) : right) - (xx > left ? (float)xx : left);
                    if (wx > 0) sum += wx * row[xx * ss];
                }
                acc[x] += wy * sum;
            }
        }
        float scale = 1.0f / (total * fx);
        u8 *out = dst + y * dp;
        for (u32 x = 0; x < dw; ++x) out[x * ds] = clamp8((int)(acc[x] * scale + 0.5f));
    }
}

/* The main plane, area-resampled to dw x dh samples (dw even) at y (luma) and c (CbCr), rows
   `pitch` bytes apart. */
__attribute__((export_name("dev_downscale"))) void dev_downscale(u32 y, u32 c, u32 dw, u32 dh, u32 pitch, float *acc)
{
    const Plane *p = &develop_set.planes[0];
    resample((const u8 *)p->y, p->width, p->height, 1U, p->pitch, (u8 *)y, dw, dh, 1U, pitch, acc);
    resample((const u8 *)p->c, p->width / 2U, p->height, 2U, p->pitch, (u8 *)c, dw / 2U, dh, 2U, pitch, acc);
    resample((const u8 *)p->c + 1, p->width / 2U, p->height, 2U, p->pitch, (u8 *)c + 1, dw / 2U, dh, 2U, pitch, acc);
}

/* RGBA pixels of bw x bh over the main plane at (left, top), blended by
   their alpha (the credit line). left is even. */
__attribute__((export_name("dev_blend"))) void dev_blend(const u8 *rgba, u32 bw, u32 bh, u32 left, u32 top)
{
    const Plane *p = &develop_set.planes[0];
    for (u32 y = 0; y < bh && top + y < p->height; ++y) {
        u8 *luma = (u8 *)(p->y + (top + y) * p->pitch), *cbcr = (u8 *)(p->c + (top + y) * p->pitch);
        for (u32 x = 0; x + 1U < bw && left + x + 1U < p->width; x += 2U) {
            const u8 *a = rgba + (y * bw + x) * 4U, *b = a + 4;
            u32 wa = a[3], wb = b[3];
            if (!(wa | wb)) continue;
            int pa[3] = {a[0], a[1], a[2]}, pb[3] = {b[0], b[1], b[2]};
            u8 ly[2], lc[2];
            pair_ycc(pa, pb, ly, lc);
            u8 *at = luma + left + x, *ac = cbcr + left + x;
            at[0] = (u8)((at[0] * (255U - wa) + ly[0] * wa + 127U) / 255U);
            at[1] = (u8)((at[1] * (255U - wb) + ly[1] * wb + 127U) / 255U);
            u32 wc = (wa + wb) / 2U;
            ac[0] = (u8)((ac[0] * (255U - wc) + lc[0] * wc + 127U) / 255U);
            ac[1] = (u8)((ac[1] * (255U - wc) + lc[1] * wc + 127U) / 255U);
        }
    }
}

/* RGBA pixels of the main plane for the screen, upright (turned `turns`
   quarter turns clockwise), inside a border of `margin` (left, top, right,
   bottom of the stored picture) in the luma `border` (255 white, 0 black).
   The chroma between two pairs is their mean, as a JPEG decoder makes it. */
__attribute__((export_name("dev_rgba"))) void dev_rgba(u8 *out, u32 turns, const u32 *margin, u32 border)
{
    const Plane *p = &develop_set.planes[0];
    u32 w = p->width, h = p->height;
    u32 cw = w + margin[0] + margin[2], ch = h + margin[1] + margin[3];
    u32 ow = turns & 1U ? ch : cw;
    for (u32 y = 0; y < ch; ++y)
        for (u32 x = 0; x < cw; ++x) {
            u32 ox, oy;
            switch (turns & 3U) {
            case 1: ox = ch - 1U - y; oy = x; break;
            case 2: ox = cw - 1U - x; oy = ch - 1U - y; break;
            case 3: ox = y; oy = cw - 1U - x; break;
            default: ox = x; oy = y;
            }
            u8 *o = out + (oy * ow + ox) * 4U;
            o[3] = 255;
            if (x < margin[0] || y < margin[1] || x >= margin[0] + w || y >= margin[1] + h) {
                o[0] = o[1] = o[2] = (u8)border;
                continue;
            }
            u32 px = x - margin[0], py = y - margin[1], q = px & ~1U;
            const u8 *crow = (const u8 *)(p->c + py * p->pitch);
            int cb = crow[q] - 128, cr = crow[q + 1U] - 128;
            if ((px & 1U) && q + 2U < w) {
                cb = (cb + crow[q + 2U] - 128) / 2;
                cr = (cr + crow[q + 3U] - 128) / 2;
            }
            int l = ((const u8 *)(p->y + py * p->pitch))[px];
            o[0] = clamp8(l + ((359 * cr + 128) >> 8));
            o[1] = clamp8(l - ((88 * cb + 183 * cr + 128) >> 8));
            o[2] = clamp8(l + ((454 * cb + 128) >> 8));
        }
}
