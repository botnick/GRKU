p=; [ -e /tmp/grkit-core.pid ] && read p _ </tmp/grkit-core.pid
if [ -n "$p" ] && [ -d /proc/$p ]; then echo GR_MODULE_INSTALL_EXIT_3; exit 0; fi
read t _ </proc/uptime; echo "$t install-start" >>/media/storage1/GRKU/BOOT.TXT
/media/storage1/SCRIPT/GRKU/CORE.BIN --install
status=$?
read t _ </proc/uptime; echo "$t install $status" >>/media/storage1/GRKU/BOOT.TXT
echo GR_MODULE_INSTALL_EXIT_$status
exit 0
