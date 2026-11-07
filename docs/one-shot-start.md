# One-shot start

This fork loads GRKit with one request to the camera's Linux at each power-on, instead of the two of GRKit 1.3 to 1.5 (SCAN, then INSTALL). GRKit still runs from the SD card only: it never writes to the firmware, and the SD script setting of the camera stays on until the disable package turns it off, as before.

## Why the start was slow

On a GR III, the camera's Linux runs commands about 4.2 s after power-on and mounts the card about 6 to 7 s after power-on (ahonn, issue #59). GRKit 1.5 then loaded at 8 to 10 s. So 2 to 3 s went by between the mount and the hooks, and all of it was on the Linux side.

The card is not a block device on the camera's Linux. It is `ipcufs`, a file system served by the RTOS over the inter-processor channel (the 1.3.1 loader mounted it as `mount -t ipcufs mnt /tmp/m -ofs=1`). Each open, read, write, rename, and listing is a request to the RTOS. The loader of 1.5 made these requests after the mount, for a GR III package with 6 modules and 21 effects:

| Step | Requests to the card |
| --- | --- |
| `lcmd sh SCAN.SH` | `sh` reads the script; the kernel reads `CORE.BIN` (452 KB) to run it |
| `CORE.BIN --scan` | lists the module folders, reads each module file (345 KB), lists the library, reads each effect twice (2 x 180 KB), reads the state and the package list, writes `PLAN.TMP`, renames it to `PLAN.BIN` |
| `SCAN.SH` | three appends to `BOOT.TXT` |
| loader | reads the 28 bytes of the plan header one at a time through the RTOS file system |
| `lcmd sh INSTALL.SH` | `sh` reads the script; the kernel reads `CORE.BIN` again (452 KB) |
| `CORE.BIN --install` | creates `INSTALL.LCK`, reads each module file again, twice (2 x 345 KB), writes `REPORT.TXT` when it changed, creates `INSTALL.OK` |
| `INSTALL.SH` | two appends to `BOOT.TXT` |

About 2.4 MB of reads, two program loads, and about ten card writes, each a round trip to the RTOS. The measured savings of 1.3.1 ("keep the plan in RAM": 0.65 s for 350 KB written and read back) give the order of magnitude: each such request costs tens to hundreds of milliseconds.

## What the one-shot start does

`SCAN.SH` runs `CORE.BIN --start` once. The core checks the build (as `--known` or `--try` do in a package with several builds), then forks. The parent returns to the shell at once, so the request of the loader ends. The child, in a session of its own and with no descriptor of the request:

1. maps the camera memory once and resolves the relocation (milliseconds with `RELOC.BIN`);
2. posts `started` into the **mailbox**, the second script array of the loader (`abi::MAILBOX_FIELDS`), so the loader sends no second `SCAN.SH`;
3. scans: lists the modules and the effects, reading each file from the card once (`read_whole` keeps a copy under `/tmp`, which is RAM, for the second and third reads of the same start);
4. posts the plan header into the mailbox, then writes `PLAN.BIN` on the card as before, for a loader that does not see the mailbox and for `INSTALL.SH`;
5. waits until the loader allocated the arrays of the plan: the loader posts `arrays` after its last `intdim`, and the array table shows the arrays;
6. installs, with the retries of a native state that the camera still initializes (every 0.1 s for 30 s, then every 10 s), without a second program load, a second relocation, or a second read of the modules;
7. posts the result into the mailbox, writes `INSTALL.OK` or `INSTALL.ERR`, `REPORT.TXT` when it changed, and the boot log of the start in one write.

The loader polls the mailbox every 150 ms, and the card files as before. So a mailbox that the loader does not see costs only the time of the file writes, and the start still loads. After each 10 s without a result, the loader sends `INSTALL.SH`, which installs from the plan in RAM with `--install`, unless the process of the start still runs.

Requests to the card after the mount, in a steady-state start: one `sh`, one program load, one read of each module and effect, `PLAN.TMP` and its rename, `INSTALL.OK`, the boot log, and the `load` line of `SCAN.SH`. About 1 MB of reads and four writes.

## Mailbox

