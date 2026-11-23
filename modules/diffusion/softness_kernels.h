/* The row kernels of Film Softness (softness.c): each runs NEON on its whole
   blocks of 8 bytes and C on the rest, with the same arithmetic, so that the
   output does not depend on which part took a byte. On the host, and with
   SOFT_SCALAR (the NEON parity test), C takes every byte. */
#ifndef SOFTNESS_KERNELS_H
#define SOFTNESS_KERNELS_H
#include "grku.h"

#if defined(__arm__) && !defined(SOFT_SCALAR)
#define SOFT_NEON 1
#else
#define SOFT_NEON 0
#endif

/* The parameters of a pass, in the order that the NEON code loads them:
   the weights of a symmetric 9-tap kernel from its centre out, each 0 to
   255 (the NEON code multiplies bytes), with w[0] + 2 (w[1] + w[2] + w[3]
   + w[4]) = 256; the share x 8 of the way to the
   blur for a byte below it (up8) and above it (down8), 0 to 2048, and the
   difference to the blur that stays, in 1/16 levels (keep), 0 to 4080. */
typedef struct { u16 w[5], up8, down8, keep; } SoftParams;

/* The blur of n columns down nine rows, rounded to bytes, and a copy of
   the middle row (rows[4]) to `copy`. */
void soft_column(const u8 *const rows[9], u8 *out, u8 *copy, u32 n, const SoftParams *p);
/* Each of n bytes of `row` towards the blur along the column blurs `col`
   `step` bytes apart around it (col[-4 step] to col[4 step], so the caller
   pads the ends), into `out`. The first `keep` / 16 levels of the
   difference stay, so faint texture such as grain keeps its bite; of the
   rest, a byte below the blur moves up8 / 2048 of the way, a byte above it
   down8 / 2048 of the way. `row` and `out` may be the same. */
void soft_row(const u8 *col, u32 step, const u8 *row, u8 *out, u32 n, const SoftParams *p);
#endif
