#include "abi.h"
/* GRKit installer. Native selection state is read-only. */
typedef unsigned char u8;
typedef unsigned short u16;
typedef unsigned int u32;
/* kind 1: a reservation after the decoded RTOS image. BOOT does not reload
   it, so it can keep the previous session's code after a restart. */
struct patch { u32 address, size, kind; const u8 *before; u8 *after; };
#include "relocation.h"
#include "module_payload.h"
#include "grf.h"
#include "module_link.h"
#include "setting_table.h"
/* The layout of the effect list (no menu functions without MENU_TEXT). */
#include "effects.h"
/* The layout of the state of the core services. */
#include "services.h"
#include "install_status.h"

/* RTOS_NATIVE builds the installer into the RTOS-side loader of
   runtime/fastboot/, whose backend.c serves the same calls without Linux. */
#ifdef RTOS_NATIVE
/* The loader runs from FAST_BASE up to RTOS_EXECUTABLE_END (fast.ld), so the
   code of GRKit ends before it. */
#define CODE_END FAST_BASE
#else
#define CODE_END RTOS_EXECUTABLE_END
#endif
#ifdef RTOS_NATIVE
extern long syscall6(u32 number, u32 a, u32 b, u32 c, u32 d, u32 e, u32 f);
#else
static long syscall6(u32 number, u32 a, u32 b, u32 c, u32 d, u32 e, u32 f)
{
    register u32 r0 __asm__("r0") = a;
    register u32 r1 __asm__("r1") = b;
    register u32 r2 __asm__("r2") = c;
    register u32 r3 __asm__("r3") = d;
    register u32 r4 __asm__("r4") = e;
    register u32 r5 __asm__("r5") = f;
    register u32 r7 __asm__("r7") = number;
    __asm__ volatile("svc 0" : "+r"(r0) : "r"(r1), "r"(r2), "r"(r3),
                     "r"(r4), "r"(r5), "r"(r7) : "memory", "cc");
    return (long)r0;
}
#endif
/* The loader script allocates two arrays before the planned ones: the array
   of the firmware probe and the fast-boot head (runtime::fast), then the
   mailbox of a one-shot start (GRKIT_MAILBOX_*, runtime::loader). Entry i
   of the array table holds the words of array i, then its address. */
#define ARRAY_LEAD 2U
#define ARRAY_ENTRY(i) (ARRAY_TABLE + (i) * 8U)
#define ARRAYS ARRAY_ENTRY(ARRAY_LEAD)
static volatile u8 *mapping;
/* One profile more than MAX_COUNT shows that the effects do not all fit. */
static u8 profiles[MAX_COUNT + 1][GRKIT_GRF_MAX_SIZE];
static u8 temporary[GRKIT_GRF_MAX_SIZE];
static u8 directory_entries[4096];
/* The plan (runtime/abi.h: GRKIT_PLAN_*): the header, the installed
   effects, then the listed effects. */
static u8 plan[GRKIT_PLAN_HEADER_SIZE + MAX_COUNT * GRKIT_GRF_MAX_SIZE + EFFECTS_LISTED * GRKIT_PLANNED_EFFECT_SIZE];
static u32 count, size, icon_chunks;
/* The package folder holds the core, the package list, the package modules,
   and the inbox of the package effects. GRKIT holds the data of the person:
   the state, the report, the effects library, and the modules that the
   person adds. A copy of a new package, by replace or by merge, therefore
   keeps the data. */
static const char library_path[] = LIBRARY_PATH;
static const char inbox_path[] = INBOX_PATH;
static const char package_path[] = PACKAGE_PATH;
static const char imported_path[] = IMPORTED_PATH;
static const char data_path[] = DATA_PATH;
static const char plan_path[] = PLAN_PATH;
static const char plan_tmp[] = PLAN_TMP_PATH;
static const char ram_plan_path[] = RAM_PLAN_PATH;
static const char lock_path[] = LOCK_PATH;
static const char done_path[] = DONE_PATH;
static const char failed_path[] = FAILED_PATH;
/* A marker file of the safe mode or of the profile is NAME or NAME.TXT, as
   a text editor adds the extension. */
static const char safe_path[] = SAFE_PATH, safe_text_path[] = SAFE_TEXT_PATH;
static const char profile_path[] = PROFILE_PATH, profile_text_path[] = PROFILE_TEXT_PATH;
static const char state_path[] = STATE_PATH;
static const char state_tmp_path[] = STATE_TMP_PATH;
/* The folder of GRKit 1.2: INSTALL reads its state file when GRKIT has none,
   and copies its effects when GRKIT has no effects library. */
static const char legacy_state_path[] = LEGACY_STATE_PATH;
static const char legacy_state_tmp_path[] = LEGACY_STATE_TMP_PATH;
static const char legacy_effects_path[] = LEGACY_EFFECTS_PATH;
static const char report_path[] = REPORT_PATH;
static const char relocation_path[] = RELOCATION_PATH;
static volatile u8 *at(u32 physical) { return mapping + physical - MAP_BASE; }
static u32 word(u32 p) { return *(volatile u32 *)at(p); }
static void store(u32 p, u32 v) { *(volatile u32 *)at(p) = v; }
#include "install_io.h"
#define GRKIT_GRF_EMBEDDED
#include "grf.c"
#include "catalog.h"
#include "directory.h"
_Static_assert(DIRECTORY_UNREADABLE == STATUS_LIBRARY_UNREADABLE && DIRECTORY_BAD_RECORD == STATUS_LIBRARY_BAD_RECORD,
               "A failed listing reports its status");
_Static_assert(GRM_BAD_FILE > STATUS_OTHER_BUILD, "The module statuses follow the install statuses");
#include "state.h"
#define TONING_HALF(address) (*(volatile u16 *)at(address))
#include "toning.h"
#include "manage.h"
/* The effect files that GRKit lists (runtime/effects.h): the head of each
   profile, which holds its ID and name, its file name, its status at this
   start, and its choice in the GRKit section of MENU: Off in bit 0, and its position
   + 1, or 0 for the default place, above. SCAN lists them in ID order, then
   orders them by their choices. */
#define LISTED_HEAD 64U
_Static_assert(GRKIT_PLANNED_HEAD_WORDS * 4 == LISTED_HEAD && GRKIT_PLANNED_FILE_WORDS * 4 >= CATALOG_NAME_SIZE,
               "The plan holds the head and the file name of each listed effect");
static u8 listed[EFFECTS_LISTED + 1][LISTED_HEAD];
static char names[EFFECTS_LISTED + 1][CATALOG_NAME_SIZE];
static u32 listed_count, listed_status[EFFECTS_LISTED], listed_choice[EFFECTS_LISTED];
/* The record of each listed effect, or EFFECTS_NO_RECORD. */
static u32 listed_record[EFFECTS_LISTED];
/* A path in the library: the folder, '/', an 8.3 name, and NUL. */
#define PATH_MAX_OF(a, b) (sizeof(a) > sizeof(b) ? sizeof(a) : sizeof(b))
#define EFFECT_PATH_SIZE (PATH_MAX_OF(legacy_effects_path, PATH_MAX_OF(library_path, inbox_path)) + CATALOG_NAME_SIZE)
#include "install_library.h"
/* The boot log of a one-shot start, which the parts of the scan time
   (install_effects.h: GRKIT_PHASE_LOG). */
#ifndef RTOS_NATIVE
static void log_step(const char *step, int status);
#define GRKIT_PHASE_LOG(step, status) do { if (ram_cache) log_step(step, status); } while (0)
#else
#define log_step(step, status) ((void)0)
#endif
#include "install_effects.h"
/* The artwork tiles of the usable modules (plan_modules). Their icon slots
   follow the effect icons. */
static u32 module_tiles;
static void layout(void)
{
    size = GRKIT_HOST_HEADER_SIZE + count * GRKIT_RECORD_SIZE;
    icon_chunks = (count + HOST_ICON_COUNT + module_tiles + ICONS_PER_CHUNK - 1) / ICONS_PER_CHUNK;
}
static u32 chunk_count(u32 chunk)
{
    u32 left = count + HOST_ICON_COUNT + module_tiles - chunk * ICONS_PER_CHUNK;
    return left < ICONS_PER_CHUNK ? left : ICONS_PER_CHUNK;
}
#include "install_plan.h"
/* The whole plan into RAM (RAM_PLAN_PATH), for INSTALL. */
static int write_ram_plan(void)
{
    return write_file(ram_plan_path, plan, get32(plan + GRKIT_PLAN_SIZE));
}
/* The plan of this start into `plan` and into RAM (RAM_PLAN_PATH), as SCAN
   makes it: 0, or a status. The card gets only the header (publish_plan).
   A one-shot start logs each phase of the scan. */
