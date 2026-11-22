/* The host test of Date Imprint (grku module test): the stamp on a gray
   picture. tests/runtime/picture_contract.c checks the stamp in detail. */
#include <assert.h>
#include "grku_module.h"

void date_apply(PictureSet *set, u32 style);

#define WIDTH 1200U
#define HEIGHT 800U
/* A 4:2:2 plane: luma rows, then interleaved CbCr rows of the same pitch. */
static Plane gray_plane(u32 at)
{
    Plane p = {at, at + WIDTH * HEIGHT, WIDTH, HEIGHT, WIDTH, 0, 0, 0, WIDTH, HEIGHT};
    for (u32 i = 0; i < WIDTH * HEIGHT; ++i) {
        GRKU_BYTES(p.y + i)[0] = 64;
        GRKU_BYTES(p.c + i)[0] = 128;
    }
    return p;
}
/* The changed pixels of a plane, and their bounds. */
static u32 bounds(const Plane *p, u32 *left, u32 *top, u32 *right, u32 *bottom)
{
    u32 n = 0;
    *left = WIDTH; *top = HEIGHT; *right = 0; *bottom = 0;
    for (u32 y = 0; y < HEIGHT; ++y)
        for (u32 x = 0; x < WIDTH; ++x)
            if (GRKU_BYTES(p->y + y * WIDTH + x)[0] != 64) {
                ++n;
                if (x < *left) *left = x;
                if (y < *top) *top = y;
                if (x + 1 > *right) *right = x + 1;
                if (y + 1 > *bottom) *bottom = y + 1;
            }
    return n;
}
static u32 changed(const Plane *p, u32 *left, u32 *top)
{
    u32 right, bottom;
    return bounds(p, left, top, &right, &bottom);
}

static u32 pixels_hash(const Plane *p)
{
    u32 hash = 2166136261U;
    for (u32 i = 0; i < WIDTH * HEIGHT; ++i) {
        hash = (hash ^ GRKU_BYTES(p->y + i)[0]) * 16777619U;
        hash = (hash ^ GRKU_BYTES(p->c + i)[0]) * 16777619U;
    }
    return hash;
}

