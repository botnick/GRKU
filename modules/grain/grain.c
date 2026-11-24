/* Film-like grain: a plane filter that draws the grain of a color negative
   printed on paper into each recorded picture, after the grain model of
   spektrafilm by Andrea Volpato (github.com/andreavolpato/spektrafilm,
   src/spektrafilm/model/grain.py). This is a new implementation of the
   published model for the camera, in integers, not a port of that code.
   Written by piratenpanda for GRKit (pull request #122), ported to GRKU.

   The System style leaves the grain to the native grain stage, which blends
   one noise plane into Y with the same strength at each tone. In the
   Film-like style the core runs that stage with no amplitude
   (grain_film_like in runtime/picture.c), so the rest of what it does stays
   the same, and this filter draws the grain:

   - Each of the three dye layers (here R, G, and B) has grain of its own,
     independent of the others, so the grain has color, as in a scan of a
     color negative. Mono pictures get the grain of one layer, in Y only.
   - Each layer has three sublayers whose particles are 2, 1, and 0.5 times
     the particle area (spektrafilm's particle_scale_layers), and the layer
     of B has particles twice the area of R and G (particle_scale 1.6, 1.6,
     3.2). In the model a pixel holds a Poisson number of particles, of
     which a binomial share develops: the noise of a sublayer has a variance
     that grows with its particle area, so its weight here is the square root
     of that area. Each sublayer has the blur of its dye clouds, the square
     root of the optical density of one particle in pixels, and then the
     whole grain the blur of spektrafilm's `blur`: 0.5, 0.65 (the default),
     and 1.0 pixels for Small, Medium, and Large. At this pixel size those
     blurs differ by less than a tenth of a pixel, so a layer is one noise
     with their blur, weighted by their variances (grain_texture).
   - The pixel is that of a 36 mm frame across the 6000 samples of a GR III
     picture, 6 um, and the particle area 0.2 um^2 times 0.5, 1, 2, or 4 for
     Weak, Medium, Strong, and Extra Strong: a faster film has larger
     particles (spektrafilm's particle_area_um2), so stronger and wider
     dye clouds.
   - The binomial noise is largest at the middle density of the negative,
     where half of the particles develop, and the print paper shows the
     density of the negative through its curve. grain_tone_table gives the
     visible grain for each eighth of the output values for that chain
     (test.c checks it against the model): a display gamma of 2.2 over print
     density, a paper of density 2.3 whose curve is a logistic of gamma 2.6,
     and a negative of density 2.2 with half of its particles developed at
     the middle of the paper curve. The grain is strongest in the middle
     tones and none at paper white or in black.
   - The grain moves the value of each layer by its grain times the tone of
     that layer, so the filter writes the change of Y, Cb, and Cr, and a
     picture without grain stays exact.

   The model leaves out what this pixel size does not show: its lognormal
   micro-structure acts only below a pixel of about 0.6 um here. The camera
   picture was never a negative, so the tone is a model of a print,
   not of the film of the picture, and the strength is calibrated so that
   Medium is about 9 levels of G at the middle tone (strength).

   What each sample costs. The grain of the three layers is summed into
   textures when the filter starts, so that a sample only reads them:

   - The luma texture (grain_tiles) is 256 x 128 samples, the sum of the three
     layers in Y (0.299 R + 0.587 G + 0.114 B). The chroma textures hold, for
     each two samples of each two rows of its first 64 rows, the mean grain
     of each layer, already weighted by its part in Cb and in Cr: the chroma
     of 4:2:0, which 4:2:2 pictures take for two rows each. They come from the
     same noise, so the grain of a dye cloud moves Y, Cb, and Cr together.
   - The tone of each layer comes from the R, G, or B of each pair (its Y and
     its CbCr) through a table of 32 steps; the luma grain of a pair takes
     the tone of its layers in Y. The table holds the strength and the scale
     of the plane, so a sample is a texture read, a product, and a
     saturating add, in 8 and 16 bits.
   - The picture is cut into cells of 240 x 56 samples, each of which reads
     the textures at a place of its own, so the grain never repeats. The
     first 16 samples of a cell fade from the texture of the cell on the left
     (where its own samples would continue) into those of the cell, and its
     first 8 rows from those of the cell above, with the weights of
     grain_seam_luma, grain_seam_chroma, and grain_fade_weight, whose squares
     sum to one, so that the blend keeps the deviation of the grain (the
     blending of Heitz and Neyret, 2018); a corner blends four. The fades
     cover about a sixth of the samples. The grain of half of the cells is
     turned over (flip_of), so that a feature of the textures does not show
     the same in each cell.

   On the camera the hot paths run in NEON (an assembly part, as the camera
   objects build soft-float): blocks of 16 samples (8 pairs) of a 4:2:2 row
   (grain_film_422), of two 4:2:0 rows and their chroma (grain_film_420), or
   of a mono row (grain_film_mono), over runs of the textures that C lists
   for each row (GrainSegment), and the fades (grain_mix). C does the
   samples at the edges of the visible area and the textures, with the same
   arithmetic (film_pair, mono_pixel; neon_parity.c checks it). On the host,
   and with GRAIN_SCALAR, C does all.

   CORE.GRAIN gives the strength and calls the filter (module.toml), and
   CORE.GRAIN_SIZE the size; Auto follows the ISO as the native grain does:
   small to ISO 400, medium to ISO 800, large above. */
#include "grku_module.h"

typedef signed char s8;

#define LAYERS 3U
#define SUBLAYERS 3U
/* The textures: TILE_W x TILE_H samples, each luma row followed by a copy
   of its first CHUNK samples and each chroma row by a copy of its first
   CHUNK / 2 pairs, so that a block of CHUNK samples from any even column
   lies in a row. */
#define TILE_W 256U
#define TILE_H 128U
/* The chroma textures: the pairs of each two rows of the first 64 rows of the
   noise, for 4:2:0 and 4:2:2 alike. */
#define CHROMA_ROWS 32U
#define CHUNK 16U
/* The cells: CELL_W x CELL_H samples, smaller than the textures, so that
   the fade into a cell reads, where its neighbour continues, texture that
   the neighbour did not show. */
#define CELL_W 240U
#define CELL_H 56U
#define CHUNKS (CELL_W / CHUNK)
#define PAIRS (TILE_W / 2U)
#define LUMA_STRIDE (TILE_W + CHUNK)
#define CHUNK_CHROMA (CHUNK / 2U * LAYERS)
#define CHROMA_STRIDE ((PAIRS + CHUNK / 2U) * LAYERS)
/* The rows of the fade from the cell above. */
#define FADE 8U
/* The cells of a row whose runs one call of the NEON code takes (6240
   samples), and the most jobs of grain_mix that a cell of a row of the fade
   needs: the seam of the cell and of the cell above, their fade, and three
   runs, each for two luma rows, Cb, and Cr. */
#define BATCH 26U
#define CELL_JOBS 24U
/* The cells whose hashes the scratch keeps for a cell row (and the row
   above), with one more on the left: a picture up to 9360 samples wide. A
   wider one hashes the others when it needs them. */
#define PLACES 40U
#define TONES 32U
/* The standard deviation of the texture of R and G: the grain of G where it
   is strongest at Extra Strong, in levels. */
#define TILE_DEVIATION 18U

static int clamp(int v) { return v < 0 ? 0 : v > 255 ? 255 : v; }
/* The saturation of VQMOVN.S16 and VQRSHRN.S16 to 8 bits. */
static int sat8(int v) { return v < -128 ? -128 : v > 127 ? 127 : v; }

/* The visible grain of a print for the output values 8 i to 8 i + 7, 0 to
   255, from the model of the comment at the top at 8 i + 3.5 (test.c checks
   it): none in black (to 23) and at paper white (from 248). */
const u8 grain_tone_table[TONES] = {0,   0,   0,   16,  50,  82,  113, 140, 165, 187, 206,
                                    221, 234, 243, 250, 254, 255, 253, 249, 242, 233, 221,
                                    207, 191, 173, 152, 130, 107, 81,  55,  28,  0};
/* For test.c. */
u32 grain_tone_of(u32 v) { return grain_tone_table[(v & 255U) >> 3]; }

/* Gaussian kernels of radius 3 for sigma 0.40 to 1.30 pixels in steps of
   0.05, in 1/4096: the center, then each side. test.c checks them. */
#define KERNELS 19U
const u16 grain_kernel_table[KERNELS][4] = {
    {3766, 165, 0, 0},
    {3502, 297, 0, 0},
    {3222, 436, 1, 0},
    {2956, 566, 4, 0},
    {2718, 678, 11, 0},
    {2514, 769, 22, 0},
    {2336, 841, 39, 0},
    {2178, 896, 62, 1},
    {2042, 935, 90, 2},
    {1922, 962, 121, 4},
    {1816, 979, 154, 7},
    {1718, 989, 188, 12},
    {1636, 991, 221, 18},
    {1558, 989, 254, 26},
    {1486, 984, 285, 36},
    {1424, 975, 314, 47},
    {1366, 965, 340, 60},
    {1312, 953, 365, 74},
    {1266, 940, 387, 88},};

