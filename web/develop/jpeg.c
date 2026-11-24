/* A baseline JPEG of the main plane, 4:2:2 as the camera records it, with a
   border around the picture (CORE.BORDER, runtime/canvas.h) and the EXIF of
   the source. The planes go into the file as they are: no conversion back to
   RGB, no canvas of the size of the picture. The bytes leave in pieces
   through the import `flush`, so a 24-megapixel file needs no buffer of its
   size. The tables are those of the JPEG standard (Annex K), scaled for the
   quality as libjpeg scales them; the DCT is the AAN float DCT of libjpeg. */
#include "develop.h"

__attribute__((import_module("env"), import_name("flush"))) void js_flush(const u8 *data, u32 bytes);
__attribute__((import_module("env"), import_name("progress"))) void js_progress(u32 done, u32 total);

static u8 *buffer;
static u32 capacity, used;

static void put(u8 b)
{
    buffer[used++] = b;
    if (used == capacity) {
        js_flush(buffer, used);
        used = 0;
    }
}
static void put16(u32 v)
{
    put((u8)(v >> 8));
    put((u8)v);
}

static u32 bits, nbits;
static void put_bits(u32 code, u32 n)
{
    bits = bits << n | (code & ((1U << n) - 1U));
    nbits += n;
    while (nbits >= 8U) {
        u8 b = (u8)(bits >> (nbits - 8U));
        put(b);
        if (b == 0xff) put(0);
        nbits -= 8U;
    }
}

static const u8 zigzag[64] = {0,  1,  8,  16, 9,  2,  3,  10, 17, 24, 32, 25, 18, 11, 4,  5,  12, 19, 26, 33, 40, 48,
                              41, 34, 27, 20, 13, 6,  7,  14, 21, 28, 35, 42, 49, 56, 57, 50, 43, 36, 29, 22, 15, 23,
                              30, 37, 44, 51, 58, 59, 52, 45, 38, 31, 39, 46, 53, 60, 61, 54, 47, 55, 62, 63};
static const u8 base_luma[64] = {16, 11, 10, 16, 24,  40,  51,  61,  12, 12, 14, 19, 26,  58,  60,  55,
                                 14, 13, 16, 24, 40,  57,  69,  56,  14, 17, 22, 29, 51,  87,  80,  62,
                                 18, 22, 37, 56, 68,  109, 103, 77,  24, 35, 55, 64, 81,  104, 113, 92,
                                 49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99};
static const u8 base_chroma[64] = {17, 18, 24, 47, 99, 99, 99, 99, 18, 21, 26, 66, 99, 99, 99, 99,
                                   24, 26, 56, 99, 99, 99, 99, 99, 47, 66, 99, 99, 99, 99, 99, 99,
                                   99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
                                   99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99};
static const u8 dc_luma_bits[16] = {0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0};
static const u8 dc_chroma_bits[16] = {0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0};
static const u8 dc_values[12] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11};
static const u8 ac_luma_bits[16] = {0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 0x7d};
static const u8 ac_luma_values[162] = {
    0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81,
    0x91, 0xa1, 0x08, 0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0, 0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0a, 0x16, 0x17, 0x18,
    0x19, 0x1a, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48,
    0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75,
    0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99,
    0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3,
    0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2, 0xe3, 0xe4, 0xe5,
    0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa};
static const u8 ac_chroma_bits[16] = {0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 0x77};
static const u8 ac_chroma_values[162] = {
    0x00, 0x01, 0x02, 0x03, 0x11, 0x04, 0x05, 0x21, 0x31, 0x06, 0x12, 0x41, 0x51, 0x07, 0x61, 0x71, 0x13, 0x22, 0x32, 0x81, 0x08,
    0x14, 0x42, 0x91, 0xa1, 0xb1, 0xc1, 0x09, 0x23, 0x33, 0x52, 0xf0, 0x15, 0x62, 0x72, 0xd1, 0x0a, 0x16, 0x24, 0x34, 0xe1, 0x25,
    0xf1, 0x17, 0x18, 0x19, 0x1a, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47,
    0x48, 0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74,
    0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97,
    0x98, 0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba,
    0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe2, 0xe3, 0xe4,
    0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa};

typedef struct {
    u16 code[256];
    u8 size[256];
} Huffman;
static Huffman dc_luma, dc_chroma, ac_luma, ac_chroma;

static void make_huffman(Huffman *h, const u8 *counts, const u8 *values)
{
    u32 code = 0, k = 0;
    for (u32 len = 1; len <= 16U; ++len) {
        for (u32 i = 0; i < counts[len - 1U]; ++i, ++k) {
            h->code[values[k]] = (u16)code++;
            h->size[values[k]] = (u8)len;
        }
        code <<= 1;
    }
}

static u8 qt_luma[64], qt_chroma[64];
static float div_luma[64], div_chroma[64];

