/* The core of `grku module test` (grku_test.h). */
#include <assert.h>
#include <stdlib.h>
#include <string.h>

static u32 pixels[GRKU_TEST_STRIDE * 480];
static u8 planes[GRKU_TEST_PLANE_BYTES];
u8 grku_test_scratch[GRKU_PLANE_SCRATCH];
GrkuDateTime grku_test_time = {2026, 10, 25, 9, 5, 0, 0};
u8 grku_test_white[3] = {255, 255, 255};
GrkuShot grku_test_shot;
u32 grku_test_settings[GRKU_TEST_SETTINGS];
u32 grku_test_labels;
u32 grku_test_label[3];
/* The module settings start at handle GRKU_TEST_SETTING_BASE, as they
   start at a handle above 0 on the camera, so a test finds a SETTING_<KEY>
   that the code wraps in GRKU_SETTING again. No setting is used. */
const GrkuContext grku_self = {GRKU_TEST_SETTING_BASE, GRKU_TEST_SETTINGS - GRKU_TEST_SETTING_BASE, 0};

volatile u32 *grku_test_pixels(u32 address)
{
    u32 offset = address - GRKU_TEST_PIXELS;
    /* Every write stays inside the surface and on a pixel. */
    assert(address >= GRKU_TEST_PIXELS && !(offset & 3) && offset / 4 < GRKU_TEST_STRIDE * 480);
    return pixels + offset / 4;
}
u32 grku_test_pixel(u32 x, u32 y) { return pixels[y * GRKU_TEST_STRIDE + x]; }
volatile u8 *grku_test_bytes(u32 address)
{
    /* Every access stays inside the plane memory. */
    assert(address >= GRKU_TEST_PLANES && address - GRKU_TEST_PLANES < GRKU_TEST_PLANE_BYTES);
    return planes + (address - GRKU_TEST_PLANES);
}
void local_time(GrkuDateTime *out) { *out = grku_test_time; }
u32 divide(u32 n, u32 d) { assert(d); return n / d; }
void picture_white(const PictureSet *set, u8 white[3])
{
    (void)set;
    white[0] = grku_test_white[0];
    white[1] = grku_test_white[1];
    white[2] = grku_test_white[2];
}
void picture_shot(const PictureSet *set, GrkuShot *shot)
{
    u32 size = shot->size < sizeof(GrkuShot) ? shot->size : sizeof(GrkuShot);
    GrkuShot copy = grku_test_shot;
    (void)set;
    /* As the core: a size below 8 gets nothing. */
    if (size < 8) return;
    copy.size = size;
    memcpy(shot, &copy, size);
}
void grku_test_clear(void)
{
    for (u32 i = 0; i < GRKU_TEST_STRIDE * 480; ++i) pixels[i] = GRKU_TEST_CLEAR;
}
Surface grku_test_surface(const u16 *box)
{
    Surface s = {GRKU_TEST_PIXELS, GRKU_TEST_STRIDE, 0, box};
    return s;
}
u32 setting_get(u32 handle) { return handle < GRKU_TEST_SETTINGS ? grku_test_settings[handle] : 0; }
void setting_set(u32 handle, u32 value)
{
    if (handle < GRKU_TEST_SETTINGS) grku_test_settings[handle] = value;
}
void overlay_label(const Surface *s, u32 label, u32 left, u32 top)
{
    (void)s;
    grku_test_label[0] = label; grku_test_label[1] = left; grku_test_label[2] = top;
    ++grku_test_labels;
}

/* ---- timer and UI ------------------------------------------------------- */
static struct { void (*fire)(u32); u32 arg; } test_timers[GRKU_TIMERS];
u32 grku_test_timers;
u32 timer_start(u32 ms, void (*fire)(u32 arg), u32 arg)
{
    (void)ms;
    for (u32 i = 0; i < GRKU_TIMERS; ++i)
        if (!test_timers[i].fire) {
            test_timers[i].fire = fire;
            test_timers[i].arg = arg;
            ++grku_test_timers;
            return i + 1;
        }
    return 0;
}
void timer_cancel(u32 timer)
{
    if (timer - 1 < GRKU_TIMERS && test_timers[timer - 1].fire) {
        test_timers[timer - 1].fire = 0;
        --grku_test_timers;
    }
}
void grku_test_fire_timers(void)
{
    for (u32 i = 0; i < GRKU_TIMERS; ++i) {
        void (*fire)(u32) = test_timers[i].fire;
        if (!fire) continue;
        test_timers[i].fire = 0;
        --grku_test_timers;
        fire(test_timers[i].arg);
    }
}
u32 grku_test_ui_shows = 1, grku_test_ui_calls, grku_test_ui_arg, grku_test_ui_percent;
GrkuText grku_test_ui_text;
void (*grku_test_ui_message_done)(u32 arg);
void (*grku_test_ui_confirm_done)(u32 executed, u32 arg);
static u32 test_ui(GrkuText text)
{
    ++grku_test_ui_calls;
    grku_test_ui_text = text;
    return grku_test_ui_shows;
}
u32 ui_toast(GrkuText text, u32 ms) { (void)ms; return test_ui(text); }
u32 ui_message(GrkuText text, void (*done)(u32 arg), u32 arg)
{
    grku_test_ui_message_done = done;
    grku_test_ui_arg = arg;
    return test_ui(text);
}
u32 ui_confirm(GrkuText text, void (*done)(u32 executed, u32 arg), u32 arg)
{
    grku_test_ui_confirm_done = done;
    grku_test_ui_arg = arg;
    return test_ui(text);
}
u32 ui_progress_open(GrkuText text) { grku_test_ui_percent = 0; return test_ui(text); }
void ui_progress_set(u32 percent) { grku_test_ui_percent = percent; }
void ui_progress_close(GrkuText text) { if (text) test_ui(text); }
void (*grku_test_slider_changed)(u32 value, u32 arg);
void (*grku_test_slider_done)(u32 committed, u32 value, u32 arg);
u32 ui_slider(GrkuText text, u32 min, u32 max, u32 value, void (*changed)(u32 value, u32 arg),
              void (*done)(u32 committed, u32 value, u32 arg), u32 arg)
{
    if (max <= min || value < min || value > max) return 0;
    grku_test_slider_changed = changed;
    grku_test_slider_done = done;
    grku_test_ui_arg = arg;
    return test_ui(text);
}
u32 grku_test_native;
void (*grku_test_native_back)(u32 arg);
u32 ui_open_native(u32 screen, void (*back)(u32 arg), u32 arg)
{
    if (screen != GRKU_NATIVE_WHITE_BALANCE && screen != GRKU_NATIVE_LCD) return 0;
    grku_test_native = screen;
    grku_test_native_back = back;
    grku_test_ui_arg = arg;
    ++grku_test_ui_calls;
    return grku_test_ui_shows;
}
