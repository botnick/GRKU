/* Light Leak: film artefacts drawn into each recorded picture.

   Vignette   the corners darken, as through a cheap or a wide lens.
   Dust       specks and hairs, as on a scanned negative.
   Leak       light that got into the cassette: a warm wash from one side, a
              band across the frame, or a flare from a corner.
   Scratches  thin pale lines along the film, from the gate.

   Each is Off, Light, Medium, or Strong. The LOOK row chooses Custom, which
   uses the four rows, or a preset. The dust, the leak, and the scratches
   fall differently on every shot: a seed comes from the picture itself. The
   artefacts follow the upright picture, so a vertical shot gets its leak
   along its own edge. Every picture of the shot gets the same artefacts in
   its own scale, so the thumbnail matches the main picture.

   Ported from the Overlay module of kkasemsa/GRKit (MIT). */
#include "grku.h"
#include "grku_module.h"

#define LOOK_CUSTOM 1U
#define LOOK_FADED 2U
#define LOOK_DUSTY 3U
#define LOOK_LEAKY 4U
#define LOOK_EXPIRED 5U

#define BYTE(p,o) (GRKU_BYTES((p)+(o))[0])

/* The strengths of the four artefacts, 0 to 3. */
typedef struct { u32 vignette, dust, leak, scratch; } Strengths;

void leak_strengths(u32 look, Strengths *s)
{
    switch (look) {
    case LOOK_CUSTOM:
        s->vignette = setting_get(SETTING_VIGNETTE);
        s->dust = setting_get(SETTING_DUST);
        s->leak = setting_get(SETTING_LEAK);
        s->scratch = setting_get(SETTING_SCRATCH);
        break;
    case LOOK_FADED: s->vignette = 2; s->dust = 0; s->leak = 0; s->scratch = 0; break;
    case LOOK_DUSTY: s->vignette = 1; s->dust = 2; s->leak = 0; s->scratch = 1; break;
    case LOOK_LEAKY: s->vignette = 1; s->dust = 0; s->leak = 2; s->scratch = 0; break;
    case LOOK_EXPIRED: s->vignette = 2; s->dust = 2; s->leak = 1; s->scratch = 2; break;
    default: s->vignette = s->dust = s->leak = s->scratch = 0; break;
    }
}

/* ---- a view of one picture, upright ---------------------------------------- */

typedef struct {
    const Plane *p;
    u32 turns, mono;
    u32 w, h;          /* the upright size */
    u32 seed;
} View;

/* The sensor pixel of upright (u, w). */
static void sensor(const View *v, int u, int w, int *x, int *y)
{
    int L = (int)v->p->left, T = (int)v->p->top, W = (int)(v->p->right - v->p->left), H = (int)(v->p->bottom - v->p->top);
    switch (v->turns) {
    case 0: *x = L + u; *y = T + w; break;
    case 1: *x = L + w; *y = T + H - 1 - u; break;
    case 2: *x = L + W - 1 - u; *y = T + H - 1 - w; break;
    default: *x = L + W - 1 - w; *y = T + u; break;
    }
}

static u32 clamp8(int v) { return v < 0 ? 0U : v > 255 ? 255U : (u32)v; }

/* Add dy to the luma and (dcb, dcr) to the chroma of the sensor pixel. */
static void add_px(const View *v, int x, int y, int dy, int dcb, int dcr)
{
    const Plane *p = v->p;
    u32 l = p->y + (u32)y * p->pitch;
    if (x < (int)p->left || x >= (int)p->right || y < (int)p->top || y >= (int)p->bottom) return;
    BYTE(l, x) = (u8)clamp8((int)BYTE(l, x) + dy);
    if ((dcb || dcr) && !v->mono && !(x & 1) && (!p->half || !(y & 1))) {
        u32 c = chroma_row(p, (u32)y);
        BYTE(c, x) = (u8)clamp8((int)BYTE(c, x) + dcb);
        BYTE(c, x + 1) = (u8)clamp8((int)BYTE(c, x + 1) + dcr);
    }
}

/* A small random number generator, xorshift. */
static u32 next(u32 *s) { u32 x = *s; x ^= x << 13; x ^= x >> 17; x ^= x << 5; return *s = x; }
/* A random number below n. A module has no division by a variable except
   through divide(). */
static u32 rnd(u32 *s, u32 n) { u32 r = next(s) >> 8; return n ? r - divide(r, n) * n : 0; }

