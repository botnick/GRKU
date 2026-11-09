/* The host test of Guides (grku module test). The core checks the guides
   inside every Framing area (tests/runtime/framing_contract.c); this test
   checks the module alone, on the full 3:2 area. */
#include <assert.h>
#include "grku_module.h"

void guides_paint(const Surface *s, u32 style);
void guides_paint_always(const Surface *s, u32 style);

static const u16 full[4] = {0, 0, 720, 480};

/* Whether the 2-pixel line at `line` covers `value`. */
static int on_line(u32 value, u32 line) { return value == line - 1 || value == line; }

int main(void)
{
    Surface s = grku_test_surface(full);
    /* The descriptor: STYLE with 8 values, COLOR, OPACITY, DISP, and SPIRAL,
       a page with their settings rows, and the two layers. */
    assert(grku_module.setting_count == 5 && grku_module.settings[0].values == 8);
    assert(grku_module.settings[4].values == 4 && grku_module.settings[4].default_value == 2);
    /* Fn on the Golden Spiral row steps SPIRAL. */
    assert(grku_module.registrations[0].point == GRKU_POINT_MENU_PAGE);
    {
        const GrkuPage *page = grku_module.registrations[0].impl;
        assert(page->size == sizeof(GrkuPage) && page->fn_value == 6 && page->fn_setting == 4);
    }
    assert(grku_module.registration_count == 3 && grku_module.tile_count == 8);
    assert(SETTING_STYLE == GRKU_SETTING(0) && SETTING_COLOR == GRKU_SETTING(1) &&
           SETTING_OPACITY == GRKU_SETTING(2) && SETTING_DISP == GRKU_SETTING(3) &&
           SETTING_SPIRAL == GRKU_SETTING(4));
    /* Thirds: lines at 240, 480 and 160, 320, black at 50% alpha. */
    grku_test_clear();
    guides_paint(&s, 1);
    for (u32 y = 0; y < 480; y += 7)
        for (u32 x = 0; x < 720; x += 5) {
            int line = on_line(x, 240) || on_line(x, 480) || on_line(y, 160) || on_line(y, 320);
            assert(grku_test_pixel(x, y) == (line ? 0x80000000U : GRKU_TEST_CLEAR));
        }
    /* Center: a cross of 2-pixel arms, 20 pixels past the center pair. */
    grku_test_clear();
    guides_paint(&s, 2);
    assert(grku_test_pixel(339, 240) == 0x80000000U && grku_test_pixel(380, 239) == 0x80000000U);
    assert(grku_test_pixel(338, 240) == GRKU_TEST_CLEAR && grku_test_pixel(381, 240) == GRKU_TEST_CLEAR);
    assert(grku_test_pixel(360, 219) == 0x80000000U && grku_test_pixel(359, 260) == 0x80000000U);
    assert(grku_test_pixel(240, 160) == GRKU_TEST_CLEAR);
    /* Diagonals run corner to corner. */
    grku_test_clear();
    guides_paint(&s, 4);
    assert(grku_test_pixel(0, 0) == 0x80000000U && grku_test_pixel(719, 478) == 0x80000000U);
    assert(grku_test_pixel(719, 0) == 0x80000000U && grku_test_pixel(0, 478) == 0x80000000U);
    /* Golden spiral, Bottom Right: it starts at the bottom-left corner,
       touches the top at 0.618 of the width and the right side at 0.618 of
       the height, and ends near (521, 347), 72% of each side. */
    grku_test_settings[SETTING_SPIRAL] = 2;
    grku_test_clear();
    guides_paint(&s, 6);
    assert(grku_test_pixel(0, 479) == 0x80000000U && grku_test_pixel(445, 0) == 0x80000000U);
    assert(grku_test_pixel(719, 297) == 0x80000000U);
    /* The division lines: the first cut at x = 445, the second at y = 297. */
    assert(grku_test_pixel(444, 240) == 0x80000000U && grku_test_pixel(445, 240) == 0x80000000U);
    assert(grku_test_pixel(600, 296) == 0x80000000U && grku_test_pixel(600, 297) == 0x80000000U);
    assert(grku_test_pixel(300, 296) == GRKU_TEST_CLEAR);
    assert(grku_test_pixel(0, 0) == GRKU_TEST_CLEAR && grku_test_pixel(719, 479) == GRKU_TEST_CLEAR);
    assert(grku_test_pixel(360, 240) == GRKU_TEST_CLEAR);
    {
        /* Every corner value mirrors the start corner. */
        static const u32 start[4][2] = {{719, 0}, {0, 0}, {0, 479}, {719, 479}};
        for (u32 corner = 0; corner < 4; ++corner) {
            grku_test_settings[SETTING_SPIRAL] = corner;
            grku_test_clear();
            guides_paint(&s, 6);
            for (u32 other = 0; other < 4; ++other)
                assert((grku_test_pixel(start[other][0], start[other][1]) == 0x80000000U) == (other == corner));
        }
    }
    grku_test_settings[SETTING_SPIRAL] = 2;
    /* Dynamic symmetry: the diagonals, and the reciprocals from each corner
       to 4/9 of the opposite long side; two of them cross at (160, 240). */
    grku_test_clear();
    guides_paint(&s, 7);
    assert(grku_test_pixel(0, 0) == 0x80000000U && grku_test_pixel(719, 478) == 0x80000000U);
    assert(grku_test_pixel(160, 240) == 0x80000000U && grku_test_pixel(559, 240) == 0x80000000U);
    assert(grku_test_pixel(320, 479) == 0x80000000U && grku_test_pixel(399, 0) == 0x80000000U);
    assert(grku_test_pixel(360, 120) == GRKU_TEST_CLEAR);
    /* The spiral and dynamic symmetry stay inside a 1:1 area. */
    {
        static const u16 square[4] = {120, 0, 600, 480};
        Surface inner = grku_test_surface(square);
        for (u32 style = 6; style <= 7; ++style) {
            u32 drawn = 0;
            grku_test_clear();
            guides_paint(&inner, style);
            for (u32 y = 0; y < 480; ++y)
                for (u32 x = 0; x < 720; ++x) {
                    if (grku_test_pixel(x, y) == GRKU_TEST_CLEAR) continue;
                    assert(x >= 120 && x < 600 && grku_test_pixel(x, y) == 0x80000000U);
                    ++drawn;
                }
            assert(drawn > 1000);
        }
    }
    /* White at 100%, and yellow at 50%. */
    grku_test_settings[SETTING_COLOR] = 1;
    grku_test_settings[SETTING_OPACITY] = 1;
    grku_test_clear();
    guides_paint(&s, 1);
    assert(grku_test_pixel(240, 0) == 0xffffffffU);
    grku_test_settings[SETTING_COLOR] = 2;
    grku_test_settings[SETTING_OPACITY] = 0;
    grku_test_clear();
    guides_paint(&s, 1);
    /* Red in the low byte: the native yellow is red ff, green e1, blue 00. */
    assert(grku_test_pixel(240, 0) == 0x8000e1ffU);
    grku_test_settings[SETTING_COLOR] = 0;
    /* DISP 0: only the layer that follows DISP paints; DISP 1: only the
       other one. */
    grku_test_clear();
    guides_paint_always(&s, 1);
    assert(grku_test_pixel(240, 0) == GRKU_TEST_CLEAR);
    grku_test_settings[SETTING_DISP] = 1;
    guides_paint(&s, 1);
    assert(grku_test_pixel(240, 0) == GRKU_TEST_CLEAR);
    guides_paint_always(&s, 1);
    assert(grku_test_pixel(240, 0) == 0x80000000U);
    grku_test_settings[SETTING_DISP] = 0;
    /* An unknown style draws nothing. */
    grku_test_clear();
    guides_paint(&s, 8);
    for (u32 y = 0; y < 480; ++y)
        for (u32 x = 0; x < 720; ++x) assert(grku_test_pixel(x, y) == GRKU_TEST_CLEAR);
    return 0;
}