int main(void)
{
    /* Baseline pixels at the harness clock (2026-10-25 09:05), before the
       blur workspace moved from the task stack to picture scratch. */
    static const u32 expected[3][5] = {
        {1184513837U,809389240U,2473835757U,755202461U,321906744U},
        {1950141043U,2516237631U,3262944462U,4264252730U,2226400522U},
        {666516357U,2337147665U,679377069U,3903426885U,2609955457U}
    };
    static u8 guarded[GRKU_PLANE_SCRATCH + 2];
    u32 left, top;
    /* The descriptor: STYLE (6 values), LOOK (3), POSITION (2), ICON (2),
       COLOR (5), SIZE (4, M by default), CORNER (4), GLOW (2), and CAPTION
       (8), a page with its nine native settings rows, one filter, and one
       status indicator. */
    assert(grku_module.setting_count == 9 && grku_module.settings[0].values == 6 &&
           grku_module.settings[1].values == 3 && grku_module.settings[2].values == 2 &&
           grku_module.settings[3].values == 2 && grku_module.settings[4].values == 5 &&
           grku_module.settings[5].values == 4 && grku_module.settings[5].default_value == 1 &&
           grku_module.settings[6].values == 4 && grku_module.settings[7].values == 2 &&
           grku_module.settings[8].values == 8);
    assert(grku_module.registration_count == 3 && grku_module.tile_count == 6);
    assert(SETTING_STYLE == GRKU_SETTING(0) && SETTING_LOOK == GRKU_SETTING(1) &&
           SETTING_POSITION == GRKU_SETTING(2) && SETTING_CAPTION == GRKU_SETTING(8));
    /* The defaults of the new settings print as 1.8 did. */
    grku_test_settings[SETTING_SIZE] = 1;
    /* Each look of each style lights the lower right corner of the picture
       and nothing else. */
    for (u32 look = 0; look < 3; ++look)
        for (u32 style = 1; style < 6; ++style) {
            PictureSet set = {{gray_plane(GRKU_TEST_PLANES)}, 1, 0, 0, guarded + 1};
            for (u32 i = 0; i < sizeof guarded; ++i) guarded[i] = 0xa5;
            grku_test_settings[SETTING_LOOK] = look;
            date_apply(&set, style);
            assert(changed(&set.planes[0], &left, &top) > 100);
            assert(left > WIDTH / 2 && top > HEIGHT / 2);
            /* Preserve every luma/chroma byte while reusing dirty scratch. */
            assert(pixels_hash(&set.planes[0]) == expected[look][style - 1]);
            assert(guarded[0] == 0xa5 && guarded[sizeof guarded - 1] == 0xa5);
        }
    /* Film: the stamp stays at the bottom right of the sensor frame in each
       posture. Upright: it goes to the bottom right of the picture turned
       upright, which is the top right of the frame for one quarter turn, and
       its text runs along the long side of its box. */
    for (u32 look = 0; look < 3; ++look)
        for (u32 position = 0; position < 2; ++position)
            for (u32 turns = 0; turns < 4; ++turns) {
                PictureSet set = {{gray_plane(GRKU_TEST_PLANES)}, 1, 0, 0, grku_test_scratch, turns};
                u32 right, bottom, corner = position ? turns : 0;
                grku_test_settings[SETTING_LOOK] = look;
                grku_test_settings[SETTING_POSITION] = position;
                date_apply(&set, 2);
                assert(bounds(&set.planes[0], &left, &top, &right, &bottom) > 100);
                /* Corner of the frame: 0 bottom right, 1 top right, 2 top left, 3 bottom left. */
                assert((corner <= 1) == (left > WIDTH / 2) && (corner >= 1 && corner <= 2) == (bottom < HEIGHT / 2));
                assert((corner & 1) == (bottom - top > right - left));
            }
    grku_test_settings[SETTING_POSITION] = 0;
    /* COLOR: Orange is the standard color of Classic and GR II, and each
       other color changes the light of each look; white light is neutral. */
    for (u32 look = 0; look < 3; ++look) {
        u32 hashes[5];
        grku_test_settings[SETTING_LOOK] = look;
        for (u32 color = 0; color < 5; ++color) {
            PictureSet set = {{gray_plane(GRKU_TEST_PLANES)}, 1, 0, 0, grku_test_scratch};
            grku_test_settings[SETTING_COLOR] = color;
            date_apply(&set, 1);
            hashes[color] = pixels_hash(&set.planes[0]);
            if (color == 2) {
                u32 most = 0;
                for (u32 i = 0; i < WIDTH * HEIGHT; ++i) {
                    int c = GRKU_BYTES(set.planes[0].c + i)[0] - 128;
                    if ((u32)(c < 0 ? -c : c) > most) most = (u32)(c < 0 ? -c : c);
                }
                assert(most <= 12);
            }
        }
        assert((hashes[1] == hashes[0]) == (look != 1));
        for (u32 a = 1; a < 5; ++a)
            for (u32 b = a + 1; b < 5; ++b) assert(hashes[a] != hashes[b]);
    }
    grku_test_settings[SETTING_COLOR] = 0;
    /* SIZE: S, M, M-L, and L grow the text, which keeps its corner. */
    for (u32 look = 0; look < 3; ++look) {
        u32 last = 0;
        grku_test_settings[SETTING_LOOK] = look;
        for (u32 size = 0; size < 4; ++size) {
            PictureSet set = {{gray_plane(GRKU_TEST_PLANES)}, 1, 0, 0, grku_test_scratch};
            u32 right, bottom;
            grku_test_settings[SETTING_SIZE] = size;
            date_apply(&set, 1);
            assert(bounds(&set.planes[0], &left, &top, &right, &bottom) > 100);
            assert(right - left > last && left > WIDTH / 2 && top > HEIGHT / 2);
            last = right - left;
        }
    }
    grku_test_settings[SETTING_SIZE] = 1;
    /* CORNER and CAPTION: the caption comes before the date on its line;
       Split puts the date at the bottom left and the caption at the bottom
       right. Each look prints the letters and the heart. */
    for (u32 look = 0; look < 3; ++look)
        for (u32 corner = 0; corner < 4; ++corner) {
            u32 width[2];
            grku_test_settings[SETTING_LOOK] = look;
            grku_test_settings[SETTING_CORNER] = corner;
            for (u32 caption = 0; caption < 2; ++caption) {
                PictureSet set = {{gray_plane(GRKU_TEST_PLANES)}, 1, 0, 0, grku_test_scratch};
                u32 right, bottom;
                grku_test_settings[SETTING_CAPTION] = caption ? 3 : 0;
                date_apply(&set, 1);
                assert(bounds(&set.planes[0], &left, &top, &right, &bottom) > 100);
                width[caption] = right - left;
                assert((corner == 2) == (bottom < HEIGHT / 2));
                if (corner == 0 || corner == 2) assert(right > WIDTH * 3 / 4);
                if (corner == 1 || (corner == 3 && !caption)) assert(left < WIDTH / 4 && right < WIDTH * 3 / 4);
                if (corner == 3 && caption) assert(left < WIDTH / 4 && right > WIDTH * 3 / 4);
            }
            assert(width[1] > width[0]);
        }
    grku_test_settings[SETTING_CORNER] = 0;
    grku_test_settings[SETTING_CAPTION] = 0;
    /* Every caption fits next to the longest style, in each look. */
    for (u32 look = 0; look < 3; ++look)
        for (u32 caption = 1; caption < 8; ++caption) {
            PictureSet set = {{gray_plane(GRKU_TEST_PLANES)}, 1, 0, 0, grku_test_scratch};
            u32 right, bottom;
            grku_test_settings[SETTING_LOOK] = look;
            grku_test_settings[SETTING_CAPTION] = caption;
            grku_test_settings[SETTING_SIZE] = 3;
            date_apply(&set, 2);
            assert(bounds(&set.planes[0], &left, &top, &right, &bottom) > 100 && left < WIDTH / 2);
        }
    grku_test_settings[SETTING_CAPTION] = 0;
    grku_test_settings[SETTING_SIZE] = 1;
    /* GLOW: a soft light around the strokes of the mask looks lights more
       of the picture; GR II prints flat pixels without it. */
    for (u32 look = 0; look < 3; ++look) {
        u32 lit[2];
        grku_test_settings[SETTING_LOOK] = look;
        for (u32 glow = 0; glow < 2; ++glow) {
            PictureSet set = {{gray_plane(GRKU_TEST_PLANES)}, 1, 0, 0, grku_test_scratch};
            grku_test_settings[SETTING_GLOW] = glow;
            date_apply(&set, 1);
            lit[glow] = changed(&set.planes[0], &left, &top);
        }
        assert(look == 2 ? lit[1] == lit[0] : lit[1] > lit[0] + lit[0] / 4);
    }
    grku_test_settings[SETTING_GLOW] = 0;
    /* A monochrome picture keeps its chroma, also with a color. */
    {
        PictureSet set = {{gray_plane(GRKU_TEST_PLANES)}, 1, 0, 1, grku_test_scratch};
        grku_test_settings[SETTING_LOOK] = 0;
        grku_test_settings[SETTING_COLOR] = 4;
        date_apply(&set, 1);
        for (u32 i = 0; i < WIDTH * HEIGHT; ++i) assert(GRKU_BYTES(set.planes[0].c + i)[0] == 128);
    }
    return 0;
}
