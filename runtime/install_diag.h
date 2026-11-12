#ifndef GRKU_INSTALL_DIAG_H
#define GRKU_INSTALL_DIAG_H
/* A part of the installer: the details for a device report. installer.c
   includes it once, after install_report.h.

   Three files say what a start did, each for a reader:
   - GRKU/REPORT.TXT (install_report.h) is the result for a person, and
     say_details adds the facts of this card on this firmware: the build,
     the relocation, each patch, each module with its settings, each
     effect, the saved state, and the modes. They are the same from start
     to start while the card and the firmware are, so a start rarely writes
     the report.
   - GRKU/BOOT.TXT is the log of each start: the time of each step, and
     with log_environment, log_build, log_plan, and log_install, the numbers
     of the start that can differ from one start to the next: the kernel,
     the memory, the addresses of the arrays, the patches, the retries.
   - SCRIPT/GRKU/INSTALL.ERR is the file of a failure: its status, the
     name and the meaning of the status, the step, and the state at that
     point (failure_details), then the boot log of the start, so that one
     file tells the story.
   Nothing here reads the camera memory, which INSTALL unmaps before the
   report; everything comes from the state that the start kept. */
static const char *diag_eol = "\r\n";
__attribute__((noinline)) static void nl(void) { say(diag_eol); }
static const char *target_name(void) { return target_marker + sizeof("GRKU_TARGET=") - 1; }
/* A failure reason of the relocation (runtime/relocation.h). */
static const char *relocation_reason(u32 reason)
{
    switch (reason) {
    case RELOCATION_STARTUP_INVALID: return "the startup literals or code are not valid";
    case RELOCATION_NOT_FOUND: return "a window has no match";
    case RELOCATION_AMBIGUOUS: return "a window has more than one match";
    case RELOCATION_NO_BRANCH: return "a source has no B or BL at the word";
    case RELOCATION_VERIFY: return "the verify window of a source differs";
    case RELOCATION_OUTSIDE: return "a symbol lies outside its region";
    case RELOCATION_DISAGREE: return "the sources of a symbol disagree";
    default: return "unknown reason";
    }
}
/* The names of the extension points in `points` (the generated header). */
static void say_points(u32 points)
{
    if (!points) { say(" (none)"); return; }
    say(" (");
    u32 first = 1;
    struct { u32 bit; const char *name; } known[] = {
#ifdef POINT_MENU_PAGE
        {POINT_MENU_PAGE, "menu page"},
#endif
#ifdef POINT_VIEWFINDER_OVERLAY
        {POINT_VIEWFINDER_OVERLAY, "viewfinder overlay"},
#endif
#ifdef POINT_PICTURE_ENCODE
        {POINT_PICTURE_ENCODE, "picture encode"},
#endif
        {0, 0},
    };
    for (u32 i = 0; known[i].name; ++i) {
        if (!(points & known[i].bit)) continue;
        if (!first) say(", ");
        say(known[i].name); first = 0;
        points &= ~known[i].bit;
    }
    if (points) { if (!first) say(", "); say("other bits "); say_hex(points); }
    say(")");
}
static const char *effect_status_name(u32 status)
{
    switch (status) {
    case EFFECT_LOADED: return "loaded";
    case EFFECT_OFF: return "off";
    case EFFECT_OVER: return "over the limit";
    case EFFECT_UNREADABLE: return "unreadable";
    default: return "unknown";
    }
}
/* The build and the relocation: the same from start to start on one
   firmware. */
