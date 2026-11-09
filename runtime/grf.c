/* Shared GRFX0001 validation for the installer and host tools. The layout
   (GRKU_GRF_*) comes from runtime/abi.h, which grku_core::abi generates. */
#include "abi.h"
#include "grf.h"
#ifndef GRKU_GRF_EMBEDDED
typedef unsigned char u8;
typedef unsigned int u32;
#endif
#ifdef GRKU_GRF_EMBEDDED
#define grf_get32 get32
#define grf_equal equal
#else
static u32 grf_get32(const u8 *p)
{ return p[0] | p[1] << 8 | p[2] << 16 | (u32)p[3] << 24; }
static int grf_equal(volatile const u8 *a, const u8 *b, u32 n)
{ for (u32 i=0; i<n; ++i) if (a[i] != b[i]) return 0; return 1; }
#endif
static u32 crc(const u8 *p, u32 size)
{
    u32 value=~0U;
    for (u32 i=0; i<size; ++i) {
        value ^= (i>=GRKU_GRF_CRC && i<GRKU_GRF_CRC+GRKU_GRF_CRC_SIZE) ? 0 : p[i];
        for (u32 bit=0; bit<8; ++bit) value=(value>>1)^((0U-(value&1))&0xedb88320U);
    }
    return ~value;
}
static int zeros(const u8 *p, u32 n) { for(u32 i=0;i<n;++i) if(p[i]) return 0; return 1; }
/* The extension features and the hue sector layout (GRKU_FEATURE_*, GRKU_HUE_*)
   come from abi.h, which grku_core::abi generates. */
static u32 grf_get16(const u8 *p) { return p[0] | p[1] << 8; }
/* The bounds of grku_core::selective: a Q12 unit direction, inner < outer <= 1024
   on each side, and c0 < c1 <= 181. */
static int valid_selective(const u8 *p)
{
    int c=(short)grf_get16(p), s=(short)grf_get16(p+2);
    u32 square=(u32)(c*c)+(u32)(s*s);
    if (square<15000000U || square>18000000U) return 0;
    for (u32 side=0; side<2; ++side) {
        u32 inner=grf_get16(p+4+side*4), outer=grf_get16(p+6+side*4);
        if (inner>=outer || outer>1024) return 0;
    }
    return p[12]<p[13] && p[13]<=181;
}
/* Each feature bit owns its field, and an unused field stays zero. An effect
   without features has zeros in the whole extension. A monochrome effect has
   no features but its Fn defaults (feature 64). */
static int valid_extension(const u8 *p)
{
    u32 features=grf_get32(p+GRKU_GRF_FEATURES);
    if ((features & ~(GRKU_FEATURE_POST|GRKU_FEATURE_SELECTIVE|GRKU_FEATURE_HUE|GRKU_FEATURE_HUE_LEVELS|GRKU_FEATURE_NATIVE_LOOK|GRKU_FEATURE_FN_DEFAULTS)) ||
        !zeros(p+GRKU_GRF_RESERVED,GRKU_GRF_RESERVED_SIZE)) return 0;
    if ((features&GRKU_FEATURE_HUE_LEVELS) && !(features&GRKU_FEATURE_HUE)) return 0;
    /* A native look excludes hue sectors. */
    if ((features&GRKU_FEATURE_NATIVE_LOOK) && (features&(GRKU_FEATURE_HUE|GRKU_FEATURE_HUE_LEVELS))) return 0;
    if (!(features&GRKU_FEATURE_POST) && !zeros(p+GRKU_GRF_POST,GRKU_GRF_POST_SIZE)) return 0;
    if (!(features&GRKU_FEATURE_SELECTIVE) && !zeros(p+GRKU_GRF_SELECTIVE,GRKU_GRF_SELECTIVE_SIZE)) return 0;
    if ((features&~GRKU_FEATURE_FN_DEFAULTS) && grf_get32(p+GRKU_GRF_FLAGS)==1) return 0;
    if ((features&GRKU_FEATURE_SELECTIVE) && !valid_selective(p+GRKU_GRF_SELECTIVE)) return 0;
    return 1;
}
/* Each row's diagonal, 128 minus its two coefficients, fits the 12-bit register
   in Q10. */
static int valid_sectors(const u8 *p, u32 n)
{
    for (u32 i=0; i<n; i+=2) {
        int a=(signed char)p[i], b=(signed char)p[i+1];
        if (a==-128 || b==-128 || a+b<-127) return 0;
    }
    return 1;
}
/* floor(x / 1024), also for a negative x. */
static int grf_floor1024(int x) { return x>=0 ? x>>10 : -((-x+1023)>>10); }
/* The Q10 matrix m (row-major) of a bank at a level of a native look
   (grku_core::native_look::NativeLook::level_matrix): each off-diagonal is the
   level-0 coefficient times the level's gain, rounded, plus the level's
   correction; the diagonal is the gain minus the row's off-diagonals. */
