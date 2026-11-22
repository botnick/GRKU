/* The row kernels of Film Softness (softness_kernels.h). */
#include "softness_kernels.h"

/* ---- C ------------------------------------------------------------------ */

static void column_c(const u8 *const rows[9], u8 *out, u8 *copy, u32 from, u32 to, const SoftParams *p)
{
    u32 i;
    for (i = from; i < to; ++i) {
        u32 s = p->w[0] * rows[4][i] + p->w[1] * (rows[3][i] + rows[5][i]) + p->w[2] * (rows[2][i] + rows[6][i]) +
                p->w[3] * (rows[1][i] + rows[7][i]) + p->w[4] * (rows[0][i] + rows[8][i]);
        out[i] = (u8)((s + 128U) >> 8);
        copy[i] = rows[4][i];
    }
}

/* The move of one byte, as the NEON code makes it: vqrdmulh gives
   (2 d k + 2^15) >> 16. */
static u8 row_c(const u8 *c, u32 s, u32 v, const SoftParams *p)
{
    int n = (int)s;
    u32 b = p->w[0] * c[0] + p->w[1] * (c[-n] + c[n]) + p->w[2] * (c[-2 * n] + c[2 * n]) +
            p->w[3] * (c[-3 * n] + c[3 * n]) + p->w[4] * (c[-4 * n] + c[4 * n]);
    int keep = p->keep, d = (int)((b + 8U) >> 4) - (int)(v << 4), k, out;
    d -= d < -keep ? -keep : d > keep ? keep : d;
    k = d > 0 ? p->up8 : p->down8;
    out = (int)v + ((2 * d * k + 32768) >> 16);
    return (u8)(out < 0 ? 0 : out > 255 ? 255 : out);
}

/* ---- NEON --------------------------------------------------------------- */

/* Each kernel has a 9-tap form and a 5-tap form for kernels whose w[3] and
   w[4] are 0, which skips their loads and multiplies. */
#if SOFT_NEON
void soft_neon_column9(const u8 *const rows[9], u8 *out, u32 blocks, const SoftParams *p, u8 *copy);
void soft_neon_column5(const u8 *const rows[9], u8 *out, u32 blocks, const SoftParams *p, u8 *copy);
void soft_neon_row9(const u8 *col, u32 step, const u8 *row, u8 *out, u32 blocks, const SoftParams *p);
void soft_neon_row5(const u8 *col, u32 step, const u8 *row, u8 *out, u32 blocks, const SoftParams *p);
_Static_assert(sizeof(SoftParams) == 16, "the NEON code loads SoftParams as 8 halfwords");

/* soft_neon_columnN(rows, out, blocks, params, copy): 8 columns at a time,
   and row 4 copied to `copy`. d0 to d4 hold w0 to w4 in each byte. */
#define SOFT_COLUMN_HEAD(NAME)                                   \
    ".p2align 2\n"                                               \
    ".global " NAME "\n"                                         \
    ".type " NAME ", %function\n"                                \
    ".thumb_func\n"                                              \
    NAME ":\n"                                                   \
    "    cmp r2, #0\n"                                           \
    "    beq 2f\n"                                               \
    "    push {r4, r5, r6, r7, r8, r9, r10, r11, lr}\n"          \
    "    ldr r12, [sp, #36]\n"                                   \
    "    vld1.16 {d6, d7}, [r3]\n"                               \
    "    vdup.8 d0, d6[0]\n"                                     \
    "    vdup.8 d1, d6[2]\n"                                     \
    "    vdup.8 d2, d6[4]\n"                                     \
    "    vdup.8 d3, d6[6]\n"                                     \
    "    vdup.8 d4, d7[0]\n"                                     \
    "    ldm r0, {r3, r4, r5, r6, r7, r8, r9, r10, r11}\n"       \
    "1:  vld1.8 {d18}, [r5]!\n"      /* row 2 */                 \
    "    vld1.8 {d19}, [r6]!\n"                                  \
    "    vld1.8 {d20}, [r7]!\n"      /* row 4 */                 \
    "    vld1.8 {d21}, [r8]!\n"                                  \
    "    vld1.8 {d22}, [r9]!\n"      /* row 6 */                 \
    "    vmull.u8 q13, d20, d0\n"                                \
    "    vst1.8 {d20}, [r12]!\n"                                 \
    "    vmlal.u8 q13, d19, d1\n"                                \
    "    vmlal.u8 q13, d21, d1\n"                                \
    "    vmlal.u8 q13, d18, d2\n"                                \
    "    vmlal.u8 q13, d22, d2\n"
