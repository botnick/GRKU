#!/bin/sh
# Bake the Fotufilm looks: render the HaldCLUT identity image through the fotufilm engine,
# one film profile and print medium per effect, with the spatial effects off (grain, halation,
# flare, and local tone), so the picture is a pure color lookup. Then
# `grku effects import --lut EFFECT.png --input srgb` fits each render.
#
#   grku effects hald --level 8 --out hald8.png
#   FOTUFILM=path/to/fotufilm-engine/.build/release/fotufilm sh bake_fotufilm.sh
#
# fotufilm-engine revision 042e6055ac5a8db8ed690f99490fc9a409be573b, built with Swift and Halide (HALIDE_ROOT).
set -e
FOTUFILM=${FOTUFILM:-fotufilm}
render() {
    "$FOTUFILM" hald8.png "$1.png" --stock "$2" --grain 0 --halation 0 --flare 0 --local-tone 0 --paper "$3"
}
render ff-cinestill800t-v1 cinestill800t ektacolor-edge
render ff-cinestill400d-v1 cinestill400d ektacolor-edge
render ff-phoenix200-v1 phoenix200 crystal-archive
render ff-lomochromepurple-v1 lomochromepurple crystal-archive
render ff-lomochrometurquoise-v1 lomochrometurquoise crystal-archive
render ff-lomochromemetropolis-v1 lomochromemetropolis crystal-archive
render ff-lomocolor100-v1 lomocolor100 crystal-archive
render ff-instaxmini-v1 instaxmini screen
render ff-instaxwide-v1 instaxwide screen
render ff-agfachrome50-v1 agfachrome50 screen
render ff-agfachrome100-v1 agfachrome100 screen
render ff-agfachrome200-v1 agfachrome200 screen
render ff-kodacolor100-v1 kodacolor100 ektacolor-edge
render ff-pro160ns-v1 pro160ns crystal-archive
render ff-f64d-v1 f64d eterna-cp
