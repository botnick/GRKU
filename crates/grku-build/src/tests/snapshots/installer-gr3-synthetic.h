static const char target_marker[] __attribute__((used)) = "GRKU_TARGET=gr3-2.10";
#define MAX_COUNT 0x28U
#define MAX_CHUNKS 0x5U
#define ICONS_PER_CHUNK 0x28U
#define ICON_STRIDE 0x1908U
#define HOST_ICON_COUNT 0x8U
#define MAP_BASE 0x51000000U
#define MAP_SIZE 0xf000000U
#define HEAP_END 0x60000000U
#define TABLE_BYTES 0x68U
#define SETTINGS_IC_TYPE 0x77cU
#define IC_TYPE_COUNT 0x1aU
#define PATCH_COUNT 0x2U
#define CODE_RELOCATION_COUNT 0x1U
#define TAIL_SYMBOL 0U
#define TAIL_BYTES 0x0U
static const u32 relocation_words[] = { /* 2456 values, SHA-256 b011814bb832414d8519c417e9fa6b06cb5b03813fa9ce37a958e1911009bdb2 */ };
static const struct relocation_window relocation_windows[] = {
{0x53010200,0,576,1,0,1},
{0x53010300,576,512,1,0,1},
{0x530003f0,1088,24,0,0,0},
{0x55002b6c,1112,64,0,1,1},
{0x55018fcc,1176,64,0,1,1},
{0x53010000,1240,704,1,0,1},
{0x550186f4,1944,64,0,1,1},
{0x55018d54,2008,64,1,1,1},
{0x55018cb0,2072,64,0,1,1},
{0x55018e0c,2136,64,0,1,1},
{0x53dc2774,2200,64,0,0,1},
{0x53dc28f8,2264,64,0,0,1},
{0x53dc299c,2328,64,1,0,1},
{0x53dc2404,2392,64,0,0,1},
};
static const u32 relocation_symbols[] = { /* 15 values, SHA-256 cb2b3274bda7d58aaaa1998a9b17324e3c26a9d27974571a603ef9833ce6bf59 */ };
static const struct relocation_source relocation_sources[] = {
{0,5,0,0,0xffff,0},
{1,2,0,0,0xffff,256},
{2,2,0,1,0xffff,256},
{3,4,0,0,0xffff,4},
{4,0,0,3,0xffff,64},
{5,0,0,4,0xffff,64},
{6,2,0,5,0xffff,256},
{7,0,0,6,0xffff,64},
{8,0,0,7,0xffff,64},
{9,0,0,8,0xffff,64},
{10,0,0,9,0xffff,64},
{11,0,0,10,0xffff,64},
{12,0,0,11,0xffff,64},
{13,0,0,12,0xffff,64},
{14,0,0,13,0xffff,64},
};
#define RELOCATION_SYMBOL_COUNT 15U
#define RELOCATION_WINDOW_COUNT 14U
static const struct relocation_tables relocation_tables = {relocation_windows,14,relocation_words,relocation_symbols,15,relocation_sources,15,2,0x10000,0x0};
static u32 relocated[RELOCATION_SYMBOL_COUNT];
static const u32 patch_symbols[] = {0xffff,0xffff};
static const u32 patch_compare[] = {0x0,0x0};
#define RELOCATION_REFERENCE_COUNT 0U
static const u32 relocation_references[] = {};
#define ARRAY_COUNT (relocated[1] + 0x0U)
#define ARRAY_TABLE (relocated[2] + 0x0U)
#define HEAP_MIN (relocated[3] + 0x0U)
#define ENGLISH_SLOT (relocated[4] + 0x4U)
#define STOCK_RECORD (relocated[5] + 0x0U)
#define SETTINGS_DOMAIN (relocated[6] + 0x0U)
#define ICON_PIXEL_BASE_SLOT (relocated[7] + 0x0U)
static const u32 table_symbols[] = {0x8,0x9,0xa};
#define TABLE_ADDRESS(i) relocated[table_symbols[i]]
static const u32 initialized_symbols[] = {0xb,0xc,0xd,0xe};
#define GUARD_PAIR_COUNT 0U
static const u32 guard_symbols[] = {};
#define RTOS_IDENTITY 0x53002038U
#define RTOS_IDENTITY_COUNT 4U
static const u32 rtos_identities[] = {0x1b150a02,0x1c141402,0x110b3c01,0x12144601};
static const char rtos_cameras[] = "GR III\0GR III\0GR IIIx\0GR IIIx";
#define PLAN_PATH "/media/storage1/SCRIPT/GRKU/PLAN.BIN"
#define RAM_PLAN_PATH "/tmp/grku-plan.bin"
#define CARD_PLAN_PATH "/media/storage1/SCRIPT/GRKU/PLANFULL.BIN"
#define PLAN_TMP_PATH "/media/storage1/SCRIPT/GRKU/PLAN.TMP"
#define LOCK_PATH "/media/storage1/SCRIPT/GRKU/INSTALL.LCK"
#define DONE_PATH "/media/storage1/SCRIPT/GRKU/INSTALL.OK"
#define FAILED_PATH "/media/storage1/SCRIPT/GRKU/INSTALL.ERR"
#define INBOX_PATH "/media/storage1/SCRIPT/GRKU/EFFECTS"
#define PACKAGE_PATH "/media/storage1/SCRIPT/GRKU/PACKAGE.TXT"
#define RECIPES_INBOX_PATH "/media/storage1/SCRIPT/GRKU/RECIPES.BIN"
#define DATA_PATH "/media/storage1/GRKU"
#define IMPORTED_PATH "/media/storage1/GRKU/IMPORTED.TXT"
#define LIBRARY_PATH "/media/storage1/GRKU/EFFECTS"
#define STATE_PATH "/media/storage1/GRKU/STATE.TXT"
#define RECIPES_STATE_PATH "/media/storage1/GRKU/RECIPES.TXT"
#define RECIPES_STATE_TMP_PATH "/media/storage1/GRKU/RECIPES.TMP"
#define STATE_TMP_PATH "/media/storage1/GRKU/STATE.TMP"
#define DIAL_SETS_PATH "/media/storage1/GRKU/USERMODE.TXT"
#define DIAL_SETS_TMP_PATH "/media/storage1/GRKU/USERMODE.TMP"
#define REPORT_PATH "/media/storage1/GRKU/REPORT.TXT"
#define RELOCATION_PATH "/media/storage1/GRKU/RELOC.BIN"
#define SAFE_PATH "/media/storage1/GRKU/SAFE"
#define SAFE_TEXT_PATH "/media/storage1/GRKU/SAFE.TXT"
#define PROFILE_PATH "/media/storage1/GRKU/PROFILE"
#define PROFILE_TEXT_PATH "/media/storage1/GRKU/PROFILE.TXT"
#define LEGACY_STATE_PATH "/media/storage1/SCRIPT/PLUGINS/STATE.TXT"
#define LEGACY_STATE_TMP_PATH "/media/storage1/SCRIPT/PLUGINS/STATE.TMP"
#define LEGACY_EFFECTS_PATH "/media/storage1/SCRIPT/PLUGINS/EFFECTS"
#define CORE_STATE_COUNT 11U
#define CORE_STATE_IDS 861965461,484706023,790270076,977751003,826089556,660632122,618415657,458876999,697053196,862826181,360900158
#define LEGACY_STATE_COUNT 6U
#define LEGACY_STATE_FROM 495043802U,684634731U,161811731U,541741532U,957718554U,733922165U
#define LEGACY_STATE_TO 861965461U,484706023U,604351797U,157666443U,247126882U,790270076U
#define PARAMETER_KEY_BASE 990000000U
#define PARAMETER_VALUE_MAX 387420488U
#define TONING_KEY_BASE 990032768U
#define RECIPE_VALUE_MAX 536870911U
#define STATE_TEXT_MAX 16384U
#define GRKU_VERSION "0.0.0"
#define MODULES_PATH "/media/storage1/GRKU/MODULES"
#define PACKAGE_MODULES_PATH "/media/storage1/SCRIPT/GRKU/MODULES"
#define POINT_VIEWFINDER_OVERLAY 0x4U
#define POINT_MENU_PAGE 0x1U
#define POINT_PICTURE_ENCODE 0x10U
static const char *const core_setting_names[] = { /* 12 values, SHA-256 d7381dc65f3a75d0fac121b57fa48f24aaef7b9ba166436530895feca4f7cee8 */ };
static const u32 core_setting_points[] = {0x12,0xc,0x20,0x40,0xc,0x84,0x84,0x0,0x0,0x210,0x210,0x104};
#define RTOS_EXECUTABLE_END 0x55000000U
#define CORE_VIEWFINDER 0x0U
#define CORE_EXPORT_COUNT 0U
static const u32 core_exports[] = {};
static const u8 stock_record[] __attribute__((aligned(4))) = { /* 84 values, SHA-256 d1c1719f675e9a47d0e29a12b89645cbca01118d5b0fd6199887c85748f5e795 */ };
static const u8 off_pixels[] __attribute__((aligned(4))) = { /* 6400 values, SHA-256 66b76a084babf84ee76db752198797fffeac6a0cfb491d883043499031e02b33 */ };
static const u8 grku_pixels[] __attribute__((aligned(4))) = { /* 6400 values, SHA-256 3d61eaaafdd80f54b03c6ba4038e4e89e84e8345458b252cbfcc83741a9328a6 */ };
static const u8 version_pixels[] __attribute__((aligned(4))) = { /* 6400 values, SHA-256 d33a17800db34047652874e7a432ab67049e04a6e697929e9239f551858881ac */ };
static const u8 modules_pixels[] __attribute__((aligned(4))) = { /* 6400 values, SHA-256 95c17fc3ce323159be775f156f3284755c64e64ab4db7196e917b180300b9ddc */ };
static const u8 modules_off_pixels[] __attribute__((aligned(4))) = { /* 6400 values, SHA-256 1ac0be9b51ab5a4620d2516093c0feb545bf88f93ee0b482968f65b076f1eaf6 */ };
static const u8 rotate_pixels[] __attribute__((aligned(4))) = { /* 6400 values, SHA-256 8a5f3688e3432fc4c20d670e4b092cf937baf93ebd9db2e934d4e3ce63ae2d56 */ };
#define SCALE_LABEL_WIDTH 30U
#define SCALE_LABEL_HEIGHT 20U
static const u8 scale_feet_pixels[] __attribute__((aligned(4))) = { /* 2400 values, SHA-256 3035b84a34c34a48cf875d679bf732869c4b70c8e01f9a1a6c904e721f5bc1ef */ };
static const u8 scale_sixteen_pixels[] __attribute__((aligned(4))) = { /* 2400 values, SHA-256 39ce4c2f7f5579af5c39910e572b3987d7875b3aa451cf90726fb42d0a56148b */ };
#define MENU_TEXT_BYTES 6040U
static const u8 menu_text[] __attribute__((aligned(4))) = { /* 6040 values, SHA-256 abe39c80e39fbef10e24ba20e4c2d0331e7b6c0d992828a553f0ef1d1a8c2832 */ };
#define LABELS_BYTES 25160U
static const u8 overlay_labels[] __attribute__((aligned(4))) = { /* 25160 values, SHA-256 f5255dd063b5dbc8c5624b79d4b73bcac2ac3cd6876c3383c89fd1609771a3d5 */ };
static const u8 stock_tables[] __attribute__((aligned(4))) = { /* 312 values, SHA-256 43c6a333770e97d39d0749933c4cc8fd3d39ab51233e06eaefe7dda15bae5cb6 */ };
static const u32 code_relocations[] = {0x0,0x0};
static const u8 before_0[] __attribute__((aligned(4))) = {0,0,0,0,0,0,0,0};
static u8 after_0[] __attribute__((aligned(4))) = {64,35,1,88,1,2,3,4};
static const u8 before_1[] __attribute__((aligned(4))) = {244,49,208,229};
static u8 after_1[] __attribute__((aligned(4))) = {0,0,0,234};
static struct patch patches[] = {
{0x53002080,8,0,before_0,after_0},
{0x531a48f0,4,0,before_1,after_1},
};
static const u32 patch_points[] = {0x0,0x0};
