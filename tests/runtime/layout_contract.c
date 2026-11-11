/* The module descriptor of the SDK (runtime/sdk/grku.h) as the installer
   reads it (runtime/module_link.h), and the SDK copies of the core types.
   A test compiles this file for 32-bit ARM
   with -fsyntax-only, so each check holds for the layout of the camera. */
typedef unsigned char u8;
typedef unsigned int u32;
#include "module_link.h"
#include "grku.h"

#define AT(type, field, offset) \
    _Static_assert(__builtin_offsetof(type, field) == (offset), #type "." #field " moved")
#define SIZE(type, size) _Static_assert(sizeof(type) == (size), #type " changed its size")

SIZE(GrkuModule, GRM_DESCRIPTOR_FLAGS);
AT(GrkuModule, size, 0);
AT(GrkuModule, abi, GRM_DESCRIPTOR_ABI_AT);
AT(GrkuModule, registrations, GRM_DESCRIPTOR_REGISTRATIONS_AT);
AT(GrkuModule, registration_count, GRM_DESCRIPTOR_REGISTRATION_COUNT_AT);
AT(GrkuModule, settings, GRM_DESCRIPTOR_SETTINGS_AT);
AT(GrkuModule, setting_count, GRM_DESCRIPTOR_SETTING_COUNT_AT);
AT(GrkuModule, uses, GRM_DESCRIPTOR_USES_AT);
AT(GrkuModule, use_count, GRM_DESCRIPTOR_USE_COUNT_AT);
AT(GrkuModule, tiles, GRM_DESCRIPTOR_TILES_AT);
AT(GrkuModule, tile_count, GRM_DESCRIPTOR_TILE_COUNT_AT);
AT(GrkuModule, flags, GRM_DESCRIPTOR_FLAGS_AT);
_Static_assert(GRKU_MODULE_COLOR_ONLY == GRM_MODULE_COLOR_ONLY, "the module flags agree");

SIZE(GrkuRegistration, GRM_REGISTRATION);
AT(GrkuRegistration, point, 0);
AT(GrkuRegistration, impl, GRM_REGISTRATION_IMPL_AT);

SIZE(GrkuSetting, GRM_SETTING_DEFAULT);
AT(GrkuSetting, size, 0);
AT(GrkuSetting, key, GRM_SETTING_KEY_AT);
AT(GrkuSetting, values, GRM_SETTING_VALUES_AT);
AT(GrkuSetting, flags, GRM_SETTING_FLAGS_AT);
AT(GrkuSetting, default_value, GRM_SETTING_DEFAULT_AT);

SIZE(GrkuLayer, GRM_LAYER_CONDITIONAL);
AT(GrkuLayer, size, 0);
AT(GrkuLayer, flags, GRM_LAYER_FLAGS_AT);
AT(GrkuLayer, paint, GRM_LAYER_PAINT_AT);
AT(GrkuLayer, setting, GRM_LAYER_SETTING_AT);
AT(GrkuLayer, order, GRM_LAYER_ORDER_AT);
AT(GrkuLayer, condition_count, GRM_LAYER_CONDITION_COUNT_AT);
AT(GrkuLayer, conditions, GRM_LAYER_CONDITIONS_AT);

SIZE(GrkuPage, GRM_PAGE_FN);
AT(GrkuPage, size, 0);
AT(GrkuPage, kind, GRM_PAGE_KIND_AT);
AT(GrkuPage, setting, GRM_PAGE_SETTING_AT);
AT(GrkuPage, flags, GRM_PAGE_FLAGS_AT);
AT(GrkuPage, title, GRM_PAGE_TITLE_AT);
AT(GrkuPage, summaries, GRM_PAGE_SUMMARIES_AT);
AT(GrkuPage, labels, GRM_PAGE_LABELS_AT);
AT(GrkuPage, rows, GRM_PAGE_ROWS_AT);
AT(GrkuPage, setting_rows, GRM_PAGE_SETTING_ROWS_AT);
AT(GrkuPage, settings, GRM_PAGE_SETTINGS_AT);
AT(GrkuPage, children, GRM_PAGE_CHILDREN_AT);
AT(GrkuPage, icon, GRM_PAGE_ICON_AT);
AT(GrkuPage, fn_value, GRM_PAGE_FN_VALUE_AT);
AT(GrkuPage, fn_setting, GRM_PAGE_FN_SETTING_AT);

SIZE(GrkuIcon, GRM_ICON);
AT(GrkuIcon, kind, GRM_ICON_KIND_AT);
AT(GrkuIcon, setting, GRM_ICON_SETTING_AT);
AT(GrkuIcon, first_tile, GRM_ICON_FIRST_TILE_AT);
SIZE(GrkuCondition, GRM_CONDITION);
AT(GrkuCondition, setting, GRM_CONDITION_SETTING_AT);
AT(GrkuCondition, comparison, GRM_CONDITION_COMPARISON_AT);
AT(GrkuCondition, value, GRM_CONDITION_VALUE_AT);
SIZE(GrkuIndicator, GRM_INDICATOR);
AT(GrkuIndicator, placement, GRM_INDICATOR_PLACEMENT_AT);
AT(GrkuIndicator, slot, GRM_INDICATOR_SLOT_AT);
AT(GrkuIndicator, condition_count, GRM_INDICATOR_CONDITION_COUNT_AT);
AT(GrkuIndicator, conditions, GRM_INDICATOR_CONDITIONS_AT);
AT(GrkuIndicator, icon, GRM_INDICATOR_ICON_AT);

SIZE(GrkuSettingRow, GRM_ROW);
AT(GrkuSettingRow, size, 0);
AT(GrkuSettingRow, setting, GRM_ROW_SETTING_AT);
AT(GrkuSettingRow, label, GRM_ROW_LABEL_AT);
AT(GrkuSettingRow, values, GRM_ROW_VALUES_AT);

SIZE(GrkuPlaneFilter, GRM_FILTER);
AT(GrkuPlaneFilter, size, 0);
AT(GrkuPlaneFilter, stage, GRM_FILTER_STAGE_AT);
AT(GrkuPlaneFilter, setting, GRM_FILTER_SETTING_AT);
AT(GrkuPlaneFilter, apply, GRM_FILTER_APPLY_AT);

SIZE(GrkuSubscriber, GRM_SUBSCRIBER);
AT(GrkuSubscriber, size, 0);
AT(GrkuSubscriber, events, GRM_SUBSCRIBER_EVENTS_AT);
AT(GrkuSubscriber, handle, GRM_SUBSCRIBER_HANDLE_AT);

/* The context that the installer writes: the words before `uses`
   (CONTEXT_WORDS of the installer). */
AT(GrkuContext, settings, 0);
AT(GrkuContext, setting_count, 4);
AT(GrkuContext, tiles, 8);
AT(GrkuContext, uses, 12);

#define SAME(a, b) _Static_assert((a) == (b), #a " differs from " #b)
SAME(GRKU_ABI_MAJOR, GRM_ABI_MAJOR);
SAME(GRKU_ABI_MINOR, GRM_ABI_MINOR);
SAME(GRKU_POINT_OVERLAY_LAYER, GRM_POINT_OVERLAY_LAYER);
SAME(GRKU_POINT_MENU_PAGE, GRM_POINT_MENU_PAGE);
SAME(GRKU_POINT_PICTURE_PLANE, GRM_POINT_PICTURE_PLANE);
SAME(GRKU_POINT_EVENT, GRM_POINT_EVENT);
SAME(GRKU_POINT_VIEWFINDER_INDICATOR, GRM_POINT_VIEWFINDER_INDICATOR);
SAME(GRKU_ICON_TILE, GRM_ICON_TILE);
SAME(GRKU_ICON_TONE, GRM_ICON_TONE);
SAME(GRKU_ICON_LABEL, GRM_ICON_LABEL);
SAME(GRKU_CONDITION_EQUALS, GRM_CONDITION_EQUALS);
SAME(GRKU_CONDITION_NOT_EQUALS, GRM_CONDITION_NOT_EQUALS);
SAME(GRKU_INDICATOR_NATIVE_SLOT, GRM_INDICATOR_NATIVE_SLOT);
SAME(GRKU_INDICATOR_STATUS_ROW, GRM_INDICATOR_STATUS_ROW);
SAME(GRKU_SLOT_IMAGE_CONTROL, GRM_SLOT_IMAGE_CONTROL);
SAME(GRKU_EVENT_SYSTEM_READY | GRKU_EVENT_SETTING_CHANGED, GRM_EVENTS);
SAME(GRKU_PAGE_CHOICE, GRM_PAGE_CHOICE);
SAME(GRKU_PAGE_SETTINGS, GRM_PAGE_SETTINGS);
SAME(GRKU_CHOICE_OFF_ROW, GRM_CHOICE_OFF_ROW);
SAME(GRKU_CHOICE_CORE_ROWS, GRM_CHOICE_CORE_ROWS);
SAME(GRKU_CHOICE_OPTIONS, GRM_CHOICE_OPTIONS);
SAME(GRKU_LAYER_FOLLOW_DISP, GRM_LAYER_FOLLOW_DISP);
SAME(GRKU_LAYER_FULL_DISP, GRM_LAYER_FULL_DISP);
SAME(GRKU_LAYER_LIVE_ONLY, GRM_LAYER_LIVE_ONLY);
SAME(GRKU_STAGE_FRAME, GRM_STAGE_FRAME);
SAME(GRKU_STAGE_MARK, GRM_STAGE_MARK);
SAME(GRKU_STAGE_PRINT, GRM_STAGE_PRINT);
SAME(GRKU_SETTING_PUBLIC, GRM_SETTING_PUBLIC);
SAME(GRKU_SETTING_SAVED, GRM_SETTING_SAVED);
SAME(GRKU_NO_SETTING, GRM_NO_SETTING);
SAME(GRKU_USE(0), GRM_USED);
SAME(GRKU_LANGUAGES, GRM_LANGUAGES);
SAME(GRKU_TILE_BYTES, GRM_TILE_BYTES);
SAME(GRKU_SETTING_ROWS, GRM_SETTING_ROWS);
SAME(GRKU_PAGE_GROUP, GRM_PAGE_GROUP);
SAME(GRKU_PAGE_MENU_ONLY, GRM_PAGE_MENU_ONLY);
SAME(GRKU_PAGE_CHILDREN, GRM_PAGE_CHILDREN);
SAME(GRKU_SETTING_ROW_VALUES, GRM_SETTING_ROW_VALUES);

/* The SDK keeps its own copy of the overlay surface and the picture planes
   (runtime/sdk/grku.h), because a module includes only the SDK. The core's
   types (runtime/core.h) come in under other names here, and each SDK field
   must sit where the core writes it. The SDK names the core's `record` of a
   PictureSet `reserved`. */
#define Surface CoreSurface
#define Plane CorePlane
#define PictureSet CorePictureSet
#define chroma_row core_chroma_row
#define overlay_label core_overlay_label
#include "core.h"
#undef Surface
#undef Plane
#undef PictureSet
#undef chroma_row
#undef overlay_label

#define LIKE(type, core, field) AT(core, field, __builtin_offsetof(type, field))
SIZE(CoreSurface, sizeof(Surface));
LIKE(Surface, CoreSurface, data);
LIKE(Surface, CoreSurface, stride);
LIKE(Surface, CoreSurface, area);
LIKE(Surface, CoreSurface, box);
SIZE(CorePlane, sizeof(Plane));
LIKE(Plane, CorePlane, y);
LIKE(Plane, CorePlane, c);
LIKE(Plane, CorePlane, width);
LIKE(Plane, CorePlane, height);
LIKE(Plane, CorePlane, pitch);
LIKE(Plane, CorePlane, half);
LIKE(Plane, CorePlane, left);
LIKE(Plane, CorePlane, top);
LIKE(Plane, CorePlane, right);
LIKE(Plane, CorePlane, bottom);
SIZE(CorePictureSet, sizeof(PictureSet));
LIKE(PictureSet, CorePictureSet, planes);
LIKE(PictureSet, CorePictureSet, count);
AT(CorePictureSet, record, __builtin_offsetof(PictureSet, reserved));
LIKE(PictureSet, CorePictureSet, mono);
LIKE(PictureSet, CorePictureSet, scratch);
LIKE(PictureSet, CorePictureSet, turns);
AT(CorePictureSet, shot, __builtin_offsetof(PictureSet, reserved_shot));
/* A plane filter may use all of the scratch that the core gives each call. */
SAME(GRKU_PLANE_SCRATCH, GRKU_PICTURE_MASKS);

/* GrkuShot: the bytes that picture_shot writes (GRKU_SHOT_INFO_* in
   abi.h, runtime/picture.c) and the bits of `known`. */
SIZE(GrkuShot, GRKU_SHOT_INFO_BYTES);
AT(GrkuShot, size, GRKU_SHOT_INFO_SIZE);
AT(GrkuShot, known, GRKU_SHOT_INFO_KNOWN);
AT(GrkuShot, av, GRKU_SHOT_INFO_AV);
AT(GrkuShot, tv, GRKU_SHOT_INFO_TV);
AT(GrkuShot, sv, GRKU_SHOT_INFO_SV);
AT(GrkuShot, scene_ev, GRKU_SHOT_INFO_SCENE_EV);
AT(GrkuShot, compensation, GRKU_SHOT_INFO_COMPENSATION);
AT(GrkuShot, exposure_us, GRKU_SHOT_INFO_EXPOSURE_US);
AT(GrkuShot, f_number, GRKU_SHOT_INFO_F_NUMBER);
AT(GrkuShot, iso, GRKU_SHOT_INFO_ISO);
AT(GrkuShot, focal, GRKU_SHOT_INFO_FOCAL);
AT(GrkuShot, focal_35mm, GRKU_SHOT_INFO_FOCAL_35MM);
AT(GrkuShot, program, GRKU_SHOT_INFO_PROGRAM);
AT(GrkuShot, metering, GRKU_SHOT_INFO_METERING);
AT(GrkuShot, flash, GRKU_SHOT_INFO_FLASH);
AT(GrkuShot, taken, GRKU_SHOT_INFO_TAKEN);
AT(GrkuShot, taken.month, GRKU_SHOT_INFO_TAKEN + 2);
AT(GrkuShot, taken.second, GRKU_SHOT_INFO_TAKEN + 6);
_Static_assert(GRKU_SHOT_EXPOSURE == GRKU_SHOT_INFO_KNOWN_EXPOSURE &&
               GRKU_SHOT_COMPENSATION == GRKU_SHOT_INFO_KNOWN_COMPENSATION &&
               GRKU_SHOT_FOCAL == GRKU_SHOT_INFO_KNOWN_FOCAL &&
               GRKU_SHOT_TAKEN == GRKU_SHOT_INFO_KNOWN_TAKEN &&
               GRKU_SHOT_FLASH == GRKU_SHOT_INFO_KNOWN_FLASH &&
               GRKU_SHOT_PROGRAM == GRKU_SHOT_INFO_KNOWN_PROGRAM &&
               GRKU_SHOT_METERING == GRKU_SHOT_INFO_KNOWN_METERING,
               "GRKU_SHOT_* bits moved");
