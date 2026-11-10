/* Generated from crates/grku-core/src/abi.rs. Do not edit: change the tables
   there, then run GRKU_UPDATE_GENERATED=1 cargo test -p grku-core --test
   generated. */
#ifndef GRKU_ABI_H
#define GRKU_ABI_H

/* The private header: the start of the registry array. ARM code addresses it
   through the literal GRKU_HEADER_REFERENCE, which the installer relocates. */
#define GRKU_HEADER_REFERENCE 0x58012340
#define GRKU_HOST_HEADER_SIZE 6144
/* The most module pages, layers, and plane filters that the header holds. */
#define GRKU_MODULE_PAGES_MAX 16
#define GRKU_MODULE_LAYERS_MAX 16
#define GRKU_MODULE_FILTERS_MAX 8
#define GRKU_INDICATORS_MAX 16
#define GRKU_STATUS_ICONS_MAX 6
/* The recipes (runtime/recipes.h): the most recipes, the most recipes that are
   on, the most undo steps, and the words of one recipe. The recipes that are
   on come first. In the recipe file, word w of recipe n has the key
   GRKU_RECIPE_KEY_BASE + w * GRKU_RECIPE_KEY_STRIDE + n. The name of a recipe
   has GRKU_RECIPE_NAME_WORDS words of four 7-bit characters, at most
   GRKU_RECIPE_NAME_CHARS; word w of the name of recipe n has the key
   GRKU_RECIPE_NAME_KEY_BASE + w * GRKU_RECIPE_KEY_STRIDE + n. The words after
   the names have one key each from GRKU_RECIPE_IMPORTED_KEY: the hash of the
   imported package library, the ID of recipe n at GRKU_RECIPE_ID_KEY_BASE + n,
   the assignment of user mode u at GRKU_RECIPE_DIAL_KEY_BASE + u
   (grku_core::runtime::recipe_key). A recipe ID is a generated number, 1 to
   GRKU_RECIPE_ID_MAX (runtime/recipe_id.h). A user mode follows
   (GRKU_RECIPE_DIAL_FOLLOW), turns GRKU off (GRKU_RECIPE_DIAL_OFF), or applies
   the recipe with its ID. The undo steps are not saved. */
#define GRKU_RECIPE_SLOTS 64U
#define GRKU_RECIPE_ON_MAX 40U
#define GRKU_RECIPE_UNDO 5U
#define GRKU_RECIPE_WORDS 5U
#define GRKU_RECIPE_NAME_CHARS 16U
#define GRKU_RECIPE_NAME_WORDS 4U
#define GRKU_RECIPE_DIAL_POSITIONS 3U
/* The bit layout of the recipe words (grku_core::recipes::layout): the index
   of each word, then for each field its _SHIFT and the _MASK of its value
   after the shift, and the bit of each flag. */
#define GRKU_RECIPE_FN_WORD 1U
#define GRKU_RECIPE_NATIVE_WORD 2U
#define GRKU_RECIPE_EXTRA_WORD 3U
#define GRKU_RECIPE_MODULE_WORD 4U
#define GRKU_RECIPE_VALUE_BITS 29U
#define GRKU_RECIPE_LOOK_MASK 3U
#define GRKU_RECIPE_LOOK_KEPT 0U
#define GRKU_RECIPE_LOOK_OFF 1U
#define GRKU_RECIPE_LOOK_EFFECT 2U
#define GRKU_RECIPE_GRAIN_HELD 4U
#define GRKU_RECIPE_GRAIN_LEVEL_SHIFT 3U
#define GRKU_RECIPE_GRAIN_LEVEL_MASK 7U
#define GRKU_RECIPE_GRAIN_SIZE_SHIFT 6U
#define GRKU_RECIPE_GRAIN_SIZE_MASK 3U
#define GRKU_RECIPE_CODE_SHIFT 8U
#define GRKU_RECIPE_CODE_MASK 0x00007fffU
#define GRKU_RECIPE_NUMBER_SHIFT 23U
#define GRKU_RECIPE_NUMBER_MAX 15U
#define GRKU_RECIPE_USED 0x08000000U
#define GRKU_RECIPE_HIDDEN 0x10000000U
#define GRKU_RECIPE_TYPE_SHIFT 0U
#define GRKU_RECIPE_TYPE_MASK 31U
#define GRKU_RECIPE_TONE_SHIFT 5U
#define GRKU_RECIPE_TONE_MASK 15U
#define GRKU_RECIPE_INTENSITY_SHIFT 9U
#define GRKU_RECIPE_INTENSITY_MASK 3U
#define GRKU_RECIPE_FILTER_SHIFT 11U
#define GRKU_RECIPE_FILTER_MASK 7U
#define GRKU_RECIPE_MODE_SHIFT 14U
#define GRKU_RECIPE_MODE_MASK 31U
#define GRKU_RECIPE_BA_SHIFT 19U
#define GRKU_RECIPE_GM_SHIFT 24U
#define GRKU_RECIPE_SHIFT_MASK 31U
#define GRKU_RECIPE_LOOK_BITS 0x00003fffU
#define GRKU_RECIPE_MODE_BITS 0x1fffc000U
#define GRKU_RECIPE_TEMPERATURE_MASK 0x000003ffU
#define GRKU_RECIPE_CORRECTION_SHIFT 10U
#define GRKU_RECIPE_CORRECTION_BITS 3U
#define GRKU_RECIPE_CORRECTION_MASK 7U
#define GRKU_RECIPE_NATIVE_GRAIN_SHIFT 22U
#define GRKU_RECIPE_NATIVE_GRAIN_MASK 3U
#define GRKU_RECIPE_NATIVE_GRAIN_SIZE_SHIFT 24U
#define GRKU_RECIPE_NATIVE_GRAIN_SIZE_MASK 3U
#define GRKU_RECIPE_NATIVE_GRAIN_BITS 0x03c00000U
#define GRKU_RECIPE_SOLARIZATION_SHIFT 26U
#define GRKU_RECIPE_SOLARIZATION_MASK 7U
#define GRKU_RECIPE_TYPE_EXTRA_BITS 0x1fc00000U
#define GRKU_RECIPE_MODULE_SETTING_BITS 3U
#define GRKU_RECIPE_MODULE_VALUE_MASK 3U
#define GRKU_RECIPE_EV_SHIFT 9U
#define GRKU_RECIPE_EV_MASK 63U
#define GRKU_RECIPE_EV_ZERO 31U
#define GRKU_RECIPE_ISO_SHIFT 15U
#define GRKU_RECIPE_ISO_MASK 63U
#define GRKU_RECIPE_METERING_SHIFT 21U
#define GRKU_RECIPE_METERING_MASK 7U
#define GRKU_RECIPE_ND_SHIFT 24U
#define GRKU_RECIPE_ND_MASK 3U
#define GRKU_RECIPE_EXPOSURE_BITS 0x03fffe00U
#define GRKU_RECIPE_OFF 0x10000000U
/* The module settings that a recipe holds
   (grku_core::recipes::MODULE_SETTINGS), in the order of their bits in word 4:
   GLOW.BLOOM, GLOW.HALATION, GLOW.HALATION_COLOR. Each is its state file ID,
   which finds it in the settings table. GRKU_RECIPE_MODULE_COLOR_ONLY has bit
   i for a color-only setting, which GR IV Monochrome does not hold. */