/* The generator of element k of a kind: its own stream, so the elements of a
   kind do not depend on how many draws an earlier one took. */
static u32 stream(u32 seed, u32 kind, u32 k)
{
    u32 s = (seed ^ kind) * 0x9e3779b1U + k * 0x85ebca77U;
    s ^= s >> 15; s *= 0x2c1b3c6dU; s ^= s >> 12;
    return s ? s : 0x6d2b79f5U;
}
/* A position along a side of n pixels from 16 random bits: the same place in
   every plane of the shot, whatever its size. */
static u32 along(u32 *rs, u32 n) { return (rnd(rs, 65536) * n) >> 16; }

/* A seed from the picture: sums of a few luma samples of the largest plane.
   The same shot gives the same seed in each of its planes only if sampled
   from one plane, so leak_apply passes it down. */
u32 leak_seed(const Plane *p)
{
    u32 s = 0x9e3779b9U, i;
    for (i = 0; i < 64; ++i) {
        u32 x = p->left + ((p->right - p->left) * (i * 37 % 64)) / 64;
        u32 y = p->top + ((p->bottom - p->top) * (i * 11 % 64)) / 64;
        s = (s ^ BYTE(p->y + y * p->pitch, x)) * 0x01000193U;
    }
    return s ? s : 1;
}

/* ---- vignette --------------------------------------------------------------- */

/* The vignette darkens by strength * d^2 / 4096 of the luma, where d is the
   distance from the centre in 1/64 of the half diagonal: full strength at the
   corners, none at the centre. Per-row and per-column squares come from
   scratch. Monochrome and colour alike. */
static void vignette(const View *v, u32 strength, u8 *scratch)
{
    const Plane *p = v->p;
    u32 W = p->right - p->left, H = p->bottom - p->top, x, y;
    u16 *dx2 = (u16 *)scratch, *dy2 = dx2 + W;
    /* d^2 in 1/4096 of the squared half diagonal, split into x and y parts.
       d^2 * 4096 does not fit 32 bits on a full-size picture (3000^2 * 4096),
       so the ratio is (d^2 * 128) / (half2 / 32). */
    u32 half2 = (W * W + H * H) / 4;
    u32 half2_32 = half2 >> 5;
    u32 k = strength == 1 ? 28 : strength == 2 ? 44 : 64;   /* darkening at the corner, in 1/100 */
    if (!half2_32) half2_32 = 1;
    for (x = 0; x < W; ++x) { int d = (int)x - (int)W / 2; dx2[x] = (u16)divide((u32)(d * d) << 7, half2_32); }
    for (y = 0; y < H; ++y) { int d = (int)y - (int)H / 2; dy2[y] = (u16)divide((u32)(d * d) << 7, half2_32); }
    for (y = 0; y < H; ++y) {
        u32 l = p->y + (p->top + y) * p->pitch + p->left;
        u32 ry = dy2[y];
        for (x = 0; x < W; ++x) {
            u32 d2 = ry + dx2[x];                  /* 0 at centre, 4096 at the corner */
            if (d2 < 900) continue;                /* a clear centre */
            d2 -= 900;
            /* smooth: (d2/3196)^1.5-ish via d2*d2 >> 12 then scale */
            u32 f = (d2 * d2) >> 12;               /* 0..~2500 */
            u32 cut = (f * k) / 2500U;             /* 0..k percent */
            if (cut > k) cut = k;
            u32 yv = BYTE(l, x);
            BYTE(l, x) = (u8)(yv - (yv * cut) / 100U);
        }
    }
}

/* ---- dust and hairs ---------------------------------------------------------- */

/* Blend the sensor pixel's luma towards `target` by alpha a (0..256): the
   scanner's dust is translucent, not ink. */
static void blend_px(const View *v, int x, int y, u32 target, u32 a)
{
    const Plane *p = v->p;
    u32 l;
    if (x < (int)p->left || x >= (int)p->right || y < (int)p->top || y >= (int)p->bottom || !a) return;
    l = p->y + (u32)y * p->pitch;
    {
        u32 yv = BYTE(l, x);
        BYTE(l, x) = (u8)(yv + (((int)target - (int)yv) * (int)a >> 8));
    }
}

/* A speck: a soft disc of radius r (in 1/4 px) at upright (u, w), full
   alpha a at the centre, fading to the edge. Dark specks are dust on the
   negative; pale ones are dust on the print. */
