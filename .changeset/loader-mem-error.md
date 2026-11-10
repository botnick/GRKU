---
default: patch
---

The camera starts GRKU again: the start script of 1.8.0 to 1.8.2 had grown to 36.5 KB, and the GR IV refused it with "mem error" when MENU was held at power-on. The script now holds only the steps up to the install (8.5 KB), and the part that saves your settings is a file of its own, `SCRIPT/GRKU/RESIDENT.TTL`. A test keeps both files far below the size that failed.