/* The weights of a fade in 1/127: sample (or row) k of n gets
   sin(pi/2 (k + 0.5) / n) of its own cell and the cosine of the other, so
   their squares sum to one. test.c checks them. The chroma weights hold
   those of each pair, at the middle of its two samples, for each layer. */
const s8 grain_seam_luma[2][CHUNK] = {
    {6, 19, 31, 43, 54, 65, 76, 85, 94, 102, 109, 115, 120, 123, 126, 127},
    {127, 126, 123, 120, 115, 109, 102, 94, 85, 76, 65, 54, 43, 31, 19, 6}};
const s8 grain_seam_chroma[2][CHUNK_CHROMA] = {
    {12, 12, 12, 37, 37, 37, 60, 60, 60, 81, 81, 81, 98, 98, 98, 112, 112, 112, 122, 122, 122, 126, 126, 126},
    {126, 126, 126, 122, 122, 122, 112, 112, 112, 98, 98, 98, 81, 81, 81, 60, 60, 60, 37, 37, 37, 12, 12, 12}};
/* The fade of the rows: luma rows (and 4:2:2 chroma rows), and 4:2:0 chroma
   rows, at the middle of their two luma rows. */
const s8 grain_fade_weight[2][FADE] = {{12, 37, 60, 81, 98, 112, 122, 126}, {126, 122, 112, 98, 81, 60, 37, 12}};
const s8 grain_half_weight[2][FADE / 2U] = {{25, 71, 106, 125}, {125, 106, 71, 25}};

/* The particle area for each strength, in halves of 0.2 um^2: Weak 0.5,
   Medium 1, Strong 2, Extra Strong 4 times. */
static const u8 area_halves[4] = {1, 2, 4, 8};
/* The standard deviation of G where the grain is strongest, in 1/16 levels,
   for each strength: it grows with the square root of the particle area. */
static const u16 strength[4] = {102, 144, 204, 288};
/* spektrafilm's `blur` for Small, Medium, and Large, in 1/100 pixel. */
static const u8 blur_of_size[3] = {50, 65, 100};
/* The particle scale of R, G, and B, and of the sublayers, in 1/10. */
static const u8 layer_scale[LAYERS] = {16, 16, 32};
static const u8 sublayer_scale[SUBLAYERS] = {20, 10, 5};
/* The weights of R, G, and B in Y, in 1/256, and in Cb and Cr, in 1/4096
   (JPEG, BT.601 full range). */
static const u8 luma_weight[LAYERS] = {77, 150, 29};
static const short cb_weight[LAYERS] = {-691, -1357, 2048};
static const short cr_weight[LAYERS] = {2048, -1715, -333};

/* The arguments of the NEON code, at the offsets of the assembly.
   GrainSegment: `chunks` blocks of CHUNK samples read the luma noise from g0
   (and g1 for the second row of 4:2:0), and the chroma noise of their pairs
   from cb and cr, which hold the R, G, and B of each pair.
   GrainRow: the luma row y0 (and y1) and the chroma row c at the first
   block of the first segment, which the others follow.
   GrainMix: `groups` groups of 8 bytes of out = (a wa + b wb) / 128,
   rounded and saturated; wa and wb advance by `step` (0 or 8) a group, and
   hold at least 16 bytes. */
/* The sign bit of `chunks`: the grain of the cell is turned over. */
#define FLIP 0x80000000U
typedef struct {
    u32 chunks;
    const s8 *g0, *g1, *cb, *cr;
} GrainSegment;
typedef struct {
    u8 *y0, *y1, *c;
    const GrainSegment *segments;
    u32 count;
    const u8 *lut;
} GrainRow;
typedef struct {
    s8 *out;
    const s8 *a, *b, *wa, *wb;
    u32 groups, step;
} GrainMix;
_Static_assert(sizeof(void *) != 4U || (sizeof(GrainSegment) == 20U && sizeof(GrainRow) == 24U && sizeof(GrainMix) == 28U),
               "The layout of the NEON arguments");
void grain_film_422(const GrainRow *r);
void grain_film_420(const GrainRow *r);
void grain_film_mono(const GrainRow *r);
void grain_mix(const GrainMix *m, u32 count);

typedef struct {
    s8 luma[TILE_H][LUMA_STRIDE];
    s8 cb[CHROMA_ROWS][CHROMA_STRIDE];
    s8 cr[CHROMA_ROWS][CHROMA_STRIDE];
    union {
        /* While the textures are built: the noise of a layer. */
        struct {
            u8 noise[TILE_H * TILE_W];
            u8 line[TILE_W + 6U];
        } build;
        /* While the planes are drawn, for the cells of a batch: their noise
           where it fades (the first block, or the whole cell in the rows of
           the fade), the first block of the cell above them, and the runs
           and the jobs of the NEON code for a row (`kinds` says what of each
           job moves on to the next row: job_kind). */
        struct {
            s8 fade_luma[BATCH][2][CELL_W];
            s8 fade_cb[BATCH][CELL_W / 2U * LAYERS];
            s8 fade_cr[BATCH][CELL_W / 2U * LAYERS];
            s8 corner_luma[BATCH][2][CHUNK];
            s8 corner_cb[BATCH][CHUNK_CHROMA];
            s8 corner_cr[BATCH][CHUNK_CHROMA];
            GrainSegment segments[3U * BATCH];
            GrainMix jobs[CELL_JOBS * BATCH];
            u8 kinds[CELL_JOBS * BATCH];
        } draw;
    } u;
    /* The tone of the plane (grain_lut), and the weights of the fade of the
       rows for grain_mix, which reads 16 at a time: own and above, by row. The
       third of each row is the weight of above negated. */
    u8 lut[TONES];
    s8 fade_rows[FADE][3][16];
    s8 half_rows[FADE / 2U][3][16];
    /* The weights of a neighbour whose grain is turned over against that of
       the cell (fade_rows[r][2] and half_rows[r][2] too): negated. */
    s8 flip_luma[CHUNK];
    s8 flip_chroma[CHUNK_CHROMA];
    /* The hashes of the cells of cell row place_row (0) and the one above
       (1), cell column cx at cx + 1. */
    u32 places[2][PLACES];
    u32 place_row, place_seed;
    /* The plan (the runs and the jobs in u.draw) of row plan_next - 1 of
       cell row plan_cy (0 none) of the plane of plan_seed, from cell
       plan_cx. */
    u32 plan_seed, plan_cy, plan_next, plan_cx, plan_jobs, plan_segments;
} Scratch;
_Static_assert(sizeof(Scratch) <= GRKU_PLANE_SCRATCH, "The grain fits the scratch");

/* splitmix32. */
static u32 mix(u32 *state)
{
    u32 z = *state += 0x9e3779b9U;
    z = (z ^ (z >> 16)) * 0x85ebca6bU;
    z = (z ^ (z >> 13)) * 0xc2b2ae35U;
    return z ^ (z >> 16);
}

/* The integer square root. */
static u32 root(u32 v)
{
    u32 r = 0, b = 1U << 30;
    while (b > v) b >>= 2;
    while (b) {
        if (v >= r + b) {
            v -= r + b;
            r = (r >> 1) + b;
        } else {
            r >>= 1;
        }
        b >>= 2;
    }
    return r;
}

/* The Gaussian blur of `sigma` (1/100 pixel) of the w x h tile, across and
   down, with its edges wrapped. `line` holds a row or column with 3 samples
   on each side. */
static void blur(u8 *tile, u32 w, u32 h, u8 *line, u32 sigma)
{
    u32 index = sigma <= 40U ? 0 : divide(sigma - 40U + 2U, 5U);
    const u16 *k = grain_kernel_table[index < KERNELS ? index : KERNELS - 1U];
    for (u32 pass = 0; pass < 2U; ++pass)
        for (u32 i = 0; i < (pass ? w : h); ++i) {
            u32 step = pass ? w : 1U, n = pass ? h : w;
            u8 *at = tile + (pass ? i : i * w);
            for (u32 j = 0; j < n; ++j) line[j + 3U] = at[j * step];
            for (u32 j = 0; j < 3U; ++j) {
                line[j] = line[n + j];
                line[n + 3U + j] = line[3U + j];
            }
            for (u32 j = 0; j < n; ++j) {
                const u8 *c = line + j + 3U;
                u32 sum = k[0] * c[0] + k[1] * ((u32)c[-1] + c[1]) + k[2] * ((u32)c[-2] + c[2]) + k[3] * ((u32)c[-3] + c[3]) + 2048U;
                at[j * step] = (u8)(sum >> 12);
            }
        }
}