static void speck(const View *v, int u, int w, int r4, u32 target, u32 a)
{
    int r = (r4 + 3) / 4, du, dw, x, y;
    if (r < 1) r = 1;
    for (dw = -r; dw <= r; ++dw)
        for (du = -r; du <= r; ++du) {
            int d2 = du * du * 16 + dw * dw * 16;      /* in 1/16 px^2 */
            int r2 = r4 * r4;
            u32 f;
            if (d2 >= r2) continue;
            f = 256U - (u32)divide((u32)d2 * 256U, (u32)r2);   /* 256 at the centre, 0 at the edge */
            f = (f * f) >> 8;                              /* a soft shoulder */
            sensor(v, u + du, w + dw, &x, &y);
            blend_px(v, x, y, target, (a * f) >> 8);
        }
}

/* A hair: a thin curved fibre, pale, faint, with a slightly darker core, as
   a fibre on a scanner's glass. Its path is HAIR_POINTS points in 1/65536 of
   the upright width, drawn from `rs` alone, so it is the same curve in every
   plane of the shot; each plane draws the segments at its own scale. */
#define HAIR_POINTS 48
static void hair(const View *v, u32 *rs, u32 a, int thick)
{
    int i, x, y, k;
    /* Start, heading in 1/16 of a step, and the length of a step: 0.1% to 0.3%
       of the width, so a hair spans 5% to 15% of the frame. */
    int fu = (int)rnd(rs, 65536), fw = (int)divide(rnd(rs, 65536) * v->h, v->w ? v->w : 1);
    int vu = (int)rnd(rs, 33) - 16, vw = (int)rnd(rs, 33) - 16, ddu = (int)rnd(rs, 3) - 1, ddw = (int)rnd(rs, 3) - 1;
    int step = 64 + (int)rnd(rs, 140);
    if (vu == 0 && vw == 0) vu = 11;
    int pu = (int)(((u32)fu * v->w) >> 16), pw = (int)(((u32)fw * v->w) >> 16);
    for (i = 0; i < HAIR_POINTS; ++i) {
        vu += ddu; vw += ddw;
        if (rnd(rs, 3) == 0) { ddu = (int)rnd(rs, 3) - 1; ddw = (int)rnd(rs, 3) - 1; }
        if (vu > 16) vu = 16;
        if (vu < -16) vu = -16;
        if (vw > 16) vw = 16;
        if (vw < -16) vw = -16;
        fu += vu * step / 16; fw += vw * step / 16;
        {
            int nu = (int)(((u32)(fu < 0 ? 0 : fu) * v->w) >> 16), nw = (int)(((u32)(fw < 0 ? 0 : fw) * v->w) >> 16);
            int du = nu - pu, dw = nw - pw, n = (du < 0 ? -du : du) > (dw < 0 ? -dw : dw) ? (du < 0 ? -du : du) : (dw < 0 ? -dw : dw);
            /* The alpha wanders along the fibre: a hair is never one even line. */
            u32 ai = (a * (160U + ((u32)(i * 37) & 95U))) >> 8;
            if (fu < 0 || fw < 0) break;
            if (n < 1) n = 1;
            for (k = 0; k < n; ++k) {
                int t, cu = pu + divide((u32)(du < 0 ? -du : du) * (u32)k, (u32)n) * (du < 0 ? -1 : 1);
                int cw = pw + divide((u32)(dw < 0 ? -dw : dw) * (u32)k, (u32)n) * (dw < 0 ? -1 : 1);
                for (t = 0; t < thick; ++t) {
                    /* perpendicular offset: thicker fibres are a few pixels wide, fainter at the sides */
                    int side = t - thick / 2, px = cu + ((dw < 0 ? -dw : dw) > (du < 0 ? -du : du) ? side : 0), py = cw + ((dw < 0 ? -dw : dw) > (du < 0 ? -du : du) ? 0 : side);
                    sensor(v, px, py, &x, &y);
                    blend_px(v, x, y, 235, side == 0 ? ai : ai / 2);
                }
            }
            pu = nu; pw = nw;
        }
    }
}

