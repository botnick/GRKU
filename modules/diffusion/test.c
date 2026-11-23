/* The host test of Diffusion (grku module test): a light on a dark picture. */
#include <assert.h>
#include "grku_module.h"

void diffusion_apply(PictureSet *set, u32 strength);
void softness_apply(PictureSet *set, u32 level);
u32 diffusion_grid_shift(u32 width, u32 height);

/* A 4:2:2 plane of w x h: luma rows, then interleaved CbCr rows of the same
   pitch, dark grey with a disc of colour (y, cb, cr) of radius r at (cx, cy). */
static Plane scene(u32 w, u32 h, u32 cx, u32 cy, u32 r, u8 y, u8 cb, u8 cr)
{
    Plane p = {GRKU_TEST_PLANES, GRKU_TEST_PLANES + w * h, w, h, w, 0, 0, 0, w, h};
    for (u32 j = 0; j < h; ++j)
        for (u32 i = 0; i < w; ++i) {
            int dx = (int)i - (int)cx, dy = (int)j - (int)cy;
            u32 in = (u32)(dx * dx + dy * dy) <= r * r;
            GRKU_BYTES(p.y + j * w + i)[0] = in ? y : 20;
            GRKU_BYTES(p.c + j * w + (i & ~1U))[0] = in ? cb : 128;
            GRKU_BYTES(p.c + j * w + (i & ~1U) + 1)[0] = in ? cr : 128;
        }
    return p;
}
static u32 luma(const Plane *p, u32 x, u32 y) { return GRKU_BYTES(p->y + y * p->pitch + x)[0]; }
static u32 cb_at(const Plane *p, u32 x, u32 y) { return GRKU_BYTES(p->c + y * p->pitch + (x & ~1U))[0]; }
static u32 cr_at(const Plane *p, u32 x, u32 y) { return GRKU_BYTES(p->c + y * p->pitch + (x & ~1U) + 1)[0]; }

static PictureSet one(Plane p, u32 mono)
{
    PictureSet set = {{p}, 1, 0, mono, grku_test_scratch, 0};
    return set;
}

/* Film Softness works on pictures with a long side of 1600 pixels or more.
   A 4:2:2 plane of 1800 x 120: luma `at(x)` of each column, chroma (cb, cr)
   left of `split` and neutral from it. */
#define SOFT_W 1800U
#define SOFT_H 120U
static Plane soft_scene(u8 (*at)(u32 x), u32 split, u8 cb, u8 cr)
{
    Plane p = {GRKU_TEST_PLANES, GRKU_TEST_PLANES + SOFT_W * SOFT_H, SOFT_W, SOFT_H, SOFT_W, 0, 0, 0, SOFT_W, SOFT_H};
    for (u32 j = 0; j < SOFT_H; ++j)
        for (u32 i = 0; i < SOFT_W; ++i) {
            GRKU_BYTES(p.y + j * SOFT_W + i)[0] = at(i);
            GRKU_BYTES(p.c + j * SOFT_W + (i & ~1U))[0] = i < split ? cb : 128;
            GRKU_BYTES(p.c + j * SOFT_W + (i & ~1U) + 1)[0] = i < split ? cr : 128;
        }
    return p;
}
static u8 flat(u32 x) { (void)x; return 120; }
static u8 stripes(u32 x) { return x & 1U ? 200 : 60; }
static u8 faint(u32 x) { return x & 1U ? 131 : 128; }
static u8 step(u32 x) { return x < 900U ? 40 : 220; }