static int make_plan(void)
{
    /* The marker files of the safe mode and of the profile. */
    safe_mode = present(safe_path) || present(safe_text_path);
    profile_mode = present(profile_path) || present(profile_text_path);
    /* The modules first: the effects install only for a module that uses
       CORE.TONE. */
    plan_modules();
    if (ram_cache) log_step("modules", (int)module_count);
    collect();
    if (ram_cache) log_step("library", (int)pending_count);
    int status = discover();
    if (ram_cache) log_step("effects", status ? status : (int)count);
    if (status) return status;
    plan_array();
    layout();
    u32 effects_at = GRKIT_PLAN_HEADER_SIZE + count * GRKIT_GRF_MAX_SIZE;
    put32(plan + GRKIT_PLAN_MAGIC, GRKIT_PLAN_MAGIC_VALUE); put32(plan + GRKIT_PLAN_COUNT, count);
    put32(plan + GRKIT_PLAN_HEADER_WORDS, size / 4); put32(plan + GRKIT_PLAN_ICON_CHUNKS, icon_chunks);
    put32(plan + GRKIT_PLAN_SIZE, effects_at + listed_count * GRKIT_PLANNED_EFFECT_SIZE);
    put32(plan + GRKIT_PLAN_MODULE_WORDS, module_words);
    put32(plan + GRKIT_PLAN_MODULE_TILES, module_tiles);
    put32(plan + GRKIT_PLAN_MODES, (safe_mode ? GRKIT_PLAN_SAFE : 0) | (profile_mode ? GRKIT_PLAN_PROFILE : 0));
    put32(plan + GRKIT_PLAN_OVERFLOW, overflow_count);
    put32(plan + GRKIT_PLAN_LISTED, listed_count);
    for (u32 i = 0; i < count; ++i)
        copy(plan + GRKIT_PLAN_HEADER_SIZE + i * GRKIT_GRF_MAX_SIZE, profiles[i], GRKIT_GRF_MAX_SIZE);
    for (u32 i = 0; i < listed_count; ++i) {
        u8 *entry = plan + effects_at + i * GRKIT_PLANNED_EFFECT_SIZE;
        zero(entry, GRKIT_PLANNED_EFFECT_SIZE);
        copy(entry + GRKIT_PLANNED_HEAD, listed[i], LISTED_HEAD);
        copy(entry + GRKIT_PLANNED_FILE, (const u8 *)names[i], CATALOG_NAME_SIZE);
        put32(entry + GRKIT_PLANNED_STATUS, listed_status[i]);
        put32(entry + GRKIT_PLANNED_CHOICE, listed_choice[i]);
        put32(entry + GRKIT_PLANNED_RECORD, listed_record[i]);
    }
    /* The whole plan goes to RAM, then only its header to the card. The
       loader starts INSTALL when the header appears on the card, so INSTALL
       always finds the whole plan. A card write of the plan takes about
       0.35 s on a camera. A one-shot start writes the RAM plan after its
       posts (run_start): only INSTALL.SH, its fallback, reads it. */
    if (!ram_cache && !write_ram_plan()) return STATUS_PLAN_WRITE;
    return 0;
}
/* The temporary plan on the card, with O_EXCL: the loader resends SCAN until
   a plan appears, so attempts can overlap. Only the attempt that creates the
   temporary plan moves the inbox and lists the effects. Returns its
   descriptor, or the negative of STATUS_BUSY or STATUS_PLAN_WRITE. */
static long open_plan_tmp(void)
{
    long fd = syscall6(5, (u32)plan_tmp, 0xc1, 0600, 0, 0, 0);
    if (fd == -17) return -STATUS_BUSY;
    return fd < 0 ? -STATUS_PLAN_WRITE : fd;
}
/* The plan header into the open temporary plan `fd`, then under the name
   of the plan. Return 0, or STATUS_PLAN_WRITE after removing the temporary
   plan. */
static int publish_plan(long fd)
{
    u32 done = 0;
    while (done < GRKIT_PLAN_HEADER_SIZE) {
        long n = syscall6(4, fd, (u32)(plan + done), GRKIT_PLAN_HEADER_SIZE - done, 0, 0, 0);
        if (n <= 0) break;
        done += n;
    }
    if (syscall6(6, fd, 0, 0, 0, 0, 0) < 0 || done < GRKIT_PLAN_HEADER_SIZE ||
        syscall6(38, (u32)plan_tmp, (u32)plan_path, 0, 0, 0, 0) < 0) {
        syscall6(10, (u32)plan_tmp, 0, 0, 0, 0, 0);
        return STATUS_PLAN_WRITE;
    }
    return 0;
}
static int scan(void)
{
    /* An earlier attempt of this power-on wrote the plan: the loader deletes
       it at power-on. A second plan would replace it in a rename, which the
       camera's Linux does not do. */
    long fd = syscall6(5, (u32)plan_path, 0x8800, 0, 0, 0, 0);
    if (fd >= 0) { syscall6(6, fd, 0, 0, 0, 0, 0); return 0; }
    fd = open_plan_tmp();
    if (fd < 0) return (int)-fd;
    int status = make_plan();
    if (status) {
        syscall6(6, fd, 0, 0, 0, 0, 0);
        syscall6(10, (u32)plan_tmp, 0, 0, 0, 0, 0);
        return status;
    }
    if ((status = publish_plan(fd))) return status;
    print("GR_MODULE_SCANNED "); number(count); print("\n");
    return 0;
}
static void barrier(void) { __asm__ volatile("dsb sy" ::: "memory"); }
static int sync_alias(u32 address, u32 n)
{
    barrier();
    return syscall6(0xf0002, (u32)at(address), (u32)at(address + n), 0, 0, 0, 0) == 0;
}
/* A native icon: its descriptor, then the 40 x 40 pixels. The descriptor
   gives the pixels as an offset in words from `pixels`, the base of the icon
   drawer. */
#ifdef GRKIT_ICON_DESCRIPTOR_12
/* Width and a valid flag, height, and the pixel offset. */
#define ICON_PIXELS 12
#else
/* Height and width, then the pixel offset. */
#define ICON_PIXELS 8
#endif
static void icon_header(u32 icon, u32 pixels)
{
#ifdef GRKIT_ICON_DESCRIPTOR_12
    store(icon, 0x00280001);
    store(icon + 4, 40);
    store(icon + 8, (icon + ICON_PIXELS - pixels) / 4);
#else
    store(icon, 0x00280028);
    store(icon + 4, (icon + ICON_PIXELS - pixels) / 4);
#endif
}
static int heap(u32 p, u32 n)
{
    return !(p & 3) && p >= HEAP_MIN && n <= HEAP_END - HEAP_MIN && p <= HEAP_END - n;
}
/* The mailbox (GRKIT_MAILBOX_*): the second array of the loader, or 0 when
   the loader has not allocated it. The array table is a firmware address,
   so the relocation must have run. */
static u32 mailbox(void)
{
    if (*(volatile u16 *)at(ARRAY_COUNT) < ARRAY_LEAD || word(ARRAY_ENTRY(1)) != GRKIT_MAILBOX_WORDS) return 0;
    u32 box = word(ARRAY_ENTRY(1) + 4);
    return heap(box, GRKIT_MAILBOX_WORDS * 4) ? box : 0;
}
/* The extension points of the usable modules. Only their patches change
   the firmware. */
static u32 needed_points;
/* patch_points[i]: the extension points that need patch i, or 0 for code that
   each installation publishes. */
static int applies(u32 i) { return !patch_points[i] || (patch_points[i] & needed_points); }
static void publish(struct patch *p, const u8 *bytes)
{
    if (p->size == 4) store(p->address, get32(bytes));
    else copy(at(p->address), bytes, p->size);
    __asm__ volatile("dsb sy" ::: "memory");
}
/* Relocation of the private code to the running build of the firmware
   version (relocation.h). The report of a failure goes to INSTALL.ERR. */
static u32 window_at[RELOCATION_WINDOW_COUNT];
static struct relocation_state relocation;
static u32 read_word(u32 address) { return word(address); }
/* The window addresses that a search of the running build found, kept in
   RELOC.BIN of the data folder: three key words, then the address of each
   window. A later start checks the windows at these addresses instead of a
   search, which takes seconds on a camera (runtime/relocation.h). */