static void dust(const View *v, u32 strength)
{
    u32 rs, i;
    u32 scale = v->w / 300;                        /* 1 at 300 px wide, 20 at 6000 */
    if (!scale) scale = 1;
    u32 n = (strength == 1 ? 16 : strength == 2 ? 45 : 120);
    u32 hairs = strength == 1 ? 1 : strength == 2 ? 2 : 4;
    for (i = 0; i < n; ++i) {
        rs = stream(v->seed, 0xd0d0U, i);
        int u = (int)along(&rs, v->w), w = (int)along(&rs, v->h);
        /* Mostly tiny specks; a few larger blots. Radius in 1/4 px. */
        u32 big = rnd(&rs, 10) == 0;
        int r4 = (int)(scale * (big ? 5 + rnd(&rs, 8) : 2 + rnd(&rs, 4)));
        u32 dark = rnd(&rs, 3) != 0;               /* two in three are dark */
        u32 a = 25 + rnd(&rs, 60);                 /* faint, varied */
        if (big) a = a / 2 + 10;
        speck(v, u, w, r4, dark ? 40U : 225U, a);
    }
    for (i = 0; i < hairs; ++i) {
        rs = stream(v->seed, 0x4a12U, i);
        hair(v, &rs, 35 + rnd(&rs, 45), scale >= 6 ? 3 : scale >= 3 ? 2 : 1);
    }
}

/* ---- light leak --------------------------------------------------------------- */

/* The leak: a warm wash. style 0 a wash from the left or right edge, 1 a
   vertical band, 2 a flare from a top corner. The strength sets the width
   and the brightness. Luma rises and the chroma turns orange-red. */
static void light_leak(const View *v, u32 strength)
{
    u32 rs = stream(v->seed, 0x1ea4U, 0), style = rnd(&rs, 3), side = rnd(&rs, 2);
    u32 W = v->w, H = v->h, u, w;
    int x, y;
    u32 width = (W * (strength == 1 ? 18 : strength == 2 ? 28 : 40)) / 100;
    int peak = strength == 1 ? 70 : strength == 2 ? 110 : 150;
    u32 band_at = width / 2 + along(&rs, W - width);
    u32 step = v->w >= 1200 ? 2 : 1;               /* every pixel on small planes */
    u32 period = H / 3 > 8 ? H / 3 : 8;
    for (w = 0; w < H; w += 1) {
        /* A slow ripple down the frame, so the leak is not a flat wash: a
           triangle wave of period H/3, 208 to 255 in 1/256. */
        u32 t = divide(w * 256, period) & 255, rip = t < 128 ? t : 255 - t;
        u32 gain = 208 + (rip * 48) / 128;
        for (u = 0; u < W; u += step) {
            u32 a;                                 /* 0..256 */
            if (style == 0) {
                u32 d = side ? W - 1 - u : u;
                if (d >= width) continue;
                a = 256 - divide(d * 256, width);
                a = (a * a) >> 8;
            } else if (style == 1) {
                u32 d = u > band_at ? u - band_at : band_at - u;
                if (d >= width / 2) continue;
                a = 256 - divide(d * 512, width);
            } else {
                u32 du = side ? W - 1 - u : u, dw = w;
                u32 d = du + dw;                   /* a diagonal fall-off from the corner */
                if (d >= width * 2) continue;
                a = 256 - divide(d * 128, width);
            }
            a = (a * gain) >> 8;
            {
                int dy = (peak * (int)a) >> 8;
                int dcr = (dy * 3) / 8, dcb = -(dy / 5);
                sensor(v, (int)u, (int)w, &x, &y);
                add_px(v, x, y, dy, dcb, dcr);
                if (step == 2) add_px(v, x + (v->turns & 1 ? 0 : 1), y + (v->turns & 1 ? 1 : 0), dy, dcb, dcr);
            }
        }
    }
}

/* ---- scratches ----------------------------------------------------------------- */

/* Thin lines along the long side of the film, which is the sensor's x axis in
   either posture, as the gate scratches it. Each scratch has its own count of
   random draws, in 1/65536 of the frame, so it falls the same in every plane
   of the shot: its start and length, a drift across the frame that wanders
   at SCRATCH_POINTS control points, breaks, and an alpha that rises and
   falls. Most are pale, some dark. Strength sets how many: 1-2, 2-4, 4-7. */
