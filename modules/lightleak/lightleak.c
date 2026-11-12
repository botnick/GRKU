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

/* ---- light leak and bokeh ------------------------------------------------------ */

/* Light that got into the camera fogs the film from the side it came in: strongest at that edge, fading
   into the frame along a soft, smoky boundary. Through the base of a colour negative it prints warm: a
   core near white-yellow, then orange, red, and a magenta fringe; through the front, a pale streak. The
   leak adds light (a screen blend), so it never greys the picture. A lens adds ghosts: soft discs on the
   line from the light through the centre, the bokeh of the flare.

   The shape is a field of LG_W x LG_H points over the upright frame, in 1/4096, from the seed alone, so
   every plane of the shot gets the same leak; each pixel samples it bilinearly. */
#define LG_W 48U
#define LG_H 32U
#define Q 4096U

/* Value noise in [0, Q): hashed lattice values, smoothly blended. x and y in 1/Q of a lattice cell. */
static u32 lattice(u32 seed, u32 i, u32 j) { return stream(seed, 0x6e01U + i * 0x9e37U, j) >> 20; }
static u32 smooth(u32 t) { return ((((t * t) >> 12) * (3U * Q - 2U * t)) >> 12); }
static u32 noise(u32 seed, u32 x, u32 y)
{
    u32 i = x >> 12, j = y >> 12, fx = smooth(x & (Q - 1)), fy = smooth(y & (Q - 1));
    u32 a = lattice(seed, i, j), b = lattice(seed, i + 1, j), c = lattice(seed, i, j + 1), d = lattice(seed, i + 1, j + 1);
    u32 top = (a * (Q - fx) + b * fx) >> 12, bottom = (c * (Q - fx) + d * fx) >> 12;
    return (top * (Q - fy) + bottom * fy) >> 12;
}
/* The fall-off of a leak at t (0 at its source, Q at its end): a cube, so the colour gathers at the
   source and thins quickly into the frame instead of hazing it. */
static u32 falloff(u32 t) { if (t >= Q) return 0; t = Q - t; return (((t * t) >> 12) * t) >> 12; }

#define LEAK_EDGE 0
#define LEAK_CORNER 1
#define LEAK_BAND 2
#define LEAK_BURN 3
#define LEAK_STREAK 4

typedef struct {
    u32 style, side, low, gain, palette;
    u32 width;          /* in 1/Q of the width (edge, band, burn) or of the short side (corner, streak) */
    u32 at;             /* band centre, corner point, streak angle, in 1/Q */
    u32 seed;
} Leak;

/* The leak strength at upright (nx, ny), both in 1/Q of the frame; X and Y in 1/Q of the short side. */
static u32 leak_at(const Leak *k, u32 nx, u32 ny, u32 X, u32 Y, u32 W, u32 H)
{
    u32 wob = 2458U + ((noise(k->seed, (ny * 3U), 1234U) * 3277U) >> 12);   /* 0.6 .. 1.4 of the width */
    u32 grain = 2867U + ((noise(k->seed ^ 0x55U, nx * 9U, ny * 6U) * 1229U) >> 12); /* wisps, 0.7 .. 1.0 */
    u32 w = (k->width * wob) >> 12, t, d, a = 0;
    if (!w) w = 1;
    switch (k->style) {
    case LEAK_EDGE:
    case LEAK_BURN:
        d = k->side ? Q - nx : nx;
        a = falloff(divide(d * 64U, w) * 64U);
        break;
    case LEAK_BAND:
        d = nx > k->at ? nx - k->at : k->at - nx;
        a = falloff(divide(d * 128U, w) * 64U);
        break;
    case LEAK_CORNER: {
        /* From a point just outside a top corner (low: a bottom one). */
        int cx = k->side ? (int)divide(W * Q, H < W ? H : W) + 300 : -300, cy = k->low ? (int)divide(H * Q, H < W ? H : W) + 300 : -300;
        int dx = (int)X - cx, dy = (int)Y - cy;
        u32 r2 = (u32)((dx >> 4) * (dx >> 4) + (dy >> 4) * (dy >> 4)), r = 0, bit = 1U << 30;
        while (bit > r2) bit >>= 2;
        while (bit) { if (r2 >= r + bit) { r2 -= r + bit; r = (r >> 1) + bit; } else r >>= 1; bit >>= 2; }
        a = falloff(divide((r << 4) * 64U, w) * 64U);
        break;
    }
    default: {
        /* A pale streak across the frame at an angle: the distance from its line. */
        int dx = (int)X - (int)k->at, dy = (int)Y - (int)(Q / 2), slope = (int)k->side * 2 - 1;
        int dist = (dx * 3 + dy * 4 * slope) / 5;
        t = (u32)(dist < 0 ? -dist : dist);
        a = falloff(divide(t * 64U, w) * 64U);
        break;
    }
    }
    return (a * grain) >> 12;
}