/* The softness tests: Off, then each level. */
static void test_softness(void)
{
    /* A flat picture stays as it was, luma and chroma. */
    for (u32 level = 1; level <= 3; ++level) {
        Plane p = soft_scene(flat, SOFT_W, 100, 160);
        PictureSet set = one(p, 0);
        softness_apply(&set, level);
        for (u32 y = 0; y < SOFT_H; y += 7)
            for (u32 x = 0; x < SOFT_W; x += 13)
                assert(luma(&p, x, y) == 120 && cb_at(&p, x, y) == 100 && cr_at(&p, x, y) == 160);
    }

    /* Detail one pixel wide fades, more with each level, and the dark lines
       rise more than the light ones fall. */
    {
        int swing[4] = {140, 0, 0, 0};
        for (u32 level = 1; level <= 3; ++level) {
            Plane p = soft_scene(stripes, 0, 128, 128);
            PictureSet set = one(p, 0);
            int dark, light;
            softness_apply(&set, level);
            dark = (int)luma(&p, 900, 60);
            light = (int)luma(&p, 901, 60);
            swing[level] = light - dark;
            assert(dark - 60 > 200 - light);
        }
        assert(swing[1] < swing[0] && swing[2] < swing[1] && swing[3] < swing[2] && swing[1] > 40);
    }

    /* Faint texture, such as grain, keeps its bite. */
    for (u32 level = 1; level <= 3; ++level) {
        Plane p = soft_scene(faint, 0, 128, 128);
        PictureSet set = one(p, 0);
        softness_apply(&set, level);
        for (u32 x = 896; x < 904; ++x) assert(luma(&p, x, 60) == faint(x));
    }

    /* A bright edge spreads into its dark side more than the dark eats into
       the light: highlights roll off at their edges. */
    {
        Plane p = soft_scene(step, 0, 128, 128);
        PictureSet set = one(p, 0);
        softness_apply(&set, 2);
        assert(luma(&p, 899, 60) > 40 + 10 && luma(&p, 900, 60) < 220);
        assert((int)luma(&p, 899, 60) - 40 > 220 - (int)luma(&p, 900, 60));
        assert(luma(&p, 880, 60) == 40 && luma(&p, 920, 60) == 220);
    }

    /* A colour edge softens on a colour picture; a monochrome picture keeps
       its chroma. */
    {
        Plane p = soft_scene(flat, 900, 60, 200);
        PictureSet set = one(p, 0);
        softness_apply(&set, 2);
        assert(cr_at(&p, 898, 60) < 200 && cr_at(&p, 900, 60) > 128);
        assert(cr_at(&p, 880, 60) == 200 && cr_at(&p, 920, 60) == 128);
        p = soft_scene(stripes, 900, 60, 200);
        set = one(p, 1);
        softness_apply(&set, 2);
        assert(luma(&p, 901, 60) < 200);
        assert(cr_at(&p, 898, 60) == 200 && cr_at(&p, 900, 60) == 128);
    }

    /* Only the visible area changes, and its edges repeat. */
    {
        Plane p = soft_scene(stripes, 0, 128, 128);
        PictureSet set;
        p.left = 100;
        p.top = 10;
        p.bottom = SOFT_H - 10;
        set = one(p, 0);
        softness_apply(&set, 3);
        for (u32 x = 90; x < 100; ++x) assert(luma(&p, x, 60) == stripes(x));
        assert(luma(&p, 300, 5) == stripes(300) && luma(&p, 300, SOFT_H - 5) == stripes(300));
        assert(luma(&p, 101, 10) < 200 && luma(&p, 101, SOFT_H - 11) < 200);
    }

    /* A screennail stays as it was: at its size the softness does not show. */
    {
        Plane p = scene(720, 480, 360, 240, 4, 255, 128, 128);
        PictureSet set = one(p, 0);
        softness_apply(&set, 3);
        assert(luma(&p, 360, 240) == 255 && luma(&p, 366, 240) == 20);
    }

    /* The core gates each filter by its own setting: Softness runs with the
       diffusion strength Off. */
    {
        u32 filters = 0, soft = 0;
        for (u32 i = 0; i < grku_module.registration_count; ++i) {
            const GrkuRegistration *r = &grku_module.registrations[i];
            const GrkuPlaneFilter *f;
            if (r->point != GRKU_POINT_PICTURE_PLANE) continue;
            f = r->impl;
            ++filters;
            assert(f->stage == GRKU_STAGE_FRAME);
            if (f->apply == softness_apply) {
                assert(GRKU_SETTING(f->setting) == SETTING_SOFTNESS);
                ++soft;
            } else {
                assert(f->apply == diffusion_apply && GRKU_SETTING(f->setting) == SETTING_STRENGTH);
                assert(!soft); /* the glow of the filter comes first */
            }
        }
        assert(filters == 2 && soft == 1);
    }
}