static void grf_native_matrix(const u8 *p, u32 bank, u32 level, int *m)
{
    int gain=(int)grf_get16(p+GRKU_NATIVE_GAINS+level*2);
    for (u32 r=0; r<3; ++r) {
        int sum=0;
        for (u32 j=0; j<2; ++j) {
            int c=(short)grf_get16(p+GRKU_NATIVE_MATRICES+(bank*6+r*2+j)*2);
            int v=grf_floor1024(c*gain+512);
            if (level) v+=(signed char)p[GRKU_NATIVE_CORRECTIONS+((level-1)*12+bank)*6+r*2+j];
            m[r*3+(r+1+j)%3]=v;
            sum+=v;
        }
        m[r*4]=gain-sum;
    }
}
/* The set of a native look: four non-increasing bounds of 0..2048 per quadrant,
   bank selectors below 12, control fields within their registers (9-bit slopes
   14..17, 12 bits else), gains of 0..2047, and level matrices within the 12-bit
   registers. */
static int valid_native(const u8 *p)
{
    for (u32 q=0; q<4; ++q) {
        const u8 *b=p+GRKU_NATIVE_BOUNDS+q*8;
        if (grf_get16(b)>2048) return 0;
        for (u32 k=1; k<4; ++k) if (grf_get16(b+k*2)>grf_get16(b+k*2-2)) return 0;
    }
    for (u32 k=0; k<20; ++k) if (p[GRKU_NATIVE_SELECTORS+k]>=12) return 0;
    for (u32 k=0; k<21; ++k)
        if (grf_get16(p+GRKU_NATIVE_CONTROL+k*2)>((k>=14 && k<18) ? 0x1ffU : 0xfffU)) return 0;
    for (u32 l=0; l<5; ++l) if (grf_get16(p+GRKU_NATIVE_GAINS+l*2)>2047) return 0;
    for (u32 bank=0; bank<12; ++bank)
        for (u32 l=0; l<5; ++l) {
            int m[9];
            grf_native_matrix(p,bank,l,m);
            for (u32 k=0; k<9; ++k) if (m[k]<-2048 || m[k]>2047) return 0;
        }
    return 1;
}
/* The Fn defaults of feature 64, -4..4, in a file of GRKU_GRF_MAX_SIZE bytes,
   and zeros after them. Without the feature, those bytes stay zero. */
static int valid_defaults(const u8 *p, u32 size)
{
    if (size!=GRKU_GRF_MAX_SIZE) return 1;
    if (!(grf_get32(p+GRKU_GRF_FEATURES)&GRKU_FEATURE_FN_DEFAULTS))
        return zeros(p+GRKU_GRF_FN_DEFAULTS,size-GRKU_GRF_FN_DEFAULTS);
    for (u32 k=GRKU_GRF_FN_DEFAULTS; k<GRKU_GRF_FN_DEFAULTS_END; ++k) {
        int value=(signed char)p[k];
        if (value<-4 || value>4) return 0;
    }
    return zeros(p+GRKU_GRF_FN_DEFAULTS_END,size-GRKU_GRF_FN_DEFAULTS_END);
}
/* The hue sectors of feature 8 and the levels of feature 16, the set of a
   native look (feature 32), or zeros, up to the Fn defaults. */
