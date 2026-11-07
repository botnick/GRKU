mkdir -p /media/storage1/GRKIT
if [ ! -e /tmp/grkit-boot ]; then
  : >/tmp/grkit-boot
  read t _ </proc/uptime; echo "$t load" >>/media/storage1/GRKIT/BOOT.TXT
fi
[ -e /tmp/grkit-start.lck ] && exit 0
read t _ </proc/uptime; echo "$t start" >>/tmp/grkit-boot.log
/media/storage1/SCRIPT/GRKIT/CORE.BIN --start
status=$?
read t _ </proc/uptime; echo "$t started $status" >>/tmp/grkit-boot.log
echo GR_MODULE_START_EXIT_$status
if [ -e /media/storage1/GRKIT/DIAG ]; then
  (
    usleep 15000000
    {
      echo "== uptime"; cat /proc/uptime
      echo "== mounts"; cat /proc/mounts
      echo "== filesystems"; cat /proc/filesystems
      echo "== version"; cat /proc/version
      echo "== cmdline"; cat /proc/cmdline
      echo "== cpuinfo"; cat /proc/cpuinfo
      echo "== meminfo"; cat /proc/meminfo
      echo "== busybox"; busybox
      echo "== ps"; ps
      echo "== tmp"; ls -la /tmp
      echo "== dev"; ls -l /dev
      echo "== messages"; tail -n 300 /var/log/messages
      echo "== dmesg"; dmesg
      echo "== boot-ram"; cat /tmp/grkit-boot.log
      echo "== read-core"; cat /proc/uptime; cat /media/storage1/SCRIPT/GRKIT/CORE.BIN >/dev/null; cat /proc/uptime; cat /media/storage1/SCRIPT/GRKIT/CORE.BIN >/dev/null; cat /proc/uptime
      echo "== read-effects"; cat /proc/uptime; cat /media/storage1/GRKIT/EFFECTS/* >/dev/null; cat /proc/uptime
      echo "== write"; cat /proc/uptime; echo test >/media/storage1/GRKIT/DIAG.TMP; cat /proc/uptime; echo test >>/media/storage1/GRKIT/DIAG.TMP; cat /proc/uptime
    } >/media/storage1/GRKIT/DIAG.TXT 2>&1
  ) </dev/null >/dev/null 2>&1 &
fi
exit 0
