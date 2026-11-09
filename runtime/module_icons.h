#ifndef GRKU_MODULE_ICONS_H
#define GRKU_MODULE_ICONS_H
/* These helpers have no firmware entrypoints. Thumb keeps their shared
   lookup code within the fixed menu/viewfinder tail on every camera. */
#ifdef __arm__
#define GRKU_ICON_COMPACT __attribute__((target("thumb")))
#else
#define GRKU_ICON_COMPACT
#endif
/* Installed GrkuIcon descriptors. The installer resolves their setting
   references; ADJ and the viewfinder use the same committed-value lookup. */
#ifndef MODULE_ICON_WORD
#define MODULE_ICON_WORD(address,offset) WORD(address,offset)
#endif
#define MODULE_ICON_SIZE 16U
#define MODULE_ICON_KIND 4U
#define MODULE_ICON_SETTING 8U
#define MODULE_ICON_FIRST 12U
/* The icon of descriptor `address`. A list row of setting `handle` shows
   the icon of its own `value` before it applies; other icons show the
   committed value of their setting. */
static GRKU_MAYBE_UNUSED GRKU_ICON_COMPACT u32 module_icon_row(volatile u32 *h,u32 address,u32 tile_base,u32 handle,u32 row_value) {
    u32 kind,setting,value=0,tile;
    if(!address || MODULE_ICON_WORD(address,0)<MODULE_ICON_SIZE) return GRKU_ICON_OFF;
    kind=MODULE_ICON_WORD(address,MODULE_ICON_KIND);
    setting=MODULE_ICON_WORD(address,MODULE_ICON_SETTING);
    if(kind==2) {
        if(setting!=GRKU_CORE_TONE || !(h[GRKU_HOST_CAPABILITIES/4]&GRKU_CORE_TONE_BIT)) return GRKU_ICON_OFF;
        value=tone_value(h);
        return value ? GRKU_ICON_EFFECT(value-1) : GRKU_ICON_OFF;
    }
    if(kind!=1 && kind!=3) return GRKU_ICON_OFF;
    if(setting!=0xffffffffU) {
        if(!setting_limit(h,setting)) return GRKU_ICON_OFF;
        value=setting==handle ? row_value : setting_value(h,setting);
        if(!setting_offered(h,setting,value)) return GRKU_ICON_OFF;
    }
    tile=MODULE_ICON_WORD(address,MODULE_ICON_FIRST);
    if(kind==3) return tile<GRKU_MODULE_LABEL_COUNT && value<GRKU_MODULE_LABEL_COUNT-tile ? GRKU_ICON_CORE_LABEL(tile+value) : GRKU_ICON_OFF;
    if(tile_base>=GRKU_MODULE_TILES_MAX || tile>=GRKU_MODULE_TILES_MAX-tile_base ||
       value>=GRKU_MODULE_TILES_MAX-tile_base-tile) return GRKU_ICON_OFF;
    return GRKU_ICON_MODULE_TILE(tile_base+tile+value);
}
static GRKU_MAYBE_UNUSED GRKU_ICON_COMPACT u32 module_icon_value(volatile u32 *h,u32 address,u32 tile_base) {
    return module_icon_row(h,address,tile_base,0xffffffffU,0);
}
/* Module tile descriptors follow the effects in the icon chunks. */
static GRKU_MAYBE_UNUSED GRKU_ICON_COMPACT u32 module_tile_address(volatile u32 *h,u32 id) {
    u32 tile=id-GRKU_ICON_MODULE_TILE(0),slot,chunk;
    if(tile>=GRKU_MODULE_TILES_MAX || h[GRKU_HOST_COUNT/4]>GRKU_TEXT_RECORDS) return 0;
    slot=GRKU_HOST_ICON_COUNT+h[GRKU_HOST_COUNT/4]+tile;
    chunk=slot*1639U>>16;
    if(chunk>=GRKU_HOST_ICON_CHUNKS_WORDS || !h[GRKU_HOST_ICON_CHUNKS/4+chunk]) return 0;
    return h[GRKU_HOST_ICON_CHUNKS/4+chunk]+(slot-chunk*GRKU_ICONS_PER_CHUNK)*GRKU_ICON_STRIDE;
}
#endif
