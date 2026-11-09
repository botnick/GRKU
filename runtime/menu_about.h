#ifndef GRKU_MENU_ABOUT_H
#define GRKU_MENU_ABOUT_H
/* About GRKU on the native camera information page (INFO_CONTROLLER,
   runtime/menu.c). The build header gives the lines of the page that show
   the version with the number of effects and the website (INFO_LINES,
   two lines), or the text IDs of
   its labels (INFO_LABEL_TEXTS, three rows of a label and a value): then the
   rows read Version, Website, and Film Look, whose value is the number of
   effects in the list of this start. */
#if !defined(INFO_LINES) && !defined(INFO_LABEL_TEXTS)
#error "The build header defines INFO_LINES or INFO_LABEL_TEXTS"
#endif
static u32 about_shows(volatile u32 *h) {
    return h[GRKU_HOST_SERVICES/4] && services_word(h,SERVICES_MENU+MENU_ROWS_ABOUT)[0];
}
/* Copy ASCII text, at most `room` - 1 units, after `at` units of `to`. */
static u32 ascii_add(volatile char *to,u32 at,const u16 *from,u32 room) {
    while(at<room-1 && *from) to[at++]=(char)*from++;
    to[at]=0;
    return at;
}
/* Write `value` in decimal after `at` units of `to`, without a division,
   which the core does not link. */
static u32 ascii_decimal(volatile char *to,u32 at,u32 value,u32 room) {
    static const u32 units[]={1000000000U,100000000U,10000000U,1000000U,100000U,10000U,1000U,100U,10U,1U};
    u32 i, started=0;
    for(i=0;i<sizeof(units)/sizeof(units[0]);++i) {
        u32 digit=0;
        while(value>=units[i]) { value-=units[i]; ++digit; }
        if(!digit && !started && units[i]!=1U) continue;
        started=1;
        if(at<room-1) to[at++]=(char)('0'+digit);
    }
    to[at]=0;
    return at;
}
#ifdef INFO_LINES
static const u16 about_prefix[]={'G','R','K','U',' ',0};
static const u16 about_looks[]={' ','l','o','o','k','s',0};
static const u16 about_dash[]={' ','-',' ',0};
#endif
/* The update of the page ended (menu.S: menu_info_update): show the version,
   the website, and the number of film looks in its lines. */
A32_ENTRY void menu_info_fill(u32 controller) {
    volatile u32 *h=menu_header();
    volatile char *version, *website, *looks;
    if(!about_shows(h)) return;
    version=(volatile char *)services_word(h,SERVICES_MENU+MENU_ROWS_ABOUT_LINES);
    website=version+MENU_ABOUT_LINE;
    looks=website+MENU_ABOUT_LINE;
    ascii_add(website,0,text(h,TEXT_ABOUT+4),MENU_ABOUT_LINE);
    ascii_decimal(looks,0,effects_count(h),MENU_ABOUT_LINE);
#ifdef INFO_LINES
    {
        static const u16 lines[2]=INFO_LINES;
        u32 at=ascii_add(version,ascii_add(version,0,about_prefix,MENU_ABOUT_LINE),text(h,TEXT_ABOUT+2),MENU_ABOUT_LINE);
        /* The first line: "GRKU 1.5.2 - 40 looks". */
        at=ascii_add(version,at,about_dash,MENU_ABOUT_LINE);
        at=ascii_decimal(version,at,effects_count(h),MENU_ABOUT_LINE);
        ascii_add(version,at,about_looks,MENU_ABOUT_LINE);
        MENU_VIEW2(FW_STRING_VIEW_SET_ASCII,MENU_OBJECT_WORD(controller,lines[0]),(u32)version);
        MENU_VIEW2(FW_STRING_VIEW_SET_ASCII,MENU_OBJECT_WORD(controller,lines[1]),(u32)website);
    }
#else
    {
        static const u16 values[3]=INFO_VALUES;
        ascii_add(version,0,text(h,TEXT_ABOUT+2),MENU_ABOUT_LINE);
        MENU_VIEW2(FW_STRING_VIEW_SET_ASCII,MENU_OBJECT_WORD(controller,values[0]),(u32)version);
        MENU_VIEW2(FW_STRING_VIEW_SET_ASCII,MENU_OBJECT_WORD(controller,values[1]),(u32)website);
        MENU_VIEW2(FW_STRING_VIEW_SET_ASCII,MENU_OBJECT_WORD(controller,values[2]),(u32)looks);
    }
#endif
}
/* The title of the page reads About GRKU, and on GR IV its labels Version,
   Website, and Film Look. */
static u32 info_text(volatile u32 *h,u32 id) {
    volatile u32 *at;
    u32 n=4;
#ifdef INFO_LABEL_TEXTS
    static const u16 labels[3]=INFO_LABEL_TEXTS;
#endif
    if(!about_shows(h)) return 0;
    at=services_word(h,SERVICES_MENU+MENU_ROWS_ABOUT_TEXTS);
    if(id==INFO_TITLE_TEXT) n=0;
#ifdef INFO_LABEL_TEXTS
    else if(id==labels[0]) n=1;
    else if(id==labels[1]) n=2;
    else if(id==labels[2]) n=3;
#endif
    if(n==4) return 0;
    /* The title, then the labels: TEXT_ABOUT + 1, + 3, + 5. */
    descriptor(at+n*2,text(h,TEXT_ABOUT+(n==0 ? 0 : 2*n-1)));
    return (u32)(at+n*2)|1U;
}
#endif /* GRKU_MENU_ABOUT_H */