#define HINT_MAGIC 0x524b5247U
#define HINT_KEY 3U
static u32 hint_words[HINT_KEY + RELOCATION_WINDOW_COUNT];
static void prepare_relocation(void)
{
    relocation.read = read_word;
    relocation.window_at = window_at;
    relocation.symbol_at = relocated;
    relocation.hint = 0;
    if (read_text(relocation_path, (u8 *)hint_words, sizeof(hint_words)) == (long)sizeof(hint_words) &&
        hint_words[0] == HINT_MAGIC && hint_words[1] == RELOCATION_WINDOW_COUNT && hint_words[2] == word(RTOS_IDENTITY))
        relocation.hint = hint_words + HINT_KEY;
}
/* After a search: its addresses for the next start. */
static void keep_relocation(void)
{
    if (!relocation.searched) return;
    hint_words[0] = HINT_MAGIC; hint_words[1] = RELOCATION_WINDOW_COUNT; hint_words[2] = word(RTOS_IDENTITY);
    copy((u8 *)(hint_words + HINT_KEY), (const u8 *)window_at, RELOCATION_WINDOW_COUNT * 4);
    long made = syscall6(39, (u32)data_path, 0755, 0, 0, 0, 0);
    if (made < 0 && made != -17) return;
    write_file(relocation_path, (const u8 *)hint_words, sizeof(hint_words));
}
static u32 symbol_delta(u32 symbol) { return relocation_delta(&relocation_tables, &relocation, symbol); }
static u32 pair_value(u32 address)
{
    u32 low = word(address), high = word(address + 4);
    return (((high >> 4) & 0xf000U) | (high & 0xfffU)) << 16 | ((low >> 4) & 0xf000U) | (low & 0xfffU);
}
static int relocate(void)
{
    prepare_relocation();
    if (!relocation_resolve(&relocation_tables, &relocation)) return STATUS_RELOCATION;
    keep_relocation();
    /* Patched firmware can keep data after the image end that the startup
       literals give, where the private code goes. */
    for (u32 i = 0; i < GUARD_PAIR_COUNT; ++i) {
        u32 value = pair_value(relocated[guard_symbols[i]]);
        if (value >= relocation.image_end && value < RELOCATION_DATA_START) return STATUS_TAIL_USED;
    }
    for (u32 i = 0; i < PATCH_COUNT; ++i) {
        if (patch_symbols[i] == RELOCATION_NONE) continue;
        patches[i].address += symbol_delta(patch_symbols[i]);
        if (patches[i].kind) continue;
        /* A stock branch, or a MOVW or MOVT of a firmware address, can
           change when code or data moves, so only its masked bits must be
           equal (patch_compare). Other stock words must be equal. Rollback
           restores the running bytes. */
        u8 *before = (u8 *)patches[i].before;
        u32 live = word(patches[i].address), stock = get32(before);
        if (patch_compare[i] ? relocation_mask(live) != relocation_mask(stock) : live != stock) return STATUS_STOCK_BYTES;
        put32(before, live);
    }
    for (u32 i = 0; i < RELOCATION_REFERENCE_COUNT; ++i) {
        const u32 *r = relocation_references + i * 4;
        u32 patch = r[0], site = patch_symbols[patch];
        if (r[1] + 4 > patches[patch].size ||
            !relocation_move(patches[patch].after + r[1], r[3], symbol_delta(r[2]), symbol_delta(site)))
            return STATUS_RELOCATION;
    }
    return 0;
}
/* SCAN wrote the plan at this power-on, and the loader allocated the arrays
   for it. INSTALL takes the effects from the plan, so that both steps install
   the same effects. */
/* The plan of this start from RAM. Its header must be the header on the card,
   which the loader allocated the arrays from. */
static int read_plan(void)
{
    u32 have = 0; long got = 0; u8 extra, header[GRKIT_PLAN_HEADER_SIZE];
    long fd = syscall6(5, (u32)ram_plan_path, 0x8800, 0, 0, 0, 0);
    if (fd < 0) return STATUS_PLAN;
    while (have < sizeof(plan)) {
        got = syscall6(3, fd, (u32)(plan + have), sizeof(plan) - have, 0, 0, 0);
        if (got <= 0) break;
        have += (u32)got;
    }
    if (have == sizeof(plan)) got = syscall6(3, fd, (u32)&extra, 1, 0, 0, 0);
    syscall6(6, fd, 0, 0, 0, 0, 0);
    if (got < 0 || (have == sizeof(plan) && got) || have < GRKIT_PLAN_HEADER_SIZE ||
        get32(plan + GRKIT_PLAN_MAGIC) != GRKIT_PLAN_MAGIC_VALUE) return STATUS_PLAN;
    if (read_text(plan_path, header, sizeof(header)) != (long)sizeof(header) || !equal(header, plan, sizeof(header)))
        return STATUS_PLAN;
    count = get32(plan + GRKIT_PLAN_COUNT);
    safe_mode = get32(plan + GRKIT_PLAN_MODES) & GRKIT_PLAN_SAFE;
    profile_mode = (get32(plan + GRKIT_PLAN_MODES) & GRKIT_PLAN_PROFILE) != 0;
    overflow_count = get32(plan + GRKIT_PLAN_OVERFLOW);
    listed_count = get32(plan + GRKIT_PLAN_LISTED);
    u32 effects_at = GRKIT_PLAN_HEADER_SIZE + count * GRKIT_GRF_MAX_SIZE;
    if (count > MAX_COUNT || listed_count > EFFECTS_LISTED || have != effects_at + listed_count * GRKIT_PLANNED_EFFECT_SIZE ||
        get32(plan + GRKIT_PLAN_SIZE) != have || get32(plan + GRKIT_PLAN_MODES) > (GRKIT_PLAN_SAFE | GRKIT_PLAN_PROFILE))
        return STATUS_PLAN;
    for (u32 i = 0; i < listed_count; ++i) {
        const u8 *entry = plan + effects_at + i * GRKIT_PLANNED_EFFECT_SIZE;
        copy(listed[i], entry + GRKIT_PLANNED_HEAD, LISTED_HEAD);
        copy((u8 *)names[i], entry + GRKIT_PLANNED_FILE, CATALOG_NAME_SIZE);
        names[i][CATALOG_NAME_SIZE - 1] = 0;
        listed[i][CATALOG_ID + GRKIT_GRF_ID_MAX] = 0;
        listed_status[i] = get32(entry + GRKIT_PLANNED_STATUS);
        listed_choice[i] = get32(entry + GRKIT_PLANNED_CHOICE);
        listed_record[i] = get32(entry + GRKIT_PLANNED_RECORD);
        if (listed_status[i] > EFFECT_UNREADABLE || listed_choice[i] >= EFFECT_CHOICE_VALUES ||
            (listed_record[i] != EFFECTS_NO_RECORD && listed_record[i] >= count)) return STATUS_PLAN;
    }
    for (u32 i = 0; i < count; ++i) {
        copy(profiles[i], plan + GRKIT_PLAN_HEADER_SIZE + i * GRKIT_GRF_MAX_SIZE, GRKIT_GRF_MAX_SIZE);
        u32 bytes = get32(profiles[i] + 8);
        if ((bytes != GRKIT_GRF_SIZE && bytes != GRKIT_GRF_MAX_SIZE) || !valid_profile(profiles[i], bytes)) return STATUS_PLAN;
    }
    return 0;
}
/* Whether the camera has a monochrome sensor, as GR IV Monochrome: the sensor
   color byte of the current model record is 1. A build without the model
   record (MODEL_RECORD), or a record that is not set, counts as color. */
static int monochrome_camera(void)
{
#ifdef MODEL_RECORD
    u32 record = word(MODEL_RECORD);
    return record >= RELOCATION_RTOS_BASE && record < relocation.image_end && at(record + MODEL_SENSOR_COLOR)[0] == 1;
#else
    return 0;
#endif
}
#include "install_modules.h"
/* ---- State (runtime/state.h) ----------------------------------------------
   A missing STATE.TXT reads STATE.TMP, which a save that the power cut
   left. */
static void read_state(void)
{
    static u8 text[STATE_TEXT_MAX];
    long n = read_text(state_path, text, sizeof(text));
    if (n < 0) n = read_text(state_tmp_path, text, sizeof(text));
    if (n >= 0) {
        state_parse(&saved_state, text, n);
        return;
    }
    /* The first start after an update from GRKit 1.2: its values, under the
       current keys. The loader saves them in GRKIT at once. */
    static const u32 from[] = {LEGACY_STATE_FROM}, to[] = {LEGACY_STATE_TO};
    n = read_text(legacy_state_path, text, sizeof(text));
    if (n < 0) n = read_text(legacy_state_tmp_path, text, sizeof(text));
    state_parse(&saved_state, text, n);
    state_translate(&saved_state, from, to, LEGACY_STATE_COUNT, PARAMETER_KEY_BASE);
}
/* Restore the values of the capabilities that loaded modules use, the saved
   module settings in `table` (0 without one), and the Fn adjustments of the
   records. */
