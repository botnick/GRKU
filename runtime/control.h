#ifndef GRKU_CONTROL_H
#define GRKU_CONTROL_H
/* The commands of the Wi-Fi service (grku_core::abi). The App task answers
   each one in its poll of the mailbox (runtime/control_mailbox.h), from the
   timer of the saved state (runtime/persist.h): the effects
   (runtime/control_looks.h), the recipes (runtime/control_recipes.h), and
   the module settings and GRKU Settings (runtime/control_modules.h). */
#include "control_mailbox.h"
/* A page of GRKU that lists the effects or the recipes keeps its rows
   while it shows, so they change while none shows: not the GRKU menu of
   ADJ, a preview, the adjustments of an effect, or a development, nor in
   MENU a page of GRKU (the settings submenu and its value pages,
   settings_shows) or the camera information page with a GRKU view. The
   shooting screen, playback, and the other pages of MENU take changes:
   each GRKU row of MENU reads its value when it draws. */
static u32 control_idle(volatile u32 *h) {
    u32 current=services_word(h,SERVICES_MENU+MENU_ROWS_CURRENT)[0];
    return !h[GRKU_HOST_MENU_CONTROLLER/4] && !h[GRKU_HOST_PREVIEW/4] && !h[GRKU_HOST_DEVELOP/4] &&
           !(h[GRKU_HOST_PARAMETERS/4]&~1U) && !settings_shows(current) &&
           !(current==INFO_CONTROLLER && services_word(h,SERVICES_MENU+MENU_ROWS_ABOUT)[0]);
}
/* A change while the GRKU menu of ADJ shows closes ADJ first. The OK
   method of ADJ posts the request that takes the camera to the shooting
   screen, and ADJ exits after this poll without storing the highlighted row
   (runtime/menu.c: menu_exit). The command does not apply and answers
   GRKU_CONTROL_CLOSING, so the service sends it again. The other pages of
   control_idle, a native page that GRKU opens from ADJ, and ADJ that shows
   another controller keep the change waiting. 0 when the change applies. */
static u32 control_blocked(volatile u32 *h) {
    volatile u32 *closing;
    if(control_idle(h)) return 0;
    if(!h[GRKU_HOST_SERVICES/4] || !h[GRKU_HOST_MENU_CONTROLLER/4] || h[GRKU_HOST_DEVELOP/4] ||
       h[GRKU_HOST_PARAMETERS/4]&~1U || services_word(h,SERVICES_MENU+MENU_ROWS_CURRENT)[0]!=ADJ_CONTROLLER ||
       ui_word(h,UI_NATIVE)[0] || RETURN_STATE(h[GRKU_HOST_RETURN/4])==RETURN_OPENING)
        return GRKU_CONTROL_BUSY;
    closing=services_word(h,SERVICES_MENU+MENU_ROWS_CLOSING);
    /* One request for each close: a command that goes again waits for it. */
    if(!closing[0]) {
        closing[0]=h[GRKU_HOST_MENU_CONTROLLER/4];
        CALL1(FW_ADJ_OK)(closing[0]);
    }
    return GRKU_CONTROL_CLOSING;
}
/* Return the answer of control_blocked unless the change applies now. */
#define CONTROL_UNBLOCKED(h) do { u32 blocked_=control_blocked(h); if(blocked_) return blocked_; } while(0)
#include "control_looks.h"
#include "control_recipes.h"
#include "control_modules.h"
/* Each command to the commands of its kind, when the camera has them. */
static u32 control_dispatch(void *context,struct control_request *request,u32 *length) {
    volatile u32 *h=(volatile u32 *)context;
    u32 capabilities=h[GRKU_HOST_CAPABILITIES/4];
    switch(request->command) {
    case GRKU_CONTROL_LOOKS_READ:
    case GRKU_CONTROL_LOOK_TURN:
    case GRKU_CONTROL_LOOKS_ORDER:
        return capabilities&GRKU_CORE_TONE_BIT ? control_looks(h,request,length) : GRKU_CONTROL_UNSUPPORTED;
    case GRKU_CONTROL_RECIPES_READ:
    case GRKU_CONTROL_RECIPE_TURN:
    case GRKU_CONTROL_RECIPES_ORDER:
    case GRKU_CONTROL_RECIPE_RENAME:
    case GRKU_CONTROL_RECIPE_DELETE:
    case GRKU_CONTROL_RECIPE_APPLY:
    case GRKU_CONTROL_RECIPE_UNDO:
    case GRKU_CONTROL_RECIPE_ADD:
        return capabilities&GRKU_CORE_RECIPE_BIT ? control_recipes(h,request,length) : GRKU_CONTROL_UNSUPPORTED;
    /* The modules and the settings need no capability of Looks or Recipes. */
    case GRKU_CONTROL_MODULES_READ:
    case GRKU_CONTROL_MODULE_TEXTS:
    case GRKU_CONTROL_MODULE_TILE:
    case GRKU_CONTROL_MODULE_SET:
    case GRKU_CONTROL_MODULES_ORDER:
    case GRKU_CONTROL_MODULES_LAYOUT:
    case GRKU_CONTROL_SETTINGS_READ:
    case GRKU_CONTROL_SETTINGS_SET:
    case GRKU_CONTROL_GOODBYE_CHECK:
        return control_modules(h,request,length);
    default: return GRKU_CONTROL_UNSUPPORTED;
    }
}
/* Whether the Wi-Fi service waits for an answer. The request line belongs
   to Linux, so it is read from memory as control_acquire reads it. */
static u32 control_pending(volatile u32 *h) {
    if(!h[GRKU_HOST_CONTROL_WORD/4]) return 0;
    volatile struct control_mailbox *box=(volatile struct control_mailbox *)SERVICES_MAP(SERVICES_CONTROL_ADDRESS(h[GRKU_HOST_SERVICES/4]));
    CONTROL_INVALIDATE(&box->request,64);
    return box->request!=box->ready;
}
/* Copy the count of setting changes into the mailbox, where the service
   watches it to tell the phone of a change made on the camera. The line
   belongs to the App task: no request and no card read. */
static void control_publish(volatile u32 *h) {
    if(!h[GRKU_HOST_CONTROL_WORD/4]) return;
    volatile struct control_mailbox *box=(volatile struct control_mailbox *)SERVICES_MAP(SERVICES_CONTROL_ADDRESS(h[GRKU_HOST_SERVICES/4]));
    u32 changes=h[GRKU_HOST_STATE_CHANGES/4];
    if(box->state_changes!=changes) { box->state_changes=changes; CONTROL_CLEAN(&box->magic,64); }
}
/* The poll of the mailbox, from the timer of the saved state
   (runtime/persist.h). */
static void control_poll(volatile u32 *h) {
    if(!h[GRKU_HOST_CONTROL_WORD/4]) return;
    volatile struct control_mailbox *box=(volatile struct control_mailbox *)SERVICES_MAP(SERVICES_CONTROL_ADDRESS(h[GRKU_HOST_SERVICES/4]));
    control_publish(h);
    control_poll_once(box,(struct control_request *)services_word(h,SERVICES_CONTROL_CANDIDATE),control_dispatch,(void *)h);
}
#endif