/* The noise of layer `layer` in the w x h tile, around 128 before its
   scale. Returns the weight of the layer, the square root of the sum of the
   particle scales of its sublayers, x 256 / sqrt(1.6).

   Each sublayer is Gaussian noise (the binomial count of many particles)
   with the variance of its particle area, blurred by its dye clouds and by
   the grain blur. Their sum has the spectrum of the sum of their blurs,
   weighted by their variances; the blurs differ by less than a tenth of a
   pixel here, so the layer is one noise with the blur whose square is the
   weighted mean of their squares. */
static u32 grain_texture(u8 *tile, u8 *line, u32 w, u32 h, u32 layer, u32 area, u32 size_blur, u32 *state)
{
    u32 weights = 0, blurs = 0;
    for (u32 l = 0; l < SUBLAYERS; ++l) {
        u32 scale = layer_scale[layer] * sublayer_scale[l];
        /* The optical density of one particle is the area of a particle
           times the particles over a sublayer of a third of the density
           2.2: 0.2 um^2 x scale / (36 um^2 / 3) x 2.2 / 3, so the square of
           the dye cloud blur is 0.01222 x scale x area, here in 1/10000
           pixel^2. */
        u32 dye = divide(1222U * scale * area, 2000U);
        weights += scale;
        blurs += scale * (size_blur * size_blur + dye);
    }
    for (u32 i = 0; i < w * h; ++i) {
        u32 r = mix(state);
        tile[i] = (u8)((((r & 255U) + (r >> 8 & 255U) + (r >> 16 & 255U) + (r >> 24)) + 2U) >> 2);
    }
    blur(tile, w, h, line, root(divide(blurs, weights)));
    return root(divide(weights * 65536U, 160U));
}

/* The mean and the standard deviation (x 16) of a w x h tile. */
static void texture_stats(const u8 *tile, u32 w, u32 h, u32 *mean, u32 *deviation)
{
    u32 all = 0, squares = 0;
    for (u32 y = 0; y < h; ++y) {
        u32 row = 0, row_squares = 0;
        for (u32 x = 0; x < w; ++x) {
            u32 v = tile[y * w + x];
            row += v;
            row_squares += v * v;
        }
        all += row;
        squares += divide(row_squares, w);
    }
    *mean = divide(all + w * h / 2U, w * h);
    /* The variance from the mean of the squares, x 256. */
    u32 mean_q4 = divide(all * 16U, w * h);
    u32 square_q8 = divide(squares, h) * 256U;
    *deviation = square_q8 > mean_q4 * mean_q4 ? root(square_q8 - mean_q4 * mean_q4) : 0;
}

/* Give each row and then each column of the w x h tile the mean 128,
   twice, so that no row or column of the texture shows as a line. */
static void center(u8 *tile, u32 w, u32 h)
{
    for (u32 round = 0; round < 4U; ++round)
        for (u32 i = 0; i < (round & 1U ? w : h); ++i) {
            u32 step = round & 1U ? w : 1U, n = round & 1U ? h : w, sum = 0;
            u8 *at = tile + (round & 1U ? i : i * w);
            for (u32 j = 0; j < n; ++j) sum += at[j * step];
            int shift = 128 - (int)divide(sum + n / 2U, n);
            if (shift)
                for (u32 j = 0; j < n; ++j) at[j * step] = (u8)clamp(at[j * step] + shift);
        }
}

/* The chroma of one layer for the chroma textures: for each pair of each two
   rows (of the first 2 CHROMA_ROWS), the mean grain of the layer times its
   weight in Cb and in Cr. */
static void texture_chroma(Scratch *s, const s8 *g, u32 layer)
{
    for (u32 y = 0; y < CHROMA_ROWS; ++y)
        for (u32 j = 0; j < PAIRS; ++j) {
            const s8 *at = g + 2U * y * TILE_W + 2U * j;
            int m = at[0] + at[1] + at[TILE_W] + at[TILE_W + 1U];
            s->cb[y][LAYERS * j + layer] = (s8)sat8((m * cb_weight[layer] + 8192) >> 14);
            s->cr[y][LAYERS * j + layer] = (s8)sat8((m * cr_weight[layer] + 8192) >> 14);
        }
}

/* The textures. The deviation of the noise of R (of G for a mono picture)
   sets the scale, and B gets it times the weight of B, so B keeps its
   larger grain. The luma texture sums the layers in Y as they come. A mono
   picture needs only G, in the luma texture. */
static void grain_tiles(Scratch *s, u32 mono, u32 area, u32 size_blur, u32 state)
{
    u8 *noise = s->u.build.noise;
    u32 scale = 0, first = 1, mean, deviation;
    for (u32 l = mono ? 1U : 0; l < (mono ? 2U : LAYERS); ++l) {
        u32 weight = grain_texture(noise, s->u.build.line, TILE_W, TILE_H, l, area, size_blur, &state);
        center(noise, TILE_W, TILE_H);
        texture_stats(noise, TILE_W, TILE_H, &mean, &deviation);
        if (!scale) {
            first = weight;
            scale = divide(TILE_DEVIATION * 16U * 4096U + deviation / 2U, deviation ? deviation : 1U);
        }
        int k = (int)divide(scale * weight, first);
        s8 *g = (s8 *)noise;
        for (u32 i = 0; i < TILE_W * TILE_H; ++i) g[i] = (s8)sat8((((int)noise[i] - (int)mean) * k + 2048) >> 12);
        for (u32 i = 0; i < TILE_W * TILE_H; ++i) {
            s8 *y = &s->luma[i / TILE_W][i % TILE_W];
            *y = mono ? g[i] : (s8)sat8((l ? *y : 0) + ((luma_weight[l] * g[i] + 128) >> 8));
        }
        if (!mono) texture_chroma(s, g, l);
    }
    for (u32 y = 0; y < TILE_H; ++y)
        for (u32 x = 0; x < CHUNK; ++x) s->luma[y][TILE_W + x] = s->luma[y][x];
    for (u32 y = 0; y < CHROMA_ROWS; ++y)
        for (u32 x = 0; x < CHUNK_CHROMA; ++x) {
            s->cb[y][PAIRS * LAYERS + x] = s->cb[y][x];
            s->cr[y][PAIRS * LAYERS + x] = s->cr[y][x];
        }
}

/* The tone table of a plane `width` samples wide, of a main picture `main`
   samples wide, at strength `level`: the grain of a layer is its texture
   times lut / 128, so lut is the tone x 127 / 255 x strength / that of
   Extra Strong (TILE_DEVIATION), and a smaller plane, the screennail or the
   thumbnail, gets the grain that a reduction of the main picture would
   keep: weaker by the ratio of the widths. */
static void grain_lut(Scratch *s, u32 level, u32 width, u32 main)
{
    u32 q = divide(divide(127U * strength[level - 1U] * 1024U, 255U * 288U) * width, main);
    for (u32 i = 0; i < TONES; ++i) s->lut[i] = (u8)((grain_tone_table[i] * q + 512U) >> 10);
    for (u32 i = 0; i < 16U; ++i) {
        for (u32 r = 0; r < FADE; ++r) {
            s->fade_rows[r][0][i] = grain_fade_weight[0][r];
            s->fade_rows[r][1][i] = grain_fade_weight[1][r];
            s->fade_rows[r][2][i] = (s8)-grain_fade_weight[1][r];
        }
        for (u32 r = 0; r < FADE / 2U; ++r) {
            s->half_rows[r][0][i] = grain_half_weight[0][r];
            s->half_rows[r][1][i] = grain_half_weight[1][r];
            s->half_rows[r][2][i] = (s8)-grain_half_weight[1][r];
        }
        s->flip_luma[i] = (s8)-grain_seam_luma[1][i];
    }
    for (u32 i = 0; i < CHUNK_CHROMA; ++i) s->flip_chroma[i] = (s8)-grain_seam_chroma[1][i];
}

/* The arithmetic of the NEON code, in C. */
/* VQRSHRN.S16 #7 of a product or a sum of products. */
static int shrink(int p) { return sat8((p + 64) >> 7); }
/* The blend of grain_mix. */
static int mixed(int a, int b, int wa, int wb) { return shrink(a * wa + b * wb); }
/* The tone of a layer whose value x 32 is v (s16): VQSHRUN.S16 #8 and VTBL,
   which gives 0 past the table. */
static int tone_at(const u8 *lut, int v)
{
    v >>= 8;
    return v < 0 ? 0 : v < (int)TONES ? lut[v] : 0;
}
static u8 add(u8 v, int d) { return (u8)clamp(v + d); }
/* The sum of the luma samples of a pair that `mask` (bit 0, bit 1) holds,
   the one sample twice if it holds only one. */
static int pair_sum(const u8 *y, u32 mask) { return mask == 3U ? y[0] + y[1] : mask ? 2 * y[mask >> 1] : 0; }