static void apply_state(u32 base, u32 table)
{
    static const u32 ids[] = {CORE_STATE_IDS};
    static const u16 words[] = {GRKIT_CORE_SETTING_WORDS}, values[] = {GRKIT_CORE_SETTING_VALUES};
    u32 value;
    for (u32 k = 0; k < GRKIT_CORE_SETTING_COUNT; ++k) {
        if (!(capabilities_used >> k & 1) || !state_value(&saved_state, ids[k], &value)) continue;
        if (k == GRKIT_CORE_TONE - GRKIT_CORE_SETTING_BASE) {
            /* The effect is its ImageTone code. */
            for (u32 i = 0; i < count; ++i) {
                u32 record = base + GRKIT_HOST_HEADER_SIZE + i * GRKIT_RECORD_SIZE;
                if (*(volatile u16 *)at(record + GRKIT_RECORD_CODE) == value) store(base + GRKIT_HOST_ACTIVE, record);
            }
        } else if (value < values[k]) store(base + words[k], value);
    }
    if (table) {
        u32 n = word(table);
        for (u32 k = 0; k < n && k < GRKIT_MODULE_SETTINGS_MAX; ++k) {
            u32 entry = table + 4 * SETTINGS_ENTRY(k), id = word(entry);
            store(entry + 4, state_setting_value(&saved_state, id, word(entry + 4), word(entry + 8)));
        }
        sync_alias(table, 4 * SETTINGS_WORDS(n));
    }
    /* The adjustments of an effect: base-9 digits, the first lowest. */
    for (u32 i = 0; i < count; ++i) {
        u32 record = base + GRKIT_HOST_HEADER_SIZE + i * GRKIT_RECORD_SIZE;
        u32 code = *(volatile u16 *)at(record + GRKIT_RECORD_CODE) & 0x7fffU;
        if (!state_value(&saved_state, PARAMETER_KEY_BASE + code, &value) || value > PARAMETER_VALUE_MAX) continue;
        for (u32 d = 0; d < 9; ++d) { at(record + GRKIT_RECORD_PARAMETERS + d)[0] = (u8)(value % 9); value /= 9; }
    }
    /* The Toning of each native look with its own curves in a slot. */
    for (u32 i = 0; i < count; ++i) {
        u32 record = base + GRKIT_HOST_HEADER_SIZE + i * GRKIT_RECORD_SIZE;
        u32 slot = at(record + GRKIT_RECORD_TONE_SLOT)[0];
        u32 code = *(volatile u16 *)at(record + GRKIT_RECORD_CODE) & 0x7fffU;
        if (!slot || !state_value(&saved_state, TONING_KEY_BASE + code, &value) || value > 8) continue;
        at(record + GRKIT_RECORD_TONING)[0] = (u8)value;
        toning_curves(record + GRKIT_RECORD_CURVES,
            word(base + GRKIT_HOST_TAIL) + GRKIT_TONE_CURVES + (slot - 1) * GRKIT_TONE_SLOT_SIZE, toning_value(value));
    }
}
/* The script arrays that the loader allocated (grkit_core::runtime::loader):
   the registry, the icon chunks, the module array, then the tail. */
struct arrays { u32 base, tail, module_array, icon_bases[MAX_CHUNKS]; };
/* Check that each array has its planned size and that no two overlap. */
static int check_arrays(struct arrays *a)
{
    if (*(volatile u16 *)at(ARRAY_COUNT) != ARRAY_LEAD + 2 + icon_chunks + (module_words != 0) || word(ARRAYS) != size / 4) return STATUS_ARRAYS;
    u32 base = a->base = word(ARRAYS + 4), *icon_bases = a->icon_bases;
    if (!heap(base, size)) return STATUS_ARRAY_MEMORY;
    for (u32 i = 0; i < icon_chunks; ++i) {
        u32 bytes = chunk_count(i) * ICON_STRIDE;
        u32 ptr = word(ARRAYS + (i + 1) * 8 + 4);
        if (word(ARRAYS + (i + 1) * 8) != bytes / 4 || !heap(ptr, bytes) ||
            (ptr < base + size && base < ptr + bytes)) return STATUS_ARRAY_MEMORY;
        for (u32 j = 0; j < i; ++j)
            if (ptr < icon_bases[j] + chunk_count(j) * ICON_STRIDE && icon_bases[j] < ptr + bytes) return STATUS_ARRAY_MEMORY;
        icon_bases[i] = ptr;
    }
    /* The module array follows the icon chunks. */
    u32 module_array = a->module_array = 0;
    if (module_words) {
        u32 entry = ARRAYS + (1 + icon_chunks) * 8, bytes = module_words * 4;
        module_array = a->module_array = word(entry + 4);
        if (word(entry) != module_words || !heap(module_array, bytes) ||
            (module_array < base + size && base < module_array + bytes)) return STATUS_ARRAY_MEMORY;
        for (u32 j = 0; j < icon_chunks; ++j)
            if (module_array < icon_bases[j] + chunk_count(j) * ICON_STRIDE && icon_bases[j] < module_array + bytes) return STATUS_ARRAY_MEMORY;
    }
    /* The tail follows the other arrays and overlaps none of them. */
    u32 tail = a->tail = word(ARRAYS + (2 + icon_chunks + (module_words != 0) - 1) * 8 + 4);
    if (word(ARRAYS + (2 + icon_chunks + (module_words != 0) - 1) * 8) != GRKIT_TAIL_SIZE / 4 ||
        !heap(tail, GRKIT_TAIL_SIZE) || (tail < base + size && base < tail + GRKIT_TAIL_SIZE) ||
        (module_array && tail < module_array + module_words * 4 && module_array < tail + GRKIT_TAIL_SIZE)) return STATUS_ARRAY_MEMORY;
    for (u32 j = 0; j < icon_chunks; ++j)
        if (tail < icon_bases[j] + chunk_count(j) * ICON_STRIDE && icon_bases[j] < tail + GRKIT_TAIL_SIZE) return STATUS_ARRAY_MEMORY;
    return 0;
}

/* The .data values of the running image are those at its copy source. */
#define INITIAL(address) ((address) - RELOCATION_DATA_START + relocation.data_source)
/* Check that the firmware is in the state that INSTALL expects: the language
   table, the Standard record and the type tables, the stock bytes of each
   patch, and the native settings. */
static int check_firmware(void)
{
    /* The tail after the RTOS image has no stock bytes to check. On a camera it
       holds the noise of uninitialized DRAM after power-on, or the code of an
       earlier GRKit session, so its content cannot show that it is free. The
       guards of the relocation detect a firmware that extends the image into
       it. */
    if (word(ENGLISH_SLOT) != word(INITIAL(ENGLISH_SLOT))) return STATUS_LANGUAGE_NOT_READY;
#ifndef GRKIT_NO_IMAGE_CONTROL
    /* The record is unchanged since startup and has the pinned layout. */
    if (!equal(at(STOCK_RECORD), (const u8 *)at(INITIAL(STOCK_RECORD)), 68)) return STATUS_STOCK_RECORD;
    for (u32 i = 0; i < 68; i += 4)
        if (relocation_mask(word(STOCK_RECORD + i)) != relocation_mask(get32(stock_record + i))) return STATUS_STOCK_RECORD;
    for (u32 i = 0; i < 4; ++i) {
        if (word(STOCK_RECORD + 68 + i * 4) == relocated[initialized_symbols[i]]) continue;
        return equal(at(STOCK_RECORD + 68), (const u8 *)at(INITIAL(STOCK_RECORD + 68)), 16) ? STATUS_RECORD_NOT_READY : STATUS_STOCK_RECORD;
    }
#endif
    /* No firmware code refers to the RTOS tail, so earlier GRKit code there is
       overwritten. Every other patch must still find its stock bytes. */
    for (u32 i = 0; i < PATCH_COUNT; ++i)
        if (!patches[i].kind && applies(i) && !equal(at(patches[i].address), patches[i].before, patches[i].size)) return STATUS_STOCK_BYTES;
#ifndef GRKIT_NO_IMAGE_CONTROL
    /* Each table is unchanged since startup and has the pinned layout, and
       entry 11 of the first one is the Standard record. */
    for (u32 i = 0; i < 3; ++i) {
        if (!equal(at(TABLE_ADDRESS(i)), (const u8 *)at(INITIAL(TABLE_ADDRESS(i))), TABLE_BYTES)) return STATUS_TONE_TABLES;
        for (u32 j = 0; j < TABLE_BYTES; j += 4)
            if (relocation_mask(word(TABLE_ADDRESS(i) + j)) !=
                relocation_mask(get32(stock_tables + i * TABLE_BYTES + j))) return STATUS_TONE_TABLES;
    }
    if (word(TABLE_ADDRESS(0) + 11 * 4) != STOCK_RECORD) return STATUS_TONE_TABLES;
    /* Reject stale native types; never attempt an in-place settings repair. */
    u32 domain = word(SETTINGS_DOMAIN);
    if (!heap(domain, 0x51c)) return STATUS_SETTINGS_NOT_READY;
    u32 control = word(domain + 0x518);
    if (!heap(control, 4)) return STATUS_SETTINGS_NOT_READY;
    u32 payload = word(control);
    if (!heap(payload, SETTINGS_IC_TYPE + 1) || at(payload + SETTINGS_IC_TYPE)[0] >= IC_TYPE_COUNT) return STATUS_SETTINGS_NOT_READY;
#endif
    return 0;
}

/* The base of the icon pixel offsets of the camera, or 0 when the camera
   has not drawn an icon yet. */
static u32 icon_pixels(void)
{
#ifdef ICON_DRAWER_SLOT
    /* The icon drawer exists after the first icon draw. Its first word is the
       base of icon pixel offsets, which can lie outside the mapping. */
    u32 drawer = word(ICON_DRAWER_SLOT);
    if (!heap(drawer, 4)) return 0;
    u32 pixels = word(drawer);
    if ((pixels & 3) || !pixels) return 0;
#else
    u32 pixels = word(ICON_PIXEL_BASE_SLOT);
    if ((pixels & 3) || pixels < MAP_BASE || pixels >= HEAP_MIN) return 0;
#endif
    return pixels;
}

/* Write the header, clear the icon chunks, and copy the menu text and the
   live-view labels into the tail. */