| Word | Field | Who writes | Meaning |
| --- | --- | --- | --- |
| 0 to 9 | `MAILBOX_PLAN` | start | the plan header (`abi::PLAN_FIELDS`), word 0 last |
| 10 | `MAILBOX_RESULT` | start | 1 installed, 2 failed |
| 11 | `MAILBOX_STATUS` | start | the status of a failure (`runtime/install_status.h`) |
| 12 | `MAILBOX_STARTED` | start | 1 once a start runs |
| 13 | `MAILBOX_ARRAYS` | loader | 1 once the arrays of the plan exist |

The loader clears the words it reads before it sends the start. The start writes through the `/dev/mem` mapping with a barrier before each word that the loader waits for, and cleans the cache of the mailbox after each post, as the installer does for the records. The 1.3.1 loader used the same mailbox for its plan header and result on GR III, GR IIIx, and GR IV cameras.

`ARRAY_LEAD` in `runtime/installer.c` is 2: the probe array of the fast-boot firmware, then the mailbox. The RTOS-side installer of the fast-boot files uses the same code, so a package still works on both firmwares, and the fast-boot path still reads the plan from the card.

## Files

| Path | Contents |
| --- | --- |
| `/tmp/grkit-start.lck` | the lock of the start: `SCAN.SH` leaves at once while it exists |
| `/tmp/grkit-core.pid` | the process of the start, which `INSTALL.SH` checks |
| `/tmp/grkit-boot.log` | the boot log of the start, until the start writes it to `GRKIT/BOOT.TXT` |
| `/tmp/grkit-cache/` | the copies of the card files that the start read |
| `/tmp/grkit-plan.bin` | the whole plan, as before |
| `GRKIT/DIAG` | while it exists, `SCAN.SH` writes `GRKIT/DIAG.TXT` about 15 s after the start |

RAM is empty at each power-on, so none of the `/tmp` files reaches another start.

## Boot log

`GRKIT/BOOT.TXT` keeps the lines of 1.5, so earlier reports still read, plus the lines of the start. Each line is the Linux uptime in seconds, the step, and a status:

```text
6.91 load            SCAN.SH ran for the first time: the camera mounted the card
6.93 start           SCAN.SH starts the core
6.95 scan-start      the start maps the memory and relocates
7.40 scan 0          the plan is made and posted
7.41 started 0       SCAN.SH returned (the loader request ended)
7.52 install-start   the loader allocated the arrays
7.95 install 0       the hooks are live
```

`install 0` is the time at which GRK appears in ADJ. Send `GRKIT/BOOT.TXT` and `GRKIT/REPORT.TXT` with a device report, as before.

## Diagnostics

Create an empty file `GRKIT/DIAG` on the card. At the next start, `SCAN.SH` writes `GRKIT/DIAG.TXT` about 15 s later: the mounts and their options, the file systems, the kernel, the busybox commands, the processes, the system log, the RAM boot log, and the uptime before and after two reads of `CORE.BIN`, one read of the effects, and two small writes. The reads give the speed of the card file system and whether a second read of the same file is cheaper (the page cache). Delete `GRKIT/DIAG` afterwards.

## Next step: start before the camera mounts the card

The one-shot start works after the mount, at 6 to 7 s. Linux runs commands from 4.2 s. The loader of 1.3.1 and 1.3.2 mounted `ipcufs` itself at 4.2 s, copied the package to RAM, released the mount, and ran SCAN from RAM, which loaded GRKit in 3 to 6 s. It was withdrawn in 1.3.3, because the camera's own mount failed while the loader held the card, and an unmount after that failure stopped Linux; a few cameras, new cards, and exFAT cards with macOS files hit this. Nothing about the firmware forbids it; the timing did.

A later version of this fork can take that 2 to 3 s back on the official firmware, without a firmware change, if the measurements of `DIAG.TXT` say that the work fits before the camera's mount:

1. At 4.2 s, mount `ipcufs` at a private mount point, copy `CORE.BIN`, the modules, the effects, and the state into RAM, and unmount. With about 1 MB to copy, this takes as long as a read of that size takes on `ipcufs` (`DIAG.TXT`, `read-core`).
2. Run the one-shot start from the RAM copy. It needs no card until its result.
3. Write the results after the camera's mount, as `FINISH.SH` of 1.3.1 did.

The rules of 1.3.1 still hold: the fast path must give the card back before the camera's mount, with a margin measured on that camera, and a start that comes close turns the fast path off until the next package. See `git show 54039a0` for the measured deadlines and `git show eb4bdd0` for why it was withdrawn.