/* The grain of one pair of samples: the luma samples y0[0], y0[1] (and
   y1[0], y1[1], the next row of 4:2:0), as many as `mask` holds (bits 0 and
   1 for y0, 2 and 3 for y1), and their CbCr sample c, with the luma noise
   g0 (g1) and the chroma noise cb and cr. R, G, and B x 32 come from the
   mean of the luma samples and the CbCr sample; each gets its tone, the
   luma samples the tone of the layers in Y, and Cb and Cr the sum of the
   chroma noise of each layer times its tone. */
static void film_pair(u8 *y0, u8 *y1, u8 *c, const s8 *g0, const s8 *g1, const s8 *cb, const s8 *cr, const u8 *lut, u32 mask, u32 flip)
{
    int s0 = pair_sum(y0, mask & 3U), s1 = y1 ? pair_sum(y1, mask >> 2) : 0, base;
    if (!y1 || !(mask >> 2)) base = s0 << 4;
    else if (!(mask & 3U)) base = s1 << 4;
    else base = (s0 + s1) << 3;
    int u = c[0] - 128, v = c[1] - 128;
    int t[LAYERS] = {tone_at(lut, base + 45 * v), tone_at(lut, base - 11 * u - 23 * v), tone_at(lut, base + 57 * u)};
    int luma = (luma_weight[0] * t[0] + luma_weight[1] * t[1] + luma_weight[2] * t[2]) >> 8;
    if (flip) {
        luma = -luma;
        for (u32 l = 0; l < LAYERS; ++l) t[l] = -t[l];
    }
    for (u32 i = 0; i < 2U; ++i) {
        if (mask >> i & 1U) y0[i] = add(y0[i], shrink(g0[i] * luma));
        if (mask >> (i + 2U) & 1U) y1[i] = add(y1[i], shrink(g1[i] * luma));
    }
    c[0] = add(c[0], shrink(cb[0] * t[0] + cb[1] * t[1] + cb[2] * t[2]));
    c[1] = add(c[1], shrink(cr[0] * t[0] + cr[1] * t[1] + cr[2] * t[2]));
}

/* The grain of one sample of a mono picture with luma noise g: the tone of
   its own value. */
static void mono_pixel(u8 *y, int g, const u8 *lut, u32 flip)
{
    int t = lut[*y >> 3];
    *y = add(*y, shrink(g * (flip ? -t : t)));
}

#if defined(__arm__) && !defined(GRAIN_SCALAR)
/* Registers of grain_film_422 and grain_film_420: d0 to d3 the tone table,
   d4 to d7 the weights 45, 11, 23, 57 of Cr in R, Cb and Cr in G, and Cb in
   B (x 32), d8 to d10 the weights of R, G, and B in Y, q6 0x80; q8 Y (even
   and odd samples), q7 the second row of 4:2:0, q9 Cb and Cr, d22 to d24
   the tones of R, G, B, d20 the tone in Y.
   FILM_TONES: the tones from q10, the luma of the pairs x 16 (x 8 for two
   rows), and q9, Cb and Cr minus 128.
   FILM_LUMA: the grain of the 16 samples of \q (\lo, \hi, at [\at]) from [\g]. */
