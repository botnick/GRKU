# The three files of a device report

GRKU writes three files on the card about each start. A person who asks for help sends them; a person who wants to know what the camera did reads them. This page says what each line means. The installer writes them from the state that a start kept in its own memory, never from the camera memory, so a report costs the camera nothing but the writes.

| File | Written by | When | For |
| --- | --- | --- | --- |
| `GRKU/BOOT.TXT` | `SCAN.SH`, `INSTALL.SH`, and the core (`CORE.BIN`) | at every start, one block of lines, in one write at the end of the start | the time of each step and the numbers of this start |
| `GRKU/REPORT.TXT` | the core | after an install, only when its text changed | the result for a person, then the facts of this card on this firmware |
| `SCRIPT/GRKU/INSTALL.ERR` | the loader (`LOADER.TTL`), then the core | before each step of the loader, and when a start stops | the status of a failure, its name and meaning, and the state at that point |

`INSTALL.ERR` disappears after a start that installed: the loader deletes it. `SCRIPT/GRKU/INSTALL.OK` exists instead. `GRKU/DIAG.TXT` is a fourth file, written only while `GRKU/DIAG` exists ([one-shot start](one-shot-start.md), section Diagnostics): the Linux side of the camera in full.

## BOOT.TXT

A text file that grows by one block at each start. Each line is the Linux uptime in seconds (two decimals, from `/proc/uptime`), a space, then the text of the line. The log keeps about 20 starts: past 400 lines, a start keeps the last 300 and its own.

The lines of one start on the official firmware, in order:

```text
6.91 load
6.93 start
6.95 scan-start
6.95 linux Linux version 3.10.108 pid 1234
6.96 memory MemTotal: 254896 kB, MemFree: 161820 kB
7.20 relocated 0
7.20 build id=0x4d3a1c00 image=0x5417b3c4 data=0x53f2a000+1872836 core=0x5417c000 windows=18 searched=0 hint=1
7.21 modules 9
7.24 library 0
7.31 listed 40
7.34 effects 40
7.40 scan 0
7.40 plan effects=40 listed=40 over=0 modules=9 usable=0x1ff code=187420 words=24210 tiles=52 chunks=3 registry=279528 plan=352040
7.41 started 0
7.41 plan 1
7.45 ramplan 0
7.52 install-start
7.95 install 0
7.95 arrays registry=0x5bd12000 tail=0x5bd57000 module=0x5bd8f000 mailbox=0x5bd0f800 icons=0x5bd56000,0x5bd80000,0x5bd8a000
7.95 patches applied=31/34 points=0x3f modules=9/9 capabilities=0x7 running=0x7 units=13
```

| Line | Who | Meaning |
| --- | --- | --- |
| `load` | `SCAN.SH` | the first `SCAN.SH` of this power-on: the camera mounted the card and ran the loader |
| `start` | `SCAN.SH` | `SCAN.SH` starts the core (`CORE.BIN --start`, `--start-known`, or `--start-try`) |
| `scan-start` | core | the core mapped the camera memory and goes on in a process of its own |
| `linux` | core | the kernel version of the camera's Linux, and the process ID of the core |
| `memory` | core | `MemTotal` and `MemFree` of `/proc/meminfo` at the start |
| `relocated N` | core | `0`: the private code relocated to the running build at the known addresses; `1`: a search of the image found them (the first start on a new firmware build); another number is a status (below) and the start stopped |
| `build` | core | `id`: the firmware build word at `RTOS_IDENTITY`; `image`: the end of the RTOS image; `data`: where the `.data` section is copied from, and its size; `core`: where the private code goes; `windows`, `searched`, `hint`: the relocation windows, whether the search ran, and whether `GRKU/RELOC.BIN` had addresses |
| `modules N` | core | `N` module files listed (the package and `GRKU/MODULES`) |
| `library N` | core | `N` effects of a new package moved into `GRKU/EFFECTS` |
| `listed N` | core | `N` effect files listed, with their reads |
| `effects N` | core | `N` effects chosen for the records, or a status |
| `scan N` | core | the plan is made: `0`, or a status |
| `plan` | core | the counts of the plan: effects installed, listed, past the list; modules listed and the usable ones as a bit mask; the bytes of module code; the words of the module array; the module tiles; the icon chunks; the bytes of the registry and of the whole plan |
| `started N` | `SCAN.SH` | `SCAN.SH` returned with exit status `N`; the loader request ended |
| `plan N` | core | the plan header was posted: `1` into the mailbox, `0` only to the card (`PLAN.BIN`) |
| `plan-file N` | core | the plan header did not reach the card: a status |
| `ramplan N` | core | the whole plan was written to `/tmp` for `INSTALL.SH`: `0`, or a status |
| `install-start` | core or `INSTALL.SH` | the loader allocated the arrays; INSTALL begins |
| `install N` | core or `INSTALL.SH` | the result: `0`, the hooks are live and GRKU appears in ADJ; or a status |
| `arrays` | core | the addresses that the loader allocated: the registry (the header and the effect records), the tail (the working memory of the hooks), the module array, the mailbox, and each icon chunk |
| `patches` | core | the firmware patches applied of the total, and the extension points that needed them as a bit mask; the modules loaded of the listed; the capabilities that the modules use and those running; `units`: the snap focus distance labels changed to feet (only with `GRKU/FEET.TXT`); `retries`: how often INSTALL waited for a native state that the camera still initialized |
| `fast-boot ...` | loader | only with the optional fast-boot files: why the start did not use them |

