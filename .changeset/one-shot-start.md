---
default: minor
---

GRKit loads with one request to the camera's Linux at each power-on: the core scans, installs, and reports in one process, reads each module and effect file once, and posts its progress to the loader in RAM, so the start makes about half the card requests of before. The boot log in `GRKIT/BOOT.TXT` keeps its lines, and an empty `GRKIT/DIAG` file writes `GRKIT/DIAG.TXT` with the Linux side of the camera and the speed of the card at the next start.