#define GRKU_RECIPE_MODULE_SETTINGS 3U
#define GRKU_RECIPE_MODULE_SETTING_IDS 73603892U, 979977653U, 208924775U
#define GRKU_RECIPE_MODULE_COLOR_ONLY 4U
#define GRKU_RECIPE_KEY_BASE 991000000U
#define GRKU_RECIPE_KEY_STRIDE 100U
#define GRKU_RECIPE_NAME_KEY_BASE 991005000U
#define GRKU_RECIPE_IMPORTED_KEY 991009000U
#define GRKU_RECIPE_ID_KEY_BASE 991009001U
#define GRKU_RECIPE_DIAL_KEY_BASE 991009065U
#define GRKU_RECIPE_ID_MAX 536870909U
#define GRKU_RECIPE_DIAL_FOLLOW 0U
#define GRKU_RECIPE_DIAL_SAVED 536870910U
#define GRKU_RECIPE_DIAL_OFF 536870911U
/* The settings that the camera saves in a user mode of the mode dial
   (runtime/mode_dial.h, grku_core::abi::DIAL_SET_WORDS): GRKU_DIAL_SET_WORDS
   words, the number of pairs + 1 (0 without a set), a word for each
   capability, the Fn adjustments and the Toning of the effect, then
   GRKU_DIAL_SET_PAIRS pairs of a state file ID and a value. The effect word is
   0 for Off, else GRKU_DIAL_SET_EFFECT with the recipe code of the effect. In
   their file, word w of user mode u (0 for U1) has the key
   GRKU_DIAL_SET_KEY_BASE + u * GRKU_DIAL_SET_KEY_STRIDE + w, and a word is at
   most GRKU_DIAL_SET_VALUE_MAX. */
#define GRKU_DIAL_SET_PAIRS 93U
#define GRKU_DIAL_SET_COUNT 0U
#define GRKU_DIAL_SET_CORE 1U
#define GRKU_DIAL_SET_FN 11U
#define GRKU_DIAL_SET_TONING 12U
#define GRKU_DIAL_SET_PAIR 13U
#define GRKU_DIAL_SET_WORDS 199U
#define GRKU_DIAL_SET_EFFECT 32768U
#define GRKU_DIAL_SET_KEY_BASE 992000000U
#define GRKU_DIAL_SET_KEY_STRIDE 1000U
#define GRKU_DIAL_SET_VALUE_MAX 999999999U
#define GRKU_MODULE_SETTINGS_MAX 160
/* The most modules that GRKU lists, and the words of the largest script array,
   which holds the module array. */
#define GRKU_MODULES_MAX 10U
#define GRKU_MODULE_ARRAY_WORDS 65536U
/* The row views of the borrowed native settings page: the ADJ Order page has a
   row for each listed module. Without a suffix, for the assembler. */
#define GRKU_SUBMENU_ROWS 10
/* Icon slots: the host icons, then the effect icons, then the module tiles, in
   chunks of GRKU_ICONS_PER_CHUNK (GRKU_HOST_ICON_CHUNKS).
   GRKU_ICON_MODULE_TILE(n) is the icon ID of module tile n. */
#define GRKU_HOST_ICON_COUNT 6
#define GRKU_ICONS_PER_CHUNK 40
#define GRKU_MODULE_TILES_MAX 128
#define GRKU_ICON_MODULE_TILE(n) (0x7000U+(n))
#define GRKU_STATE_CHANGED(h) (++(h)[GRKU_HOST_STATE_CHANGES/4])
#define GRKU_RECIPES_CHANGED(h) (++(h)[GRKU_HOST_RECIPE_CHANGES/4])
#define GRKU_HOST_MAGIC_VALUE 0x314d5247
#define GRKU_HOST_VERSION_VALUE 1
/* Number of Image Control records. */
#define GRKU_HOST_COUNT 0
/* Address of record 0. The records follow the header without gaps. */
#define GRKU_HOST_RECORDS 4
/* Selected record, or 0 for native processing. */
#define GRKU_HOST_ACTIVE 8
/* The ScreenDevice of the last highlight warning setting
   (ScreenDevice::OnSetLevelAlarm), or 0 (runtime/framing.c). */
#define GRKU_HOST_LEVEL_SCREEN 12
/* GRKU_HOST_MAGIC_VALUE after the installer writes the header. */
#define GRKU_HOST_MAGIC 16
/* GRKU_HOST_VERSION_VALUE. */
#define GRKU_HOST_VERSION 20
/* The mode of that setting: 0 while the warning is off. A change of the effect
   sets the warning again with this mode. */
#define GRKU_HOST_LEVEL_MODE 24
/* Number of parameter builds. A diagnostic. */
#define GRKU_HOST_PROCESSING_CALLS 28
/* ADJ controller that shows the private menu, or 0. */
#define GRKU_HOST_MENU_CONTROLLER 32
/* Private menu level: 0 native, MENU_ROOT, or MENU_MODULE (runtime/modules.h). */
#define GRKU_HOST_MENU_LEVEL 36
/* Highlighted row of the private menu. */
#define GRKU_HOST_MENU_CURSOR 40
/* Address of the tail, an array of its own: the picture scratch, the menu
   text, then the live-view labels. INSTALL writes it. */
#define GRKU_HOST_TAIL 44
/* Grain level, the capability CORE.GRAIN: 0 Off, 1 weak, 2 medium, 3 strong.
   The native grain stage of recorded pictures uses it instead of the native
   grain settings. */
#define GRKU_HOST_GRAIN 48
/* Address of the module list of the Modules page (runtime/manage.h), or 0
   without a listed module. INSTALL writes it. */
#define GRKU_HOST_MANAGE 52
/* Address of the state of the core services (runtime/services.h): the event
   subscribers, the timers, and the UI. INSTALL writes it, with the module
   array. */
#define GRKU_HOST_SERVICES 56
/* Nonzero while the menu rebuilds the native list. The list callback and the
   native Image Control preview ignore the changes. */
#define GRKU_HOST_MENU_REBUILDING 60
/* Native list position, saved when the private menu opens. */
#define GRKU_HOST_MENU_LIST 64
#define GRKU_HOST_MENU_LIST_WORDS 2
/* The module + 1 whose native settings page the menu opened (Module.settings,
   runtime/core.h), or 0. While it is set, the hooks of the borrowed native
   page show the settings of that module. A change to a controller outside the
   page clears it. */
#define GRKU_HOST_SETTINGS 72
/* Number of ADJ events. GRKU_HOST_MENU_EVENT_RING holds the last ones. */
#define GRKU_HOST_MENU_EVENTS 76
/* GRKU_HOST_STATE_CHANGES when the live view last took a redraw for it. A
   changed setting redraws the live view once (runtime/framing.c). */
#define GRKU_HOST_FRAME_CHANGES 80
/* Icon of Off, or 0 for the native icon. */
#define GRKU_HOST_OFF_ICON 84
/* How the private menu opened: 1 or 2 across an edge of the native slots, 3 by
   touch or on the return from the native parameters. */