static void make_tables(u32 quality)
{
    static const float aan[8] = {1.0f, 1.387039845f, 1.306562965f, 1.175875602f, 1.0f, 0.785694958f, 0.541196100f, 0.275899379f};
    if (quality < 1U) quality = 1U;
    if (quality > 100U) quality = 100U;
    u32 scale = quality < 50U ? 5000U / quality : 200U - 2U * quality;
    for (u32 i = 0; i < 64U; ++i) {
        u32 l = (base_luma[i] * scale + 50U) / 100U, c = (base_chroma[i] * scale + 50U) / 100U;
        qt_luma[i] = (u8)(l < 1U ? 1U : l > 255U ? 255U : l);
        qt_chroma[i] = (u8)(c < 1U ? 1U : c > 255U ? 255U : c);
    }
    for (u32 r = 0; r < 8U; ++r)
        for (u32 c = 0; c < 8U; ++c) {
            u32 i = r * 8U + c;
            div_luma[i] = 1.0f / ((float)qt_luma[i] * aan[r] * aan[c] * 8.0f);
            div_chroma[i] = 1.0f / ((float)qt_chroma[i] * aan[r] * aan[c] * 8.0f);
        }
    make_huffman(&dc_luma, dc_luma_bits, dc_values);
    make_huffman(&dc_chroma, dc_chroma_bits, dc_values);
    make_huffman(&ac_luma, ac_luma_bits, ac_luma_values);
    make_huffman(&ac_chroma, ac_chroma_bits, ac_chroma_values);
}

/* The forward DCT of libjpeg's jfdctflt.c, in place. */
static void fdct(float *d)
{
    for (u32 pass = 0; pass < 2U; ++pass) {
        u32 step = pass ? 8U : 1U, line = pass ? 1U : 8U;
        for (u32 k = 0; k < 8U; ++k) {
            float *p = d + k * line;
            float t0 = p[0] + p[7 * step], t7 = p[0] - p[7 * step];
            float t1 = p[step] + p[6 * step], t6 = p[step] - p[6 * step];
            float t2 = p[2 * step] + p[5 * step], t5 = p[2 * step] - p[5 * step];
            float t3 = p[3 * step] + p[4 * step], t4 = p[3 * step] - p[4 * step];
            float t10 = t0 + t3, t13 = t0 - t3, t11 = t1 + t2, t12 = t1 - t2;
            p[0] = t10 + t11;
            p[4 * step] = t10 - t11;
            float z1 = (t12 + t13) * 0.707106781f;
            p[2 * step] = t13 + z1;
            p[6 * step] = t13 - z1;
            t10 = t4 + t5;
            t11 = t5 + t6;
            t12 = t6 + t7;
            float z5 = (t10 - t12) * 0.382683433f, z2 = 0.541196100f * t10 + z5, z4 = 1.306562965f * t12 + z5,
                  z3 = t11 * 0.707106781f;
            float z11 = t7 + z3, z13 = t7 - z3;
            p[5 * step] = z13 + z2;
            p[3 * step] = z13 - z2;
            p[step] = z11 + z4;
            p[7 * step] = z11 - z4;
        }
    }
}

static void encode_block(float *block, const float *divisor, int *dc, const Huffman *hdc, const Huffman *hac)
{
    int q[64];
    fdct(block);
    for (u32 i = 0; i < 64U; ++i) {
        float v = block[zigzag[i]] * divisor[zigzag[i]];
        q[i] = (int)(v + 16384.5f) - 16384;
    }
    int diff = q[0] - *dc;
    *dc = q[0];
    u32 a = (u32)(diff < 0 ? -diff : diff), n = 0;
    while (a >> n) ++n;
    put_bits(hdc->code[n], hdc->size[n]);
    if (n) put_bits((u32)(diff < 0 ? diff - 1 : diff), n);
    u32 run = 0;
    for (u32 i = 1; i < 64U; ++i) {
        if (!q[i]) {
            ++run;
            continue;
        }
        while (run > 15U) {
            put_bits(hac->code[0xf0], hac->size[0xf0]);
            run -= 16U;
        }
        int v = q[i];
        a = (u32)(v < 0 ? -v : v);
        n = 0;
        while (a >> n) ++n;
        u32 sym = run << 4 | n;
        put_bits(hac->code[sym], hac->size[sym]);
        put_bits((u32)(v < 0 ? v - 1 : v), n);
        run = 0;
    }
    if (run) put_bits(hac->code[0], hac->size[0]);
}

static void put_table(u32 id, const u8 *table)
{
    put(id);
    for (u32 i = 0; i < 64U; ++i) put(table[zigzag[i]]);
}
static void put_huffman(u32 id, const u8 *counts, const u8 *values, u32 n)
{
    put(id);
    for (u32 i = 0; i < 16U; ++i) put(counts[i]);
    for (u32 i = 0; i < n; ++i) put(values[i]);
}

