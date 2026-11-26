case "$1" in
serve)
  if [ ! -e /tmp/grku-serve ] && [ -e /media/storage1/SCRIPT/GRKU/SERVE.BIN ] && [ -e /media/storage1/GRKU/WIFI.ON ]; then
    : >/tmp/grku-serve
    (n=0
    while :; do
      (cd / && exec /media/storage1/SCRIPT/GRKU/SERVE.BIN) &
      echo $! >/tmp/grku-serve
      wait $! && break
      n=$((n + 1))
      if [ $n -gt 1 ]; then /media/storage1/SCRIPT/GRKU/SERVE.BIN --mark-stopped; break; fi
      sleep 1
      [ -e /tmp/grku-serve ] || break
    done
    rm -f /tmp/grku-serve) </dev/null >/dev/null 2>&1 &
  fi
  exit 0 ;;
stop)
  if [ -e /tmp/grku-serve ] && read pid _ </tmp/grku-serve && [ -e /proc/$pid ]; then
    grep -q -- --from-ram /proc/$pid/cmdline && kill -TERM "$pid"
  else
    rm -f /tmp/grku-serve
    [ -e /media/storage1/SCRIPT/GRKU/SERVE.BIN ] && /media/storage1/SCRIPT/GRKU/SERVE.BIN --mark-stopped
  fi
  exit 0 ;;
esac
mkdir -p /media/storage1/GRKU
if [ ! -e /tmp/grku-boot ]; then
  : >/tmp/grku-boot
  read t _ </proc/uptime; echo "$t load" >>/media/storage1/GRKU/BOOT.TXT
fi
[ -e /tmp/grku-start.lck ] && exit 0
read t _ </proc/uptime; echo "$t start" >>/tmp/grku-boot.log
/media/storage1/SCRIPT/GRKU/CORE.BIN --start
status=$?
read t _ </proc/uptime; echo "$t started $status" >>/tmp/grku-boot.log
echo GR_MODULE_START_EXIT_$status
if [ -e /media/storage1/GRKU/DIAG ]; then
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
      echo "== card"; ls -la /media/storage1/GRKU/..; ls -la /media/storage1/GRKIT; ls -la /media/storage1/GRKU
      echo "== tmp"; ls -la /tmp
      echo "== dev"; ls -l /dev
      echo "== messages"; tail -n 300 /var/log/messages
      echo "== dmesg"; dmesg
      echo "== boot-ram"; cat /tmp/grku-boot.log 2>/dev/null || tail -n 24 /media/storage1/GRKU/BOOT.TXT
      echo "== read-core"; cat /proc/uptime; cat /media/storage1/SCRIPT/GRKU/$(cat /media/storage1/GRKU/CORE.TXT 2>/dev/null || echo CORE.BIN) >/dev/null; cat /proc/uptime; cat /media/storage1/SCRIPT/GRKU/$(cat /media/storage1/GRKU/CORE.TXT 2>/dev/null || echo CORE.BIN) >/dev/null; cat /proc/uptime
      echo "== read-effects"; cat /proc/uptime; cat /media/storage1/GRKU/EFFECTS/* >/dev/null; cat /proc/uptime
      echo "== write"; cat /proc/uptime; echo test >/media/storage1/GRKU/DIAG.TMP; cat /proc/uptime; echo test >>/media/storage1/GRKU/DIAG.TMP; cat /proc/uptime
    } >/media/storage1/GRKU/DIAG.TXT 2>&1
  ) </dev/null >/dev/null 2>&1 &
fi
exit 0
