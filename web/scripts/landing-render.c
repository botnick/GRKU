/* Runs one plane-filter module on one picture, for the example images of the
   site (build-landing.mjs). It builds like `grkit module test`, with this file
   in place of the module's test.c: the module sources, their generated
   descriptor, and the SDK host harness. One of RENDER_DATE, RENDER_GLOW,
   RENDER_LEAK, RENDER_DIFFUSION, or RENDER_BORDER selects the module.

   landing-render IN.rgb WIDTH HEIGHT OUT.rgb A [B [C]]
   IN and OUT hold 8-bit RGB pixels, row by row.
   Date: A = STYLE, B = LOOK. The time comes from RENDER_TIME, "YYYY M D H MM".
   Glow: A = Bloom, B = Halation (0 Off, 1 to 3), C = the scene EV at ISO 100.
   Light Leak: A = LOOK (1 Custom, 2 Faded, 3 Dusty, 4 Leaky, 5 Expired).
   Diffusion: A = STRENGTH (1 to 3), B = MIST (0 to 2), C = STREAK (0 to 2).
   Border: A = STYLE (1 white 3%, 2 white 6%, 3 black 3%, 4 black 6%). */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "grkit_module.h"

#if defined(RENDER_DATE)
void date_apply(PictureSet *set, u32 style);
#elif defined(RENDER_GLOW)
void glow_apply(PictureSet *set, u32 value);
#elif defined(RENDER_LEAK)
void leak_apply(PictureSet *set, u32 look);
#elif defined(RENDER_DIFFUSION)
void diffusion_apply(PictureSet *set, u32 strength);
#elif defined(RENDER_BORDER)
void border_apply(PictureSet *set, u32 style);
#else
#error "Define the module to render"
#endif

/* The screennail of a GR III picture. Glow and Diffusion find the lights on it. */
#define SCREENNAIL_WIDTH 720U
#define SCREENNAIL_HEIGHT 480U

static u8 clamp8(int v) { return v < 0 ? 0 : v > 255 ? 255 : (u8)v; }

/* A 4:2:2 plane from RGB pixels of its size, BT.601 full range as in the
   camera's JPEG: luma rows, then CbCr rows of the same pitch. */
static void fill_plane(const Plane *p, const u8 *rgb)
{
    for (u32 y = 0; y < p->height; ++y)
        for (u32 x = 0; x < p->width; x += 2) {
            int cb = 0, cr = 0;
            for (u32 k = 0; k < 2; ++k) {
                const u8 *px = rgb + ((size_t)y * p->width + x + k) * 3;
                int r = px[0], g = px[1], b = px[2];
                GRKIT_BYTES(p->y + y * p->pitch + x + k)[0] = clamp8((77 * r + 150 * g + 29 * b + 128) >> 8);
                cb += -43 * r - 85 * g + 128 * b;
                cr += 128 * r - 107 * g - 21 * b;
            }
            GRKIT_BYTES(chroma_row(p, y) + x)[0] = clamp8(128 + ((cb / 2 + 128) >> 8));
            GRKIT_BYTES(chroma_row(p, y) + x + 1)[0] = clamp8(128 + ((cr / 2 + 128) >> 8));
        }
}

/* RGB pixels from a 4:2:2 plane, with the inverse of fill_plane. */
static void read_plane(const Plane *p, u8 *rgb)
{
    for (u32 y = 0; y < p->height; ++y)
        for (u32 x = 0; x < p->width; ++x) {
            int luma = GRKIT_BYTES(p->y + y * p->pitch + x)[0];
            u32 q = x & ~1U;
            int cb = (int)GRKIT_BYTES(chroma_row(p, y) + q)[0] - 128;
            int cr = (int)GRKIT_BYTES(chroma_row(p, y) + q + 1)[0] - 128;
            u8 *px = rgb + ((size_t)y * p->width + x) * 3;
            px[0] = clamp8(luma + ((359 * cr) >> 8));
            px[1] = clamp8(luma - ((88 * cb + 183 * cr) >> 8));
            px[2] = clamp8(luma + ((454 * cb) >> 8));
        }
}