#define GRKU_HOST_MENU_EDGE 88
/* MENU was pressed, and its confirm event has not arrived yet. */
#define GRKU_HOST_BACK_PENDING 92
/* Text descriptor of the ADJ title: (length + 1) | 0x100, then the address. */
#define GRKU_HOST_MENU_TITLE 96
#define GRKU_HOST_MENU_TITLE_WORDS 2
/* Text descriptor of the ADJ detail line. */
#define GRKU_HOST_MENU_DETAIL 104
#define GRKU_HOST_MENU_DETAIL_WORDS 2
/* The last ADJ events: kind | argument << 16. */
#define GRKU_HOST_MENU_EVENT_RING 112
#define GRKU_HOST_MENU_EVENT_RING_WORDS 8
/* The record whose adjustments the native parameter page edits, or 0. Fn in
   GRKU Image Control stores the record with bit 0 set, and the page start
   clears bit 0. A page that native ADJ opens clears the word. */
#define GRKU_HOST_PARAMETERS 144
/* Number of adjustment changes. The live view rebuilds its stages when it
   changes. */
#define GRKU_HOST_PARAMETER_CHANGES 148
/* GRKU_HOST_PARAMETER_CHANGES at the last live-view build. */
#define GRKU_HOST_LIVE_PARAMETER_CHANGES 152
/* Icon chunk addresses: chunk n holds icon slots 40 n to 40 n + 39. The host
   icons come first in chunk 0, then the effect icons. */
#define GRKU_HOST_ICON_CHUNKS 156
#define GRKU_HOST_ICON_CHUNKS_WORDS 5
/* Icon of the GRKU tile. */
#define GRKU_HOST_GRKU_ICON 176
/* Private toolbar cell, or 0. */
#define GRKU_HOST_TOOLBAR_WIDGET 180
/* ADJ controller of the private toolbar cell. */
#define GRKU_HOST_TOOLBAR_OWNER 184
/* Module that the private menu shows at MENU_MODULE. At the end of a private
   session it holds the module of the root row where the next session opens
   (menu_reopen). */
#define GRKU_HOST_MODULE 188
/* Load cue: 0 none, 1 after INSTALL, then 2 + the local second of the day when
   the still live view first shows the cue. */
#define GRKU_HOST_LOAD_CUE 192
/* Aspect id 2 variant for the photo shown in playback: 0 none (shooting uses
   the Framing ratio), 1 not 65:24, 2 65:24. */
#define GRKU_HOST_FRAME_FILE 196
/* Record of the last live-view build: an owned record, or 0 for native
   processing. */
#define GRKU_HOST_LIVE_RECORD 200
/* The capabilities in use: bit n is set when a loaded module uses capability n
   (GRKU_CORE_SETTING_BASE + n). INSTALL writes it, and the resident loader
   restores only the values of these capabilities. */
#define GRKU_HOST_CAPABILITIES 204
/* Framing ratio: 0 native, then the Framing rows. */
#define GRKU_HOST_FRAME_RATIO 208
/* ADJ Framing page preview: 0 none, else the highlighted ratio + 1. */
#define GRKU_HOST_FRAME_PREVIEW 212
/* Number of Framing paints. A diagnostic. */
#define GRKU_HOST_FRAME_DRAWS 216
/* ADJ controller of the preview. Its canvas shows the preview. ADJ can make
   its canvas after its first refresh, so a draw reads the canvas from the
   controller. The word stays set until a full draw erases the mask. */
#define GRKU_HOST_FRAME_PREVIEW_ADJ 220
/* Address of the effect list of the Effects page (runtime/effects.h), or 0
   without a listed effect. INSTALL writes it. */
#define GRKU_HOST_EFFECTS 224
/* Live view controller that Framing draws on, or 0. */
#define GRKU_HOST_FRAME_OWNER 228
/* Canvas of that controller. */
#define GRKU_HOST_FRAME_CANVAS 232
/* Bitmap of the last Framing paint, or 0 when nothing is drawn. */
#define GRKU_HOST_FRAME_BITMAP 236
/* Grain size, the capability CORE.GRAIN_SIZE: 0 Auto (the ISO of the shot), 1
   small, 2 medium, 3 large. */
#define GRKU_HOST_GRAIN_SIZE 240
/* Live-view-only override: 0 none, 1 native processing, else an owned record. */
#define GRKU_HOST_PREVIEW 244
/* The grain of the shot whose grain stage was set up last: 0 the native noise,
   else the size 1 small, 2 medium, 3 large. The GR III noise fill reads it
   (runtime/picture.c). */
#define GRKU_HOST_GRAIN_SHOT 248
/* Return to GRKU Image Control after the native parameter page: 1 opening, 2
   away. 3: ADJ exited from GRKU, so the next ADJ opens GRKU. 4: MENU or OK on
   GRKU passed the event that closes ADJ to the native list. */
#define GRKU_HOST_RETURN 252
/* Number of changes of the saved selections: the effect, CORE.ASPECT,
   CORE.GRAIN, CORE.GRAIN_SIZE, CORE.ADJ, CORE.ADJ_MODULE, the Fn adjustments,
   and the module settings (GRKU_STATE_CHANGED). The resident loader polls this
   word and HOST_RECIPE_CHANGES, and saves the state file after it changes. */
#define GRKU_HOST_STATE_CHANGES 256
/* Number of module plane filters in GRKU_HOST_MODULE_FILTERS. INSTALL writes
   it. */
#define GRKU_HOST_MODULE_FILTER_COUNT 260
/* Address of the profile table (GRKU_PROFILE in the tail) while the
   development profile runs, else 0. INSTALL writes it when the card has
   GRKU/PROFILE or PROFILE.TXT. */
#define GRKU_HOST_PROFILE 264
/* Two words for each module plane filter, in stage order: its apply function,
   and its setting handle in the low half with its stage in the high half. */
#define GRKU_HOST_MODULE_FILTERS 268
#define GRKU_HOST_MODULE_FILTERS_WORDS 16
/* The crop of the capture size hooks (runtime/framing.S): the Framing ratio
   where it applies in the native aspect (aspect_value), else 0. Each live-view
   update sets it, so a native aspect that the camera menu sets takes the stock
   sizes. */
#define GRKU_HOST_FRAME_CROP 332
/* The listed modules that ADJ can show, a bit each, which ADJ Order lists
   (runtime/manage.h). The menu sets it. The text hooks read this word, so they
   do not walk the module pages. */
#define GRKU_HOST_ADJ_MODULES 336
/* Address of the module settings table, or 0 (runtime/settings.h). INSTALL
   writes it. */
#define GRKU_HOST_MODULE_SETTINGS 340
/* The ADJ preview of a module page: its setting handle plus 1 (0 for none),
   then the highlighted value. Module layers of that setting paint the
   highlighted value on the ADJ canvas. */
#define GRKU_HOST_MODULE_PREVIEW 344
#define GRKU_HOST_MODULE_PREVIEW_WORDS 2
/* Number of module pages in GRKU_HOST_MODULE_PAGES. INSTALL writes it. */
#define GRKU_HOST_MODULE_PAGE_COUNT 352
/* Three words for each module page (runtime/sdk/grku.h), in load order: the
   address of its GrkuPage, its setting handle, and the global index of its
   tile 0 (GRKU_ICON_MODULE_TILE). */
