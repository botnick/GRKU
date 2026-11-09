#ifndef GRKIT_INSTALL_REPORT_H
#define GRKIT_INSTALL_REPORT_H
/* A part of the installer: GRKU/REPORT.TXT. installer.c includes it once, in
   its order, after the helpers and the state that this part uses.

   The result of each boot for a person: the modules and why one did not
   load, the effects, the safe mode, then the details for a device report
   (install_diag.h: the build, the relocation, each patch, each module with
   its settings, each effect, the saved state). INSTALL writes it only when
   its text changes, in place: on GR IV exFAT a rename that replaces a file
   made the later requests of the camera fail. So the report holds only what
   is the same from start to start while the card and the firmware are; the
   numbers of one start go to the boot log. The report reads the state that
   the start kept, never the camera memory, which INSTALL unmaps before it. */
#define REPORT_MAX 32768U
static char report_text[REPORT_MAX + 1], report_old[REPORT_MAX + 1];
static u32 report_length;
__attribute__((noinline)) static void say(const char *text)
{
    while (*text && report_length < REPORT_MAX) report_text[report_length++] = *text++;
}
__attribute__((noinline)) static void say_number(u32 value) { char d[12]; u32 n = 0; text_dec(d, &n, sizeof(d), value); say(d); }
__attribute__((noinline)) static void say_hex(u32 value) { char d[12]; u32 n = 0; text_hex(d, &n, sizeof(d), value); say(d); }
/* The name of a status, as the source names it (runtime/install_status.h,
   the GRM_* of runtime/module_link.h, and the statuses of the loader). */
