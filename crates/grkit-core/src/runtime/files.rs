//! The runtime files of a package: the startup and loader scripts, the
//! package scripts, the core files, and the files that turn SD scripts on or
//! off.

use super::fastboot::{fast_files, fast_run_path, FAST_RUN};
use super::loader::{core_path, loader_with};
use super::ICON_STRIDE;
use crate::camera::Camera;
use crate::card::{
    INSTALL_FILE, LINUX_DATA_DIRECTORY, LINUX_DIRECTORY, LOADER_FILE, PACKAGE_FOLDER, SCAN_FILE,
};
use crate::Files;

/// The files that enable SD scripts when the camera starts with MENU held.
pub fn activation_files(camera: &Camera) -> Files {
    modeset_files(camera, b"[SCRIPT_EN_MODE EN]\r\n")
}

/// The files that turn SD scripts off again, in the same way. The firmware
/// has this command next to the one that enables them.
pub fn deactivation_files(camera: &Camera) -> Files {
    modeset_files(camera, b"[SCRIPT_EN_MODE DIS]\r\n")
}

fn modeset_files(camera: &Camera, command: &[u8]) -> Files {
    Files::from([
        (camera.modeset.into(), command.to_vec()),
        (
            "DEVELOP.MOD".into(),
            vec![7, 1, 44, 31, 16, 3, 30, 22, 5, 45],
        ),
    ])
}

pub fn runtime_files(binary: &[u8]) -> Files {
    runtime_files_for(binary, ICON_STRIDE)
}

/// The runtime files of a target with `icon_stride`-byte icon slots.
pub fn runtime_files_for(binary: &[u8], icon_stride: usize) -> Files {
    package_runtime_files(&[binary], icon_stride)
}

/// `runtime_files_for`, with the fast-boot files of `fast`
/// (`package_runtime_files_with`).
pub fn runtime_files_with(binary: &[u8], fast: &Files, icon_stride: usize) -> Files {
    package_runtime_files_with(&[binary], fast, icon_stride)
}

/// The exit statuses of a core file that the package scripts test
/// (`runtime/install_status.h`): the core does not relocate to the running
/// build, or (`--known`) does not name it.
pub const STATUS_RELOCATION: u32 = 47;
pub const STATUS_OTHER_BUILD: u32 = 48;

/// The boot log in the data folder: one line for each step of a start, with
/// the Linux uptime in seconds. A person sends it with a report of a start
/// that failed. The scripts count lines with `grep -c`, because the camera's
/// Linux has no `wc`.
pub const BOOT_LOG: &str = "BOOT.TXT";
/// A start keeps at most about 20 starts of the boot log
/// (runtime/installer.c, `BOOT_LOG_LINES`).
/// The core file that installed at the last start, in the data folder.
const CORE_CHOICE: &str = "CORE.TXT";
/// The marker in RAM of the first SCAN.SH of a power-on.
const BOOT_MARK: &str = "/tmp/grkit-boot";

/// The core file of a runtime build: the core of one firmware build and its
/// installer, which SCAN.SH and INSTALL.SH run.
pub use crate::card::CORE_FILE;

/// The most core files that a package holds: `CORE1.BIN` to `CORE9.BIN`, so
/// each name stays 8.3.
pub const MAX_CORE_FILES: usize = 9;

/// The path of core file `index` of `count` in a package: `CORE.BIN` for one
/// build, else `CORE1.BIN` and on, in release order.
pub fn core_path_of(index: usize, count: usize) -> String {
    if count == 1 {
        CORE_FILE.to_owned()
    } else {
        format!("{PACKAGE_FOLDER}/CORE{}.BIN", index + 1)
    }
}

/// The lock of a one-shot start in RAM (runtime/installer.c): `SCAN.SH`
/// sends no second start while it exists, and RAM is empty at each power-on.
pub const START_LOCK: &str = "/tmp/grkit-start.lck";
/// The process ID of the start, which `INSTALL.SH` reads: while that process
/// runs, the fallback installs nothing.
pub const START_PID: &str = "/tmp/grkit-core.pid";
/// The boot log of a start in RAM, which the start appends to the card log
/// after its result, so a start writes the card once for its log.
pub const BOOT_RAM_LOG: &str = "/tmp/grkit-boot.log";
/// The marker file of the diagnostics in the data folder: while it exists,
/// `SCAN.SH` writes `DIAG.TXT` next to it, with the Linux side of the camera
/// and the time of a read of the core file, about 15 s after the start.
pub const DIAG_MARKER: &str = "DIAG";
pub const DIAG_FILE: &str = "DIAG.TXT";