#define GRKU_HOST_MODULE_PAGES 356
#define GRKU_HOST_MODULE_PAGES_WORDS 48
/* The module page that the generic page callbacks of the menu serve. */
#define GRKU_HOST_MODULE_CHOICE 548
/* Number of module layers in GRKU_HOST_MODULE_LAYERS. INSTALL writes it. */
#define GRKU_HOST_MODULE_LAYER_COUNT 552
/* Four words for each module layer, in painting order: its paint function,
   setting handle (GRKU_NO_SETTING paints with value 1), flags in the low half
   with order in the high half, and an optional GrkuLayer descriptor with
   enabled conditions (0 for no conditions). */
#define GRKU_HOST_MODULE_LAYERS 556
#define GRKU_HOST_MODULE_LAYERS_WORDS 64
/* Key of the inputs of the last private curve composition in the gamma stage,
   or 0 (runtime/processing.h). */
#define GRKU_HOST_GAMMA_KEY 812
/* The effect of the RAW development in playback: 1 for native processing, else
   an owned record. The start of a development sets the effect that its DNG
   records (runtime/picture.c), and its Image Control list changes it. The
   still builds of a development apply it instead of the selected effect
   (runtime/processing.h). */
#define GRKU_HOST_DEVELOP 816
/* GRKU_HOST_DEVELOP when the Image Control list of the development opened.
   Cancel restores it, as the list restores its native value. */
#define GRKU_HOST_DEVELOP_SAVED 820
/* The native rows of that list. The effects follow them (runtime/menu.c). */
#define GRKU_HOST_DEVELOP_ROWS 824
/* The text ID of the native Standard label of the development, which shows the
   name of a GRKU effect (GRKU_HOST_DEVELOP_NAME) instead. */
#define GRKU_HOST_DEVELOP_TEXT 828
/* The text descriptor of that name. */
#define GRKU_HOST_DEVELOP_NAME 832
#define GRKU_HOST_DEVELOP_NAME_WORDS 2
/* Number of registered viewfinder indicators. INSTALL writes it. */
#define GRKU_HOST_INDICATOR_COUNT 840
/* Descriptor address and module tile base for each indicator, in module load
   order and declaration order (runtime/sdk/grku.h). */
#define GRKU_HOST_INDICATORS 844
#define GRKU_HOST_INDICATORS_WORDS 32
/* Code address of an ABI 2.0/2.1 module that supplies CORE.TONE, or 0. Its
   legacy native icon applies only without an explicit slot owner. */
#define GRKU_HOST_LEGACY_TONE_OWNER 972
/* CORE.ASPECT_MODE: 0 crops photos, 1 draws a composition frame only. */
#define GRKU_HOST_ASPECT_MODE 976
/* Native aspect + 1 at the last live-view bind, or 0 before the first bind. */
#define GRKU_HOST_FRAME_NATIVE 980
/* The Framing ratio of the RAW development in playback (a CORE.ASPECT value),
   or 0 for its native aspect. The start of a development clears it
   (runtime/picture.c), and the aspect list of the development sets it
   (runtime/menu.c). The development sends the capture aspect and the geometry
   of that ratio to the pipeline (runtime/framing.c). */
#define GRKU_HOST_DEVELOP_RATIO 984
/* GRKU_HOST_DEVELOP_RATIO when the aspect list of the development opened.
   Cancel restores it, as the list restores its native value. */
#define GRKU_HOST_DEVELOP_RATIO_SAVED 988
/* The native rows of that list. The Framing ratios follow them. */
#define GRKU_HOST_DEVELOP_ASPECT_ROWS 992
/* The text ID of the native aspect label that shows the name of the Framing
   ratio (GRKU_HOST_DEVELOP_RATIO_NAME) instead. */
#define GRKU_HOST_DEVELOP_RATIO_TEXT 996
/* The text descriptor of that name. */
#define GRKU_HOST_DEVELOP_RATIO_NAME 1000
#define GRKU_HOST_DEVELOP_RATIO_NAME_WORDS 2
/* The effect record whose Fn adjustments the Standard parameter set of the
   development model holds, or 0 while the set holds its own values
   (runtime/develop.h). */
#define GRKU_HOST_DEVELOP_FILLED 1008
/* The own values of that set while GRKU_HOST_DEVELOP_FILLED is not 0: one byte
   for each Fn adjustment, in GRKU_RECORD_PARAMETERS order. */
#define GRKU_HOST_DEVELOP_NATIVE 1012
#define GRKU_HOST_DEVELOP_NATIVE_WORDS 3
/* The effect record whose changed adjustments the development keeps while the
   set holds another one, or 0. The start of a development clears it. */
#define GRKU_HOST_DEVELOP_CHANGED 1024
/* Those adjustments, as GRKU_HOST_DEVELOP_NATIVE. */
#define GRKU_HOST_DEVELOP_CHANGES 1028
#define GRKU_HOST_DEVELOP_CHANGES_WORDS 3
/* CORE.CROP: 0 Off, then a focal-length crop step (runtime/crop.h). */
#define GRKU_HOST_CROP 1040
/* CORE.CROP_MODE: 0 crops photos where the camera can, 1 draws the frame only. */
#define GRKU_HOST_CROP_MODE 1044
/* The native crop factor that the core set for CORE.CROP, as float bits, or 0
   while the camera keeps its own (runtime/crop.h). */
#define GRKU_HOST_CROP_NATIVE 1048
/* The crop factor of the next shot, as float bits, where it is longer than the
   native factor of the live view (70 and 90 mm), or 0. */
#define GRKU_HOST_CROP_SHOT 1052
/* GR IV: the back end of the last shot, whose queue completion the core can
   post when a crop shot finishes before the shutter release stops
   (runtime/crop_queue.S). */
#define GRKU_HOST_CROP_QUEUE_OWNER 1056
/* GR IV: the queue completion flags of that shot, CROP_QUEUE_POSTED and
   CROP_QUEUE_RECOVERED. */
#define GRKU_HOST_CROP_QUEUE_FLAGS 1060
/* The recipes (runtime/recipes.h): RECIPE_WORDS words for each of the
   RECIPE_SLOTS recipes. A recipe whose word 0 is 0 is empty. The resident
   loader saves each word that is not 0 in the recipe file
   (`capabilities::StateFile::Recipes`). */
#define GRKU_HOST_RECIPES 1064
#define GRKU_HOST_RECIPES_WORDS 320
/* The names of the recipes, RECIPE_NAME_WORDS words each (RECIPE_NAME_CHARS),
   right after HOST_RECIPES, which the loader saves after the recipe words. */
#define GRKU_HOST_RECIPE_NAMES 2344
#define GRKU_HOST_RECIPE_NAMES_WORDS 256
/* The hash of the recipe library of the package that INSTALL imported last
   (runtime/install_recipes.h), after the names: the loader saves it with the
   recipes, so a package imports once. */
#define GRKU_HOST_RECIPE_IMPORTED 3368
/* The ID of each recipe, by slot, 1 to `runtime::RECIPE_ID_MAX`: a generated
   number, so that a recipe that the site moves to another card keeps an ID
   that no recipe of that card had. A reference to a recipe holds its ID, so
   that it stays valid when the recipes move. Each part that creates a recipe
   (the camera, INSTALL, the site) generates its ID. The loader saves the IDs
   after the import hash. */
#define GRKU_HOST_RECIPE_IDS 3372
#define GRKU_HOST_RECIPE_IDS_WORDS 64
/* What each user mode of the mode dial, U1 to U3, does
   (`runtime::RECIPE_DIAL_FOLLOW`, `RECIPE_DIAL_OFF`, or the ID of a recipe).
   An ID that no recipe has follows, as `RECIPE_DIAL_FOLLOW`. A generated ID is
   never one of these values, so a deleted recipe never gets the references of
   another. */
