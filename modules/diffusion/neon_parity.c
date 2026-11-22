/* The NEON parity test of Film Softness (softness.c, softness_kernels.c).
   It is not a source of the module: the ignored test
   synthetic_softness_neon_parity (crates/grku-build/src/tests/modules.rs)
   builds it for 32-bit ARM Linux with both files twice, once with NEON and
   once with SOFT_SCALAR (C only, the functions named scalar_<name>), and
   runs it with qemu-arm.

   Each kernel runs on the same random inputs, parameters, and lengths in
   both builds, with lengths that end in a NEON block and in a C tail; then
   softness_apply runs on the same random planes: each level, 4:2:2 and
   4:2:0 chroma, colour and monochrome, odd visible areas, and a pitch wider
   than the plane. The outputs must be equal byte for byte. Standard output
   names each case that differs, and the exit status is their number. */
#include "softness_kernels.h"

void softness_apply(PictureSet *set, u32 level);
void scalar_softness_apply(PictureSet *set, u32 level);
void scalar_soft_column(const u8 *const rows[9], u8 *out, u8 *copy, u32 n, const SoftParams *p);
void scalar_soft_row(const u8 *col, u32 step, const u8 *row, u8 *out, u32 n, const SoftParams *p);

/* The freestanding link has no C library. */
void *memset(void *d, int v, __SIZE_TYPE__ n)
{
    u8 *p = d;
    while (n--) *p++ = (u8)v;
    return d;
}
void *memcpy(void *d, const void *s, __SIZE_TYPE__ n)
{
    u8 *p = d;
    const u8 *q = s;
    while (n--) *p++ = *q++;
    return d;
}
void __aeabi_memset(void *d, __SIZE_TYPE__ n, int v) { memset(d, v, n); }
void __aeabi_memclr(void *d, __SIZE_TYPE__ n) { memset(d, 0, n); }
void __aeabi_memclr4(void *d, __SIZE_TYPE__ n) { memset(d, 0, n); }
void __aeabi_memcpy(void *d, const void *s, __SIZE_TYPE__ n) { memcpy(d, s, n); }
void __aeabi_memcpy4(void *d, const void *s, __SIZE_TYPE__ n) { memcpy(d, s, n); }
void __aeabi_memcpy8(void *d, const void *s, __SIZE_TYPE__ n) { memcpy(d, s, n); }
void __aeabi_memclr8(void *d, __SIZE_TYPE__ n) { memset(d, 0, n); }

static void sys_write(const char *text)
{
    u32 n = 0;
    while (text[n]) ++n;
    register u32 r0 __asm__("r0") = 1;
    register const char *r1 __asm__("r1") = text;
    register u32 r2 __asm__("r2") = n;
    register u32 r7 __asm__("r7") = 4;
    __asm__ volatile("svc #0" : "+r"(r0) : "r"(r1), "r"(r2), "r"(r7) : "memory");
}

static void sys_exit(u32 code)
{
    register u32 r0 __asm__("r0") = code;
    register u32 r7 __asm__("r7") = 1;
    __asm__ volatile("svc #0" : : "r"(r0), "r"(r7));
    for (;;) {}
}

static u32 seed = 0x9e3779b9U;
static u32 next(void)
{
    seed ^= seed << 13;
    seed ^= seed >> 17;
    seed ^= seed << 5;
    return seed;
}
/* A random value below n, without a division: n is at most 65536. */
static u32 below(u32 n) { return (u32)(((next() >> 16) * n) >> 16); }

static int same(const u8 *a, const u8 *b, u32 n)
{
    while (n--)
        if (*a++ != *b++) return 0;
    return 1;
}

/* Random bytes, or a smooth ramp with a little noise, which keeps most
   differences inside `keep`. */
static void fill(u8 *a, u8 *b, u32 n)
{
    u32 smooth = below(2), level = below(256);
    for (u32 i = 0; i < n; ++i) {
        u32 v = smooth ? (level + (i >> 5) + below(5)) & 255U : next() & 255U;
        a[i] = b[i] = (u8)v;
    }
}

/* Random symmetric weights of 256, the centre below 256, a third of them
   of 5 taps (w[3] and w[4] 0, the short NEON code), and random shares. */
