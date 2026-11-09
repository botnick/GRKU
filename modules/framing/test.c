/* The host test of Framing (grku module test): the mask of each capture area. */
#include <assert.h>
#include "grku_module.h"

void framing_mask(const Surface *s, u32 value);

/* The photo area of XPan, and of 4:3, on the 720 x 480 surface. */
static const u16 xpan[4] = {0, 107, 720, 373};
static const u16 four_three[4] = {40, 0, 680, 480};

static int inside(const u16 *box, u32 x, u32 y) { return x >= box[0] && x < box[2] && y >= box[1] && y < box[3]; }

static void check_mask(const u16 *box, u32 area)
{
    Surface s = grku_test_surface(box);
    s.area = area;
    grku_test_clear();
    framing_mask(&s, area);
    for (u32 y = 0; y < 480; ++y)
        for (u32 x = 0; x < 720; ++x)
            assert(grku_test_pixel(x, y) == (inside(box, x, y) ? GRKU_TEST_CLEAR : 0x80000000U));
}

int main(void)
{
    /* The descriptor: MASK and LABEL, a page of CORE.ASPECT with its mode
       and settings rows, a mask layer, and a status indicator. */
    assert(grku_module.setting_count == 2 && grku_module.use_count == 2);
    assert(SETTING_MASK == GRKU_SETTING(0) && SETTING_LABEL == GRKU_SETTING(1));
    assert(grku_module.registration_count == 3 && grku_module.tile_count == 8);
    /* The mask covers each pixel outside the photo area, and no other. */
    check_mask(xpan, 1);
    check_mask(four_three, 3);
    /* A surface of the full 3:2 area, such as for Off, gets no mask. */
    {
        static const u16 full[4] = {0, 0, 720, 480};
        Surface s = grku_test_surface(full);
        grku_test_clear();
        framing_mask(&s, 5);
        for (u32 y = 0; y < 480; ++y)
            for (u32 x = 0; x < 720; ++x) assert(grku_test_pixel(x, y) == GRKU_TEST_CLEAR);
        assert(grku_test_labels == 0);
    }
    /* MASK Black fills the outside opaque; Frame lines leave it clear and
       draw 2 white pixels inside each edge of the photo area. */
    {
        Surface s = grku_test_surface(xpan);
        s.area = 1;
        grku_test_settings[SETTING_MASK] = 1;
        grku_test_clear();
        framing_mask(&s, 1);
        assert(grku_test_pixel(10, 10) == 0xff000000U && grku_test_pixel(360, 240) == GRKU_TEST_CLEAR);
        grku_test_settings[SETTING_MASK] = 2;
        grku_test_clear();
        framing_mask(&s, 1);
        assert(grku_test_pixel(10, 10) == GRKU_TEST_CLEAR && grku_test_pixel(360, 240) == GRKU_TEST_CLEAR);
        assert(grku_test_pixel(360, 107) == 0xffffffffU && grku_test_pixel(360, 108) == 0xffffffffU);
        assert(grku_test_pixel(360, 109) == GRKU_TEST_CLEAR && grku_test_pixel(360, 372) == 0xffffffffU);
        assert(grku_test_pixel(0, 240) == 0xffffffffU && grku_test_pixel(1, 240) == 0xffffffffU);
        assert(grku_test_pixel(2, 240) == GRKU_TEST_CLEAR && grku_test_pixel(719, 240) == 0xffffffffU);
        grku_test_settings[SETTING_MASK] = 0;
    }
    return 0;
}
