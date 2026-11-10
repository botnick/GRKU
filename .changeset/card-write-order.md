---
default: patch
---

The site and `scripts/card.py` write the part of the start script that saves your settings before the start script itself, so a write that stops halfway cannot leave a card that starts GRKU but no longer saves.