static void say_build(void)
{
    say("Build: "); say(target_name()); say(" on firmware build word "); say_hex(rtos_identity_value);
    if (!relocation_done) { say(", not relocated"); nl(); return; }
    say("; image "); say_hex(RELOCATION_RTOS_BASE); say(".."); say_hex(relocation.image_end);
    say("; data "); say_hex(RELOCATION_DATA_START); say(" copied from "); say_hex(relocation.data_source);
    say(" ("); say_number(relocation.data_size); say(" bytes)");
    say("; bss "); say_hex(relocation.bss_start); say(".."); say_hex(relocation.bss_end);
    say("; core at "); say_hex(relocated[TAIL_SYMBOL]); say(" ("); say_number(TAIL_BYTES); say(" bytes), module code after it up to "); say_hex(CODE_END);
    nl();
    say("Relocation: "); say_number(relocation_tables.window_count); say(" windows ");
    say(relocation.searched ? "found by a search of the image" : "at their known addresses");
    say(relocation.hint ? " (GRKU\\RELOC.BIN had addresses)" : " (no GRKU\\RELOC.BIN)");
    say(", "); say_number(relocation_tables.symbol_count); say(" symbols; windows at");
    for (u32 w = 0; w < relocation_tables.window_count && w < RELOCATION_WINDOW_COUNT; ++w) { say(" "); say_hex(window_at[w]); }
    nl();
}
/* Each firmware patch: its address in the running build, its size, its
   kind (a hook over stock bytes, or code in the reserved area after the
   image), the extension points that need it, and whether this start
   applies it. */
static void say_patches(int status)
{
    u32 applied = 0;
    for (u32 i = 0; i < PATCH_COUNT; ++i) applied += applies(i) != 0;
    say("Patches: "); say_number(applied); say(" of "); say_number(PATCH_COUNT);
    say(status ? " planned" : " applied"); say(" for extension points "); say_hex(needed_points); say_points(needed_points); nl();
    for (u32 i = 0; i < PATCH_COUNT; ++i) {
        say("  "); say_hex(patches[i].address); say(" "); say_number(patches[i].size); say(" bytes, ");
        say(patches[i].kind ? "code in the reserved area" : "hook over stock bytes");
        say(", points "); say_hex(patch_points[i]); say(applies(i) ? (status ? ", planned" : ", applied") : ", not needed"); nl();
    }
}
/* Each module: its ID and file, where it comes from, its order and status,
   its code area, its capabilities, and its settings with their values at
   this start. */
static void say_modules_detail(void)
{
    u32 usable = 0;
    for (u32 i = 0; i < module_count; ++i) usable += module_usable >> i & 1;
    say("Modules: "); say_number(module_count); say(" listed, "); say_number(usable); say(" usable of "); say_number(GRKU_MODULES_MAX);
    say(" at most; "); say_number(module_code_bytes); say(" bytes of code, "); say_number(module_words); say(" words of module array, ");
    say_number(setting_total); say(" settings, "); say_number(module_tiles); say(" tiles; capabilities used "); say_hex(capabilities_used);
    say(", running "); say_hex(capabilities_running); nl();
    for (u32 i = 0; i < module_count; ++i) {
        char id[9];
        module_id(i, id);
        say("  "); say(id); say(" "); say(module_names[i]); say(module_source[i] ? " (GRKU\\MODULES)" : " (package)");
        say(", order "); say_number(module_order[i]);
        say(", status "); say_number(module_status[i]);
        if (module_status[i]) {
            say(" "); say(module_status[i] == MANAGE_SAFE ? "safe mode" : status_name(module_status[i]));
            if (module_detail[i][0]) { say(" "); say(module_detail[i]); }
        }
        if (module_code_to[i]) { say(", code "); say_hex(module_code_from[i]); say(".."); say_hex(module_code_to[i]); }
        if (module_usable >> i & 1) {
            say(", capabilities "); say_hex(module_capabilities[i]);
            say(", settings "); say_number(module_settings[i]); say(", uses "); say_number(module_use_count[i]);
            say(", first tile "); say_number(module_tile_first[i]);
        }
        if (module_position[i]) { say(", position "); say_number(module_position[i]); }
        if (module_off[i]) say(", Off");
        nl();
        if (!(module_usable >> i & 1)) continue;
        for (u32 k = module_first[i]; k < module_first[i] + module_settings[i] && k < setting_total; ++k) {
            u32 key = grm_state_id(setting_names[k]), value;
            int saved = state_value(&saved_state, key, &value);
            say("    "); say(setting_names[k]); say(" = "); say_number(state_setting_value(&saved_state, key, setting_defaults[k], setting_values[k]));
            say(" of "); say_number(setting_values[k]); say(saved ? " (saved)" : " (default)"); say(", state ID "); say_number(key); nl();
        }
    }
    if (all_off) { say("  Enable GRKU is Off: every module is loaded and stopped"); nl(); }
}
static void say_effects_detail(void)
{
    say("Effects: "); say_number(listed_count); say(" listed, "); say_number(count); say(" installed of "); say_number(MAX_COUNT);
    say(" at most, "); say_number(overflow_count); say(" past the list of "); say_number(EFFECTS_LISTED); nl();
    for (u32 i = 0; i < listed_count; ++i) {
        char id[GRKU_GRF_ID_MAX + 1]; u32 k = 0;
        while (k < GRKU_GRF_ID_MAX && listed[i][CATALOG_ID + k]) { id[k] = (char)listed[i][CATALOG_ID + k]; ++k; }
        id[k] = 0;
        say("  "); say(names[i]); say(" id "); say(id);
        say(", status "); say_number(listed_status[i]); say(" "); say(effect_status_name(listed_status[i]));
        say(", choice "); say_number(listed_choice[i]);
        if (listed_choice[i] & 1) say(" (Off)");
        if (listed_choice[i] >> 1) { say(" (position "); say_number(listed_choice[i] >> 1); say(")"); }
        say(", record "); if (listed_record[i] == EFFECTS_NO_RECORD) say("none"); else say_number(listed_record[i]);
        nl();
    }
}
/* The saved state: the core settings by name, then every pair of
   GRKU/STATE.TXT as the installer read it. */