__asm__(
    ".pushsection .text.grain_neon,\"ax\",%progbits\n"
    ".syntax unified\n"
    ".fpu neon\n"
    ".thumb\n"
    ".macro FILM_SETUP\n"
    "    push {r4, r5, r6, r7, r8, r9, r10, r11, lr}\n"
    "    vpush {d8-d15}\n"
    "    ldr r1, [r0, #0]\n"
    "    ldr r10, [r0, #4]\n"
    "    ldr r2, [r0, #8]\n"
    "    ldr r3, [r0, #12]\n"
    "    ldr r4, [r0, #16]\n"
    "    ldr r12, [r0, #20]\n"
    "    vld1.8 {d0-d3}, [r12]\n"
    "    vmov.i8 d4, #45\n"
    "    vmov.i8 d5, #11\n"
    "    vmov.i8 d6, #23\n"
    "    vmov.i8 d7, #57\n"
    "    vmov.i8 d8, #77\n"
    "    vmov.i8 d9, #150\n"
    "    vmov.i8 d10, #29\n"
    "    vmov.i8 q6, #0x80\n"
    ".endm\n"
    ".macro FILM_TONES\n"
    "    vmov q11, q10\n"
    "    vmlal.s8 q11, d19, d4\n"
    "    vmov q12, q10\n"
    "    vmlsl.s8 q12, d18, d5\n"
    "    vmlsl.s8 q12, d19, d6\n"
    "    vmlal.s8 q10, d18, d7\n"
    "    vqshrun.s16 d22, q11, #8\n"
    "    vqshrun.s16 d23, q12, #8\n"
    "    vqshrun.s16 d24, q10, #8\n"
    "    vtbl.8 d22, {d0-d3}, d22\n"
    "    vtbl.8 d23, {d0-d3}, d23\n"
    "    vtbl.8 d24, {d0-d3}, d24\n"
    "    vmull.u8 q13, d22, d8\n"
    "    vmlal.u8 q13, d23, d9\n"
    "    vmlal.u8 q13, d24, d10\n"
    "    vshrn.u16 d20, q13, #8\n"
    ".endm\n"
    ".macro FILM_LUMA q, lo, hi, at, g\n"
    "    vld2.8 {d26, d27}, [\\g]!\n"
    "    vmull.s8 q14, d26, d20\n"
    "    vmull.s8 q15, d27, d20\n"
    "    vqrshrn.s16 d26, q14, #7\n"
    "    vqrshrn.s16 d27, q15, #7\n"
    "    veor \\q, \\q, q6\n"
    "    vqadd.s8 \\q, \\q, q13\n"
    "    veor \\q, \\q, q6\n"
    "    vst2.8 {\\lo, \\hi}, [\\at]!\n"
    ".endm\n"
    ".macro FILM_CHROMA\n"
    "    vld3.8 {d26, d27, d28}, [r8]!\n"
    "    vmull.s8 q8, d26, d22\n"
    "    vmlal.s8 q8, d27, d23\n"
    "    vmlal.s8 q8, d28, d24\n"
    "    vld3.8 {d26, d27, d28}, [r9]!\n"
    "    vmull.s8 q15, d26, d22\n"
    "    vmlal.s8 q15, d27, d23\n"
    "    vmlal.s8 q15, d28, d24\n"
    "    vqrshrn.s16 d16, q8, #7\n"
    "    vqrshrn.s16 d17, q15, #7\n"
    "    vqadd.s8 q9, q9, q8\n"
    "    veor q9, q9, q6\n"
    "    vst2.8 {d18, d19}, [r2]!\n"
    ".endm\n"
    /* FILM_FLIP: the tones of a cell whose grain is turned over (its sign
       bit, GrainSegment). */
    ".macro FILM_FLIP\n"
    "    vneg.s8 q11, q11\n"
    "    vneg.s8 d24, d24\n"
    "    vneg.s8 d20, d20\n"
    ".endm\n"
    ".macro FILM_422_TONES\n"
    "    vld2.8 {d16, d17}, [r1]\n"
    "    vld2.8 {d18, d19}, [r2]\n"
    "    veor q9, q9, q6\n"
    "    vaddl.u8 q10, d16, d17\n"
    "    vshl.i16 q10, q10, #4\n"
    "    FILM_TONES\n"
    ".endm\n"
    ".macro FILM_420_TONES\n"
    "    vld2.8 {d16, d17}, [r1]\n"
    "    vld2.8 {d14, d15}, [r10]\n"
    "    vld2.8 {d18, d19}, [r2]\n"
    "    veor q9, q9, q6\n"
    "    vaddl.u8 q10, d16, d17\n"
    "    vaddw.u8 q10, q10, d14\n"
    "    vaddw.u8 q10, q10, d15\n"
    "    vshl.i16 q10, q10, #3\n"
    "    FILM_TONES\n"
    ".endm\n"
    /* FILM_SEGMENT: the chunks of a segment in r5, its sign bit in C. */
    ".macro FILM_SEGMENT\n"
    "    ldm r3!, {r5, r6, r7, r8, r9}\n"
    "    lsls r5, r5, #1\n"
    "    lsr r5, r5, #1\n"
    ".endm\n"
    ".p2align 2\n"
    ".global grain_film_422\n"
    ".type grain_film_422, %function\n"
    ".thumb_func\n"
    "grain_film_422:\n"
    "    FILM_SETUP\n"
    "    cmp r4, #0\n"
    "    beq 9f\n"
    "2:  FILM_SEGMENT\n"
    "    bcs 3f\n"
    "1:  FILM_422_TONES\n"
    "    FILM_LUMA q8, d16, d17, r1, r6\n"
    "    FILM_CHROMA\n"
    "    subs r5, r5, #1\n"
    "    bne 1b\n"
    "    b 4f\n"
    "3:  FILM_422_TONES\n"
    "    FILM_FLIP\n"
    "    FILM_LUMA q8, d16, d17, r1, r6\n"
    "    FILM_CHROMA\n"
    "    subs r5, r5, #1\n"
    "    bne 3b\n"
    "4:  subs r4, r4, #1\n"
    "    bne 2b\n"
    "9:  vpop {d8-d15}\n"
    "    pop {r4, r5, r6, r7, r8, r9, r10, r11, pc}\n"
    ".size grain_film_422, .-grain_film_422\n"
    ".p2align 2\n"
    ".global grain_film_420\n"
    ".type grain_film_420, %function\n"
    ".thumb_func\n"
    "grain_film_420:\n"
    "    FILM_SETUP\n"
    "    cmp r4, #0\n"
    "    beq 9f\n"
    "2:  FILM_SEGMENT\n"
    "    bcs 3f\n"
    "1:  FILM_420_TONES\n"
    "    FILM_LUMA q8, d16, d17, r1, r6\n"
    "    FILM_LUMA q7, d14, d15, r10, r7\n"
    "    FILM_CHROMA\n"
    "    subs r5, r5, #1\n"
    "    bne 1b\n"
    "    b 4f\n"
    "3:  FILM_420_TONES\n"
    "    FILM_FLIP\n"
    "    FILM_LUMA q8, d16, d17, r1, r6\n"
    "    FILM_LUMA q7, d14, d15, r10, r7\n"
    "    FILM_CHROMA\n"
    "    subs r5, r5, #1\n"
    "    bne 3b\n"
    "4:  subs r4, r4, #1\n"
    "    bne 2b\n"
    "9:  vpop {d8-d15}\n"
    "    pop {r4, r5, r6, r7, r8, r9, r10, r11, pc}\n"
    ".size grain_film_420, .-grain_film_420\n"
    /* grain_film_mono: d0 to d3 the tone table, q2 0x80; it keeps d8 to
       d15. MONO_TONES: the tones of 16 samples in q10, MONO_LUMA their
       grain. */
    ".macro MONO_TONES\n"
    "    vld1.8 {d16, d17}, [r1]\n"
    "    vld1.8 {d26, d27}, [r6]!\n"
    "    vshr.u8 q10, q8, #3\n"
    "    vtbl.8 d20, {d0-d3}, d20\n"
    "    vtbl.8 d21, {d0-d3}, d21\n"
    ".endm\n"
    ".macro MONO_LUMA\n"
    "    vmull.s8 q14, d26, d20\n"
    "    vmull.s8 q15, d27, d21\n"
    "    vqrshrn.s16 d26, q14, #7\n"
    "    vqrshrn.s16 d27, q15, #7\n"
    "    veor q8, q8, q2\n"
    "    vqadd.s8 q8, q8, q13\n"
    "    veor q8, q8, q2\n"
    "    vst1.8 {d16, d17}, [r1]!\n"
    ".endm\n"
    ".p2align 2\n"
    ".global grain_film_mono\n"
    ".type grain_film_mono, %function\n"
    ".thumb_func\n"
    "grain_film_mono:\n"
    "    push {r4, r5, r6, r7, r8, r9, r10, lr}\n"
    "    ldr r1, [r0, #0]\n"
    "    ldr r3, [r0, #12]\n"
    "    ldr r4, [r0, #16]\n"
    "    ldr r12, [r0, #20]\n"
    "    vld1.8 {d0-d3}, [r12]\n"
    "    vmov.i8 q2, #0x80\n"
    "    cmp r4, #0\n"
    "    beq 9f\n"
    "2:  FILM_SEGMENT\n"
    "    bcs 3f\n"
    "1:  MONO_TONES\n"
    "    MONO_LUMA\n"
    "    subs r5, r5, #1\n"
    "    bne 1b\n"
    "    b 4f\n"
    "3:  MONO_TONES\n"
    "    vneg.s8 q10, q10\n"
    "    MONO_LUMA\n"
    "    subs r5, r5, #1\n"
    "    bne 3b\n"
    "4:  subs r4, r4, #1\n"
    "    bne 2b\n"
    "9:  pop {r4, r5, r6, r7, r8, r9, r10, pc}\n"
    ".size grain_film_mono, .-grain_film_mono\n"
    /* grain_mix(jobs, count): 16 bytes a loop, then 8 if the count of
       groups is odd. */
    ".p2align 2\n"
    ".global grain_mix\n"
    ".type grain_mix, %function\n"
    ".thumb_func\n"
    "grain_mix:\n"
    "    push {r4, r5, r6, r7, r8, r9, r10, lr}\n"
    "    cmp r1, #0\n"
    "    beq 9f\n"
    "2:  ldm r0!, {r2, r3, r4, r5, r6, r7, r8}\n"
    "    lsl r9, r8, #1\n"
    "    subs r7, r7, #2\n"
    "    blt 3f\n"
    "1:  vld1.8 {d0, d1}, [r3]!\n"
    "    vld1.8 {d2, d3}, [r4]!\n"
    "    vld1.8 {d4, d5}, [r5], r9\n"
    "    vld1.8 {d6, d7}, [r6], r9\n"
    "    vmull.s8 q8, d0, d4\n"
    "    vmull.s8 q9, d1, d5\n"
    "    vmlal.s8 q8, d2, d6\n"
    "    vmlal.s8 q9, d3, d7\n"
    "    vqrshrn.s16 d0, q8, #7\n"
    "    vqrshrn.s16 d1, q9, #7\n"
    "    vst1.8 {d0, d1}, [r2]!\n"
    "    subs r7, r7, #2\n"
    "    bge 1b\n"
    "3:  adds r7, r7, #2\n"
    "    beq 4f\n"
    "    vld1.8 {d0}, [r3]\n"
    "    vld1.8 {d2}, [r4]\n"
    "    vld1.8 {d4}, [r5]\n"
    "    vld1.8 {d6}, [r6]\n"
    "    vmull.s8 q8, d0, d4\n"
    "    vmlal.s8 q8, d2, d6\n"
    "    vqrshrn.s16 d0, q8, #7\n"
    "    vst1.8 {d0}, [r2]\n"
    "4:  subs r1, r1, #1\n"
    "    bne 2b\n"
    "9:  pop {r4, r5, r6, r7, r8, r9, r10, pc}\n"
    ".size grain_mix, .-grain_mix\n"
    ".purgem FILM_SETUP\n"
    ".purgem FILM_TONES\n"
    ".purgem FILM_LUMA\n"
    ".purgem FILM_CHROMA\n"
    ".purgem FILM_FLIP\n"
    ".purgem FILM_422_TONES\n"
    ".purgem FILM_420_TONES\n"
    ".purgem FILM_SEGMENT\n"
    ".purgem MONO_TONES\n"
    ".purgem MONO_LUMA\n"
    ".popsection\n");
#else
static void film_blocks(const GrainRow *r, u32 two)
{
    u8 *y0 = r->y0, *y1 = r->y1, *c = r->c;
    for (u32 i = 0; i < r->count; ++i) {
        const GrainSegment *g = &r->segments[i];
        for (u32 k = 0; k < (g->chunks & ~FLIP) * CHUNK / 2U; ++k) {
            film_pair(y0, two ? y1 : 0, c, g->g0 + 2U * k, two ? g->g1 + 2U * k : 0, g->cb + LAYERS * k, g->cr + LAYERS * k, r->lut,
                      two ? 15U : 3U, g->chunks >> 31);
            y0 += 2;
            y1 += 2;
            c += 2;
        }
    }
}
void grain_film_422(const GrainRow *r) { film_blocks(r, 0); }
void grain_film_420(const GrainRow *r) { film_blocks(r, 1); }
void grain_film_mono(const GrainRow *r)
{
    u8 *y = r->y0;
    for (u32 i = 0; i < r->count; ++i)
        for (u32 x = 0; x < (r->segments[i].chunks & ~FLIP) * CHUNK; ++x) mono_pixel(y++, r->segments[i].g0[x], r->lut, r->segments[i].chunks >> 31);
}
void grain_mix(const GrainMix *m, u32 count)
{
    for (u32 j = 0; j < count; ++j, ++m)
        for (u32 g = 0; g < m->groups; ++g)
            for (u32 i = 0; i < 8U; ++i) m->out[8U * g + i] = (s8)mixed(m->a[8U * g + i], m->b[8U * g + i], m->wa[m->step * g + i], m->wb[m->step * g + i]);
}
#endif

/* The place of a cell in the textures: a hash of the cell and the seed of
   the plane. Its column is even and its row even for 4:2:0, so that a pair
   and a chroma row start where those of the picture do. */
static u32 cell_hash(u32 seed, u32 cx, u32 cy)
{
    u32 h = seed + cx * 0x9e3779b1U + cy * 0x85ebca77U;
    h ^= h >> 15;
    h *= 0x2c1b3c6dU;
    h ^= h >> 12;
    h *= 0x297a2d39U;
    h ^= h >> 15;
    return h;
}
static u32 place_x(u32 h) { return (h & 127U) << 1; }
static u32 place_y(u32 h) { return (h >> 7) & (TILE_H - 2U); }
/* The grain of a cell turned over: half of the cells, so that a feature of
   the textures shows, in one cell of two, the other way. */