static SoftParams params(void)
{
    SoftParams p;
    u32 left = 128;
    u32 five = below(3) == 0;
    for (u32 i = 4; i >= 1; --i) {
        p.w[i] = (u16)(five && i >= 3U ? 0U : below(left / 2U + 1U));
        left -= p.w[i];
    }
    if (left == 128U) {
        p.w[1] = 1;
        left = 127;
    }
    p.w[0] = (u16)(2U * left);
    p.up8 = (u16)below(2049);
    p.down8 = (u16)below(2049);
    p.keep = (u16)(below(2) ? below(200) : 0);
    return p;
}

#define KERNEL_CASES 400U
#define MAX_N 300U
#define PAD 8U

static u8 rows[9][MAX_N], cols[2][MAX_N + 2U * PAD], line[2][MAX_N], outs[2][MAX_N], copies[2][MAX_N];

static u32 kernels(void)
{
    u32 failures = 0;
    for (u32 c = 0; c < KERNEL_CASES; ++c) {
        u32 n = 1U + below(MAX_N), step = 1U + below(2);
        SoftParams p = params();
        const u8 *taps[9];
        for (u32 i = 0; i < 9U; ++i) {
            fill(rows[i], rows[i], n);
            taps[i] = rows[i];
        }
        soft_column(taps, outs[0], copies[0], n, &p);
        scalar_soft_column(taps, outs[1], copies[1], n, &p);
        if (!same(outs[0], outs[1], n) || !same(copies[0], copies[1], n) || !same(copies[0], rows[4], n)) {
            sys_write("differs: soft_column\n");
            ++failures;
        }
        fill(cols[0], cols[1], n + 2U * PAD);
        fill(line[0], line[1], n);
        soft_row(cols[0] + PAD, step, line[0], outs[0], n, &p);
        scalar_soft_row(cols[1] + PAD, step, line[1], outs[1], n, &p);
        if (!same(outs[0], outs[1], n)) {
            sys_write("differs: soft_row\n");
            ++failures;
        }
    }
    return failures;
}

/* A picture wider than SOFT_MIN_SIDE, with room for a wider pitch. */
#define PICTURE_W 1700U
#define PICTURE_H 140U
#define PITCH_MAX (PICTURE_W + 32U)
#define PLANE_BYTES (PITCH_MAX * PICTURE_H * 2U)
static u8 memory[2][PLANE_BYTES];
static u8 scratch[2][GRKU_PLANE_SCRATCH];

static PictureSet picture(u8 *base, u8 *work, u32 w, u32 pitch, u32 half, u32 mono)
{
    PictureSet set = {0};
    Plane *p = &set.planes[0];
    p->y = (u32)base;
    p->c = p->y + pitch * PICTURE_H;
    p->width = w;
    p->height = PICTURE_H;
    p->pitch = pitch;
    p->half = half;
    p->left = below(3) ? 0 : below(40);
    p->top = below(3) ? 0 : below(20);
    p->right = w - (below(3) ? 0 : below(40));
    p->bottom = PICTURE_H - (below(3) ? 0 : below(20));
    set.count = 1;
    set.mono = mono;
    set.scratch = work;
    return set;
}

#define PLANE_CASES 24U

static u32 planes(void)
{
    u32 failures = 0;
    for (u32 c = 0; c < PLANE_CASES; ++c) {
        u32 level = 1U + c % 3U, half = below(3) == 0, mono = below(4) == 0;
        u32 w = (PICTURE_W - 2U * below(40)), pitch = w + 2U * below(16);
        u32 s;
        PictureSet a, b;
        fill(memory[0], memory[1], PLANE_BYTES);
        s = seed;
        a = picture(memory[0], scratch[0], w, pitch, half, mono);
        seed = s;
        b = picture(memory[1], scratch[1], w, pitch, half, mono);
        softness_apply(&a, level);
        scalar_softness_apply(&b, level);
        if (!same(memory[0], memory[1], PLANE_BYTES)) {
            sys_write("differs: softness_apply\n");
            ++failures;
        }
    }
    return failures;
}

static int parity_main(void)
{
    u32 failures = kernels() + planes();
    if (!failures) sys_write("film softness: NEON == C\n");
    return (int)failures;
}

void _start(void) { sys_exit((u32)parity_main()); }