static void say_state_detail(void)
{
    static const u32 ids[] = {CORE_STATE_IDS};
    u32 value;
    say("Core settings:");
    for (u32 k = 0; k < GRKU_CORE_SETTING_COUNT; ++k) {
        say(" "); say(core_setting_names[k]); say("=");
        if (state_value(&saved_state, ids[k], &value)) say_number(value); else say("default");
    }
    nl();
    say("State (GRKU\\STATE.TXT): "); say_number(saved_state.pairs); say(" pairs of state ID=value");
    for (u32 k = 0; k < saved_state.pairs && k < 128; ++k) {
        if (k % 8 == 0) { nl(); say("  "); } else say(" ");
        say_number(saved_state.ids[k]); say("="); say_number(saved_state.values[k]);
    }
    nl();
    if (saved_state.pairs > 128) { say("  and "); say_number(saved_state.pairs - 128); say(" more"); nl(); }
}
static void say_modes(void)
{
    say("Modes: safe "); say(safe_mode ? "on" : "off"); say(", profile "); say(profile_mode ? "on" : "off");
    nl();
}
static void say_details(int status)
{
    diag_eol = "\r\n";
    nl(); say("Details for a device report:"); nl();
    say_build();
    say_patches(status);
    say_modules_detail();
    say_effects_detail();
    say_state_detail();
    say_modes();
}
/* The Linux side of this start, as far as /proc tells (nothing on the RTOS
   side): the kernel, the uptime, and the memory. */
static void say_linux(void)
{
    static u8 raw[4096];
    long got = read_text("/proc/version", raw, sizeof(raw) - 1);
    if (got > 0) {
        say("linux ");
        for (long i = 0; i < got && raw[i] != '\n' && raw[i] != '('; ++i) { char c[2] = {(char)raw[i], 0}; say(c); }
        nl();
    }
    got = read_text("/proc/uptime", raw, sizeof(raw) - 1);
    if (got > 0) {
        say("uptime ");
        for (long i = 0; i < got && raw[i] != '\n'; ++i) { char c[2] = {(char)raw[i], 0}; say(c); }
        say(" (seconds up, seconds idle)"); nl();
    }
    got = read_text("/proc/meminfo", raw, sizeof(raw) - 1);
    if (got > 0) {
        u32 lines = 0, space = 0;
        say("memory ");
        for (long i = 0; i < got && lines < 2; ++i) {
            if (raw[i] == '\n') { ++lines; if (lines < 2) say(", "); space = 0; continue; }
            if (raw[i] == ' ') { if (space) continue; space = 1; } else space = 0;
            char c[2] = {(char)raw[i], 0}; say(c);
        }
        nl();
    }
}
/* The failure file after its status line (installer.c, create): the name
   and the meaning of the status, the step, how the start ran, the build and
   the relocation with its failures, the plan, the arrays, the patches, the
   modules, the effects, the Linux side, then the boot log of this start. */