/// The runtime files of a package with the core file of each runtime build of
/// a camera, in release order, for `icon_stride`-byte icon slots. The builds of
/// a camera have the same scripts and plan.
///
/// `SCAN.SH` starts the core once at each power-on (`--start`,
/// runtime/installer.c): the core checks the build, then scans, installs,
/// and posts its results in a process of its own, so the request returns at
/// once. With one core file, the script runs it with `--start`. With more,
/// it runs each with `--start-known` first, which reads one word to find the
/// build. If no core file names the build, it tries each one with
/// `--start-try`, which runs the relocation, and the last one with
/// `--start`, which writes `INSTALL.ERR` if it also fails. A known build thus
/// starts without a relocation of another build, and an unknown build still
/// gets each runtime.
///
/// `INSTALL.SH` is the fallback of the loader, which sends it when the start
/// posts no result: it installs from the plan in RAM with `--install`, after
/// the same selection with `--known` and `--try`, unless the process of the
/// start still runs.
///
/// After Linux deletes a file in the folder, the camera does not find the next
/// new name that it looks up there, and it keeps that miss. So `SCAN.SH`, the
/// first script of a power-on, looks up each core file before it starts.
///
/// A core that started with `--start-known` goes into `CORE_CHOICE`, and the
/// next start tries it first. A core of another build takes seconds to rule
/// out on GR IV, and the camera keeps its build until a firmware update. The
/// record names only a core of the package, and `--start-known` checks the
/// build again, so a stale record costs only that check.
///
/// Both scripts add their steps to the boot log (`BOOT_LOG`): `SCAN.SH` the
/// `load` line of the power-on on the card, and its own lines in RAM, which
/// the start writes to the card with its result; `INSTALL.SH` its lines on
/// the card.
pub fn package_runtime_files(binaries: &[&[u8]], icon_stride: usize) -> Files {
    package_runtime_files_with(binaries, &Files::new(), icon_stride)
}

/// `package_runtime_files`, with the fast-boot files of `fast` by their path
/// (`runtime::fastboot`). The loader runs each of them on its firmware
/// release, and `FRUN.BIN` comes with them. `fast` holds no other file.
pub fn package_runtime_files_with(binaries: &[&[u8]], fast: &Files, icon_stride: usize) -> Files {
    let releases: Vec<_> = fast_files(fast)
        .into_iter()
        .map(|(release, _)| release)
        .collect();
    assert_eq!(releases.len(), fast.len(), "only fast-boot files");
    let count = binaries.len();
    assert!((1..=MAX_CORE_FILES).contains(&count));
    let target = core_path("LOADER.TTL");
    let startup = format!("filesearch '{target}'\r\nif result = 0 goto done\r\ninclude '{target}'\r\n:done\r\nend\r\n");
    let name = |index: usize| {
        core_path_of(index, count)
            .rsplit('/')
            .next()
            .unwrap()
            .to_owned()
    };
    let log = format!("{LINUX_DATA_DIRECTORY}/{BOOT_LOG}");
    // A line of the boot log: the Linux uptime in seconds, then the step.
    let stamp =
        |step: &str, to: &str| format!("read t _ </proc/uptime; echo \"$t {step}\" >>{to}\n");
    let names = |range: std::ops::Range<usize>| range.map(name).collect::<Vec<_>>().join(" ");
    // The selection of the core of the running build, with the modes of
    // `modes`: known, try, and last. Each body sets `status`.
    let select = |modes: [&str; 3]| -> String {
        let [known, tried, last_mode] = modes;
        if count == 1 {
            return format!("{LINUX_DIRECTORY}/{} {last_mode}\nstatus=$?\n", name(0));
        }
        format!(
            "k={LINUX_DATA_DIRECTORY}/{CORE_CHOICE}\n\
             last=; [ -e $k ] && read last _ <$k\n\
             status={other}; used=\n\
             case \" {all} \" in *\" $last \"*) {LINUX_DIRECTORY}/$last {known}; status=$?; used=$last ;; esac\n\
             if [ $status = {other} ]; then\n\
             \x20 for core in {all}; do\n\
             \x20   [ \"$core\" = \"$last\" ] && continue\n\
             \x20   {LINUX_DIRECTORY}/$core {known}\n\
             \x20   status=$?; used=$core\n\
             \x20   case $status in {other}) ;; *) break ;; esac\n\
             \x20 done\n\
             fi\n\
             [ $status = 0 ] && [ \"$used\" != \"$last\" ] && echo $used >$k\n\
             case $status in {other})\n\
             \x20 for core in {tried_names}; do\n\
             \x20   {LINUX_DIRECTORY}/$core {tried}\n\
             \x20   status=$?\n\
             \x20   case $status in {relocation}) ;; *) break ;; esac\n\
             \x20 done\n\
             \x20 case $status in {relocation}) {LINUX_DIRECTORY}/{last} {last_mode}; status=$? ;; esac\n\
             \x20 ;;\n\
             esac\n",
            all = names(0..count),
            tried_names = names(0..count - 1),
            last = name(count - 1),
            other = STATUS_OTHER_BUILD,
            relocation = STATUS_RELOCATION,
        )
    };
    // SCAN.SH: the first script of a power-on starts the boot log of the
    // start on the card, with the one line that reaches the card before the
    // result. A marker in RAM tells the first run, because the loader
    // repeats SCAN.SH until the start answers. The lock of the start keeps a
    // repeat from running the core again.
    let lookups = if count > 1 {
        format!(
            "for core in {}; do [ -e {LINUX_DIRECTORY}/$core ]; done\n",
            names(1..count)
        )
    } else {
        String::new()
    };
    let scan = format!(
        "mkdir -p {LINUX_DATA_DIRECTORY}\n\
         if [ ! -e {BOOT_MARK} ]; then\n\
         \x20 : >{BOOT_MARK}\n\
         \x20 {load}\
         fi\n\
         [ -e {START_LOCK} ] && exit 0\n\
         {start}\
         {lookups}\
         {select}\
         {started}\
         echo GR_MODULE_START_EXIT_$status\n\
         {diag}\
         exit 0\n",
        load = stamp("load", &log),
        start = stamp("start", BOOT_RAM_LOG),
        select = select(["--start-known", "--start-try", "--start"]),
        started = stamp("started $status", BOOT_RAM_LOG),
        diag = diagnostics(),
    );
    // INSTALL.SH: the fallback, after the same selection as before the
    // one-shot start. While the process of the start runs, it does nothing.
    let install = format!(
        "p=; [ -e {START_PID} ] && read p _ <{START_PID}\n\
         if [ -n \"$p\" ] && [ -d /proc/$p ]; then echo GR_MODULE_INSTALL_EXIT_3; exit 0; fi\n\
         {}\
         {}\
         {}\
         echo GR_MODULE_INSTALL_EXIT_$status\n\
         exit 0\n",
        stamp("install-start", &log),
        select(["--known", "--try", "--install"]),
        stamp("install $status", &log),
    );
    let mut files = Files::from([
        ("SCRIPT/STARTUP.TTL".into(), startup.into_bytes()),
        (LOADER_FILE.into(), loader_with(icon_stride, &releases)),
        (SCAN_FILE.into(), scan.into_bytes()),
        (INSTALL_FILE.into(), install.into_bytes()),
    ]);
    for (index, binary) in binaries.iter().enumerate() {
        files.insert(core_path_of(index, count), binary.to_vec());
    }
    if !fast.is_empty() {
        files.extend(fast.clone());
        files.insert(fast_run_path(), FAST_RUN.to_vec());
    }
    files
}