static const char *status_name(u32 status)
{
    switch (status) {
    case STATUS_OK: return "STATUS_OK";
    case STATUS_NO_MEMORY: return "STATUS_NO_MEMORY";
    case STATUS_NO_MAPPING: return "STATUS_NO_MAPPING";
    case STATUS_BUSY: return "STATUS_BUSY";
    case STATUS_NO_PROCESS: return "STATUS_NO_PROCESS";
    case STATUS_ARRAYS: return "STATUS_ARRAYS";
    case STATUS_ARRAY_MEMORY: return "STATUS_ARRAY_MEMORY";
    case STATUS_LANGUAGE_NOT_READY: return "STATUS_LANGUAGE_NOT_READY";
    case STATUS_STOCK_RECORD: return "STATUS_STOCK_RECORD";
    case STATUS_RECORD_NOT_READY: return "STATUS_RECORD_NOT_READY";
    case STATUS_STOCK_BYTES: return "STATUS_STOCK_BYTES";
    case STATUS_TONE_TABLES: return "STATUS_TONE_TABLES";
    case STATUS_SYNC: return "STATUS_SYNC";
    case STATUS_ROLLED_BACK: return "STATUS_ROLLED_BACK";
    case STATUS_ROLLBACK_FAILED: return "STATUS_ROLLBACK_FAILED";
    case STATUS_ICONS_NOT_READY: return "STATUS_ICONS_NOT_READY";
    case STATUS_LIBRARY_UNREADABLE: return "STATUS_LIBRARY_UNREADABLE";
    case STATUS_LIBRARY_BAD_RECORD: return "STATUS_LIBRARY_BAD_RECORD";
    case STATUS_PLAN_WRITE: return "STATUS_PLAN_WRITE";
    case STATUS_PLAN: return "STATUS_PLAN";
    case STATUS_SETTINGS_NOT_READY: return "STATUS_SETTINGS_NOT_READY";
    case STATUS_USAGE: return "STATUS_USAGE";
    case STATUS_NO_HEADER: return "STATUS_NO_HEADER";
    case STATUS_NO_EFFECT: return "STATUS_NO_EFFECT";
    case STATUS_TAIL_USED: return "STATUS_TAIL_USED";
    case STATUS_RELOCATION: return "STATUS_RELOCATION";
    case STATUS_OTHER_BUILD: return "STATUS_OTHER_BUILD";
    case GRM_BAD_FILE: return "GRM_BAD_FILE";
    case GRM_BAD_ABI: return "GRM_BAD_ABI";
    case GRM_MISSING_IMPORT: return "GRM_MISSING_IMPORT";
    case GRM_BAD_DESCRIPTOR: return "GRM_BAD_DESCRIPTOR";
    case GRM_NO_ROOM: return "GRM_NO_ROOM";
    case GRM_MISSING_SETTING: return "GRM_MISSING_SETTING";
    case GRM_COLOR_ONLY: return "GRM_COLOR_ONLY";
    case STATUS_LOADER_NO_PLAN: return "STATUS_LOADER_NO_PLAN";
    case STATUS_LOADER_BAD_PLAN: return "STATUS_LOADER_BAD_PLAN";
    case STATUS_LOADER_NO_INSTALL: return "STATUS_LOADER_NO_INSTALL";
    default: return "STATUS_UNKNOWN";
    }
}
/* What a status means, in one sentence (the comments of install_status.h). */
static const char *status_meaning(u32 status)
{
    switch (status) {
    case STATUS_OK: return "installed";
    case STATUS_NO_MEMORY: return "/dev/mem does not open";
    case STATUS_NO_MAPPING: return "/dev/mem does not map the camera memory";
    case STATUS_BUSY: return "another SCAN or INSTALL attempt of this power-on runs or ran";
    case STATUS_NO_PROCESS: return "the one-shot start could not make the process that installs";
    case STATUS_ARRAYS: return "the script arrays are not the ones that the plan asked for";
    case STATUS_ARRAY_MEMORY: return "the memory of a script array is not valid, or two arrays overlap";
    case STATUS_LANGUAGE_NOT_READY: return "the camera has not set its language yet; INSTALL tries again";
    case STATUS_STOCK_RECORD: return "the Standard record of Image Control changed since startup";
    case STATUS_RECORD_NOT_READY: return "the Standard record is not initialized yet; INSTALL tries again";
    case STATUS_STOCK_BYTES: return "the firmware at a hook site is not the stock code";
    case STATUS_TONE_TABLES: return "the Image Control tables changed since startup";
    case STATUS_SYNC: return "a cache sync of written memory failed";
    case STATUS_ROLLED_BACK: return "a patch did not publish; the earlier patches were rolled back";
    case STATUS_ROLLBACK_FAILED: return "a patch did not publish, and the rollback failed too: power the camera off and on";
    case STATUS_ICONS_NOT_READY: return "the icon drawer does not exist yet; INSTALL tries again";
    case STATUS_LIBRARY_UNREADABLE: return "the effects library GRKU\\EFFECTS does not list";
    case STATUS_LIBRARY_BAD_RECORD: return "a directory record of the effects library is not valid";
    case STATUS_PLAN_WRITE: return "SCAN could not write the plan to the card";
    case STATUS_PLAN: return "INSTALL found no valid plan, or one that does not match the modules and effects on the card";
    case STATUS_SETTINGS_NOT_READY: return "the native settings are not initialized yet; INSTALL tries again";
    case STATUS_USAGE: return "the command line names no known mode";
    case STATUS_NO_HEADER: return "diagnostic build: no GRKU header in memory";
    case STATUS_NO_EFFECT: return "diagnostic build: no effect with that ID";
    case STATUS_TAIL_USED: return "the firmware keeps data where the core goes";
    case STATUS_RELOCATION: return "the core does not relocate to the running firmware build";
    case STATUS_OTHER_BUILD: return "the core does not name the running firmware build";
    case GRM_BAD_FILE: return "not a module file that this version reads";
    case GRM_BAD_ABI: return "the module needs another version";
    case GRM_MISSING_IMPORT: return "the module calls a function that the core does not have";
    case GRM_BAD_DESCRIPTOR: return "the description of the module is not valid";
    case GRM_NO_ROOM: return "the modules need more memory than there is";
    case GRM_MISSING_SETTING: return "the module uses a setting that no module has";
    case GRM_COLOR_ONLY: return "the module needs a camera with a color sensor";
    case STATUS_LOADER_NO_PLAN: return "the loader: SCAN wrote no plan";
    case STATUS_LOADER_BAD_PLAN: return "the loader: the plan header is not valid";
    case STATUS_LOADER_NO_INSTALL: return "the loader: INSTALL did not answer";
    default: return "no such status";
    }
}
/* Why a module did not load (runtime/module_link.h). */
static const char *module_reason(u32 status)
{
    switch (status) {
    case GRM_BAD_FILE: return "it is not a module file that this GRKU reads";
    case GRM_BAD_ABI: return "it needs another version of GRKU";
    case GRM_MISSING_IMPORT: return "it calls a function that GRKU does not have: ";
    case GRM_BAD_DESCRIPTOR: return "its description is not valid";
    case GRM_NO_ROOM: return "the modules need more memory than GRKU has";
    case GRM_MISSING_SETTING: return "it uses a setting that no module has: ";
    default: return "INSTALL stopped";
    }
}
/* The recipes part of REPORT.TXT: the count, the recipes that are on, those
   that INSTALL turned off past GRKIT_RECIPE_ON_MAX, the import of a package
   library, then each recipe that is on and cannot apply in full
   (check_recipes). */