/* The colour of the leak at strength a (0..Q): five stops from the fringe to the core. */
static void leak_colour(u32 palette, u32 a, int out[3])
{
    static const u8 stops[4][5][3] = {
        {{190, 20, 70}, {235, 35, 25}, {255, 85, 10}, {255, 145, 25}, {255, 215, 110}},     /* orange */
        {{140, 20, 125}, {205, 25, 100}, {250, 45, 65}, {255, 95, 75}, {255, 185, 150}},    /* magenta-red */
        {{200, 40, 35}, {245, 85, 15}, {255, 135, 15}, {255, 185, 50}, {255, 230, 150}},    /* golden */
        {{235, 225, 215}, {240, 235, 225}, {245, 240, 232}, {250, 246, 240}, {255, 252, 248}}, /* pale */
    };
    static const u16 at[5] = {0, 700, 1500, 2600, 3700};
    u32 i = 0, k;
    while (i < 3 && a > at[i + 1]) ++i;
    u32 span = at[i + 1] - at[i], f = a <= at[i] ? 0 : a >= at[i + 1] ? span : a - at[i];
    for (k = 0; k < 3; ++k)
        out[k] = (int)((stops[palette][i][k] * (span - f) + stops[palette][i + 1][k] * f) / span);
}

/* Screen colour c into the sensor pixel at amount m (0..Q), in RGB; the chroma of a pixel pair (and of
   a row pair when the plane halves it) takes the first pixel's result. */
static void screen_px(const View *v, int x, int y, const int c[3], u32 m)
{
    const Plane *p = v->p;
    u32 l = p->y + (u32)y * p->pitch;
    int Y = BYTE(l, x), cb = 0, cr = 0, rgb[3], k;
    u32 cl = 0;
    if (!v->mono) {
        cl = chroma_row(p, (u32)y) + ((u32)x & ~1U);
        cb = (int)BYTE(cl, 0) - 128; cr = (int)BYTE(cl, 1) - 128;
    }
    rgb[0] = Y + ((359 * cr) >> 8); rgb[1] = Y - ((88 * cb + 183 * cr) >> 8); rgb[2] = Y + ((454 * cb) >> 8);
    /* Fog has a colour: the pixel moves towards it (0.45 of m), then the light adds (a screen at 0.7
       of m), so a leak is warm on a bright sky too and still lifts the shadows. */
    for (k = 0; k < 3; ++k) {
        int in = (int)clamp8(rgb[k]);
        in += (int)(((c[k] - in) * (int)((m * 1843U) >> 12)) >> 12);
        in = (int)clamp8(in);
        rgb[k] = in + (int)((((u32)(255 - in) * (u32)c[k]) >> 8) * ((m * 2867U) >> 12) >> 12);
    }
    if (v->mono) {
        int cy = (77 * c[0] + 150 * c[1] + 29 * c[2]) >> 8;
        BYTE(l, x) = (u8)clamp8(Y + (int)((((u32)(255 - Y) * (u32)cy) >> 8) * m >> 12));
        return;
    }
    /* Light only adds: the tint may move the colour, never darken the pixel. */
    k = (77 * rgb[0] + 150 * rgb[1] + 29 * rgb[2]) >> 8;
    BYTE(l, x) = (u8)clamp8(k < Y ? Y : k);
    if (!(x & 1) && (!p->half || !(y & 1))) {
        BYTE(cl, 0) = (u8)clamp8(128 + ((-43 * rgb[0] - 85 * rgb[1] + 128 * rgb[2]) >> 8));
        BYTE(cl, 1) = (u8)clamp8(128 + ((128 * rgb[0] - 107 * rgb[1] - 21 * rgb[2]) >> 8));
    }
}

/* The upright pixel (u, w) of sensor pixel (x, y): the inverse of sensor(). */
static void upright(const View *v, int x, int y, int *u, int *w)
{
    int L = (int)v->p->left, T = (int)v->p->top, W = (int)(v->p->right - v->p->left), H = (int)(v->p->bottom - v->p->top);
    switch (v->turns) {
    case 0: *u = x - L; *w = y - T; break;
    case 1: *w = x - L; *u = T + H - 1 - y; break;
    case 2: *u = L + W - 1 - x; *w = T + H - 1 - y; break;
    default: *w = L + W - 1 - x; *u = y - T; break;
    }
}