static void write_header(const struct arrays *a)
{
    u32 base = a->base, tail = a->tail;
    zero(at(base), size);
    store(base + GRKIT_HOST_COUNT, count); store(base + GRKIT_HOST_RECORDS, base + GRKIT_HOST_HEADER_SIZE);
    store(base + GRKIT_HOST_TAIL, tail);
    store(base + GRKIT_HOST_MAGIC, GRKIT_HOST_MAGIC_VALUE); store(base + GRKIT_HOST_VERSION, GRKIT_HOST_VERSION_VALUE);
    /* The next still live view shows that GRKit has loaded (runtime/framing.c). */
    store(base + GRKIT_HOST_LOAD_CUE, 1);
    /* The shot ring of the picture hooks (runtime/picture.c) starts empty. The
       tail holds noise after power-on, and after a soft reset the ring of the
       last start, whose keys a new shot could match. */
    zero(at(tail + GRKIT_SHOT_RING), GRKIT_SHOT_ENTRY + GRKIT_SHOT_ENTRIES * GRKIT_SHOT_STRIDE);
    for (u32 i = 0; i < icon_chunks; ++i) {
        zero(at(a->icon_bases[i]), chunk_count(i) * ICON_STRIDE);
        store(base + GRKIT_HOST_ICON_CHUNKS + i * 4, a->icon_bases[i]);
    }
    /* Menu text after the picture scratch (runtime/abi.h). */
    _Static_assert(MAX_COUNT <= GRKIT_TEXT_RECORDS, "Menu text has no summary slot for each record");
    _Static_assert(MENU_TEXT_BYTES <= GRKIT_TEXT_SUMMARY, "Menu text table overlaps the summaries");
    u32 text = tail + GRKIT_PICTURE_SCRATCH;
    copy(at(text), menu_text, MENU_TEXT_BYTES);
    _Static_assert(LABELS_BYTES <= GRKIT_LABELS_SIZE, "Live-view labels exceed their area");
    copy(at(text + GRKIT_TEXT_SIZE), overlay_labels, LABELS_BYTES);
}

#ifndef GRKIT_NO_IMAGE_CONTROL
/* Write the record, the menu summaries, and the icon of each effect. */
static void write_records(const struct arrays *a, u32 pixels)
{
    u32 tone_slots = 0;
    u32 base = a->base, text = a->tail + GRKIT_PICTURE_SCRATCH;
    const u32 *icon_bases = a->icon_bases;
    for (u32 i = 0; i < count; ++i) {
        u32 record = base + GRKIT_HOST_HEADER_SIZE + i * GRKIT_RECORD_SIZE;
        const u8 *profile = profiles[i];
        copy(at(record), (const u8 *)at(STOCK_RECORD), GRKIT_RECORD_COEFFICIENTS);
        store(record + 4, record + GRKIT_RECORD_COEFFICIENTS);
        /* The matrix and the curves, which the coefficients hold as the GRF
           does (grkit_core::abi). */
        copy(at(record + GRKIT_RECORD_COEFFICIENTS), profile + GRKIT_GRF_MATRIX, GRKIT_GRF_ICON - GRKIT_GRF_MATRIX);
        /* Extension: features, then the post matrix, selective color, and the
           reserved zero bytes. */
        copy(at(record + GRKIT_RECORD_FEATURES), profile + GRKIT_GRF_FEATURES, GRKIT_GRF_FEATURES_SIZE);
        copy(at(record + GRKIT_RECORD_POST), profile + GRKIT_GRF_POST, GRKIT_GRF_MATRIX - GRKIT_GRF_POST);
        if (get32(profile + GRKIT_GRF_FEATURES) & (GRKIT_FEATURE_HUE | GRKIT_FEATURE_NATIVE_LOOK)) multiaxial(record, profile);
        /* Neutral Fn adjustments until the loader restores the saved ones, and
           the defaults that they change: those of feature 64, as values mod 9
           like a stored adjustment, else zero. */
        zero(at(record + GRKIT_RECORD_PARAMETERS), 9);
        for (u32 k = 0; k < 9; ++k) {
            int value = (get32(profile + GRKIT_GRF_FEATURES) & GRKIT_FEATURE_FN_DEFAULTS)
                ? (signed char)profile[GRKIT_GRF_FN_DEFAULTS + k] : 0;
            at(record + GRKIT_RECORD_FN_DEFAULTS + k)[0] = (u8)(value < 0 ? value + 9 : value);
        }
        /* Toning (runtime/toning.h): a native look whose red or blue curve
           differs from green keeps those curves in the next tail slot, and
           starts at its own toning. */
        zero(at(record + GRKIT_RECORD_TONING), 2);
        if ((get32(profile + GRKIT_GRF_FEATURES) & GRKIT_FEATURE_NATIVE_LOOK) && tone_slots < GRKIT_TONE_SLOTS &&
            !(grf_equal(profile + GRKIT_GRF_CURVES, profile + GRKIT_GRF_CURVES + 512, 512) &&
              grf_equal(profile + GRKIT_GRF_CURVES + 1024, profile + GRKIT_GRF_CURVES + 512, 512))) {
            u32 slot = a->tail + GRKIT_TONE_CURVES + tone_slots * GRKIT_TONE_SLOT_SIZE;
            copy(at(slot), profile + GRKIT_GRF_CURVES, 512);
            copy(at(slot + 512), profile + GRKIT_GRF_CURVES + 1024, 512);
            at(record + GRKIT_RECORD_TONE_SLOT)[0] = (u8)++tone_slots;
        }
        u32 n = length((const char *)profile + CATALOG_EFFECT_NAME);
        for (u32 j = 0; j < n; ++j) at(record + GRKIT_RECORD_NAME + j * 2)[0] = profile[CATALOG_EFFECT_NAME + j];
        store(record + GRKIT_RECORD_MONOCHROME, get32(profile + GRKIT_GRF_FLAGS));
        copy(at(record + GRKIT_RECORD_ID), profile + GRKIT_GRF_ID, GRKIT_GRF_ID_SIZE);
        /* The Image Control summary in each language: the prefix, then the name. */
        for (u32 language = 0; language < GRKIT_TEXT_LANGUAGES; ++language) {
            volatile u16 *summary = (volatile u16 *)at(text + GRKIT_TEXT_SUMMARY +
                (language * GRKIT_TEXT_RECORDS + i) * GRKIT_SUMMARY_UNITS * 2);
            const u16 *table = (const u16 *)menu_text;
            const u16 *prefix = table + table[language * GRKIT_TEXT_STRINGS + TEXT_IMAGE_PREFIX] / 2;
            u32 k = 0, m = n < CATALOG_EFFECT_NAME_MAX ? n : CATALOG_EFFECT_NAME_MAX;
            for (; prefix[k]; ++k) summary[k] = prefix[k];
            for (u32 j = 0; j < m; ++j) summary[k + j] = profile[CATALOG_EFFECT_NAME + j];
            summary[k + m] = 0;
        }
        u32 slot = HOST_ICON_COUNT + i;
        u32 icon = icon_bases[slot / ICONS_PER_CHUNK] + (slot % ICONS_PER_CHUNK) * ICON_STRIDE;
        icon_header(icon, pixels);
        copy(at(icon + ICON_PIXELS), profile + GRKIT_GRF_ICON, GRKIT_GRF_ICON_SIZE);
        store(record + GRKIT_RECORD_ICON, icon);
        /* Resolve hash collisions in catalog order, and skip native values. */
        u32 code = effect_code(profile + GRKIT_GRF_ID), j = 0;
        while (j < i || NATIVE_CODE(code)) {
            if (!NATIVE_CODE(code) && *(volatile u16 *)at(base + GRKIT_HOST_HEADER_SIZE + j * GRKIT_RECORD_SIZE + GRKIT_RECORD_CODE) != code) { ++j; continue; }
            code = 0x8000 | ((code + 1) & 0x7fff);
            j = 0;
        }
        *(volatile u16 *)at(record + GRKIT_RECORD_CODE) = code;
    }
}
#endif

static void write_host_icons(const struct arrays *a, u32 pixels)
{
    u32 base = a->base;
    /* Host artwork does not consume an effect record or a native settings ID.
       It comes first in chunk 0: Off, the GRKit tile, the Version tile, the
       Modules tile, then the Modules tile of Enable GRKit Off. */
    _Static_assert(HOST_ICON_COUNT == 5, "The host icons are Off, GRKit, Version, Modules, and Modules Off");
    for (u32 i = 0; i < HOST_ICON_COUNT; ++i) {
        u32 icon = a->icon_bases[0] + i * ICON_STRIDE;
        static const u8 *const artwork[HOST_ICON_COUNT] = {off_pixels, grkit_pixels, version_pixels, modules_pixels,
                                                                 modules_off_pixels};
        icon_header(icon, pixels);
        copy(at(icon + ICON_PIXELS), artwork[i], 6400);
        /* The menu derives the Version and the two Modules icons from the
           GRKit icon. */
        if (i < 2) store(base + (i ? GRKIT_HOST_GRKIT_ICON : GRKIT_HOST_OFF_ICON), icon);
    }
}

