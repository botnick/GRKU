/* Film Softness: the softness of a scanned film frame on each recorded
   picture.

   A film scan does not show the hard pixel detail of a digital picture: the
   film and the scanner both lose the finest detail gradually, and light
   scatters a little in the emulsion, so a bright edge spreads into its dark
   side more than a dark edge eats into the light. The filter does the same
   on the YCbCr planes of the main picture, row by row:

   1. blur: a Gaussian down and across the plane, about 0.9, 1.4, or 2
      pixels wide for Low, Medium, and High, which takes the detail at
      the pixel scale and keeps the detail a few pixels wide;
   2. move each luma byte towards that blur, further up than down: a pixel
      darker than its surroundings rises by UP, one brighter falls only by
      DOWN, so highlights roll off at their edges and keep their light, and
      thin dark lines against the light fade as on film. The first KEEP of
      the difference stays: faint texture such as grain and the noise of the
      sensor keep their bite, as the grain of a scan does, so the picture
      looks soft and not smeared;
   3. colour: the chroma pairs take the same blur over twice the width (a
      chroma pair spans two pixels), so colour edges soften as the dyes of
      colour film do. Monochrome pictures keep their chroma.

   Low is the sharpest scans, Medium a typical scan, High a soft one. The
   filter runs at the frame stage after Diffusion, Glow and Light Leak, as
   the scan comes after the light reached the film, and before the date. The
   native grain of the camera comes before every module filter, so the KEEP
   above is what keeps it crisp. The screennail and thumbnail stay as they
   are: a pixel of theirs covers many of the picture, and at that size the
   softness does not show.

   The core calls the filter while SOFTNESS is on, whatever the diffusion
   STRENGTH. */
#include "grku.h"
#include "softness_kernels.h"

void softness_apply(PictureSet *set, u32 level);

/* Planes whose long side is below this stay as they are. */
#define SOFT_MIN_SIDE 1600U
/* The widest row: GR IV pictures are 6192 pixels wide. */
#define SOFT_MAX_ROW 8192U
/* Room before and after the column blur of a row: 4 steps of 2 bytes. */
#define SOFT_PAD 8U

/* Luma and chroma of each level: Low, Medium, High. The luma kernels are
   the Gaussians of sigma 0.9, 1.4 (the binomial of 9), and 2 pixels; the
   chroma kernels have 5 taps, the cheaper kernel code, and a pair is two
   pixels wide, so the colour softens over about 2 pixels across. */
static const SoftParams LUMA[3] = {
    {{114, 61, 10, 0, 0}, 1280, 768, 48},
    {{70, 56, 28, 8, 1}, 1664, 1024, 48},
    {{52, 46, 32, 17, 7}, 1920, 1280, 48},
};
static const SoftParams CHROMA[3] = {
    {{114, 61, 10, 0, 0}, 1280, 1280, 0},
    {{96, 64, 16, 0, 0}, 1664, 1664, 0},
    {{96, 64, 16, 0, 0}, 2048, 2048, 0},
};

typedef struct {
    u8 *ring[5]; /* copies of the last five rows before the filter, oldest first */
    u8 *col;     /* the column blur of a row, after SOFT_PAD bytes */
} Rows;

/* Soften rows `top` to `bottom` - 1 of a plane of rows `pitch` bytes apart
   from `base`, bytes `left` to `left` + n - 1 of each, a value every `step`
   bytes (1 for luma, 2 for the interleaved CbCr). */
static void soften(Rows *r, u32 base, u32 pitch, u32 top, u32 bottom, u32 left, u32 n, u32 step,
                   const SoftParams *p)
{
    u32 y, i, pad = 4U * step;
    u8 *col = r->col;
    for (y = top; y < bottom; ++y) {
        u8 *row = (u8 *)(void *)GRKU_BYTES(base + y * pitch + left);
        const u8 *taps[9];
        /* The oldest copy takes this row: ring[4] is row y, ring[i] row
           y - 4 + i. The core has no division, so no modulo. */
        u8 *now = r->ring[0];
        u32 first = y - top < 4U ? 4U - (y - top) : 0U; /* ring[first] holds row top */
        for (i = 0; i < 4U; ++i) r->ring[i] = r->ring[i + 1U];
        r->ring[4] = now;
        /* Rows above come from the copies, this row and the rows below from
           the plane; the edge rows repeat. The column blur copies this row
           to `now` before the row blur writes it. */
        for (i = 0; i < 4U; ++i) {
            u32 down = y + 1U + i < bottom ? y + 1U + i : bottom - 1U;
            taps[i] = y == top ? row : r->ring[i > first ? i : first];
            taps[5U + i] = (const u8 *)(void *)GRKU_BYTES(base + down * pitch + left);
        }
        taps[4] = row;
        soft_column(taps, col, now, n, p);
        /* The ends repeat the first and last value of each kind. */
        for (i = 1; i <= pad; ++i) {
            col[-(int)i] = col[(pad - i) & (step - 1U)];
            col[n - 1U + i] = col[n - step + ((i - 1U) & (step - 1U))];
        }
        soft_row(col, step, now, row, n, p);
    }
}

void softness_apply(PictureSet *set, u32 level)
{
    u32 i;
    Rows r;
    u8 *m = set->scratch;
    if (!level) return;
    if (level > 3U) level = 3U;
    for (i = 0; i < 5U; ++i) r.ring[i] = m + i * SOFT_MAX_ROW;
    r.col = m + 5U * SOFT_MAX_ROW + SOFT_PAD;
    for (i = 0; i < set->count; ++i) {
        const Plane *p = &set->planes[i];
        u32 w, h, left, right, ctop, cbottom;
        if (p->right > p->width || p->bottom > p->height || p->right <= p->left || p->bottom <= p->top) continue;
        w = p->right - p->left;
        h = p->bottom - p->top;
        if ((w > h ? w : h) < SOFT_MIN_SIDE || w > SOFT_MAX_ROW || w < 16U || h < 16U) continue;
        soften(&r, p->y, p->pitch, p->top, p->bottom, p->left, w, 1U, &LUMA[level - 1U]);
        if (set->mono) continue;
        /* The chroma pairs that the visible area touches. */
        left = p->left & ~1U;
        right = (p->right + 1U) & ~1U;
        if (right > p->width) right = p->width;
        ctop = p->half ? p->top >> 1 : p->top;
        cbottom = p->half ? (p->bottom + 1U) >> 1 : p->bottom;
        soften(&r, p->c, p->pitch, ctop, cbottom, left, right - left, 2U, &CHROMA[level - 1U]);
    }
}

/* The rows and the column blur fit the scratch of the call. */
_Static_assert(5U * SOFT_MAX_ROW + SOFT_MAX_ROW + 2U * SOFT_PAD <= GRKU_PLANE_SCRATCH, "Film Softness scratch");