static void bokeh(const View *v, const Leak *k, u32 strength);

static void light_leak(const View *v, u32 strength, u8 *scratch)
{
    const Plane *p = v->p;
    u32 rs = stream(v->seed, 0x1ea4U, 0), pick = rnd(&rs, 100), i, j;
    u32 W = v->w, H = v->h, S = W < H ? W : H;
    u16 *field = (u16 *)scratch;
    Leak k, second;
    k.seed = stream(v->seed, 0x1ea5U, 0);
    k.style = pick < 42 ? LEAK_EDGE : pick < 66 ? LEAK_CORNER : pick < 80 ? LEAK_BAND : pick < (strength >= 2 ? 92U : 86U) ? LEAK_BURN : LEAK_STREAK;
    k.side = rnd(&rs, 2); k.low = rnd(&rs, 4) == 0;
    k.palette = k.style == LEAK_STREAK ? 3 : rnd(&rs, 5) < 3 ? 0 : rnd(&rs, 3) ? 1 : 2;
    k.width = (strength == 1 ? 900U : strength == 2 ? 1300U : 1700U) + rnd(&rs, 600);
    if (k.style == LEAK_BURN) k.width = 2200U + rnd(&rs, 1100);
    if (k.style == LEAK_CORNER) k.width += k.width / 2;
    if (k.style == LEAK_STREAK) k.width = 250U + rnd(&rs, 300);
    k.at = k.style == LEAK_STREAK ? along(&rs, divide(W * Q, S)) : 700U + rnd(&rs, Q - 1400U);
    k.gain = strength == 1 ? 2400U : strength == 2 ? 3300U : 4096U;
    if (k.style == LEAK_STREAK) k.gain = k.gain * 2 / 3;
    /* Strong: a weaker leak from the other edge too. */
    second = k;
    second.style = LEAK_EDGE; second.side = !k.side; second.seed = stream(v->seed, 0x1ea6U, 0);
    second.width = k.width / 2 + 300U; second.gain = k.gain * 2 / 5;
    for (j = 0; j <= LG_H; ++j)
        for (i = 0; i <= LG_W; ++i) {
            u32 nx = divide(i * Q, LG_W), ny = divide(j * Q, LG_H);
            u32 X = divide(nx * (W >> 2), S >> 2), Y = divide(ny * (H >> 2), S >> 2);
            u32 a = (leak_at(&k, nx, ny, X, Y, W, H) * k.gain) >> 12;
            if (strength == 3) a += (leak_at(&second, nx, ny, X, Y, W, H) * second.gain) >> 12;
            field[j * (LG_W + 1) + i] = (u16)(a > Q ? Q : a);
        }
    {
        u32 x, y, kx = divide(LG_W << 16, W), ky = divide(LG_H << 16, H);
        for (y = p->top; y < p->bottom; ++y)
            for (x = p->left; x < p->right; ++x) {
                int u, w, c[3];
                upright(v, (int)x, (int)y, &u, &w);
                u32 gx = ((u32)u * kx) >> 8, gy = ((u32)w * ky) >> 8;           /* in 1/256 of a cell */
                u32 ci = gx >> 8, cj = gy >> 8, fx = gx & 255, fy = gy & 255;
                if (ci >= LG_W) { ci = LG_W - 1; fx = 255; }
                if (cj >= LG_H) { cj = LG_H - 1; fy = 255; }
                {
                    const u16 *f0 = field + cj * (LG_W + 1) + ci, *f1 = f0 + LG_W + 1;
                    if (!(f0[0] | f0[1] | f1[0] | f1[1])) continue;
                    u32 top = (f0[0] * (256 - fx) + f0[1] * fx) >> 8, bot = (f1[0] * (256 - fx) + f1[1] * fx) >> 8;
                    u32 a = (top * (256 - fy) + bot * fy) >> 8;
                    if (a < 16) continue;
                    leak_colour(k.palette, a, c);
                    screen_px(v, (int)x, (int)y, c, a);
                }
            }
    }
    bokeh(v, &k, strength);
}