/* Link the modules and register them in the header. */
static int write_modules(const struct arrays *a, u32 pixels, u32 code)
{
    u32 base = a->base;
    int status;
    if ((status = install_modules(code, a->module_array, pixels, a->icon_bases))) return status;
    needed_points |= POINT_MENU_PAGE;
    store(base + GRKIT_HOST_MANAGE, module_list);
    store(base + GRKIT_HOST_EFFECTS, effect_list);
    store(base + GRKIT_HOST_SERVICES, services_block);
    store(base + GRKIT_HOST_MODULE_SETTINGS, a->module_array);
    store(base + GRKIT_HOST_CAPABILITIES, capabilities_running);
    store(base + GRKIT_HOST_MODULE_PAGE_COUNT, module_page_count);
    for (u32 i = 0; i < module_page_count * 3; ++i) store(base + GRKIT_HOST_MODULE_PAGES + i * 4, module_pages[i]);
    store(base + GRKIT_HOST_MODULE_LAYER_COUNT, module_layer_count);
    for (u32 i = 0; i < module_layer_count * 4; ++i) store(base + GRKIT_HOST_MODULE_LAYERS + i * 4, module_layers[i]);
    store(base + GRKIT_HOST_LEGACY_TONE_OWNER, module_legacy_tone_owner);
    store(base + GRKIT_HOST_INDICATOR_COUNT, module_indicator_count);
    for (u32 i = 0; i < module_indicator_count * 2; ++i) store(base + GRKIT_HOST_INDICATORS + i * 4, module_indicators[i]);
    store(base + GRKIT_HOST_MODULE_FILTER_COUNT, module_filter_count);
    for (u32 i = 0; i < module_filter_count * 2; ++i) store(base + GRKIT_HOST_MODULE_FILTERS + i * 4, module_filters[i]);
    return 0;
}

static void write_profile(const struct arrays *a)
{
    u32 base = a->base, tail = a->tail;
    u32 table = tail + GRKIT_PROFILE;
    zero(at(table), GRKIT_PROFILE_SIZE);
    for (u32 i = 0; i < module_count && i < GRKIT_PROFILE_MODULES; ++i) {
        u32 entry = table + i * GRKIT_PROFILE_MODULE_SIZE, n = 0;
        if (module_status[i]) continue;
        store(entry, module_code_from[i]);
        store(entry + 4, module_code_to[i]);
        char id[9];
        module_id(i, id);
        for (; id[n] && n < GRKIT_PROFILE_NAME_BYTES; ++n) at(entry + 8 + n)[0] = (u8)id[n];
    }
    store(base + GRKIT_HOST_PROFILE, table);
}

/* Install the patches. Each payload goes in before its entry branch. */
static int publish_patches(void)
{
    /* Publish payloads before entry branches. Cross-domain coherence needs device validation. */
    u32 installed = 0;
    for (; installed < PATCH_COUNT; ++installed) {
        if (!applies(installed)) continue;
        publish(&patches[installed], patches[installed].after);
        if (!sync_alias(patches[installed].address, patches[installed].size)) break;
    }
    if (installed != PATCH_COUNT) {
        int rollback_ok = 1;
        for (u32 i = installed + 1; i > 0; --i) {
            if (!applies(i - 1)) continue;
            publish(&patches[i - 1], patches[i - 1].before);
            if (!sync_alias(patches[i - 1].address, patches[i - 1].size)) rollback_ok = 0;
        }
        return rollback_ok ? STATUS_ROLLED_BACK : STATUS_ROLLBACK_FAILED;
    }
    return 0;
}

/* INSTALL after the plan and the relocation: the code area, the arrays, the
   firmware checks, the records, the icons, the modules, the saved values,
   then the hooks. A not-ready status leaves the camera as it was, so a
   one-shot start calls it again. */
static int install_planned(void)
{
    struct arrays arrays;
    u32 module_start;
    int status;
    /* The loaded modules add the points that they need (install_modules). */
    needed_points = 0;
    if ((status = plan_code(relocated[TAIL_SYMBOL], TAIL_BYTES, CODE_END, &module_start))) return status;
    if ((status = check_arrays(&arrays))) return status;
    if ((status = check_firmware())) return status;
    u32 pixels = icon_pixels();
    if (!pixels) return STATUS_ICONS_NOT_READY;
    write_header(&arrays);
#ifndef GRKIT_NO_IMAGE_CONTROL
    write_records(&arrays, pixels);
#endif
    write_host_icons(&arrays, pixels);
    /* The GRKit section of MENU lists each module, also when none loads, so
       the menu hooks install with a listed module. */
    if (module_count && (status = write_modules(&arrays, pixels, module_start))) return status;
    /* The profile table: the code range and the name of each module that
       loaded, and counters at 0 (the tail holds noise after power-on). */
    if (profile_mode) write_profile(&arrays);
    /* The saved values, before the hooks start (plan_modules read them). */
    apply_state(arrays.base, module_count ? arrays.module_array : 0);
    for (u32 i = 0; i < CODE_RELOCATION_COUNT; ++i) {
        u32 patch_index = code_relocations[i * 2], offset = code_relocations[i * 2 + 1];
        put32(patches[patch_index].after + offset, arrays.base);
    }
    if (!sync_alias(arrays.base, size)) return STATUS_SYNC;
    if (!sync_alias(arrays.tail, GRKIT_TAIL_SIZE)) return STATUS_SYNC;
    for (u32 i = 0; i < icon_chunks; ++i)
        if (!sync_alias(arrays.icon_bases[i], chunk_count(i) * ICON_STRIDE)) return STATUS_SYNC;
    if ((status = publish_patches())) return status;
    print("GR_MODULE_INSTALLED "); number(count); print("\n");
    return 0;
}
static int install(void)
{
    int status = read_plan();
    if (status) return status;
    /* The modules of SCAN, which the loader reserved memory for. */
    plan_modules();
    plan_array();
    layout();
    if (get32(plan + GRKIT_PLAN_HEADER_WORDS) != size / 4 || get32(plan + GRKIT_PLAN_ICON_CHUNKS) != icon_chunks ||
        get32(plan + GRKIT_PLAN_MODULE_WORDS) != module_words || get32(plan + GRKIT_PLAN_MODULE_TILES) != module_tiles)
        return STATUS_PLAN;
    if ((status = relocate())) return status;
    return install_planned();
}
#ifdef MODULE_DIAGNOSTICS
/* Diagnostic builds can select profiles independently of the menu. */
static int select_profile(const char *id)
{
    relocation.read = read_word;
    relocation.window_at = window_at;
    relocation.symbol_at = relocated;
    if (!relocation_resolve(&relocation_tables, &relocation)) return STATUS_RELOCATION;
    u32 base = word(ARRAYS + 4);
    if (!heap(base, GRKIT_HOST_HEADER_SIZE) || word(base + GRKIT_HOST_MAGIC) != GRKIT_HOST_MAGIC_VALUE || word(base + GRKIT_HOST_VERSION) != GRKIT_HOST_VERSION_VALUE) return STATUS_NO_HEADER;
    u32 n = word(base + GRKIT_HOST_COUNT), records = word(base + GRKIT_HOST_RECORDS), selected = 0;
    if (n > MAX_COUNT || records != base + GRKIT_HOST_HEADER_SIZE || !heap(base, GRKIT_HOST_HEADER_SIZE + n * GRKIT_RECORD_SIZE)) return STATUS_NO_HEADER;
    if (!text_equal(id, "off")) {
        for (u32 i = 0; i < n; ++i) {
            u32 p = records + i * GRKIT_RECORD_SIZE;
            if (equal(at(p + GRKIT_RECORD_ID), (const u8 *)id, length(id) + 1)) { selected = p; break; }
        }
        if (!selected) return STATUS_NO_EFFECT;
    }
    store(base + GRKIT_HOST_ACTIVE, selected);
    if (!sync_alias(base, GRKIT_HOST_HEADER_SIZE)) return STATUS_SYNC;
    print("GR_MODULE_SELECTED "); print(id); print("\n");
    return 0;
}
#endif
/* Create an empty file only when it is absent. */
/* Create a result file. A nonzero status is written as decimal text, so a
   card from a camera shows why INSTALL failed. It replaces the status that
   the loader wrote before the step. A file without a status is created only
   when it is absent, so the lock admits one attempt. */