/// The diagnostics of `SCAN.SH`: while `GRKIT/DIAG` exists, a process of its
/// own writes `GRKIT/DIAG.TXT` about 15 s after the start: the Linux side of
/// the camera, its mounts and log, the boot log in RAM, and the time of two
/// reads of the core file, which gives the speed of the card file system and
/// whether Linux keeps a read file. The camera's Linux has no `wc` and may
/// lack other tools, so each command may fail on its own.
fn diagnostics() -> String {
    let core = format!(
        "{LINUX_DIRECTORY}/{}",
        core_path_of(0, 1).rsplit('/').next().unwrap()
    );
    format!(
        "if [ -e {LINUX_DATA_DIRECTORY}/{DIAG_MARKER} ]; then\n\
         \x20 (\n\
         \x20   usleep 15000000\n\
         \x20   {{\n\
         \x20     echo \"== uptime\"; cat /proc/uptime\n\
         \x20     echo \"== mounts\"; cat /proc/mounts\n\
         \x20     echo \"== filesystems\"; cat /proc/filesystems\n\
         \x20     echo \"== version\"; cat /proc/version\n\
         \x20     echo \"== cmdline\"; cat /proc/cmdline\n\
         \x20     echo \"== cpuinfo\"; cat /proc/cpuinfo\n\
         \x20     echo \"== meminfo\"; cat /proc/meminfo\n\
         \x20     echo \"== busybox\"; busybox\n\
         \x20     echo \"== ps\"; ps\n\
         \x20     echo \"== tmp\"; ls -la /tmp\n\
         \x20     echo \"== dev\"; ls -l /dev\n\
         \x20     echo \"== messages\"; tail -n 300 /var/log/messages\n\
         \x20     echo \"== dmesg\"; dmesg\n\
         \x20     echo \"== boot-ram\"; cat {BOOT_RAM_LOG}\n\
         \x20     echo \"== read-core\"; cat /proc/uptime; cat {core} >/dev/null; cat /proc/uptime; cat {core} >/dev/null; cat /proc/uptime\n\
         \x20     echo \"== read-effects\"; cat /proc/uptime; cat {LINUX_DATA_DIRECTORY}/EFFECTS/* >/dev/null; cat /proc/uptime\n\
         \x20     echo \"== write\"; cat /proc/uptime; echo test >{LINUX_DATA_DIRECTORY}/DIAG.TMP; cat /proc/uptime; echo test >>{LINUX_DATA_DIRECTORY}/DIAG.TMP; cat /proc/uptime\n\
         \x20   }} >{LINUX_DATA_DIRECTORY}/{DIAG_FILE} 2>&1\n\
         \x20 ) </dev/null >/dev/null 2>&1 &\n\
         fi\n"
    )
}