#define GRKU_HOST_RECIPE_DIAL 3628
#define GRKU_HOST_RECIPE_DIAL_WORDS 3
/* The count of changes of the recipes: the loader saves the recipe file after
   it changes (GRKU_RECIPES_CHANGED). INSTALL sets 1 after an import. */
#define GRKU_HOST_RECIPE_CHANGES 3640
/* The undo steps, the oldest first, RECIPE_WORDS words each. They are not
   saved: a start begins without them. */
#define GRKU_HOST_RECIPE_UNDO 3644
#define GRKU_HOST_RECIPE_UNDO_WORDS 25
/* Nonzero while the mode dial is on a user mode whose settings are temporary
   (runtime/mode_dial.h): the resident loader then does not save the main state
   file, so the file keeps the settings of the other positions. The recipe file
   still saves. */
#define GRKU_HOST_STATE_HOLD 3744
/* The count of changes of the saved settings of the user modes
   (`HOST_DIAL_SETS`): the loader saves their file after it changes. */
#define GRKU_HOST_DIAL_SET_CHANGES 3748
/* CORE.ADJ: 1 when the next ADJ should open on GRKU, 0 for a native entry.
   Survives enter clearing HOST_RETURN, and STATE.TXT keeps it across power-off
   (runtime/menu.c). */
#define GRKU_HOST_ADJ_OPEN 3752
/* The settings that the camera saved in each user mode of the mode dial, U1 to
   U3, `DIAL_SET_WORDS` words each (runtime/mode_dial.h). A user mode applies
   them while it has `runtime::RECIPE_DIAL_SAVED` (`HOST_RECIPE_DIAL`). The
   resident loader saves each word that is not 0 in their file
   (`capabilities::StateFile::DialSets`), and INSTALL restores them. */
#define GRKU_HOST_DIAL_SETS 3756
#define GRKU_HOST_DIAL_SETS_WORDS 597

/* The capabilities of the core (grku_core::capabilities): the handle of each
   CORE setting, and for each handle in order, its header word and its number
   of values. CORE.TONE has neither: its value is the active record, and the
   effects give its number of values (runtime/tone.h). */
#define GRKU_CORE_SETTING_BASE 0x100U
#define GRKU_CORE_SETTING_COUNT 10U
#define GRKU_CORE_TONE 0x100U
#define GRKU_CORE_TONE_VALUES 0U
#define GRKU_CORE_TONE_BIT 0x1
#define GRKU_CORE_ASPECT 0x101U
#define GRKU_CORE_ASPECT_VALUES 8U
#define GRKU_CORE_ASPECT_BIT 0x2
#define GRKU_CORE_GRAIN 0x102U
#define GRKU_CORE_GRAIN_VALUES 5U
#define GRKU_CORE_GRAIN_BIT 0x4
#define GRKU_CORE_GRAIN_SIZE 0x103U
#define GRKU_CORE_GRAIN_SIZE_VALUES 4U
#define GRKU_CORE_GRAIN_SIZE_BIT 0x8
#define GRKU_CORE_ASPECT_MODE 0x104U
#define GRKU_CORE_ASPECT_MODE_VALUES 2U
#define GRKU_CORE_ASPECT_MODE_BIT 0x10
#define GRKU_CORE_CROP 0x105U
#define GRKU_CORE_CROP_VALUES 6U
#define GRKU_CORE_CROP_BIT 0x20
#define GRKU_CORE_CROP_MODE 0x106U
#define GRKU_CORE_CROP_MODE_VALUES 2U
#define GRKU_CORE_CROP_MODE_BIT 0x40
#define GRKU_CORE_ADJ 0x107U
#define GRKU_CORE_ADJ_VALUES 2U
#define GRKU_CORE_ADJ_BIT 0x80
#define GRKU_CORE_ADJ_MODULE 0x108U
#define GRKU_CORE_ADJ_MODULE_VALUES 10U
#define GRKU_CORE_ADJ_MODULE_BIT 0x100
#define GRKU_CORE_RECIPE 0x109U
#define GRKU_CORE_RECIPE_VALUES 0U
#define GRKU_CORE_RECIPE_BIT 0x200
#define GRKU_CORE_SETTING_WORDS 0,208,48,240,976,1040,1044,3752,188,0
#define GRKU_CORE_SETTING_VALUES 0,8,5,4,2,6,2,2,10,0

/* An Image Control record. The records follow the header. */
#define GRKU_RECORD_SIZE 0x1100
/* The native processing record: a prefix, then the tone curves. */
#define GRKU_RECORD_COEFFICIENTS 0x54
/* UTF-16 effect name with its NUL. */
#define GRKU_RECORD_NAME 0x668
/* Nonzero for a monochrome effect. */
#define GRKU_RECORD_MONOCHROME 0x690
/* Address of the effect icon. */
#define GRKU_RECORD_ICON 0x694
/* Effect ID with its NUL. */
#define GRKU_RECORD_ID 0x698
/* u16 ImageTone code recorded in photos: 0x8000 | hash of the effect ID. */
#define GRKU_RECORD_CODE 0x6f8
/* GRF extension, zero for an effect without features. */
#define GRKU_RECORD_FEATURES 0x700
/* i16[9] signed Q13 RGB matrix after the tone curves, applied through the
   YCbCr matrix. */
#define GRKU_RECORD_POST 0x704
/* Selective color for recorded pictures: i16 cos and sin of the target hue
   (Q12), u16 inner and outer tangents toward smaller hue angles, then toward
   larger ones (Q8), and u8 chroma gate c0 and c1. Bytes 0x724..0x72b are
   reserved and zero. */
#define GRKU_RECORD_SELECTIVE 0x716
/* Fn adjustments of the effect: saturation, hue, high/low key, contrast,
   highlight contrast, shadow contrast, sharpness, shading, clarity. Each byte
   is (native value - 4) mod 9, so zero is neutral. A native value is 0..8, and
   4 is neutral. */
#define GRKU_RECORD_PARAMETERS 0x72c
/* The default of each Fn adjustment, in the order of RECORD_PARAMETERS:
   (default - 4) mod 9 of a native value 0..8, from the Fn defaults of the
   effect (feature 64), else zero. An adjustment's native value is (stored +
   default + 4) mod 9, so a stored zero is the default. */
#define GRKU_RECORD_FN_DEFAULTS 0x735
/* The Toning of a native look whose red or blue curve differs from green, as a
   stored Fn byte: (shown value) mod 9, -4..4, 0 the look's own toning. The
   curves of the record hold the toned curves. */
#define GRKU_RECORD_TONING 0x73e
/* 1 + the slot of the look's own red and blue curves in the tail
   (`TONE_CURVES`), or 0 for an effect without Toning. */
#define GRKU_RECORD_TONE_SLOT 0x73f
/* The MultiAxial parameter set that INSTALL expands from the hue sectors of
   the GRF (feature 8): the address of the set at +0, the address of the
   highlight-correction set at +4, the set (six pointers) at +8, the bounds at
   +0x20, the bank selectors at +0x40, the matrix header at +0x58, the control
   fields at +0x6c, 60 3x3 i32 Q10 matrices at +0x98, the highlight-correction
   set at +0x908, and its control fields at +0x920. Zero without hue sectors. */