#define SOFT_COLUMN_OUTER                                        \
    "    vld1.8 {d16}, [r3]!\n"      /* row 0 */                 \
    "    vld1.8 {d17}, [r4]!\n"                                  \
    "    vld1.8 {d23}, [r10]!\n"                                 \
    "    vld1.8 {d24}, [r11]!\n"     /* row 8 */                 \
    "    vmlal.u8 q13, d17, d3\n"                                \
    "    vmlal.u8 q13, d23, d3\n"                                \
    "    vmlal.u8 q13, d16, d4\n"                                \
    "    vmlal.u8 q13, d24, d4\n"
#define SOFT_COLUMN_TAIL(NAME)                                   \
    "    vrshrn.i16 d26, q13, #8\n"                              \
    "    vst1.8 {d26}, [r1]!\n"                                  \
    "    subs r2, r2, #1\n"                                      \
    "    bne 1b\n"                                               \
    "    pop {r4, r5, r6, r7, r8, r9, r10, r11, lr}\n"           \
    "2:  bx lr\n"                                                \
    ".size " NAME ", .-" NAME "\n"
/* soft_neon_rowN(col, step, row, out, blocks, params): 8 bytes at a time.
   d0 to d4 hold w0 to w4 in each byte, q3 keep, q5 -keep, q14 up8, q15
   down8. r5 walks the taps from col - REACH step, r6 is TAPS step - 8. */
#define SOFT_ROW_HEAD(NAME, REACH, TAPS)                         \
    ".p2align 2\n"                                               \
    ".global " NAME "\n"                                         \
    ".type " NAME ", %function\n"                                \
    ".thumb_func\n"                                              \
    NAME ":\n"                                                   \
    "    push {r4, r5, r6, r7, lr}\n"                            \
    "    ldr r4, [sp, #20]\n"                                    \
    "    ldr r5, [sp, #24]\n"                                    \
    "    cmp r4, #0\n"                                           \
    "    beq 2f\n"                                               \
    "    vpush {d8-d11}\n"                                       \
    "    vld1.16 {d8, d9}, [r5]\n"                               \
    "    vdup.8 d0, d8[0]\n"                                     \
    "    vdup.8 d1, d8[2]\n"                                     \
    "    vdup.8 d2, d8[4]\n"                                     \
    "    vdup.8 d3, d8[6]\n"                                     \
    "    vdup.8 d4, d9[0]\n"                                     \
    "    vdup.16 q14, d9[1]\n"                                   \
    "    vdup.16 q15, d9[2]\n"                                   \
    "    vdup.16 q3, d9[3]\n"                                    \
    "    vneg.s16 q5, q3\n"                                      \
    "    mov r6, #" TAPS "\n"                                    \
    "    mul r6, r6, r1\n"                                       \
    "    sub r6, r6, #8\n"                                       \
    "    mov r5, #" REACH "\n"                                   \
    "    mul r5, r5, r1\n"                                       \
    "    sub r5, r0, r5\n"