/* The screennail: the mean of the picture pixels under each of its pixels. */
static u8 *screennail(const u8 *rgb, u32 w, u32 h)
{
    u8 *small = malloc((size_t)SCREENNAIL_WIDTH * SCREENNAIL_HEIGHT * 3);
    if (!small) return 0;
    for (u32 y = 0; y < SCREENNAIL_HEIGHT; ++y)
        for (u32 x = 0; x < SCREENNAIL_WIDTH; ++x) {
            u32 x0 = x * w / SCREENNAIL_WIDTH, x1 = (x + 1) * w / SCREENNAIL_WIDTH;
            u32 y0 = y * h / SCREENNAIL_HEIGHT, y1 = (y + 1) * h / SCREENNAIL_HEIGHT;
            u32 sum[3] = {0, 0, 0};
            for (u32 yy = y0; yy < y1; ++yy)
                for (u32 xx = x0; xx < x1; ++xx)
                    for (u32 c = 0; c < 3; ++c) sum[c] += rgb[((size_t)yy * w + xx) * 3 + c];
            for (u32 c = 0; c < 3; ++c)
                small[((size_t)y * SCREENNAIL_WIDTH + x) * 3 + c] = (u8)(sum[c] / ((x1 - x0) * (y1 - y0)));
        }
    return small;
}

int main(int argc, char **argv)
{
    if (argc < 6 || argc > 8) {
        fprintf(stderr, "usage: landing-render IN.rgb WIDTH HEIGHT OUT.rgb A [B [C]]\n");
        return 2;
    }
    u32 w = (u32)atoi(argv[2]), h = (u32)atoi(argv[3]);
    u32 a = (u32)atoi(argv[5]), b = argc > 6 ? (u32)atoi(argv[6]) : 0;
    double c = argc > 7 ? atof(argv[7]) : 0;
    size_t bytes = (size_t)w * h * 3;
    if (w % 2 || w < SCREENNAIL_WIDTH || h < SCREENNAIL_HEIGHT ||
        (size_t)2 * ((size_t)w * h + SCREENNAIL_WIDTH * SCREENNAIL_HEIGHT) > GRKIT_TEST_PLANE_BYTES) {
        fprintf(stderr, "The picture does not fit the planes of the harness.\n");
        return 2;
    }
    u8 *rgb = malloc(bytes);
    FILE *f = fopen(argv[1], "rb");
    if (!rgb || !f || fread(rgb, 1, bytes, f) != bytes) {
        fprintf(stderr, "Cannot read %s\n", argv[1]);
        return 1;
    }
    fclose(f);
    u8 *small = screennail(rgb, w, h);
    if (!small) return 1;

    /* The main picture, then its screennail, as the camera encodes them. */
    u32 s0 = GRKIT_TEST_PLANES + 2 * w * h;
    Plane main_plane = {GRKIT_TEST_PLANES, GRKIT_TEST_PLANES + w * h, w, h, w, 0, 0, 0, w, h};
    Plane small_plane = {s0, s0 + SCREENNAIL_WIDTH * SCREENNAIL_HEIGHT, SCREENNAIL_WIDTH, SCREENNAIL_HEIGHT,
                         SCREENNAIL_WIDTH, 0, 0, 0, SCREENNAIL_WIDTH, SCREENNAIL_HEIGHT};
    fill_plane(&main_plane, rgb);
    fill_plane(&small_plane, small);
    PictureSet set;
    memset(&set, 0, sizeof set);
    set.planes[0] = main_plane;
    set.planes[1] = small_plane;
    set.count = 2;
    set.scratch = grkit_test_scratch;

#if defined(RENDER_DATE)
    unsigned year = 2024, month = 1, day = 1, hour = 0, minute = 0;
    const char *time = getenv("RENDER_TIME");
    if (time) sscanf(time, "%u %u %u %u %u", &year, &month, &day, &hour, &minute);
    grkit_test_time = (GrkitDateTime){(u16)year, (u8)month, (u8)day, (u8)hour, (u8)minute, 0, 0};
    setting_set(SETTING_LOOK, b);
    setting_set(SETTING_POSITION, 0);
    date_apply(&set, a);
#elif defined(RENDER_GLOW)
    setting_set(SETTING_BLOOM, a);
    setting_set(SETTING_HALATION, b);
    setting_set(SETTING_HALATION_COLOR, 1); /* Orange, the default */
    if (argc > 7) {
        grkit_test_shot.known = GRKIT_SHOT_EXPOSURE;
        grkit_test_shot.scene_ev = (s32)(c * 256);
    }
    glow_apply(&set, a || b);
#elif defined(RENDER_LEAK)
    setting_set(SETTING_LOOK, a);
    leak_apply(&set, a);
#elif defined(RENDER_DIFFUSION)
    setting_set(SETTING_STRENGTH, a);
    setting_set(SETTING_MIST, b);
    setting_set(SETTING_STREAK, (u32)c);
    diffusion_apply(&set, a);
#elif defined(RENDER_BORDER)
    setting_set(SETTING_STYLE, a);
    border_apply(&set, a);
#endif

    read_plane(&main_plane, rgb);
    f = fopen(argv[4], "wb");
    if (!f || fwrite(rgb, 1, bytes, f) != bytes) {
        fprintf(stderr, "Cannot write %s\n", argv[4]);
        return 1;
    }
    fclose(f);
    return 0;
}