static u32 flip_of(u32 h) { return h >> 15 & 1U; }

/* The hash of cell (cx, cy), from the cell rows that the scratch keeps
   (cy and the one above) where it can. */
static u32 place_of(Scratch *s, u32 seed, u32 cx, u32 cy)
{
    if (s->place_row != cy + 1U || s->place_seed != seed) {
        s->place_row = cy + 1U;
        s->place_seed = seed;
        for (u32 i = 0; i < PLACES; ++i) {
            s->places[0][i] = cell_hash(seed, i - 1U, cy);
            s->places[1][i] = cell_hash(seed, i - 1U, cy - 1U);
        }
    }
    return cx + 1U < PLACES ? s->places[0][cx + 1U] : cell_hash(seed, cx, cy);
}
static u32 place_above(const Scratch *s, u32 seed, u32 cx, u32 cy)
{
    return cx + 1U < PLACES ? s->places[1][cx + 1U] : cell_hash(seed, cx, cy - 1U);
}

/* A row of the grain: the chroma row `c` of luma rows y (and y + 1 for 4:2:0,
   rows = 2) of a plane, and where it is in its cell row. */
typedef struct {
    u8 *luma[2], *c;
    u32 rows, mono, half, seed, y, cy, t;
} Row;

/* The texture rows of luma row k of `row` and of its chroma in the cell
   whose hash is h, here or (with `above`) in the cell above, where the
   rows of that cell continue. */
static u32 luma_row(const Row *row, u32 h, u32 k, u32 above)
{
    return (row->t + k + place_y(h) + (above ? CELL_H : 0)) & (TILE_H - 1U);
}
static u32 tile_row(const Row *row, u32 h, u32 above) { return luma_row(row, h, 0, above) >> 1 & (CHROMA_ROWS - 1U); }
/* The noise of block `chunk` of the cell whose hash is h: the column of the
   block, past the end of a texture row from its start. */
static u32 column_of(u32 h, u32 chunk)
{
    u32 x = place_x(h) + CHUNK * chunk;
    return x > TILE_W ? x - TILE_W : x;
}
/* The first block of the cell whose hash is h that starts its texture row
   again. */
static u32 wrap_of(u32 h) { return ((TILE_W - place_x(h)) >> 4) + 1U; }

/* What of a job of grain_mix moves on with the next row (next_rows): a and
   b (texture rows), and wa and wb (the weights of the fade of the next row);
   MOVE_CHROMA for a job of Cb or Cr. */
#define MOVE_A 1U
#define MOVE_B 2U
#define MOVE_W 4U
#define MOVE_CHROMA 8U

/* A job of grain_mix. */
static GrainMix *job_of(Scratch *s, GrainMix *job, u32 kind, s8 *out, const s8 *a, const s8 *b, const s8 *wa, const s8 *wb, u32 groups,
                        u32 step)
{
    job->out = out;
    job->a = a;
    job->b = b;
    job->wa = wa;
    job->wb = wb;
    job->groups = groups;
    job->step = step;
    s->u.draw.kinds[job - s->u.draw.jobs] = (u8)kind;
    return job + 1;
}

/* The jobs of the blend of the first block of the cell whose hash is h with
   the cell on its left (hash left), here or (with `above`) where the rows of
   both continue, into luma, cb, and cr. */
static GrainMix *seam_jobs(Scratch *s, GrainMix *job, const Row *row, u32 h, u32 left, u32 above, s8 *const *luma, s8 *cb, s8 *cr)
{
    u32 flip = flip_of(h) != flip_of(left);
    for (u32 k = 0; k < row->rows; ++k)
        job = job_of(s, job, MOVE_A | MOVE_B, luma[k], s->luma[luma_row(row, h, k, above)] + place_x(h),
                     s->luma[luma_row(row, left, k, above)] + column_of(left, CHUNKS), grain_seam_luma[0], flip ? s->flip_luma : grain_seam_luma[1], CHUNK / 8U, 8);
    if (row->mono) return job;
    for (u32 p = 0; p < 2U; ++p) {
        s8(*tile)[CHROMA_STRIDE] = p ? s->cr : s->cb;
        job = job_of(s, job, MOVE_A | MOVE_B | MOVE_CHROMA, p ? cr : cb, tile[tile_row(row, h, above)] + place_x(h) / 2U * LAYERS,
                     tile[tile_row(row, left, above)] + column_of(left, CHUNKS) / 2U * LAYERS, grain_seam_chroma[0], flip ? s->flip_chroma : grain_seam_chroma[1],
                     CHUNK_CHROMA / 8U, 8);
    }
    return job;
}

/* The weights of the fade of the rows of `row`: luma row k, or its chroma. */
static const s8 *fade_of(const Scratch *s, const Row *row, u32 k, u32 other, u32 chroma)
{
    if (chroma && row->half) return s->half_rows[row->t >> 1][other];
    return s->fade_rows[row->t + k][other];
}

/* The jobs of the fade of chunks c0 to c1 of the cell whose hash is h (of
   the batch, i) with the cell above (hash above). */
static GrainMix *fade_jobs(Scratch *s, GrainMix *job, const Row *row, u32 i, u32 h, u32 above, u32 c0, u32 c1)
{
    u32 other = flip_of(h) != flip_of(above) ? 2U : 1U;
    for (u32 k = 0; k < row->rows; ++k)
        job = job_of(s, job, MOVE_A | MOVE_B | MOVE_W, s->u.draw.fade_luma[i][k] + CHUNK * c0, s->luma[luma_row(row, h, k, 0)] + column_of(h, c0),
                     s->luma[luma_row(row, above, k, 1)] + column_of(above, c0), fade_of(s, row, k, 0, 0), fade_of(s, row, k, other, 0),
                     (c1 - c0) * (CHUNK / 8U), 0);
    if (row->mono) return job;
    for (u32 p = 0; p < 2U; ++p) {
        s8(*tile)[CHROMA_STRIDE] = p ? s->cr : s->cb;
        job = job_of(s, job, MOVE_A | MOVE_B | MOVE_W | MOVE_CHROMA, (p ? s->u.draw.fade_cr[i] : s->u.draw.fade_cb[i]) + CHUNK_CHROMA * c0,
                     tile[tile_row(row, h, 0)] + column_of(h, c0) / 2U * LAYERS, tile[tile_row(row, above, 1)] + column_of(above, c0) / 2U * LAYERS,
                     fade_of(s, row, 0, 0, 1), fade_of(s, row, 0, other, 1), (c1 - c0) * (CHUNK_CHROMA / 8U), 0);
    }
    return job;
}

/* The NEON code over the runs of `row` from luma sample x. */
static void run_blocks(Scratch *s, const Row *row, u32 x, const GrainSegment *segments, u32 count)
{
    GrainRow r;
    r.y0 = row->luma[0] + x;
    r.y1 = row->luma[1] + x;
    r.c = row->c + x;
    r.segments = segments;
    r.count = count;
    r.lut = s->lut;
    if (row->mono) grain_film_mono(&r);
    else if (row->rows == 2U) grain_film_420(&r);
    else grain_film_422(&r);
}

/* One run of the texture of the cell whose hash is h, chunks c0 to c1. */
static GrainSegment *texture_run(Scratch *s, GrainSegment *g, const Row *row, u32 h, u32 c0, u32 c1)
{
    u32 x = column_of(h, c0);
    g->chunks = (c1 - c0) | (flip_of(h) ? FLIP : 0);
    g->g0 = s->luma[luma_row(row, h, 0, 0)] + x;
    g->g1 = s->luma[luma_row(row, h, 1, 0)] + x;
    g->cb = s->cb[tile_row(row, h, 0)] + x / 2U * LAYERS;
    g->cr = s->cr[tile_row(row, h, 0)] + x / 2U * LAYERS;
    return g + 1;
}
/* A run of the faded noise of cell i of the batch, chunks c0 to c1. */
static GrainSegment *fade_run(Scratch *s, GrainSegment *g, u32 i, u32 c0, u32 c1, u32 flip)
{
    g->chunks = (c1 - c0) | (flip ? FLIP : 0);
    g->g0 = s->u.draw.fade_luma[i][0] + CHUNK * c0;
    g->g1 = s->u.draw.fade_luma[i][1] + CHUNK * c0;
    g->cb = s->u.draw.fade_cb[i] + CHUNK_CHROMA * c0;
    g->cr = s->u.draw.fade_cr[i] + CHUNK_CHROMA * c0;
    return g + 1;
}

/* The texture rows `rows` further on, past the end of a texture from its
   start: luma (a pointer into s->luma) or chroma (into tile, of `size`
   rows). */