static void failure_details(long fd, int status)
{
    static u8 ram_log[8192];
    report_length = 0;
    diag_eol = "\n";
    say("status "); say_number((u32)status); say(" "); say(status_name((u32)status)); say(": "); say(status_meaning((u32)status)); nl();
    say("step "); say(failed_step); nl();
    say("run GRKU "); say(GRKU_VERSION); say(" ("); say(target_name()); say("), "); say(run_mode);
    if (install_retries) { say(", "); say_number(install_retries); say(" retries of a native state that the camera still initialized"); }
    nl();
    say_build();
    for (u32 i = 0; i < relocation.failures && i < RELOCATION_REPORT; ++i) {
        const struct relocation_failure *f = &relocation.failure[i];
        say("relocation failure: "); say(relocation_reason(f->reason)); say(", index "); say_number(f->index);
        say(", address "); say_hex(f->address); say(", count "); say_number(f->count); nl();
    }
    if (relocation.failures > RELOCATION_REPORT) { say("relocation failures: "); say_number(relocation.failures); say(" in all"); nl(); }
    say("plan: "); say_number(count); say(" effects, "); say_number(listed_count); say(" listed, "); say_number(module_count); say(" modules, usable ");
    say_hex(module_usable); say(", "); say_number(module_words); say(" module words, "); say_number(module_tiles); say(" tiles, ");
    say_number(icon_chunks); say(" icon chunks, registry "); say_number(size); say(" bytes"); nl();
    if (arrays_known) {
        say("arrays: registry "); say_hex(installed_arrays.base); say(", tail "); say_hex(installed_arrays.tail); say(" ("); say_number(GRKU_TAIL_SIZE); say(" bytes)");
        if (installed_arrays.module_array) { say(", module array "); say_hex(installed_arrays.module_array); }
        say(", icon chunks");
        for (u32 i = 0; i < icon_chunks && i < MAX_CHUNKS; ++i) { say(" "); say_hex(installed_arrays.icon_bases[i]); }
        nl();
    }
    if (mailbox_address) { say("mailbox: "); say_hex(mailbox_address); nl(); }
    say_patches(status);
    say_modules_detail();
    say_effects_detail();
    say_modes();
    say_linux();
    long n = read_text(BOOT_RAM_LOG, ram_log, sizeof(ram_log) - 1);
    if (n > 0) { say("boot log of this start:"); nl(); ram_log[n] = 0; say((const char *)ram_log); }
    syscall6(4, fd, (u32)report_text, report_length, 0, 0, 0);
}
#ifndef RTOS_NATIVE
/* The lines of the boot log past the steps, with the numbers of this start
   (installer.c, log_text). */
