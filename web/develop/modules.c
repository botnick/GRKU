/* The calls of each module, with the values of its settings. The build
   compiles this file once for each module, with -DDEVELOP_<MODULE> and the
   settings header of that module (grku_module.h), next to the sources of the
   module; Grain is compiled here with its source, so that a preview can give
   the width of the full picture (grain_lut). The planes are those of
   dev_set. */
#include "develop.h"
#include "grku_module.h"

#if defined(DEVELOP_DATE)
void date_apply(PictureSet *set, u32 style);
/* Date Imprint: STYLE 1 to 5, LOOK, POSITION, COLOR, SIZE, CORNER, GLOW, CAPTION. */
__attribute__((export_name("dev_date"))) void dev_date(u32 style, u32 look, u32 position, u32 color, u32 size, u32 corner, u32 glow, u32 caption)
{
    setting_set(SETTING_STYLE, style);
    setting_set(SETTING_LOOK, look);
    setting_set(SETTING_POSITION, position);
    setting_set(SETTING_COLOR, color);
    setting_set(SETTING_SIZE, size);
    setting_set(SETTING_CORNER, corner);
    setting_set(SETTING_GLOW, glow);
    setting_set(SETTING_CAPTION, caption);
    if (style) date_apply(&develop_set, style);
}
#elif defined(DEVELOP_GLOW)
void glow_apply(PictureSet *set, u32 value);
/* Glow: Bloom and Halation 0 Off to 3 Strong, the Halation color 0 Red to 3 White. */
__attribute__((export_name("dev_glow"))) void dev_glow(u32 bloom, u32 halation, u32 color)
{
    setting_set(SETTING_BLOOM, bloom);
    setting_set(SETTING_HALATION, halation);
    setting_set(SETTING_HALATION_COLOR, color);
    if (bloom || halation) glow_apply(&develop_set, 1);
}
#elif defined(DEVELOP_LEAK)
#include "lightleak.c"
/* Light Leak: LOOK 1 Custom to 5 Expired, and the four strengths of Custom. As leak_apply, but
   with `seed` for the dust and the scratches (0: from the main plane, as the camera does): a seed
   of the photo keeps them in the same places in the preview and in the download. */
__attribute__((export_name("dev_leak"))) void dev_leak(u32 look, u32 vignette, u32 dust, u32 leak, u32 scratches, u32 seed)
{
    PictureSet *set = &develop_set;
    Strengths s;
    u32 i, main = 0;
    setting_set(SETTING_LOOK, look);
    setting_set(SETTING_VIGNETTE, vignette);
    setting_set(SETTING_DUST, dust);
    setting_set(SETTING_LEAK, leak);
    setting_set(SETTING_SCRATCH, scratches);
    if (!look || look > LOOK_EXPIRED || !set->count) return;
    leak_strengths(look, &s);
    if (!(s.vignette | s.dust | s.leak | s.scratch)) return;
    for (i = 1; i < set->count; ++i)
        if (set->planes[i].width * set->planes[i].height > set->planes[main].width * set->planes[main].height) main = i;
    if (!seed) seed = leak_seed(&set->planes[main]);
    for (i = 0; i < set->count; ++i) leak_plane(&set->planes[i], set->turns, set->mono, seed, &s, set->scratch);
}
#elif defined(DEVELOP_DIFFUSION)
void diffusion_apply(PictureSet *set, u32 strength);
void softness_apply(PictureSet *set, u32 level);
/* Diffusion: STRENGTH 1/8, 1/4, 1/2 (1 to 3), Black Mist, Streak. */
__attribute__((export_name("dev_diffusion"))) void dev_diffusion(u32 strength, u32 mist, u32 streak)
{
    setting_set(SETTING_STRENGTH, strength);
    setting_set(SETTING_MIST, mist);
    setting_set(SETTING_STREAK, streak);
    if (strength) diffusion_apply(&develop_set, strength);
}
/* Film Softness: 1 Low to 3 High. */
__attribute__((export_name("dev_softness"))) void dev_softness(u32 level)
{
    setting_set(SETTING_SOFTNESS, level);
    if (level) softness_apply(&develop_set, level);
}
#elif defined(DEVELOP_GRAIN)
#include "grain.c"
/* Film-like Grain of `level` 1 to 4 and `size` 1 to 3, as grain_draw, but
   with the strength of each plane scaled to `full`, the width of the full
   picture: a preview of a smaller size then shows the grain as the camera
   shows it on its screennail. `full` 0 is the width of the main plane. */
__attribute__((export_name("dev_grain"))) void dev_grain(u32 level, u32 size, u32 full)
{
    PictureSet *set = &develop_set;
    setting_set(SETTING_STYLE, 1);
    if (!level || level > 4U || !size || size > 3U || !set->count) return;
    const Plane *main = &set->planes[0];
    for (u32 i = 1; i < set->count; ++i)
        if (set->planes[i].width > main->width) main = &set->planes[i];
    if (main->right <= main->left || main->bottom <= main->top) return;
    if (full < main->width) full = main->width;
    Scratch *s = (Scratch *)(void *)set->scratch;
    u32 state = seed_of(set, main), tiles = mix(&state);
    grain_tiles(s, set->mono, area_halves[level - 1U], blur_of_size[size - 1U], tiles);
    for (u32 i = 0; i < set->count; ++i) {
        const Plane *p = &set->planes[i];
        if (p->right <= p->left || p->bottom <= p->top) continue;
        u32 seed = mix(&state);
        s->place_row = 0;
        s->plan_next = 0;
        grain_lut(s, level, p->width, full);
        grain_plane(p, s, seed, set->mono);
    }
}
/* The grain size of Auto (CORE.GRAIN_SIZE 0) for the shot of dev_shot. */
__attribute__((export_name("dev_grain_auto"))) u32 dev_grain_auto(void) { return size_of_iso(&develop_set); }
#else
#error "Define the module of the build"
#endif