static void say_recipes(void)
{
    if (!recipes_count && recipes_import == RECIPES_IMPORT_NONE) return;
    say("\r\nRecipes (GRKIT\\RECIPES.TXT): "); say_number(recipes_count); say(" of "); say_number(GRKIT_RECIPE_SLOTS);
    say(", "); say_number(recipes_on); say(" on of "); say_number(GRKIT_RECIPE_ON_MAX);
    if (recipes_turned_off) { say(", "); say_number(recipes_turned_off); say(" turned off"); }
    say("\r\n");
    if (recipes_import == RECIPES_IMPORT_DAMAGED)
        say("The recipes of the package are damaged: none added. Download GRKit again.\r\n");
    else if (recipes_import == RECIPES_IMPORT_READ) {
        say("From the package: "); say_number(recipes_added); say(" added");
        if (recipes_same) { say(", "); say_number(recipes_same); say(" already there"); }
        if (recipes_switched) { say(", "); say_number(recipes_switched); say(" turned on or off"); }
        if (recipes_full) { say(", "); say_number(recipes_full); say(" left out: at most "); say_number(GRKIT_RECIPE_SLOTS); }
        if (recipes_other) { say(", "); say_number(recipes_other); say(" of another camera"); }
        if (recipes_bad) { say(", "); say_number(recipes_bad); say(" not valid"); }
        say("\r\n");
    }
    if (!recipe_problem_count) return;
    say("Recipes that do not apply in full:\r\n");
    for (u32 i = 0; i < recipe_problem_count; ++i) {
        const struct recipe_problem *p = &recipe_problems[i];
        if (p->name[0]) say(p->name);
        else { say("recipe "); say_number(p->recipe); }
        say(p->problem == RECIPE_PROBLEM_EFFECT ? ": its effect is not installed, or Film Look does not run\r\n" :
            p->problem == RECIPE_PROBLEM_GRAIN ? ": its Grain needs the Grain module\r\n" :
            ": its Glow needs the Glow module\r\n");
    }
    if (recipe_problems_more) { say("and "); say_number(recipe_problems_more); say(" more\r\n"); }
}
/* The details for a device report (install_diag.h). */
static void say_details(int status);
static void write_report(int status)
{
    report_length = 0;
    say("GRKU "); say(GRKIT_VERSION); say(" ("); say(target_marker + sizeof("GRKIT_TARGET=") - 1); say(")\r\n");
    if (status) {
        say("\r\nGRKU did not install: error "); say_number((u32)status); say(" ("); say(status_name((u32)status));
        say("): "); say(status_meaning((u32)status)); say(".\r\n");
    }
    if (safe_mode) say("\r\nSafe mode: GRKU\\SAFE exists, so no module loads. Delete it to load the modules.\r\n");
    if (profile_mode) say("\r\nProfile: GRKU\\PROFILE exists, so GRKU writes its CPU use to GRKU\\PROFILE.LOG. Delete it to stop.\r\n");
    say("\r\nModules (the package, and GRKU\\MODULES):\r\n");
    if (!module_count) say("none\r\n");
    for (u32 i = 0; i < module_count; ++i) {
        say(module_names[i]);
        if (module_source[i]) say(" (GRKU\\MODULES)");
        u32 result = module_status[i];
        if (!result && (module_usable >> i & 1))
            say(module_off[i] ? "  loaded, stopped: Enable is Off in the GRKU section of MENU\r\n" :
                !all_off ? "  loaded\r\n" :
                start_choice == MANAGE_START_OFF ? "  loaded, stopped: Enable at Start is Off in the GRKU section of MENU\r\n" :
                "  loaded, stopped: Enable GRKU is Off in the GRKU section of MENU\r\n");
        else if (result == MANAGE_SAFE) say("  not loaded: safe mode\r\n");
        else if (result == GRM_COLOR_ONLY) say("  not loaded: it needs a camera with a color sensor\r\n");
        else {
            say("  not loaded: error "); say_number(result); say(", "); say(module_reason(result));
            say(module_detail[i]); say("\r\n");
        }
    }
    if (module_overflow) {
        say_number(module_overflow);
        say(" more module files are not loaded. GRKU loads at most "); say_number(GRKIT_MODULES_MAX); say(" modules.\r\n");
    }
    say("\r\nEffects (GRKU\\EFFECTS):\r\n");
    if (!listed_count) say(tone_used() ? "none\r\n" : "none: no module uses them\r\n");
    for (u32 i = 0; i < listed_count; ++i) {
        char name[CATALOG_EFFECT_NAME_MAX + 1]; u32 k = 0;
        while (k < CATALOG_EFFECT_NAME_MAX && listed[i][CATALOG_EFFECT_NAME + k]) { name[k] = (char)listed[i][CATALOG_EFFECT_NAME + k]; ++k; }
        name[k] = 0;
        say(name); say(" ("); say(names[i]); say(")");
        if (listed_status[i] == EFFECT_LOADED)
            /* After INSTALL, the effects are of no use without a loaded
               module that uses them, such as Film Look on GR IV Monochrome. */
            say(status || (capabilities_used & GRKIT_CORE_TONE_BIT) ? "  loaded\r\n" : "  not used: no loaded module uses effects\r\n");
        else if (listed_status[i] == EFFECT_OFF && listed_record[i] != EFFECTS_NO_RECORD)
            say("  loaded, hidden: Off in the GRKU section of MENU\r\n");
        else if (listed_status[i] == EFFECT_OFF) say("  not loaded: Off in the GRKU section of MENU\r\n");
        else if (listed_status[i] == EFFECT_OVER) { say("  not loaded: GRKU installs at most "); say_number(MAX_COUNT); say(" effects\r\n"); }
        else say("  not loaded: the file changed during the start\r\n");
    }
    if (overflow_count) {
        say_number(overflow_count);
        say(" more effect files are not listed. GRKU lists at most "); say_number(EFFECTS_LISTED); say(" effects.\r\n");
    }
    say_recipes();
    say_details(status);
    /* A new card has no GRKU folder until this start. */
    long made = syscall6(39, (u32)data_path, 0755, 0, 0, 0, 0);
    if (made < 0 && made != -17) return;
    long had = read_text(report_path, (u8 *)report_old, sizeof(report_old));
    if (had == (long)report_length && equal((const u8 *)report_old, (const u8 *)report_text, report_length)) return;
    write_file(report_path, (const u8 *)report_text, report_length);
}
#endif