static int create(const char *path, u32 status)
{
    long fd = syscall6(5, (u32)path, status ? 0x241 : 0xc1, 0600, 0, 0, 0);
    if (fd < 0) return 0;
    if (status) {
        char text[12]; u32 n = sizeof(text) - 1, code = status;
        text[n] = '\n';
        do { text[--n] = '0' + status % 10; status /= 10; } while (status);
        syscall6(4, fd, (u32)(text + n), sizeof(text) - n, 0, 0, 0);
        /* After the status: one line for each relocation failure, with the
           reason, the window or symbol index, the pinned address, and a
           count or value (runtime/relocation.h). */
        if (code == STATUS_RELOCATION) {
            u32 shown = relocation.failures < RELOCATION_REPORT ? relocation.failures : RELOCATION_REPORT;
            for (u32 i = 0; i < shown; ++i) {
                const struct relocation_failure *f = &relocation.failure[i];
                u32 fields[4] = {f->reason, f->index, f->address, f->count};
                char line[48]; u32 m = 0;
                for (u32 k = 0; k < 4; ++k) {
                    for (int shift = 28; shift >= 0; shift -= 4)
                        line[m++] = "0123456789abcdef"[(fields[k] >> shift) & 15];
                    line[m++] = k == 3 ? '\n' : ' ';
                }
                syscall6(4, fd, (u32)line, m, 0, 0, 0);
            }
        }
    }
    syscall6(6, fd, 0, 0, 0, 0, 0);
    return 1;
}
#include "install_report.h"
/* Native state that the camera is still initializing. Other failures are final. */
static int not_ready(int status)
{
    return status == STATUS_LANGUAGE_NOT_READY || status == STATUS_RECORD_NOT_READY ||
           status == STATUS_ICONS_NOT_READY || status == STATUS_SETTINGS_NOT_READY;
}
/* A package with a runtime for each build of a camera runs its installers in
   turn (runtime::package_runtime_files). `--known` installs on a build that
   the runtime names, and exits with 48 on another build. `--try` installs on a
   build that the relocation resolves, and exits with 47 on another build.
   On another build, both read the RTOS only and leave each file as it is:
   after Linux deletes a file in the folder, the camera does not find the next
   name that it looks up there, such as the next installer. `--install` is the
   last attempt and always leaves its result. */
enum install_mode { INSTALL_LAST, INSTALL_KNOWN, INSTALL_TRY };
static int names_build(void)
{
#if RTOS_IDENTITY_COUNT
    u32 identity = word(RTOS_IDENTITY);
    for (u32 i = 0; i < RTOS_IDENTITY_COUNT; ++i)
        if (identity == rtos_identities[i]) return 1;
#endif
    return 0;
}
static int relocation_found(void)
{
    prepare_relocation();
    if (!relocation_resolve(&relocation_tables, &relocation)) return 0;
    keep_relocation();
    return 1;
}
/* Whether the running build is not the one of `mode`. A failure to read the
   RTOS is left to the install attempt, which reports it. */
static int other_build(enum install_mode mode)
{
    long fd = syscall6(5, (u32)"/dev/mem", 0x101002, 0, 0, 0, 0), other = 0;
    if (fd < 0) return 0;
    long mapped = syscall6(192, 0, MAP_SIZE, 1, 1, fd, MAP_BASE >> 12);
    if ((u32)mapped < 0xfffff001U) {
        mapping = (volatile u8 *)mapped;
        other = mode == INSTALL_KNOWN ? !names_build() : !relocation_found();
        syscall6(91, (u32)mapping, MAP_SIZE, 0, 0, 0, 0);
    }
    syscall6(6, fd, 0, 0, 0, 0, 0);
    return other;
}
#ifndef RTOS_NATIVE
/* ---- One-shot start --------------------------------------------------------
   SCAN.SH runs the core once at each power-on with --start, --start-known,
   or --start-try, which check the build as --install, --known, and --try
   do. The core then goes on in a process of its own, so the request of the
   loader returns at once, and the loader polls the mailbox (abi.h,
   GRKIT_MAILBOX_*) and the result files. In that process, the start maps
   the camera memory once, reads each module and each effect file once
   (read_whole), scans, posts the plan header into the mailbox and writes it
   to the card, waits until the loader allocated the arrays of the plan,
   installs, with the retries of a native state that the camera still
   initializes, and posts the result. The camera's Linux reads the card
   through the RTOS, so each request, each read of the core file, and each
   card write costs about as much, and a start makes as few as it can. The
   loader sends INSTALL.SH when no result comes, which runs --install from
   the plan in RAM, as before. */
#define START_LOCK_PATH "/tmp/grkit-start.lck"
#define START_PID_PATH "/tmp/grkit-core.pid"
/* The boot log of this start in RAM, which SCAN.SH starts, and the boot
   log on the card (grkit_core::runtime::files::BOOT_LOG). */
#define BOOT_RAM_LOG "/tmp/grkit-boot.log"
#define BOOT_LOG_PATH DATA_PATH "/BOOT.TXT"
/* The most lines of the boot log, about 20 starts, and the lines that a
   longer log keeps. */
#define BOOT_LOG_LINES 400U
#define BOOT_LOG_KEEP 300U
#define BOOT_LOG_MAX 65536U
static u8 boot_log[BOOT_LOG_MAX];
static void sleep_ms(u32 ms)
{
    u32 time[2] = {ms / 1000U, (ms % 1000U) * 1000000U};
    syscall6(162, (u32)time, 0, 0, 0, 0, 0);
}
/* A line of the boot log in RAM: the Linux uptime in seconds, the step,
   then its status unless `status` is negative. SCAN.SH and INSTALL.SH write
   the same lines. */
static void log_step(const char *step, int status)
{
    char line[80]; u8 up[32];
    u32 n = 0;
    long got = read_text("/proc/uptime", up, sizeof(up) - 1);
    for (long i = 0; i < got && up[i] != ' ' && n < 24; ++i) line[n++] = (char)up[i];
    if (!n) line[n++] = '?';
    line[n++] = ' ';
    for (const char *p = step; *p && n < 60; ++p) line[n++] = *p;
    if (status >= 0) {
        char digits[12]; u32 d = sizeof(digits), v = (u32)status;
        line[n++] = ' ';
        do { digits[--d] = (char)('0' + v % 10); v /= 10; } while (v);
        while (d < sizeof(digits)) line[n++] = digits[d++];
    }
    line[n++] = '\n';
    long fd = syscall6(5, (u32)BOOT_RAM_LOG, 0x441, 0644, 0, 0, 0);
    if (fd < 0) return;
    syscall6(4, fd, (u32)line, n, 0, 0, 0);
    syscall6(6, fd, 0, 0, 0, 0, 0);
}
/* The boot log of this start to the card, after the result: the card log,
   then the lines in RAM, in one write. A log past BOOT_LOG_LINES lines keeps
   its last BOOT_LOG_KEEP lines. The RAM log then starts again, so a later
   INSTALL.SH of the same power-on appends its own lines to the card. */
static void flush_log(void)
{
    static u8 ram[8192];
    long have = read_text(BOOT_LOG_PATH, boot_log, BOOT_LOG_MAX), fresh = read_text(BOOT_RAM_LOG, ram, sizeof(ram));
    if (fresh <= 0) return;
    if (have < 0) have = 0;
    u32 lines = 0;
    for (long i = 0; i < have; ++i) lines += boot_log[i] == '\n';
    if (lines > BOOT_LOG_LINES) {
        u32 skip = lines - BOOT_LOG_KEEP;
        long i = 0;
        while (skip && i < have) if (boot_log[i++] == '\n') --skip;
        copy(boot_log, boot_log + i, (u32)(have - i));
        have -= i;
    }
    if (have + fresh > (long)BOOT_LOG_MAX) fresh = (long)BOOT_LOG_MAX - have;
    copy(boot_log + have, ram, (u32)fresh);
    long made = syscall6(39, (u32)data_path, 0755, 0, 0, 0, 0);
    if (made < 0 && made != -17) return;
    if (write_file(BOOT_LOG_PATH, boot_log, (u32)(have + fresh))) syscall6(10, (u32)BOOT_RAM_LOG, 0, 0, 0, 0, 0);
}
/* The plan header into the mailbox, its magic word last: the loader reads
   the other words after it. */
static void post_plan(u32 box)
{
    copy(at(box + GRKIT_MAILBOX_PLAN + 4), plan + 4, GRKIT_PLAN_HEADER_SIZE - 4);
    barrier();
    store(box + GRKIT_MAILBOX_PLAN, GRKIT_PLAN_MAGIC_VALUE);
    sync_alias(box, GRKIT_MAILBOX_WORDS * 4);
}
/* The result of the start into the mailbox: the status, then the result
   word, which the loader polls. */
static void post_result(u32 box, int status)
{
    store(box + GRKIT_MAILBOX_STATUS, (u32)status);
    barrier();
    store(box + GRKIT_MAILBOX_RESULT, status ? GRKIT_MAILBOX_FAILED : GRKIT_MAILBOX_INSTALLED);
    sync_alias(box, GRKIT_MAILBOX_WORDS * 4);
}
/* Wait until the loader allocated the arrays of the plan: the mailbox says
   so, or the array table lists them in three polls in a row, so that the
   loader is past its last allocation. Return 1, or 0 after a minute. */
static int wait_arrays(u32 box)
{
    struct arrays arrays;
    u32 stable = 0;
    for (u32 poll = 0; poll < 3000; ++poll) {
        int listed = check_arrays(&arrays) == 0;
        if (listed && box && word(box + GRKIT_MAILBOX_ARRAYS) == 1) return 1;
        stable = listed ? stable + 1 : 0;
        if (stable >= 3) return 1;
        sleep_ms(20);
    }
    return 0;
}
/* The result of a start: the mailbox, the report, the result file that the
   loader polls, and the boot log. */