static void log_environment(void)
{
    static u8 raw[4096];
    char text[200]; u32 n = 0;
    long got = read_text("/proc/version", raw, sizeof(raw) - 1);
    text_add(text, &n, sizeof(text), "linux ");
    for (long i = 0; i < got && raw[i] != '\n' && raw[i] != '(' && n < 120; ++i) { char c[2] = {(char)raw[i], 0}; text_add(text, &n, sizeof(text), c); }
    text_add(text, &n, sizeof(text), "pid "); text_dec(text, &n, sizeof(text), (u32)syscall6(20, 0, 0, 0, 0, 0, 0));
    log_text(text);
    got = read_text("/proc/meminfo", raw, sizeof(raw) - 1);
    if (got <= 0) return;
    n = 0;
    text_add(text, &n, sizeof(text), "memory ");
    u32 lines = 0, space = 0;
    for (long i = 0; i < got && lines < 2; ++i) {
        if (raw[i] == '\n') { ++lines; if (lines < 2) text_add(text, &n, sizeof(text), ", "); space = 0; continue; }
        if (raw[i] == ' ') { if (space) continue; space = 1; } else space = 0;
        char c[2] = {(char)raw[i], 0}; text_add(text, &n, sizeof(text), c);
    }
    log_text(text);
}
static void log_build(void)
{
    char text[200]; u32 n = 0;
    if (!relocation_done) return;
    text_add(text, &n, sizeof(text), "build id="); text_hex(text, &n, sizeof(text), rtos_identity_value);
    text_add(text, &n, sizeof(text), " image="); text_hex(text, &n, sizeof(text), relocation.image_end);
    text_add(text, &n, sizeof(text), " data="); text_hex(text, &n, sizeof(text), relocation.data_source);
    text_add(text, &n, sizeof(text), "+"); text_dec(text, &n, sizeof(text), relocation.data_size);
    text_add(text, &n, sizeof(text), " core="); text_hex(text, &n, sizeof(text), relocated[TAIL_SYMBOL]);
    text_add(text, &n, sizeof(text), " windows="); text_dec(text, &n, sizeof(text), relocation_tables.window_count);
    text_add(text, &n, sizeof(text), " searched="); text_dec(text, &n, sizeof(text), relocation.searched);
    text_add(text, &n, sizeof(text), " hint="); text_dec(text, &n, sizeof(text), relocation.hint != 0);
    log_text(text);
}
static void log_plan(void)
{
    char text[200]; u32 n = 0;
    text_add(text, &n, sizeof(text), "plan effects="); text_dec(text, &n, sizeof(text), count);
    text_add(text, &n, sizeof(text), " listed="); text_dec(text, &n, sizeof(text), listed_count);
    text_add(text, &n, sizeof(text), " over="); text_dec(text, &n, sizeof(text), overflow_count);
    text_add(text, &n, sizeof(text), " modules="); text_dec(text, &n, sizeof(text), module_count);
    text_add(text, &n, sizeof(text), " usable="); text_hex(text, &n, sizeof(text), module_usable);
    text_add(text, &n, sizeof(text), " code="); text_dec(text, &n, sizeof(text), module_code_bytes);
    text_add(text, &n, sizeof(text), " words="); text_dec(text, &n, sizeof(text), module_words);
    text_add(text, &n, sizeof(text), " tiles="); text_dec(text, &n, sizeof(text), module_tiles);
    text_add(text, &n, sizeof(text), " chunks="); text_dec(text, &n, sizeof(text), icon_chunks);
    text_add(text, &n, sizeof(text), " registry="); text_dec(text, &n, sizeof(text), size);
    text_add(text, &n, sizeof(text), " plan="); text_dec(text, &n, sizeof(text), get32(plan + GRKU_PLAN_SIZE));
    log_text(text);
}
static void log_install(void)
{
    char text[200]; u32 n = 0;
    if (arrays_known) {
        text_add(text, &n, sizeof(text), "arrays registry="); text_hex(text, &n, sizeof(text), installed_arrays.base);
        text_add(text, &n, sizeof(text), " tail="); text_hex(text, &n, sizeof(text), installed_arrays.tail);
        text_add(text, &n, sizeof(text), " module="); text_hex(text, &n, sizeof(text), installed_arrays.module_array);
        text_add(text, &n, sizeof(text), " mailbox="); text_hex(text, &n, sizeof(text), mailbox_address);
        text_add(text, &n, sizeof(text), " icons=");
        for (u32 i = 0; i < icon_chunks && i < MAX_CHUNKS; ++i) {
            if (i) text_add(text, &n, sizeof(text), ",");
            text_hex(text, &n, sizeof(text), installed_arrays.icon_bases[i]);
        }
        log_text(text);
        n = 0;
    }
    u32 applied = 0, loaded = 0;
    for (u32 i = 0; i < PATCH_COUNT; ++i) applied += applies(i) != 0;
    for (u32 i = 0; i < module_count; ++i) loaded += !module_status[i] && (module_usable >> i & 1);
    text_add(text, &n, sizeof(text), "patches applied="); text_dec(text, &n, sizeof(text), applied);
    text_add(text, &n, sizeof(text), "/"); text_dec(text, &n, sizeof(text), PATCH_COUNT);
    text_add(text, &n, sizeof(text), " points="); text_hex(text, &n, sizeof(text), needed_points);
    text_add(text, &n, sizeof(text), " modules="); text_dec(text, &n, sizeof(text), loaded);
    text_add(text, &n, sizeof(text), "/"); text_dec(text, &n, sizeof(text), module_count);
    text_add(text, &n, sizeof(text), " capabilities="); text_hex(text, &n, sizeof(text), capabilities_used);
    text_add(text, &n, sizeof(text), " running="); text_hex(text, &n, sizeof(text), capabilities_running);
    if (install_retries) { text_add(text, &n, sizeof(text), " retries="); text_dec(text, &n, sizeof(text), install_retries); }
    log_text(text);
}
#endif
#endif