static int valid_hue(const u8 *p, u32 size)
{
    u32 features=grf_get32(p+GRKU_GRF_FEATURES);
    if (features&GRKU_FEATURE_NATIVE_LOOK)
        return size==GRKU_GRF_MAX_SIZE &&
            zeros(p+GRKU_NATIVE_HEAD_END,GRKU_GRF_SIZE-GRKU_NATIVE_HEAD_END) &&
            zeros(p+GRKU_NATIVE_END,GRKU_GRF_FN_DEFAULTS-GRKU_NATIVE_END) && valid_native(p);
    u32 used=(features&GRKU_FEATURE_HUE) ? GRKU_GRF_HUE_SIZE : 0;
    if (!zeros(p+GRKU_GRF_HUE+used,GRKU_GRF_SIZE-GRKU_GRF_HUE-used)) return 0;
    /* A larger file for Fn defaults alone keeps the level area zero. */
    if (size==GRKU_GRF_MAX_SIZE && !(features&GRKU_FEATURE_HUE_LEVELS) &&
        !zeros(p+GRKU_HUE_LEVEL_OFFSET,GRKU_HUE_LEVEL_SIZE)) return 0;
    if (size==GRKU_GRF_MAX_SIZE && (!valid_sectors(p+GRKU_HUE_LEVEL_OFFSET,GRKU_HUE_LEVEL_SIZE) ||
        !zeros(p+GRKU_HUE_LEVEL_OFFSET+GRKU_HUE_LEVEL_SIZE,GRKU_GRF_FN_DEFAULTS-GRKU_HUE_LEVEL_OFFSET-GRKU_HUE_LEVEL_SIZE))) return 0;
    if (!used) return 1;
    if (!valid_sectors(p+GRKU_GRF_HUE,GRKU_HUE_MATRICES)) return 0;
    const u8 *f=p+GRKU_GRF_HUE+GRKU_HUE_MATRICES;
    static const unsigned short borders[3]=GRKU_HUE_BORDERS;
    for (u32 k=0; k<4; ++k) if (grf_get16(f+k*2)>1024 || grf_get16(f+8+k*2)>0x1ff) return 0;
    for (u32 k=0; k<3; ++k) if (grf_get16(f+16+k*2)!=borders[k]) return 0;
    return 1;
}
/* The size is GRKU_GRF_MAX_SIZE exactly with feature 16, 32, or 64, else GRKU_GRF_SIZE. */
static int valid_profile(const u8 *p, u32 size)
{
    const u8 *id=p+GRKU_GRF_ID, *name=p+GRKU_GRF_NAME;
    /* A monochrome effect has equal matrix rows and equal curves. */
    const u32 row=GRKU_GRF_MATRIX_SIZE/3, curve=GRKU_GRF_CURVES_SIZE/3;
    u32 levels=(grf_get32(p+GRKU_GRF_FEATURES)&(GRKU_FEATURE_HUE_LEVELS|GRKU_FEATURE_NATIVE_LOOK|GRKU_FEATURE_FN_DEFAULTS)) ? 1 : 0;
    if (size!=(levels ? GRKU_GRF_MAX_SIZE : GRKU_GRF_SIZE)) return 0;
    if (!grf_equal(p+GRKU_GRF_MAGIC,(const u8 *)"GRFX0001",GRKU_GRF_MAGIC_SIZE) ||
        grf_get32(p+GRKU_GRF_BYTES)!=size || grf_get32(p+GRKU_GRF_CRC)!=crc(p,size)) return 0;
    u32 n=0;
    while (n<GRKU_GRF_ID_SIZE && id[n]) {
        u8 c=id[n];
        if (!((c>='a'&&c<='z')||(c>='0'&&c<='9')||(n&&c=='-'))) return 0;
        ++n;
    }
    if (!n || n>GRKU_GRF_ID_MAX || !zeros(id+n,GRKU_GRF_ID_SIZE-n)) return 0;
    n=0;
    while (n<GRKU_GRF_NAME_SIZE && name[n]) { if(name[n]<32 || name[n]>126) return 0; ++n; }
    if (!n || n>GRKU_GRF_NAME_MAX || name[0]==' ' || name[n-1]==' ' || !zeros(name+n,GRKU_GRF_NAME_SIZE-n)) return 0;
    if (grf_get32(p+GRKU_GRF_FLAGS)>1 || !valid_extension(p) ||
        !zeros(p+GRKU_GRF_PADDING,GRKU_GRF_PADDING_SIZE) || !valid_hue(p,size) ||
        !valid_defaults(p,size)) return 0;
    for (u32 i=GRKU_GRF_CURVES;i<GRKU_GRF_CURVES+GRKU_GRF_CURVES_SIZE;i+=2) if (((u32)p[i]|p[i+1]<<8)>16383) return 0;
    if(grf_get32(p+GRKU_GRF_FLAGS)==1 && (!grf_equal(p+GRKU_GRF_MATRIX,p+GRKU_GRF_MATRIX+row,row) ||
       !grf_equal(p+GRKU_GRF_MATRIX,p+GRKU_GRF_MATRIX+2*row,row) ||
       !grf_equal(p+GRKU_GRF_CURVES,p+GRKU_GRF_CURVES+curve,curve) ||
       !grf_equal(p+GRKU_GRF_CURVES,p+GRKU_GRF_CURVES+2*curve,curve))) return 0;
    /* The alpha of each icon pixel is 0 or 255. */
    for (u32 i=GRKU_GRF_ICON+3;i<GRKU_GRF_ICON+GRKU_GRF_ICON_SIZE;i+=4) if(p[i]!=0 && p[i]!=255) return 0;
    return 1;
}

#ifndef GRKU_GRF_EMBEDDED
int grku_grf_validate(const unsigned char *data, unsigned long size)
{
    return data && (size == GRKU_GRF_SIZE || size == GRKU_GRF_MAX_SIZE) && valid_profile(data, (u32)size);
}
#endif