`install 0` is the time at which GRKU appears in ADJ. A `linux`, `memory`, `build`, `plan`, `arrays`, and `patches` block from `INSTALL.SH` (the fallback of the loader) looks the same.

## REPORT.TXT

The report for a person first, then the details. The first part:

```text
GRKU 1.5.2 (gr4-1.11)

Modules (the package, and GRKU\MODULES):
FILMLOOK.GRM  loaded
FRAMING.GRM  loaded
LEAK.GRM  loaded, stopped: Enable is Off in the GRKU section of MENU
HELLO.GRM (GRKU\MODULES)  not loaded: error 51, it needs another version of GRKU

Effects (GRKU\EFFECTS):
Portra 400 (PORTRA40.GRF)  loaded
Tri-X 400 (TRIX400.GRF)  loaded, hidden: Off in the GRKU section of MENU
```

A start that stopped says so after the first line: `GRKU did not install: error 47 (STATUS_RELOCATION): the core does not relocate to the running firmware build.` Safe mode (`GRKU/SAFE`) and the profile (`GRKU/PROFILE`) each have a line when they are on.

Then `Details for a device report:`

| Line | Meaning |
| --- | --- |
| `Build:` | the target of this installer; the firmware build word; the RTOS image, its `.data` source and size, its `.bss`; where the private code of GRKU goes and how many bytes it has; the end of the area for module code |
| `Relocation:` | the windows of the relocation, how they were found (at their known addresses, or by a search of the image), whether `GRKU/RELOC.BIN` had addresses, the symbols, and the address of each window |
| `Patches:` | the firmware patches applied of the total, and the extension points that need them; then one line for each patch: its address in the running build, its size, its kind (a hook over stock bytes, or code in the reserved area after the image), the points that need it, and whether this start applied it (`not needed`: no loaded module uses that point) |
| `Modules:` | the modules listed, the usable ones, the limit; the module code bytes, the words of the module array, the settings, the tiles; the capabilities used and running. Then each module: its ID and file, its folder, its order (its place in ADJ and MENU), its status (`0`, or a number with its name and detail), its code area, its capabilities, the number of its settings, the settings it uses from other modules, its first tile, its position when a person moved it, `Off` when a person turned it off. Under a usable module, each setting: `ID.KEY = value of values (saved or default), state ID n`, the value at this start and the key of `GRKU/STATE.TXT` that keeps it |
| `Effects:` | the effects listed, installed, the limit, and those past the list of 64; then each effect: its file, its ID, its status (`loaded`, `off`, `over the limit`, `unreadable`), its choice (`Off`, and its position when a person moved it), and its record (its index among the installed effects, or `none`) |
| `Core settings:` | the five core settings, `CORE.TONE` (the effect), `CORE.ASPECT`, `CORE.GRAIN`, `CORE.GRAIN_SIZE`, `CORE.ASPECT_MODE`, with the saved value or `default` |
| `State (GRKU\STATE.TXT):` | every pair of the state file as the installer read it, `state ID=value`, eight to a line, the first 128 |
| `Modes:` | safe mode, profile, and the feet labels (`on, 13 labels changed`, or `off`) |

The details are the same at each start while the card and the firmware are, so the report is rewritten only when something changed: a module, an effect, a setting, a firmware update.

## INSTALL.ERR

The first line is the status, a number, which the loader also reads. Nothing else of the file is fixed.

The loader writes the file before each of its steps and deletes it after the install, so a camera that never ran Linux leaves the loader's version:

```text
60
120
mailbox started 0 plan 0 result 0 status 0 arrays 0
```

Line 1 is the step: `60` SCAN wrote no plan, `61` the plan header is not valid, `62` INSTALL did not answer. Line 2 counts the attempts of the loader (polls of 100 ms). Line 3 is what the loader saw in the mailbox when it stopped: `started` is 1 once the core ran, `plan` is 826561095 (the magic word `GRM1`) once the core posted the plan header, `result` is 1 after an install or 2 after a failure, `status` is the status of that failure, and `arrays` is 1 once the loader allocated the arrays. A start that reached Linux but did not finish shows `started 1 plan 0`: the core ran and stopped before its plan, so the core's own file, below, says why.