static void finish_start(u32 box, int status)
{
    if (box) post_result(box, status);
    write_report(status);
    create(status ? failed_path : done_path, status);
    flush_log();
}
static void run_start(void)
{
    int status = STATUS_NO_MEMORY;
    u32 box = 0;
    long fd = syscall6(5, (u32)"/dev/mem", 0x101002, 0, 0, 0, 0);
    long mapped = fd < 0 ? -1 : syscall6(192, 0, MAP_SIZE, 3, 1, fd, MAP_BASE >> 12);
    if (fd >= 0 && (u32)mapped >= 0xfffff001U) status = STATUS_NO_MAPPING;
    if (fd < 0 || (u32)mapped >= 0xfffff001U) {
        log_step("scan", status);
        finish_start(0, status);
        return;
    }
    mapping = (volatile u8 *)mapped;
    ram_cache = 1;
    log_step("scan-start", -1);
    /* The addresses of this build first: the mailbox is at one of them. The
       log says whether the build moved and the search ran. */
    status = relocate();
    log_step("relocated", status ? status : (int)relocation.searched);
    if (!status && (box = mailbox()) != 0) {
        store(box + GRKIT_MAILBOX_STARTED, 1);
        sync_alias(box, GRKIT_MAILBOX_WORDS * 4);
    }
    if (!status) status = make_plan();
    log_step("scan", status);
    if (status) {
        finish_start(box, status);
        return;
    }
    /* The plan header: the mailbox first, then the card, for a loader that
       reads the file, and for INSTALL.SH. After a post into the mailbox, a
       card that refuses the file costs only the fallback. */
    if (box) post_plan(box);
    long tmp = open_plan_tmp();
    int published = tmp >= 0 ? publish_plan(tmp) : (int)-tmp;
    if (published) log_step("plan-file", published);
    if (!box) status = published;
    if (status) {
        finish_start(box, status);
        return;
    }
    log_step("plan", box ? 1 : 0);
    /* The RAM plan for INSTALL.SH, after the posts: the loader allocates
       the arrays meanwhile. */
    log_step("ramplan", write_ram_plan() ? 0 : STATUS_PLAN_WRITE);
    if (!wait_arrays(box)) {
        log_step("install", STATUS_ARRAYS);
        finish_start(box, STATUS_ARRAYS);
        return;
    }
    log_step("install-start", -1);
    for (u32 attempt = 0;; ++attempt) {
        status = install_planned();
        if (!not_ready(status)) break;
        /* As the loader retried INSTALL.SH: every 0.1 s for 30 s, then
           every 10 s, so a later shooting-mode start can still install. */
        sleep_ms(attempt < 300 ? 100 : 10000);
    }
    log_step("install", status);
    finish_start(box, status);
}
/* --start: check the build as `mode` does, then go on in a process of its
   own. Returns 0 to SCAN.SH once that process runs, STATUS_OTHER_BUILD or
   STATUS_RELOCATION on another build, STATUS_BUSY after a start of this
   power-on, or STATUS_NO_PROCESS. */
static int start_once(enum install_mode mode)
{
    if (mode != INSTALL_LAST && other_build(mode)) return mode == INSTALL_KNOWN ? STATUS_OTHER_BUILD : STATUS_RELOCATION;
    long lock = syscall6(5, (u32)START_LOCK_PATH, 0xc1, 0600, 0, 0, 0);
    if (lock < 0) return STATUS_BUSY;
    syscall6(6, lock, 0, 0, 0, 0, 0);
    /* A pipe tells the parent when the child is on its own, so that the
       request of the loader ends only then: a shell that ends a request may
       end the processes of the request with it. */
    u32 pipe_fds[2] = {0, 0};
    long piped = syscall6(42, (u32)pipe_fds, 0, 0, 0, 0, 0);
    long pid = syscall6(2, 0, 0, 0, 0, 0, 0);
    if (pid < 0) {
        syscall6(10, (u32)START_LOCK_PATH, 0, 0, 0, 0, 0);
        create(failed_path, STATUS_NO_PROCESS);
        return STATUS_NO_PROCESS;
    }
    if (pid > 0) {
        /* The parent: the word of the child, then the process ID for
           INSTALL.SH, then back to SCAN.SH. A child that ends first closes
           the pipe. */
        u8 word = 0;
        if (piped >= 0) {
            syscall6(6, pipe_fds[1], 0, 0, 0, 0, 0);
            syscall6(3, pipe_fds[0], (u32)&word, 1, 0, 0, 0);
            syscall6(6, pipe_fds[0], 0, 0, 0, 0, 0);
        }
        char text[12]; u32 n = sizeof(text) - 1, v = (u32)pid;
        text[n] = '\n';
        do { text[--n] = (char)('0' + v % 10); v /= 10; } while (v);
        write_file(START_PID_PATH, (const u8 *)(text + n), sizeof(text) - n);
        return 0;
    }
    /* The child: a session of its own, and no descriptor of the request,
       which returns when the last one closes: the standard ones go to
       /dev/null, and any other that the shell left open closes. */
    syscall6(66, 0, 0, 0, 0, 0, 0);
    long null = syscall6(5, (u32)"/dev/null", 2, 0, 0, 0, 0);
    for (u32 i = 0; i < 3; ++i) {
        if (null >= 0) syscall6(63, (u32)null, i, 0, 0, 0, 0);
        else syscall6(6, i, 0, 0, 0, 0, 0);
    }
    for (u32 fd = 3; fd < 256; ++fd)
        if (piped < 0 || fd != pipe_fds[1]) syscall6(6, fd, 0, 0, 0, 0, 0);
    if (piped >= 0) {
        u8 word = 1;
        syscall6(4, pipe_fds[1], (u32)&word, 1, 0, 0, 0);
        syscall6(6, pipe_fds[1], 0, 0, 0, 0, 0);
    }
    run_start();
    syscall6(1, 0, 0, 0, 0, 0, 0);
    for (;;) {}
}
#endif
#ifdef RTOS_NATIVE
__attribute__((used)) int grkit_install_entry(u32 argc, char **argv)
{
    int status = STATUS_USAGE;
#else
__attribute__((used)) void start(u32 *stack)
{
    u32 argc = stack[0]; char **argv = (char **)(stack + 1); int status = STATUS_USAGE;
#endif
    enum install_mode mode = INSTALL_LAST;
    int starting = 0;
    if (argc == 2 && text_equal(argv[1], "--known")) mode = INSTALL_KNOWN;
    else if (argc == 2 && text_equal(argv[1], "--try")) mode = INSTALL_TRY;
#ifndef RTOS_NATIVE
    else if (argc == 2 && text_equal(argv[1], "--start-known")) { mode = INSTALL_KNOWN; starting = 1; }
    else if (argc == 2 && text_equal(argv[1], "--start-try")) { mode = INSTALL_TRY; starting = 1; }
    else if (argc == 2 && text_equal(argv[1], "--start")) starting = 1;
#endif
    int installing = argc == 2 && !starting && (mode != INSTALL_LAST || text_equal(argv[1], "--install"));
    if (argc == 2 && text_equal(argv[1], "--scan")) status = scan();
#ifndef RTOS_NATIVE
    else if (starting) status = start_once(mode);
#endif
    else if (installing
#ifdef MODULE_DIAGNOSTICS
             || (argc == 3 && text_equal(argv[1], "--select") && length(argv[2]) <= 31)
#endif
    ) {
        long fd = -1;
        int other = mode != INSTALL_LAST && other_build(mode);
        if (other) status = mode == INSTALL_KNOWN ? STATUS_OTHER_BUILD : STATUS_RELOCATION;
        /* The lock admits one install attempt at a time and stays after a result. */
        else if (argc == 2 && !create(lock_path, 0)) status = STATUS_BUSY;
        else if ((fd = syscall6(5, (u32)"/dev/mem", 0x101002, 0, 0, 0, 0)) < 0) status = STATUS_NO_MEMORY;
        else {
            long mapped = syscall6(192, 0, MAP_SIZE, 3, 1, fd, MAP_BASE >> 12);
            status = STATUS_NO_MAPPING;
            if ((u32)mapped < 0xfffff001U) {
                mapping = (volatile u8 *)mapped;
                if (argc == 2) status = install();
#ifdef MODULE_DIAGNOSTICS
                else status = select_profile(argv[2]);
#endif
                syscall6(91, (u32)mapping, MAP_SIZE, 0, 0, 0, 0);
            }
            syscall6(6, fd, 0, 0, 0, 0, 0);
        }
        /* The loader polls these files: retry after not-ready, stop after a result.
           Another build leaves the next installer to run. */
        if (argc == 2 && status != STATUS_BUSY && !other) {
            if (not_ready(status)) syscall6(10, (u32)lock_path, 0, 0, 0, 0, 0);
            else {
                write_report(status);
                create(status ? failed_path : done_path, status);
            }
        }
    }
    if (status) { print("GR_MODULE_REJECTED "); number(status); print("\n"); }
#ifdef RTOS_NATIVE
    return status;
}
#else
    syscall6(1, status, 0, 0, 0, 0, 0); for (;;) {}
}
__attribute__((naked)) void _start(void) { __asm__ volatile("mov r0, sp\nb start"); }
#endif