#define SOFT_ROW_TAIL(NAME)                                      \
    "    sub r5, r5, r6\n"                                       \
    "    vrshr.u16 q13, q13, #4\n"   /* the blur, x16 */          \
    "    vld1.8 {d18}, [r2]!\n"                                  \
    "    vshll.u8 q8, d18, #4\n"     /* the byte, x16 */          \
    "    vsub.i16 q13, q13, q8\n"    /* d */                      \
    "    vmax.s16 q8, q13, q5\n"                                 \
    "    vmin.s16 q8, q8, q3\n"                                  \
    "    vsub.i16 q13, q13, q8\n"    /* d less what keep keeps */ \
    "    vcgt.s16 q8, q13, #0\n"                                 \
    "    vbsl q8, q14, q15\n"        /* k */                      \
    "    vqrdmulh.s16 q13, q13, q8\n"                            \
    "    vaddw.u8 q13, q13, d18\n"                               \
    "    vqmovun.s16 d20, q13\n"                                 \
    "    vst1.8 {d20}, [r3]!\n"                                  \
    "    subs r4, r4, #1\n"                                      \
    "    bne 1b\n"                                               \
    "    vpop {d8-d11}\n"                                        \
    "2:  pop {r4, r5, r6, r7, lr}\n"                             \
    "    bx lr\n"                                                \
    ".size " NAME ", .-" NAME "\n"
__asm__(
    ".pushsection .text.soft_neon,\"ax\",%progbits\n"
    ".syntax unified\n"
    ".fpu neon\n"
    ".thumb\n"
    SOFT_COLUMN_HEAD("soft_neon_column9")
    SOFT_COLUMN_OUTER
    SOFT_COLUMN_TAIL("soft_neon_column9")
    SOFT_COLUMN_HEAD("soft_neon_column5")
    SOFT_COLUMN_TAIL("soft_neon_column5")
    SOFT_ROW_HEAD("soft_neon_row9", "4", "9")
    "1:  vld1.8 {d16}, [r5], r1\n"
    "    vld1.8 {d17}, [r5], r1\n"
    "    vld1.8 {d18}, [r5], r1\n"
    "    vld1.8 {d19}, [r5], r1\n"
    "    vld1.8 {d20}, [r5], r1\n"
    "    vld1.8 {d21}, [r5], r1\n"
    "    vld1.8 {d22}, [r5], r1\n"
    "    vld1.8 {d23}, [r5], r1\n"
    "    vld1.8 {d24}, [r5], r1\n"
    "    vmull.u8 q13, d20, d0\n"
    "    vmlal.u8 q13, d19, d1\n"
    "    vmlal.u8 q13, d21, d1\n"
    "    vmlal.u8 q13, d18, d2\n"
    "    vmlal.u8 q13, d22, d2\n"
    "    vmlal.u8 q13, d17, d3\n"
    "    vmlal.u8 q13, d23, d3\n"
    "    vmlal.u8 q13, d16, d4\n"
    "    vmlal.u8 q13, d24, d4\n"
    SOFT_ROW_TAIL("soft_neon_row9")
    SOFT_ROW_HEAD("soft_neon_row5", "2", "5")
    "1:  vld1.8 {d18}, [r5], r1\n"
    "    vld1.8 {d19}, [r5], r1\n"
    "    vld1.8 {d20}, [r5], r1\n"
    "    vld1.8 {d21}, [r5], r1\n"
    "    vld1.8 {d22}, [r5], r1\n"
    "    vmull.u8 q13, d20, d0\n"
    "    vmlal.u8 q13, d19, d1\n"
    "    vmlal.u8 q13, d21, d1\n"
    "    vmlal.u8 q13, d18, d2\n"
    "    vmlal.u8 q13, d22, d2\n"
    SOFT_ROW_TAIL("soft_neon_row5")
    ".popsection\n");
#endif

void soft_column(const u8 *const rows[9], u8 *out, u8 *copy, u32 n, const SoftParams *p)
{
    u32 done = 0;
#if SOFT_NEON
    done = n & ~7U;
    if (p->w[3] | p->w[4])
        soft_neon_column9(rows, out, n >> 3, p, copy);
    else
        soft_neon_column5(rows, out, n >> 3, p, copy);
#endif
    column_c(rows, out, copy, done, n, p);
}

void soft_row(const u8 *col, u32 step, const u8 *row, u8 *out, u32 n, const SoftParams *p)
{
    u32 i = 0;
#if SOFT_NEON
    i = n & ~7U;
    if (p->w[3] | p->w[4])
        soft_neon_row9(col, step, row, out, n >> 3, p);
    else
        soft_neon_row5(col, step, row, out, n >> 3, p);
#endif
    for (; i < n; ++i) out[i] = row_c(col + i, step, row[i], p);
}