When the core stops, it replaces the file with its status and the state of the start:

```text
47
02 0003 5300a1c0 00000000
status 47 STATUS_RELOCATION: the core does not relocate to the running firmware build
step relocate
run GRKU 1.5.2 (gr4-1.11), one-shot start
Build: gr4-1.11 on firmware build word 0x4d3a1c01, not relocated
relocation failure: a window has no match, index 3, address 0x5300a1c0, count 0
plan: 0 effects, 0 listed, 0 modules, usable 0x0, 0 module words, 0 tiles, 0 icon chunks, registry 0 bytes
Patches: 0 of 34 planned for extension points 0x0 (none)
  ...
Modules: 0 listed, ...
Effects: 0 listed, ...
Modes: safe off, profile off, feet labels off
linux Linux version 3.10.108
uptime 7.21 6.02 (seconds up, seconds idle)
memory MemTotal: 254896 kB, MemFree: 161820 kB
boot log of this start:
6.93 start
6.95 scan-start
6.95 linux Linux version 3.10.108 pid 1234
7.20 relocated 47
```

| Line | Meaning |
| --- | --- |
| the first line | the status (the table below) |
| hex lines after a status 47 | one for each relocation failure: the reason, the window or symbol index, the pinned address, and a count or value, as eight hex digits each (`runtime/relocation.h`); the `relocation failure:` lines below say the same in words |
| `status` | the status, its name in the source, and its meaning in one sentence |
| `step` | where the start stopped: `relocate`, `scan` (the plan), `plan` (posting the plan), `arrays` (waiting for the loader), `install` |
| `run` | the version and target, how the core ran (`one-shot start` from `SCAN.SH`, or `INSTALL.SH`, the fallback), and the retries of a native state that the camera still initialized |
| `Build:` to `Modes:` | as in `REPORT.TXT`, as far as the start got: a failure before the plan has empty counts |
| `arrays:` | the arrays, when the start got them |
| `mailbox:` | the address of the mailbox of the one-shot start |
| `linux`, `uptime`, `memory` | the Linux side at the failure |
| `boot log of this start:` | the lines of `BOOT.TXT` of this start, so that the one file tells the story |

### The statuses

The number never changes meaning between versions (`runtime/install_status.h`). The modules page of MENU shows the module statuses after a module name, such as `HELLO (51)`.

| Status | Name | Meaning |
| --- | --- | --- |
| 1, 2 | `STATUS_NO_MEMORY`, `STATUS_NO_MAPPING` | `/dev/mem` does not open, or does not map the camera memory |
| 3 | `STATUS_BUSY` | another SCAN or INSTALL attempt of this power-on runs or ran |
| 4 | `STATUS_NO_PROCESS` | the one-shot start could not make the process that installs |
| 10, 11 | `STATUS_ARRAYS`, `STATUS_ARRAY_MEMORY` | the script arrays are not the ones that the plan asked for, or their memory is not valid |
| 12, 14, 26, 39 | `*_NOT_READY` | a native state that the camera still initializes (language, Standard record, icon drawer, settings); INSTALL tries again, so this status is rarely final |
| 13, 17 | `STATUS_STOCK_RECORD`, `STATUS_TONE_TABLES` | Image Control changed since startup |
| 16 | `STATUS_STOCK_BYTES` | the firmware at a hook site is not the stock code (another patch, or another build) |
| 21 | `STATUS_SYNC` | a cache sync of written memory failed |
| 23, 24 | `STATUS_ROLLED_BACK`, `STATUS_ROLLBACK_FAILED` | a patch did not publish; after 24 the firmware may keep some patches until a power cycle |
| 30, 31 | `STATUS_LIBRARY_*` | the effects library does not list, or a directory record is not valid |
| 36, 37 | `STATUS_PLAN_WRITE`, `STATUS_PLAN` | SCAN could not write the plan; INSTALL found no valid plan or one that does not match the card |
| 45 | `STATUS_TAIL_USED` | the firmware keeps data where the core goes |
| 47 | `STATUS_RELOCATION` | the core does not relocate to the running firmware build (a firmware version this package does not know) |
| 48 | `STATUS_OTHER_BUILD` | this installer does not name the running build; the package runs its next installer |
| 50 to 56 | `GRM_*` | a module did not link: not a module file, another version, a missing function, a bad description, no room, a missing setting, a color-only module on a monochrome camera |
| 60, 61, 62 | `STATUS_LOADER_*` | the loader stopped: no plan, a bad plan header, or INSTALL did not answer |

## Sending a report

Copy the three files from the card (and `GRKU/DIAG.TXT` when a maintainer asked for it) and attach them to the issue, with the camera model and the firmware version. The files hold no personal data: no serial number, no photo, no setting beyond the GRKU ones.