#define SCRATCH_POINTS 32
static void scratches(const View *v, u32 strength)
{
    const Plane *p = v->p;
    u32 W = p->right - p->left, H = p->bottom - p->top, i, k;
    u32 rs = stream(v->seed, 0x5c7aU, 0xffffU);
    u32 base = strength == 1 ? 1 : strength == 2 ? 2 : 4, n = base + rnd(&rs, base + (strength == 3 ? 0 : 1));
    u32 scale = W / 1500; if (!scale) scale = 1;
    for (i = 0; i < n; ++i) {
        rs = stream(v->seed, 0x5c7aU, i);
        /* Start and length along x, the row across, in 1/65536. A third are
           short marks, the rest run long. */
        u32 len16 = rnd(&rs, 3) == 0 ? 3000 + rnd(&rs, 9000) : 13000 + rnd(&rs, 52000);
        u32 x16 = rnd(&rs, 65536 - len16 + 1), y16 = 1500 + rnd(&rs, 62500);
        u32 thick = 1 + rnd(&rs, scale + (scale > 1)), bright = rnd(&rs, 5) != 0, a0 = 25 + rnd(&rs, 60);
        int drift[SCRATCH_POINTS + 1], gap[SCRATCH_POINTS + 1], amp[SCRATCH_POINTS + 1];
        /* The drift: a random walk with a slope, up to about 1.5% of the
           height over the scratch, in 1/65536 of the height. */
        int slope = (int)rnd(&rs, 61) - 30, walk = 0;
        for (k = 0; k <= SCRATCH_POINTS; ++k) {
            walk += (int)rnd(&rs, 31) - 15 + slope;
            drift[k] = walk;
            gap[k] = rnd(&rs, 9) == 0;                 /* a break in the scratch */
            amp[k] = 96 + (int)rnd(&rs, 161);          /* 96..256: the scratch fades in and out */
        }
        {
            u32 x0 = p->left + ((x16 * W) >> 16), len = (len16 * W) >> 16, x;
            if (len < 4) continue;
            for (x = 0; x < len && x0 + x < p->right; ++x) {
                /* The control point and the fraction to the next, in 1/256. */
                u32 at = divide(x * SCRATCH_POINTS * 256U, len), c = at >> 8, fr = at & 255U, t;
                int d, yrow;
                u32 a;
                if (c >= SCRATCH_POINTS) { c = SCRATCH_POINTS - 1; fr = 255; }
                if (gap[c]) continue;
                d = drift[c] + (((drift[c + 1] - drift[c]) * (int)fr) >> 8);
                yrow = (int)p->top + (int)((y16 * H) >> 16) + ((d * (int)H) >> 16);
                a = (a0 * (u32)(amp[c] + (((amp[c + 1] - amp[c]) * (int)fr) >> 8))) >> 8;
                /* Fade in and out at the ends. */
                if (x < len / 10) a = divide(a * x, len / 10 + 1);
                if (len - x < len / 10) a = divide(a * (len - x), len / 10 + 1);
                for (t = 0; t < thick; ++t) {
                    int yy = yrow + (int)t;
                    u32 as = thick > 1 && (t == 0 || t == thick - 1) ? a / 2 : a;
                    if (yy >= (int)p->top && yy < (int)p->bottom) {
                        u32 l = p->y + (u32)yy * p->pitch, yv = BYTE(l, x0 + x), target = bright ? 240U : 30U;
                        BYTE(l, x0 + x) = (u8)(yv + (((int)target - (int)yv) * (int)as >> 8));
                    }
                }
            }
        }
    }
}

/* ---- the filter --------------------------------------------------------------- */

void leak_plane(const Plane *p, u32 turns, u32 mono, u32 seed, const Strengths *s, u8 *scratch)
{
    View v;
    u32 W = p->right - p->left, H = p->bottom - p->top;
    v.p = p; v.turns = turns & 3; v.mono = mono; v.seed = seed;
    v.w = v.turns & 1 ? H : W;
    v.h = v.turns & 1 ? W : H;
    if (W < 16 || H < 16) return;
    if (s->leak) light_leak(&v, s->leak);
    if (s->vignette) vignette(&v, s->vignette, scratch);
    if (s->dust) dust(&v, s->dust);
    if (s->scratch) scratches(&v, s->scratch);
}

void leak_apply(PictureSet *set, u32 look)
{
    Strengths s;
    u32 i, main = 0, seed;
    if (!look || look > LOOK_EXPIRED || !set->count) return;
    leak_strengths(look, &s);
    if (!(s.vignette | s.dust | s.leak | s.scratch)) return;
    for (i = 1; i < set->count; ++i)
        if (set->planes[i].width * set->planes[i].height > set->planes[main].width * set->planes[main].height) main = i;
    seed = leak_seed(&set->planes[main]);
    for (i = 0; i < set->count; ++i)
        leak_plane(&set->planes[i], set->turns, set->mono, seed, &s, set->scratch);
}