#define GRKU_RECORD_MULTIAXIAL 0x740
/* The R, G, and B tone curves in the coefficients: 256 14-bit samples each,
   GRKU_RECORD_CURVE_SIZE bytes apart. */
#define GRKU_RECORD_CURVES 0x68
#define GRKU_RECORD_CURVE_SIZE 0x200
/* A GRFX0001 effect file has GRKU_GRF_SIZE bytes, or GRKU_GRF_MAX_SIZE with
   hue levels (feature 16). Each byte that no field holds is zero. */
#define GRKU_GRF_SIZE 8192U
#define GRKU_GRF_MAX_SIZE 8704U
/* The magic `GRFX0001`. */
#define GRKU_GRF_MAGIC 0U
#define GRKU_GRF_MAGIC_SIZE 8U
/* u32 size of the file. */
#define GRKU_GRF_BYTES 8U
#define GRKU_GRF_BYTES_SIZE 4U
/* u32 CRC-32 of the file, which reads these bytes as zero. */
#define GRKU_GRF_CRC 12U
#define GRKU_GRF_CRC_SIZE 4U
/* The effect ID: NUL-terminated and zero-padded. */
#define GRKU_GRF_ID 16U
#define GRKU_GRF_ID_SIZE 32U
/* The effect name: NUL-terminated and zero-padded ASCII. */
#define GRKU_GRF_NAME 48U
#define GRKU_GRF_NAME_SIZE 32U
/* u32 flags: 1 for a monochrome effect. */
#define GRKU_GRF_FLAGS 80U
#define GRKU_GRF_FLAGS_SIZE 4U
/* u32 extension features (GRKU_FEATURE_*), zero without the extension. */
#define GRKU_GRF_FEATURES 84U
#define GRKU_GRF_FEATURES_SIZE 4U
/* i16[9] signed Q13 RGB matrix after the tone curves (feature 1). */
#define GRKU_GRF_POST 88U
#define GRKU_GRF_POST_SIZE 18U
/* Selective color (feature 2): i16 cos and sin of the target hue, four u16
   tangents, and two u8 chroma limits. */
#define GRKU_GRF_SELECTIVE 106U
#define GRKU_GRF_SELECTIVE_SIZE 14U
/* Reserved and zero. */
#define GRKU_GRF_RESERVED 120U
#define GRKU_GRF_RESERVED_SIZE 8U
/* i16[9] signed Q13 color matrix. */
#define GRKU_GRF_MATRIX 128U
#define GRKU_GRF_MATRIX_SIZE 18U
/* Zero. */
#define GRKU_GRF_PADDING 146U
#define GRKU_GRF_PADDING_SIZE 2U
/* The R, G, and B tone curves: 256 14-bit u16 samples each. */
#define GRKU_GRF_CURVES 148U
#define GRKU_GRF_CURVES_SIZE 1536U
/* The 40 x 40 RGBA8 icon, with binary alpha. */
#define GRKU_GRF_ICON 1684U
#define GRKU_GRF_ICON_SIZE 6400U
/* Hue sectors of feature 8: 11 x 6 i8 coefficients (GRKU_HUE_MATRICES bytes),
   then the u16 control fields 10..20 of the weight curve. */
#define GRKU_GRF_HUE 8084U
#define GRKU_GRF_HUE_SIZE 88U
#define GRKU_GRF_ID_MAX 31U
#define GRKU_GRF_NAME_MAX 16U
/* A GRKR0001 recipe library has GRKU_RCP_HEADER_SIZE bytes, then
   GRKU_RCP_RECORD_SIZE bytes for each of at most GRKU_RCP_MAX recipes. */
#define GRKU_RCP_HEADER_SIZE 32U
#define GRKU_RCP_RECORD_SIZE 64U
#define GRKU_RCP_MAX 64U
#define GRKU_RCP_NAME_UNITS 16U
/* A user mode of the mode dial in the header (GRKU_RCP_DIAL): keep the value
   of the camera, follow the dial, turn GRKU off, or apply record k at
   GRKU_RCP_DIAL_RECORD + k. */
#define GRKU_RCP_DIAL_KEEP 0U
#define GRKU_RCP_DIAL_FOLLOW 1U
#define GRKU_RCP_DIAL_OFF 2U
#define GRKU_RCP_DIAL_RECORD 3U
/* The family byte of a record: the camera line whose INSTALL imports it. */
#define GRKU_RCP_FAMILY_GR3 1U
#define GRKU_RCP_FAMILY_GR4 2U
#define GRKU_RCP_FAMILY_GR4_MONOCHROME 3U
/* The magic `GRKR0001`. */
#define GRKU_RCP_MAGIC 0U
/* u32 size of the file. */
#define GRKU_RCP_BYTES 8U
/* u32 CRC-32 of the file, which reads these bytes as zero. */
#define GRKU_RCP_CRC 12U
/* u32 number of recipes. */
#define GRKU_RCP_COUNT 16U
/* u32 for each user mode of the mode dial, U1 to U3: what INSTALL sets it to
   when it imports the library (`recipes::DialStep`). */
#define GRKU_RCP_DIAL 20U
/* The name: UTF-16LE units, zero-padded, without a NUL at 16 units. */
#define GRKU_RCP_RECORD_NAME 0U
/* The RECIPE_WORDS words of the recipe (runtime/recipes.h). */
#define GRKU_RCP_RECORD_WORDS 32U
/* u8 family: 1 GR III, 2 GR IV, 3 GR IV Monochrome. */
#define GRKU_RCP_RECORD_FAMILY 52U
#define GRKU_FEATURE_POST 1U
#define GRKU_FEATURE_SELECTIVE 2U
#define GRKU_FEATURE_HUE 8U
#define GRKU_FEATURE_HUE_LEVELS 16U
#define GRKU_FEATURE_NATIVE_LOOK 32U
#define GRKU_FEATURE_FN_DEFAULTS 64U
/* The default Fn adjustments of feature 64: 9 i8 (-4..4) in the order of
   GRKU_RECORD_PARAMETERS, in a file of GRKU_GRF_MAX_SIZE bytes. */
#define GRKU_GRF_FN_DEFAULTS 8624U
#define GRKU_GRF_FN_DEFAULTS_END 8633U
#define GRKU_HUE_SIZE 88U
#define GRKU_HUE_MATRICES 66U
/* Hue levels of feature 16: the sectors of levels 1 to 3 after the first
   GRKU_GRF_SIZE bytes. */
#define GRKU_HUE_LEVEL_OFFSET 8192U
#define GRKU_HUE_LEVEL_SIZE 198U
/* The fixed breakpoints of the weight curve, control fields 18..20. */
#define GRKU_HUE_BORDERS { 164, 655, 4095 }
/* The quadrant bounds and the bank of each segment: 11 equal sectors, sector k
   in bank k + 1. */
#define GRKU_HUE_BOUNDS { 1490, 745, 0, 0, 1304, 559, 0, 0, 1862, 1118, 373, 0, 1676, 931, 187, 0 }
#define GRKU_HUE_SELECTORS { 3, 2, 1, 0, 0, 11, 10, 9, 0, 0, 9, 8, 7, 6, 0, 6, 5, 4, 3, 0 }
/* Control fields 1..8 that spread the levels, and those for a capture with
   highlight correction, which halves the stage's input. */