/* Bokeh of the flare. Most are orbs: out-of-focus points of the leaking light, in its own colour,
   scattered near where it comes in, a few large and dim, more small and brighter. A few are ghosts: soft
   discs on the line from the light through the centre, faintly tinted by the lens coatings. Each disc is
   flat inside, a little brighter at the rim, with a soft edge, as an aperture draws it. */
static void bokeh(const View *v, const Leak *k, u32 strength)
{
    static const int tints[3][3] = {{255, 196, 120}, {170, 235, 190}, {255, 232, 205}};
    u32 rs = stream(v->seed, 0xb0ce0U, 0), n = strength == 1 ? 2 + rnd(&rs, 3) : strength == 2 ? 4 + rnd(&rs, 4) : 6 + rnd(&rs, 6), i;
    u32 W = v->w, H = v->h, S = W < H ? W : H;
    /* The source: the middle of the leak's edge, or its corner. */
    int sx = k->side ? (int)W : 0, sy = k->style == LEAK_CORNER ? (k->low ? (int)H : 0) : (int)(H / 2);
    if (k->style == LEAK_BAND || k->style == LEAK_STREAK) sx = (int)((k->at * (W >> 4)) >> 8) > (int)W ? (int)W : (int)((k->at * (W >> 4)) >> 8);
    for (i = 0; i < n; ++i) {
        u32 r2s = stream(v->seed, 0xb0ce1U, i), ghost = rnd(&r2s, 4) == 0, t, peak;
        int cx, cy, r, u, w, x, y, c[3];
        if (ghost) {
            t = 1200U + rnd(&r2s, 4000);                        /* along the line, 0.3 .. 1.27 */
            cx = sx + (int)(((int)(W / 2) - sx) * (int)t / (int)Q) + (int)along(&r2s, S / 16) - (int)(S / 32);
            cy = sy + (int)(((int)(H / 2) - sy) * (int)t / (int)Q) + (int)along(&r2s, S / 16) - (int)(S / 32);
            r = (int)(S / 40 + along(&r2s, S * 5 / 100));
            peak = (strength == 1 ? 500U : strength == 2 ? 700U : 900U) + rnd(&r2s, 500);
            for (u = 0; u < 3; ++u) c[u] = tints[rnd(&r2s, 3)][u];
        } else {
            /* Near the source: up to 0.45 of the way in, spread across the leak. */
            u32 size = rnd(&r2s, 8);
            t = rnd(&r2s, 1850);
            cx = sx + (int)(((int)(W / 2) - sx) * (int)t / (int)Q);
            cy = sy + (int)(((int)(H / 2) - sy) * (int)t / (int)Q);
            if (k->style == LEAK_CORNER) { cx += (int)along(&r2s, S / 3) - (int)(S / 6); cy += (int)along(&r2s, S / 3) - (int)(S / 6); }
            else cy = (int)along(&r2s, H);
            /* Big and dim, or small and bright. */
            r = size < 2 ? (int)(S / 14 + along(&r2s, S / 14)) : (int)(S / 70 + along(&r2s, S / 28));
            peak = (strength == 1 ? 900U : strength == 2 ? 1300U : 1700U) + rnd(&r2s, 900);
            if (size < 2) peak = peak / 2;
            leak_colour(k->palette, 2200U + rnd(&r2s, 1600), c);
        }
        {
            int r2 = r * r, edge = r + r / 10 + 1;
            if (r < 2) continue;
            for (w = cy - edge; w <= cy + edge; ++w) {
                if (w < 0 || w >= (int)H) continue;
                for (u = cx - edge; u <= cx + edge; ++u) {
                    int du = u - cx, dw = w - cy, d2 = du * du + dw * dw;
                    u32 m;
                    if (u < 0 || u >= (int)W || d2 > edge * edge) continue;
                    /* 0.7 of the peak inside, the full peak at the rim, then a soft edge. */
                    if (d2 <= r2 * 64 / 100) m = peak * 7 / 10;
                    else if (d2 <= r2) m = peak * 7 / 10 + (u32)divide((u32)(d2 - r2 * 64 / 100) * (peak * 3 / 10), (u32)(r2 * 36 / 100 + 1));
                    else m = (u32)divide((u32)(edge * edge - d2) * peak, (u32)(edge * edge - r2 + 1));
                    sensor(v, u, w, &x, &y);
                    if (x < (int)v->p->left || x >= (int)v->p->right || y < (int)v->p->top || y >= (int)v->p->bottom) continue;
                    screen_px(v, x, y, c, m);
                }
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
    if (s->leak) light_leak(&v, s->leak, scratch);
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