static const s8 *luma_next(const Scratch *s, const s8 *p, u32 rows)
{
    p += rows * LUMA_STRIDE;
    return p >= (const s8 *)s->luma + sizeof s->luma ? p - sizeof s->luma : p;
}
static const s8 *chroma_next(const s8 *p, const s8 *tile, u32 size)
{
    p += CHROMA_STRIDE;
    return p >= tile + size * CHROMA_STRIDE ? p - size * CHROMA_STRIDE : p;
}

/* The NEON code over the plan of `row` from block b0, and then the plan of
   the next row while it stays in the fade or out of it: each texture
   pointer one row (two luma rows for 4:2:0) further on, the chroma one row
   of pairs when the next luma row starts one (each two luma rows), and the
   weights of the fade those of the next row. */
static void next_rows(Scratch *s, const Row *row, u32 b0)
{
    u32 size = CHROMA_ROWS, t = row->t + row->rows, chroma = row->half || (row->t & 1U);
    const s8 *cb = s->cb[0], *cr = s->cr[0];
    grain_mix(s->u.draw.jobs, s->plan_jobs);
    run_blocks(s, row, b0 * CHUNK, s->u.draw.segments, s->plan_segments);
    s->plan_next = t < CELL_H && (row->t < FADE) == (t < FADE) ? t + 1U : 0;
    if (!s->plan_next) return;
    for (u32 i = 0; i < s->plan_jobs; ++i) {
        GrainMix *job = &s->u.draw.jobs[i];
        u32 kind = s->u.draw.kinds[i];
        if (kind & MOVE_CHROMA) {
            const s8 *tile = (u32)(job->a - cr) < size * CHROMA_STRIDE ? cr : cb;
            if (chroma && (kind & MOVE_A)) job->a = chroma_next(job->a, tile, size);
            if (chroma && (kind & MOVE_B)) job->b = chroma_next(job->b, tile, size);
        } else {
            if (kind & MOVE_A) job->a = luma_next(s, job->a, row->rows);
            if (kind & MOVE_B) job->b = luma_next(s, job->b, row->rows);
        }
        if (kind & MOVE_W) {
            u32 rows = kind & MOVE_CHROMA ? 1U : row->rows;
            job->wa += rows * sizeof s->fade_rows[0];
            job->wb += rows * sizeof s->fade_rows[0];
        }
    }
    for (u32 i = 0; i < s->plan_segments; ++i) {
        GrainSegment *g = &s->u.draw.segments[i];
        if ((u32)(g->g0 - s->luma[0]) >= sizeof s->luma) continue;
        g->g0 = luma_next(s, g->g0, row->rows);
        g->g1 = g->g0 + LUMA_STRIDE;
        if (!chroma) continue;
        g->cb = chroma_next(g->cb, cb, size);
        g->cr = chroma_next(g->cr, cr, size);
    }
}

/* The blocks b0 to b1 (of the picture row) of the cells cx0 to cx1
   (excluded) of `row`. Out of the fade: the runs of the textures, and the
   first block of each cell from its seam. In the fade: the cell and the cell
   above, each with its seam, blended. The plan is built at the first row
   of a cell row (or of its fade) and moved on from row to row. */
static void row_blocks(Scratch *s, const Row *row, u32 cx0, u32 cx1, u32 b0, u32 b1)
{
    if (s->plan_next != row->t + 1U || s->plan_cy != row->cy || s->plan_seed != row->seed || s->plan_cx != cx0) {
        GrainSegment *g = s->u.draw.segments;
        GrainMix *job = s->u.draw.jobs;
        for (u32 cx = cx0; cx < cx1; ++cx) {
            u32 i = cx - cx0, h = place_of(s, row->seed, cx, row->cy), left = place_of(s, row->seed, cx - 1U, row->cy);
            u32 c0 = cx * CHUNKS < b0 ? b0 - cx * CHUNKS : 0, c1 = (cx + 1U) * CHUNKS > b1 ? b1 - cx * CHUNKS : CHUNKS;
            s8 *luma[2] = {s->u.draw.fade_luma[i][0], s->u.draw.fade_luma[i][1]};
            if (row->t >= FADE) {
                if (!c0) {
                    job = seam_jobs(s, job, row, h, left, 0, luma, s->u.draw.fade_cb[i], s->u.draw.fade_cr[i]);
                    g = fade_run(s, g, i, 0, 1, flip_of(h));
                    c0 = 1;
                }
                u32 wrap = wrap_of(h);
                if (c0 < c1 && c0 < wrap) g = texture_run(s, g, row, h, c0, c1 < wrap ? c1 : wrap);
                if (wrap < c1) g = texture_run(s, g, row, h, c0 > wrap ? c0 : wrap, c1);
                continue;
            }
            u32 above = place_above(s, row->seed, cx, row->cy);
            u32 other = flip_of(h) != flip_of(above) ? 2U : 1U;
            if (!c0) {
                s8 *corner[2] = {s->u.draw.corner_luma[i][0], s->u.draw.corner_luma[i][1]};
                job = seam_jobs(s, job, row, h, left, 0, luma, s->u.draw.fade_cb[i], s->u.draw.fade_cr[i]);
                job = seam_jobs(s, job, row, above, place_above(s, row->seed, cx - 1U, row->cy), 1, corner, s->u.draw.corner_cb[i],
                                s->u.draw.corner_cr[i]);
                for (u32 k = 0; k < row->rows; ++k)
                    job = job_of(s, job, MOVE_W, luma[k], luma[k], corner[k], fade_of(s, row, k, 0, 0), fade_of(s, row, k, other, 0), CHUNK / 8U, 0);
                for (u32 p = 0; p < (row->mono ? 0 : 2U); ++p) {
                    s8 *out = p ? s->u.draw.fade_cr[i] : s->u.draw.fade_cb[i];
                    job = job_of(s, job, MOVE_W | MOVE_CHROMA, out, out, p ? s->u.draw.corner_cr[i] : s->u.draw.corner_cb[i], fade_of(s, row, 0, 0, 1),
                                 fade_of(s, row, 0, other, 1), CHUNK_CHROMA / 8U, 0);
                }
            }
            /* The runs from chunk max(c0, 1) to c1 where neither texture
               starts its row again. */
            u32 cuts[4] = {c0 ? c0 : 1U, wrap_of(h), wrap_of(above), c1};
            if (cuts[1] > cuts[2]) {
                u32 t = cuts[1];
                cuts[1] = cuts[2];
                cuts[2] = t;
            }
            u32 from = cuts[0];
            for (u32 n = 1; n < 4U; ++n) {
                u32 to = cuts[n] < c1 ? cuts[n] : c1;
                if (to > from) {
                    job = fade_jobs(s, job, row, i, h, above, from, to);
                    from = to;
                }
            }
            g = fade_run(s, g, i, c0, c1, flip_of(h));
        }
        s->plan_jobs = (u32)(job - s->u.draw.jobs);
        s->plan_segments = (u32)(g - s->u.draw.segments);
        s->plan_seed = row->seed;
        s->plan_cy = row->cy;
        s->plan_cx = cx0;
    }
    next_rows(s, row, b0);
}

/* The noise of luma row k of `row` at sample x, and of the chroma of layer
   l of pair x / 2, in C, as the NEON code and grain_mix give it. */
static int luma_tile(const Scratch *s, const Row *row, u32 k, u32 h, u32 at, u32 above)
{
    return s->luma[luma_row(row, h, k, above)][(place_x(h) + at) & (TILE_W - 1U)];
}
/* The weight w of a neighbour (hash b) of the cell whose hash is a, negated
   if one of their grains is turned over. */