#define GRKU_HUE_LEVEL_CONTROL { 656, 656, 656, 586, 150, 650, 1150, 1650 }
#define GRKU_HUE_LEVEL_CONTROL_HALVED { 1312, 1312, 1312, 1172, 75, 325, 575, 825 }
/* A native look (feature 32, grku_core::native_look): 16 u16 bounds, 20 u8
   bank selectors, 21 u16 control fields, and 5 u16 level gains from
   GRKU_GRF_HUE; and 12 x 6 i16 level-0 coefficients and 4 x 12 x 6 i8
   corrections of levels 1 to 4 from GRKU_GRF_SIZE. */
#define GRKU_NATIVE_BOUNDS 8084U
#define GRKU_NATIVE_SELECTORS 8116U
#define GRKU_NATIVE_CONTROL 8136U
#define GRKU_NATIVE_GAINS 8178U
#define GRKU_NATIVE_HEAD_END 8188U
#define GRKU_NATIVE_MATRICES 8192U
#define GRKU_NATIVE_CORRECTIONS 8336U
#define GRKU_NATIVE_END 8624U
/* The plan that SCAN writes: this header, the GRF file of each installed
   effect, then an entry of GRKU_PLANNED_EFFECT_SIZE bytes for each listed
   effect. */
#define GRKU_PLAN_HEADER_SIZE 40
#define GRKU_PLAN_MAGIC_VALUE 0x314d5247
#define GRKU_PLAN_SAFE 1U
#define GRKU_PLAN_PROFILE 2U
/* GRKU_PLAN_MAGIC_VALUE. */
#define GRKU_PLAN_MAGIC 0
/* Number of installed effects. */
#define GRKU_PLAN_COUNT 4
/* Words of the registry array: the private header and the records. */
#define GRKU_PLAN_HEADER_WORDS 8
/* Number of icon chunk arrays. */
#define GRKU_PLAN_ICON_CHUNKS 12
/* Bytes of the plan. */
#define GRKU_PLAN_SIZE 16
/* Words of the module array, or 0 without modules. */
#define GRKU_PLAN_MODULE_WORDS 20
/* Artwork tiles of the usable modules. */
#define GRKU_PLAN_MODULE_TILES 24
/* GRKU_PLAN_SAFE and GRKU_PLAN_PROFILE. */
#define GRKU_PLAN_MODES 28
/* Effect files past the listed ones. */
#define GRKU_PLAN_OVERFLOW 32
/* Number of listed effects. */
#define GRKU_PLAN_LISTED 36
/* The mailbox: the second script array of the loader. A one-shot start posts
   the plan header and its result into it, and the loader posts that the arrays
   of the plan exist. */
#define GRKU_MAILBOX_WORDS 16
#define GRKU_MAILBOX_INSTALLED 1U
#define GRKU_MAILBOX_FAILED 2U
/* The plan header (`PLAN_FIELDS`), with its magic word written last. */
#define GRKU_MAILBOX_PLAN 0
#define GRKU_MAILBOX_PLAN_WORDS 10
/* GRKU_MAILBOX_INSTALLED or GRKU_MAILBOX_FAILED, else 0. */
#define GRKU_MAILBOX_RESULT 40
/* The status of a failure (runtime/install_status.h). */
#define GRKU_MAILBOX_STATUS 44
/* 1 once a start of this power-on runs: the loader sends no other. */
#define GRKU_MAILBOX_STARTED 48
/* 1 once the loader allocated the arrays of the plan. */
#define GRKU_MAILBOX_ARRAYS 52
#define GRKU_PLANNED_EFFECT_SIZE 92
/* The head of its GRF file, which holds its ID and name. */
#define GRKU_PLANNED_HEAD 0
#define GRKU_PLANNED_HEAD_WORDS 16
/* Its file name with its NUL. */
#define GRKU_PLANNED_FILE 64
#define GRKU_PLANNED_FILE_WORDS 4
/* Its status at this start (runtime/effects.h). */
#define GRKU_PLANNED_STATUS 80
/* Its choice in the GRKU section of MENU. */
#define GRKU_PLANNED_CHOICE 84
/* Its record, or EFFECTS_NO_RECORD. */
#define GRKU_PLANNED_RECORD 88
/* The longest menu string, with its NUL: an Image Control summary is a prefix
   and a 16-character effect name. */
#define GRKU_SUMMARY_UNITS 32

/* Picture scratch after the records: the date stamp core and halo masks, then
   the shot ring. */
#define GRKU_PICTURE_MASKS 141376
/* Shot ring: the record of each recent non-live-view parameter build, keyed by
   its shot settings pointer, which the maker-note setter (+0x18) and the JPEG
   encode configuration (+0x34) also hold. A later shot can start processing
   before an earlier one is written, so a single "last build" word is not
   enough. Word 0 counts the writes, and word 1 (GRKU_SHOT_LAST_TURNS) holds
   the turns of the last shot with a known posture. Entry n is at
   GRKU_SHOT_ENTRY + GRKU_SHOT_STRIDE n and holds the key at GRKU_SHOT_KEY, the
   record at GRKU_SHOT_RECORD, the posture of the electronic level at
   GRKU_SHOT_POSTURE, and the effective capture crop at GRKU_SHOT_FRAME_CROP
   (runtime/processing.h). */
#define GRKU_SHOT_RING 141376
#define GRKU_SHOT_ENTRIES 8
#define GRKU_SHOT_ENTRY 8
#define GRKU_SHOT_STRIDE 16
#define GRKU_SHOT_KEY 0
#define GRKU_SHOT_RECORD 4
#define GRKU_SHOT_POSTURE 8
#define GRKU_SHOT_FRAME_CROP 12
#define GRKU_SHOT_LAST_TURNS 4
#define GRKU_PICTURE_SCRATCH 141512

/* The layout of GrkuShot (runtime/sdk/grku.h) that picture_shot fills:
   its size in bytes, the byte offset of each field, and the bits of
   `known`. tests/runtime/layout_contract.c checks them against the SDK. */
#define GRKU_SHOT_INFO_BYTES 52
#define GRKU_SHOT_INFO_SIZE 0
#define GRKU_SHOT_INFO_KNOWN 4
#define GRKU_SHOT_INFO_AV 8
#define GRKU_SHOT_INFO_TV 12
#define GRKU_SHOT_INFO_SV 16
#define GRKU_SHOT_INFO_SCENE_EV 20
#define GRKU_SHOT_INFO_COMPENSATION 24
#define GRKU_SHOT_INFO_EXPOSURE_US 28
#define GRKU_SHOT_INFO_F_NUMBER 32
#define GRKU_SHOT_INFO_ISO 34
#define GRKU_SHOT_INFO_FOCAL 36
#define GRKU_SHOT_INFO_FOCAL_35MM 38
#define GRKU_SHOT_INFO_PROGRAM 40
#define GRKU_SHOT_INFO_METERING 41
#define GRKU_SHOT_INFO_FLASH 42
#define GRKU_SHOT_INFO_TAKEN 44
#define GRKU_SHOT_INFO_KNOWN_EXPOSURE 1
#define GRKU_SHOT_INFO_KNOWN_COMPENSATION 2
#define GRKU_SHOT_INFO_KNOWN_FOCAL 4
#define GRKU_SHOT_INFO_KNOWN_TAKEN 8
#define GRKU_SHOT_INFO_KNOWN_FLASH 16
#define GRKU_SHOT_INFO_KNOWN_PROGRAM 32
#define GRKU_SHOT_INFO_KNOWN_METERING 64
#define GRKU_SHOT_INFO_KNOWN_ALL 127