/* The JPEG of the main plane of dev_set inside a border of `margin` (left,
   top, right, bottom of the stored picture, each even) of the luma `border`,
   with `app1` (a whole APP1 segment from its marker, the EXIF) or a JFIF
   header without one. `out` holds `cap` bytes for the pieces. */
__attribute__((export_name("dev_encode"))) void dev_encode(u32 quality, const u32 *margin, u32 border, const u8 *app1, u32 app1_bytes, u8 *out, u32 cap)
{
    const Plane *p = &develop_set.planes[0];
    u32 w = p->width, h = p->height, ml = margin[0], mt = margin[1];
    u32 cw = w + margin[0] + margin[2], ch = h + margin[1] + margin[3];
    buffer = out;
    capacity = cap;
    used = 0;
    bits = nbits = 0;
    make_tables(quality);
    put16(0xffd8);
    if (app1_bytes) {
        for (u32 i = 0; i < app1_bytes; ++i) put(app1[i]);
    } else {
        static const u8 jfif[18] = {0xff, 0xe0, 0, 16, 'J', 'F', 'I', 'F', 0, 1, 1, 0, 0, 1, 0, 1, 0, 0};
        for (u32 i = 0; i < sizeof jfif; ++i) put(jfif[i]);
    }
    put16(0xffdb);
    put16(2U + 2U * 65U);
    put_table(0, qt_luma);
    put_table(1, qt_chroma);
    put16(0xffc0);
    put16(17);
    put(8);
    put16(ch);
    put16(cw);
    put(3);
    put(1); put(0x21); put(0);
    put(2); put(0x11); put(1);
    put(3); put(0x11); put(1);
    put16(0xffc4);
    put16(2U + 4U * 17U + 12U + 12U + 162U + 162U);
    put_huffman(0x00, dc_luma_bits, dc_values, 12);
    put_huffman(0x10, ac_luma_bits, ac_luma_values, 162);
    put_huffman(0x01, dc_chroma_bits, dc_values, 12);
    put_huffman(0x11, ac_chroma_bits, ac_chroma_values, 162);
    put16(0xffda);
    put16(12);
    put(3);
    put(1); put(0x00);
    put(2); put(0x11);
    put(3); put(0x11);
    put(0); put(63); put(0);

    int dc[3] = {0, 0, 0};
    float y0[64], y1[64], cb[64], cr[64];
    u32 rows = (ch + 7U) / 8U, cols = (cw + 15U) / 16U;
    float edge = (float)border - 128.0f;
    for (u32 my = 0; my < rows; ++my) {
        for (u32 mx = 0; mx < cols; ++mx) {
            for (u32 r = 0; r < 8U; ++r) {
                u32 cy = my * 8U + r;
                if (cy >= ch) cy = ch - 1U;
                int inside_row = cy >= mt && cy < mt + h;
                const u8 *luma = inside_row ? (const u8 *)(p->y + (cy - mt) * p->pitch) : 0;
                const u8 *cbcr = inside_row ? (const u8 *)(p->c + (cy - mt) * p->pitch) : 0;
                for (u32 k = 0; k < 16U; ++k) {
                    u32 cx = mx * 16U + k;
                    if (cx >= cw) cx = cw - 1U;
                    float v = inside_row && cx >= ml && cx < ml + w ? (float)luma[cx - ml] - 128.0f : edge;
                    if (k < 8U) y0[r * 8U + k] = v; else y1[r * 8U + k - 8U] = v;
                }
                for (u32 k = 0; k < 8U; ++k) {
                    u32 cx = mx * 16U + 2U * k;
                    if (cx >= cw) cx = (cw - 1U) & ~1U;
                    if (inside_row && cx >= ml && cx < ml + w) {
                        const u8 *pair = cbcr + ((cx - ml) & ~1U);
                        cb[r * 8U + k] = (float)pair[0] - 128.0f;
                        cr[r * 8U + k] = (float)pair[1] - 128.0f;
                    } else {
                        cb[r * 8U + k] = cr[r * 8U + k] = 0;
                    }
                }
            }
            encode_block(y0, div_luma, &dc[0], &dc_luma, &ac_luma);
            encode_block(y1, div_luma, &dc[0], &dc_luma, &ac_luma);
            encode_block(cb, div_chroma, &dc[1], &dc_chroma, &ac_chroma);
            encode_block(cr, div_chroma, &dc[2], &dc_chroma, &ac_chroma);
        }
        if (!(my & 31U)) js_progress(my, rows);
    }
    /* Fill the last byte with ones. */
    if (nbits) put_bits(0x7f, 8U - nbits);
    put16(0xffd9);
    if (used) js_flush(buffer, used);
    js_progress(rows, rows);
}