static int other_weight(u32 a, u32 b, int w) { return flip_of(a) != flip_of(b) ? -w : w; }
static int luma_noise(Scratch *s, const Row *row, u32 k, u32 x)
{
    u32 cx = x / CELL_W, at = x % CELL_W, h = place_of(s, row->seed, cx, row->cy), left = place_of(s, row->seed, cx - 1U, row->cy);
    int v = luma_tile(s, row, k, h, at, 0);
    if (at < CHUNK) v = mixed(v, luma_tile(s, row, k, left, CELL_W + at, 0), grain_seam_luma[0][at], other_weight(h, left, grain_seam_luma[1][at]));
    if (row->t < FADE) {
        u32 above = place_above(s, row->seed, cx, row->cy), corner = place_above(s, row->seed, cx - 1U, row->cy);
        int a = luma_tile(s, row, k, above, at, 1);
        if (at < CHUNK)
            a = mixed(a, luma_tile(s, row, k, corner, CELL_W + at, 1), grain_seam_luma[0][at], other_weight(above, corner, grain_seam_luma[1][at]));
        v = mixed(v, a, fade_of(s, row, k, 0, 0)[0], other_weight(h, above, fade_of(s, row, k, 1, 0)[0]));
    }
    return v;
}
static int chroma_tile(const Scratch *s, const Row *row, u32 p, u32 h, u32 j, u32 l, u32 above)
{
    const s8 *tile = (p ? s->cr : s->cb)[tile_row(row, h, above)];
    return tile[((place_x(h) / 2U + j) & (PAIRS - 1U)) * LAYERS + l];
}
static int chroma_noise(Scratch *s, const Row *row, u32 p, u32 x, u32 l)
{
    u32 cx = x / CELL_W, j = x % CELL_W / 2U, h = place_of(s, row->seed, cx, row->cy), left = place_of(s, row->seed, cx - 1U, row->cy);
    int v = chroma_tile(s, row, p, h, j, l, 0);
    if (j < CHUNK / 2U)
        v = mixed(v, chroma_tile(s, row, p, left, CELL_W / 2U + j, l, 0), grain_seam_chroma[0][LAYERS * j],
                  other_weight(h, left, grain_seam_chroma[1][LAYERS * j]));
    if (row->t < FADE) {
        u32 above = place_above(s, row->seed, cx, row->cy), corner = place_above(s, row->seed, cx - 1U, row->cy);
        int a = chroma_tile(s, row, p, above, j, l, 1);
        if (j < CHUNK / 2U)
            a = mixed(a, chroma_tile(s, row, p, corner, CELL_W / 2U + j, l, 1), grain_seam_chroma[0][LAYERS * j],
                      other_weight(above, corner, grain_seam_chroma[1][LAYERS * j]));
        v = mixed(v, a, fade_of(s, row, 0, 0, 1)[0], other_weight(h, above, fade_of(s, row, 0, 1, 1)[0]));
    }
    return v;
}

/* The samples x0 to x1 (excluded) of `row` in C, with the luma rows that
   `rows` (bit 0, bit 1) holds: the edges of the visible area. */
static void row_c(Scratch *s, const Row *row, u32 x0, u32 x1, u32 rows)
{
    if (row->mono) {
        for (u32 x = x0; x < x1; ++x) mono_pixel(row->luma[0] + x, luma_noise(s, row, 0, x), s->lut, flip_of(place_of(s, row->seed, x / CELL_W, row->cy)));
        return;
    }
    for (u32 j = x0 >> 1; j < (x1 + 1U) >> 1; ++j) {
        u32 x = j << 1, mask = 0;
        s8 g[2][2] = {{0, 0}, {0, 0}}, cb[LAYERS], cr[LAYERS];
        for (u32 i = 0; i < 2U; ++i)
            if (x + i >= x0 && x + i < x1)
                for (u32 k = 0; k < row->rows; ++k)
                    if (rows >> k & 1U) {
                        mask |= 1U << (2U * k + i);
                        g[k][i] = (s8)luma_noise(s, row, k, x + i);
                    }
        for (u32 l = 0; l < LAYERS; ++l) {
            cb[l] = (s8)chroma_noise(s, row, 0, x, l);
            cr[l] = (s8)chroma_noise(s, row, 1, x, l);
        }
        film_pair(row->luma[0] + x, row->rows == 2U ? row->luma[1] + x : 0, row->c + x, g[0], g[1], cb, cr, s->lut, mask,
                  flip_of(place_of(s, row->seed, x / CELL_W, row->cy)));
    }
}

/* The grain of one row of a plane: the blocks of CHUNK samples that the
   visible area holds whole in NEON, and the samples around them in C. A
   4:2:0 row of which one luma row is outside the visible area is all C. */
static void grain_row(Scratch *s, const Plane *p, Row *row, u32 rows)
{
    u32 x0 = p->left, x1 = p->right, b0 = (x0 + CHUNK - 1U) / CHUNK, b1 = x1 / CHUNK;
    if (rows != (1U << row->rows) - 1U || b0 >= b1) {
        row_c(s, row, x0, x1, rows);
        return;
    }
    row_c(s, row, x0, b0 * CHUNK, rows);
    row_c(s, row, b1 * CHUNK, x1, rows);
    u32 first = b0 / CHUNKS, last = (b1 - 1U) / CHUNKS + 1U;
    for (u32 cx = first; cx < last; cx += BATCH) {
        u32 end = cx + BATCH < last ? cx + BATCH : last;
        u32 c0 = cx * CHUNKS > b0 ? cx * CHUNKS : b0, c1 = end * CHUNKS < b1 ? end * CHUNKS : b1;
        row_blocks(s, row, cx, end, c0, c1);
    }
}

/* The grain of a plane, row by row: the luma rows of a mono picture, or the
   chroma rows of a color one with their one or two luma rows. */
static void grain_plane(const Plane *p, Scratch *s, u32 seed, u32 mono)
{
    u32 two = !mono && p->half;
    u32 first = two ? p->top >> 1 : p->top, last = two ? (p->bottom + 1U) >> 1 : p->bottom;
    for (u32 r = first; r < last; ++r) {
        Row row;
        u32 rows = 0;
        row.rows = two ? 2U : 1U;
        row.mono = mono;
        row.half = two;
        row.seed = seed;
        row.y = two ? r << 1 : r;
        row.cy = row.y / CELL_H;
        row.t = row.y % CELL_H;
        for (u32 k = 0; k < row.rows; ++k) {
            row.luma[k] = (u8 *)GRKU_BYTES(p->y + (row.y + k) * p->pitch);
            if (row.y + k >= p->top && row.y + k < p->bottom) rows |= 1U << k;
        }
        if (row.rows == 1U) row.luma[1] = row.luma[0];
        row.c = mono ? row.luma[0] : (u8 *)GRKU_BYTES(p->c + r * p->pitch);
        grain_row(s, p, &row, rows);
    }
}

/* The grain size of a shot for CORE.GRAIN_SIZE Auto: by its ISO. */
static u32 size_of_iso(const PictureSet *set)
{
    GrkuShot shot;
    shot.size = sizeof(GrkuShot);
    shot.known = 0;
    picture_shot(set, &shot);
    if (!(shot.known & GRKU_SHOT_EXPOSURE)) return 1;
    return shot.iso <= 400U ? 1U : shot.iso <= 800U ? 2U : 3U;
}

/* The seed of a picture: some samples of the main picture and the shot, so
   that each picture gets its own grain, and the same picture the same. */
static u32 seed_of(const PictureSet *set, const Plane *main)
{
    GrkuShot shot;
    u32 seed = 0x6a09e667U;
    shot.size = sizeof(GrkuShot);
    shot.known = 0;
    picture_shot(set, &shot);
    /* Only what the core filled: the rest of `shot` is undefined. */
    if (shot.known & GRKU_SHOT_EXPOSURE) seed ^= shot.exposure_us * 0x9e3779b1U ^ (u32)shot.sv << 7 ^ (u32)shot.av << 19;
    if (shot.known & GRKU_SHOT_TAKEN)
        seed ^= (u32)shot.taken.second << 24 ^ (u32)shot.taken.minute << 16 ^ (u32)shot.taken.hour << 8;
    for (u32 i = 1; i <= 64U; ++i) {
        u32 y = main->top + divide((main->bottom - main->top) * i, 65U);
        u32 x = main->left + divide((main->right - main->left) * i, 65U);
        seed = (seed ^ GRKU_BYTES(main->y + y * main->pitch + x)[0]) * 0x01000193U;
    }
    return seed;
}

/* Film-like grain of `level` 1 to 4 and `size` 1 to 3 on each plane of the
   set. The textures follow the chroma of each plane: a plane whose chroma
   differs from that of the one before builds them again, from the same
   noise. */
void grain_draw(PictureSet *set, u32 level, u32 size)
{
    if (!level || level > 4U || !size || size > 3U || !set->count) return;
    const Plane *main = &set->planes[0];
    for (u32 i = 1; i < set->count; ++i)
        if (set->planes[i].width > main->width) main = &set->planes[i];
    if (main->right <= main->left || main->bottom <= main->top) return;
    Scratch *s = (Scratch *)(void *)set->scratch;
    u32 state = seed_of(set, main), tiles = mix(&state);
    grain_tiles(s, set->mono, area_halves[level - 1U], blur_of_size[size - 1U], tiles);
    for (u32 i = 0; i < set->count; ++i) {
        const Plane *p = &set->planes[i];
        if (p->right <= p->left || p->bottom <= p->top) continue;
        u32 seed = mix(&state);
        s->place_row = 0;
        s->plan_next = 0;
        grain_lut(s, level, p->width, main->width);
        grain_plane(p, s, seed, set->mono);
    }
}

/* The filter of CORE.GRAIN: the core calls it with the strength 1 to 4.
   In the System style the native grain stage draws the grain. */
void grain_apply(PictureSet *set, u32 level)
{
    if (setting_get(SETTING_STYLE) != 1U) return;
    u32 size = setting_get(USED_CORE_GRAIN_SIZE);
    grain_draw(set, level, size ? size : size_of_iso(set));
}