int main(void)
{
    /* The descriptor: STRENGTH (4 values), MIST (3), STREAK (3), and
       SOFTNESS (4) in the order that the state file keeps, a group page,
       and two filters. */
    assert(grku_module.setting_count == 4 && grku_module.settings[0].values == 4 &&
           grku_module.settings[1].values == 3 && grku_module.settings[2].values == 3 &&
           grku_module.settings[3].values == 4 && grku_module.settings[3].default_value == 0);
    assert(grku_module.tile_count == 9);
    assert(SETTING_STRENGTH == GRKU_SETTING(0) && SETTING_MIST == GRKU_SETTING(1) &&
           SETTING_STREAK == GRKU_SETTING(2) && SETTING_SOFTNESS == GRKU_SETTING(3));

    /* The grids of the GR III pictures fit the scratch memory: 24 MP in cells
       of 32 pixels, the screennail in 16, the thumbnail in single pixels. */
    assert(diffusion_grid_shift(6000, 4000) == 5 && diffusion_grid_shift(4000, 6000) == 5);
    assert(diffusion_grid_shift(1620, 1080) == 4 && diffusion_grid_shift(160, 120) == 0);

    /* A white light glows: brighter around it, the light stays white, the far
       corner stays as it was, and a stronger setting glows more. */
    {
        u32 near[4] = {0};
        for (u32 s = 1; s <= 3; ++s) {
            Plane p = scene(600, 400, 300, 200, 6, 255, 128, 128);
            PictureSet set = one(p, 0);
            diffusion_apply(&set, s);
            near[s] = luma(&p, 320, 200);
            assert(luma(&p, 300, 200) == 255);
            assert(luma(&p, 5, 5) == 20 && luma(&p, 595, 395) == 20);
            /* A white light gives a neutral glow. */
            assert(cb_at(&p, 320, 200) >= 126 && cb_at(&p, 320, 200) <= 130);
            assert(cr_at(&p, 320, 200) >= 126 && cr_at(&p, 320, 200) <= 130);
        }
        assert(near[1] > 24 && near[1] < near[2] && near[2] < near[3]);
    }

    /* An orange lamp glows orange: Cr up and Cb down around it. */
    {
        Plane p = scene(600, 400, 300, 200, 8, 180, 60, 200);
        PictureSet set = one(p, 0);
        diffusion_apply(&set, 3);
        assert(luma(&p, 322, 200) > 30);
        assert(cr_at(&p, 322, 200) > 132 && cb_at(&p, 322, 200) < 124);
    }

    /* A monochrome picture glows and streaks in luma only. */
    {
        Plane p = scene(600, 400, 300, 200, 6, 255, 128, 128);
        PictureSet set = one(p, 1);
        grku_test_settings[SETTING_STREAK] = 1;
        diffusion_apply(&set, 2);
        assert(luma(&p, 320, 200) > 24);
        for (u32 x = 280; x < 340; ++x) assert(cb_at(&p, x, 200) == 128 && cr_at(&p, x, 200) == 128);
        grku_test_settings[SETTING_STREAK] = 0;
    }

    /* Only the visible area changes. */
    {
        Plane p = scene(600, 400, 340, 200, 6, 255, 128, 128);
        PictureSet set;
        p.left = 310;
        set = one(p, 0);
        diffusion_apply(&set, 3);
        for (u32 x = 280; x < 310; ++x) assert(luma(&p, x, 200) == 20);
        assert(luma(&p, 320, 200) > 24);
    }

    /* A dark picture without lights stays as it was. */
    {
        Plane p = scene(600, 400, 300, 200, 0, 20, 128, 128);
        PictureSet set = one(p, 0);
        diffusion_apply(&set, 3);
        for (u32 y = 0; y < 400; y += 7)
            for (u32 x = 0; x < 600; x += 5) assert(luma(&p, x, y) == 20 && cr_at(&p, x, y) == 128);
    }

    /* A large picture with 4:2:0 chroma samples every second pixel and still
       glows around a small light. */
    {
        u32 w = 2400, h = 1600;
        Plane p = scene(w, h, 1200, 800, 10, 255, 128, 128);
        PictureSet set;
        p.half = 1;
        set = one(p, 0);
        assert(diffusion_grid_shift(w, h) >= 4);
        diffusion_apply(&set, 2);
        assert(luma(&p, 1240, 800) > 24 && luma(&p, 5, 5) == 20);
    }

    /* Black Mist lifts the shadows far from the light, Heavy more than
       Light, and keeps a grey shadow grey. */
    {
        u32 lift[3] = {0};
        for (u32 m = 0; m <= 2; ++m) {
            Plane p = scene(600, 400, 300, 200, 40, 200, 128, 128);
            PictureSet set = one(p, 0);
            grku_test_settings[SETTING_MIST] = m;
            diffusion_apply(&set, 2);
            lift[m] = luma(&p, 40, 40);
            assert(cb_at(&p, 40, 40) == 128 && cr_at(&p, 40, 40) == 128);
        }
        assert(lift[0] == 20 && lift[1] > 20 && lift[2] > lift[1]);
        grku_test_settings[SETTING_MIST] = 0;
    }

    /* A small white light streaks sideways, not up or down; blue is blue and
       amber is amber. */
    {
        Plane p = scene(1200, 400, 600, 200, 4, 255, 128, 128);
        PictureSet set = one(p, 0);
        grku_test_settings[SETTING_STREAK] = 1;
        diffusion_apply(&set, 1);
        assert(luma(&p, 700, 200) > luma(&p, 600, 300) + 4);
        assert(cb_at(&p, 700, 200) > 130 && cr_at(&p, 700, 200) < 126);
        p = scene(1200, 400, 600, 200, 4, 255, 128, 128);
        set = one(p, 0);
        grku_test_settings[SETTING_STREAK] = 2;
        diffusion_apply(&set, 1);
        assert(cb_at(&p, 700, 200) < 126 && cr_at(&p, 700, 200) > 130);
        grku_test_settings[SETTING_STREAK] = 0;
    }

    /* A wide bright area makes no streak across the picture. */
    {
        Plane p = scene(1200, 400, 600, 200, 150, 255, 128, 128);
        PictureSet set = one(p, 0);
        grku_test_settings[SETTING_STREAK] = 1;
        diffusion_apply(&set, 1);
        assert(cb_at(&p, 1150, 200) <= 130);
        grku_test_settings[SETTING_STREAK] = 0;
    }

    test_softness();
    return 0;
}