/* Menu text after the picture scratch, in each menu language: 0 English, 1
   Simplified Chinese, 2 Traditional Chinese, 3 Japanese, 4 Korean. The
   installer copies the label table of the build to offset 0: for each
   language, GRKU_TEXT_STRINGS u16 byte offsets from the text start, then
   NUL-terminated UTF-16 strings. At GRKU_TEXT_SUMMARY, the installer writes
   the Image Control summary of each record in each language,
   GRKU_SUMMARY_UNITS units each, language-major. */
#define GRKU_TEXT_SIZE 24576
/* Live-view labels after the menu text. The installer copies the label table
   of the build (grku_core::artwork::overlay_labels): for label n, a u16 width,
   a u16 height, and the u32 offset of its pixels from the table start at 8 n.
   Each pixel is one byte of text coverage, row by row. */
#define GRKU_LABELS_SIZE 28672
/* The profile table after the labels (runtime/profile.h). For each of the
   first GRKU_PROFILE_MODULES listed modules, at GRKU_PROFILE_MODULE_SIZE n:
   its code start, its code end, and GRKU_PROFILE_NAME_BYTES ASCII bytes of its
   name. At GRKU_PROFILE_SLOTS, GRKU_PROFILE_SLOT_COUNT slots of
   GRKU_PROFILE_SLOT_SIZE bytes: calls, cycles, and the cycles of the largest
   call. The core points come first, then GRKU_PROFILE_KINDS slots for each of
   those modules. */
#define GRKU_PROFILE 194760
#define GRKU_PROFILE_SIZE 500
#define GRKU_PROFILE_MODULES 8
#define GRKU_PROFILE_MODULE_SIZE 16
#define GRKU_PROFILE_NAME_BYTES 8
#define GRKU_PROFILE_SLOTS 128
#define GRKU_PROFILE_SLOT_SIZE 12
#define GRKU_PROFILE_SLOT_COUNT 31
#define GRKU_PROFILE_MODULE_BASE 7
#define GRKU_PROFILE_KINDS 3
#define GRKU_PROFILE_FRAME_BIND 0
#define GRKU_PROFILE_FRAME_PREPARE 1
#define GRKU_PROFILE_FRAME_PAINT 2
#define GRKU_PROFILE_PICTURE_POST 3
#define GRKU_PROFILE_PICTURE_ENCODE 4
#define GRKU_PROFILE_MENU_ICON 5
#define GRKU_PROFILE_PICTURE_GRAIN 6
#define GRKU_PROFILE_PAINT 0
#define GRKU_PROFILE_FILTER 1
#define GRKU_PROFILE_CALL 2
/* Everything after the records: the script array must hold it. */
#define GRKU_TAIL_SIZE 199356
/* The own red and blue curves of the native looks with Toning: for each of
   GRKU_TONE_SLOTS slots, 256 u16 red samples, then the blue ones. */
#define GRKU_TONE_CURVES 195260
#define GRKU_TONE_SLOTS 4
#define GRKU_TONE_SLOT_SIZE 1024
#define GRKU_TEXT_SUMMARY 8192
/* The parameter page title of a GRKU session, after the summaries: the page,
   its vtable, and the descriptor of the effect name. */
#define GRKU_TEXT_PARAMETER_TITLE 24560
/* The native settings page of a GRKU session, before the parameter page title:
   the borrowed submenu entry, the text descriptors, and the views that show
   settings (runtime/menu.c). */
#define GRKU_TEXT_SETTINGS 24048
/* The value of a group page in MENU and on the ADJ root, before the native
   settings page: the titles of the children that are on, joined by a slash,
   GRKU_TEXT_GROUP_UNITS units with the NUL. */
#define GRKU_TEXT_GROUP_VALUE 23536
#define GRKU_TEXT_GROUP_UNITS 256
#define GRKU_TEXT_LANGUAGES 5
#define GRKU_TEXT_RECORDS 40
#define GRKU_TEXT(h) ((h)[GRKU_HOST_TAIL/4]+GRKU_PICTURE_SCRATCH)
#define GRKU_LABELS(h) (GRKU_TEXT(h)+GRKU_TEXT_SIZE)
#define GRKU_LABEL_COUNT 20
#define GRKU_MODULE_LABEL_COUNT 14
/* String IDs of the label table, in grku_core::menu_text order. A run of IDs
   follows the rows or values that it names. */
#define TEXT_OFF 0
#define TEXT_IMAGE_OFF_SUMMARY 1
/* The Image Control summary before an effect name, for the installer. */
#define TEXT_IMAGE_PREFIX 2
/* The About row: the GRKU version. */
#define TEXT_VERSION 3
/* The Modules root row: as usual, and in safe mode. */
#define TEXT_MODULES_SUMMARY 4
/* The settings row that turns a module or an effect on or off. */
#define TEXT_ENABLE 6
#define TEXT_ON 7
/* The GRKU row of MENU in safe mode. */
#define TEXT_SAFE_MODE 8
/* The GRKU row of MENU after a change for the next start. */
#define TEXT_RESTART 9
/* The Image Control settings row that opens the Fn adjustments. */
#define TEXT_ADJUSTMENTS 10
/* The ADJ Order row of MENU. */
#define TEXT_ADJ 11
/* The settings row that lists the options of a module page. */
#define TEXT_OPTIONS 12
/* About GRKU: the title, the Version row and its value, the Website row and
   its value, and the Film Look row, whose value the menu counts. */
#define TEXT_ABOUT 13
/* The Film Look settings row that selects the effect. */
#define TEXT_FILM 19
/* The guides of an options value page: OK turns an option on or off, MENU goes
   back. */
#define TEXT_GUIDE 20
/* The switch that stops each module at once: its ADJ summary while on, and
   while off, then its MENU row. */
#define TEXT_SWITCH 22
/* Between a group title and its value in the ADJ root summary. */
#define TEXT_SEPARATOR 25
/* The page of recipes: the Undo and Save rows, the text before a saved name,
   the text before and after the name to delete, the message when the recipes
   are full, the text of a missing effect, the name of a recipe without a look,
   the message of a value that the camera does not have, the message of an
   apply whose Grain has no effect, then the two buttons of Fn on a camera
   recipe: Rename and Delete, then the message of an apply whose Glow module is
   not loaded, and the mark after the name of a recipe whose effect is not
   installed, then the Apply row of the Recipes page of MENU. */
#define TEXT_RECIPE 26
/* The names of the native Image Control types, in the order of
   runtime/native.h. */
#define TEXT_NATIVE_TYPE 41
/* Enable at Start, which decides the switch at each start: its MENU row, then
   its Keep Last value. Its On and Off are TEXT_ON and TEXT_OFF. */
#define TEXT_START 62
/* The Mode Dial row of the Recipes page of MENU, then the values of a user
   mode besides a recipe: None, GRKU Off, and Saved Settings. */
#define TEXT_DIAL 64
#define GRKU_TEXT_STRINGS 68

#endif
