# FUJIFILM recipes

A FUJIFILM recipe is a film simulation with the JPEG settings of the camera changed: white balance shift, Highlight and Shadow, Color, Color Chrome Effect, and Color Chrome FX Blue. `fujifilm_recipe.mjs` applies them as the camera does, on FUJIFILM's own F-Log2 LUT of the film simulation, and `make_fujifilm_recipe.mjs` writes the cube that `grku effects import --input flog2` fits. Grain is the Grain module; sharpness, noise reduction, and clarity are not colours.

Every setting was measured on camera JPEGs of one frame with that setting changed, in CIELAB (sRGB, D65), by `~/Desktop/grku-tools/fuji-measure` on the maintainer's machine.

| Setting | What the camera does | Measured on |
|---|---|---|
| Highlight, Shadow | a curve on each channel; ΔL* of a neutral per step (tables in the code), linear in the steps (-2 is twice -1 within 0.3); Shadow -1 lifts L* 7-35 by 3.6-4.4 and raises the chroma of dark colours with it | Imaging Resource, Fujifilm X-T3 review, the Sunlit series XT3OUTB HT/ST M2 M1 P0 P1 (full-size camera JPEGs); Fuji X Weekly, Kodak T-Max 100 Hard and Soft Tone (the same frame, Highlight and Shadow each one step apart) agrees |
| Color Chrome Effect | darkens saturated reds, oranges, yellows, and greens, the more the more saturated and the darker: Strong -3 to -8 L*; Weak is half of Strong (0.47-0.52); blues untouched | FUJIFILM Learning Centre, "Color Chrome and Film Grain Effects" (No Color Chrome / Color Chrome Strong); Fuji X Weekly, X-T30 Off / Weak / Strong |
| Color Chrome FX Blue | darkens blue hues by about 0.32 C* (Strong, at most 15 L*); Weak is half (0.49) | FUJIFILM Learning Centre (No Color Chrome FX Blue / Strong); Fuji X Weekly, X100V Off / Weak / Strong |
| White balance shift | a gain on scene light before the film simulation, per step red ln 0.045, blue ln 0.095; the ratio at the output follows the slope of the tone curve in each tonal band, as a gain before it does | Fuji X Weekly, "Fujifilm White Balance Shift", the 0/0 and +1 Red -1 Blue pair |
| Color | a chroma scale, about 1.055 per step | the best fit of the model to Fuji X Weekly's factory-default and recipe JPEGs of one frame: Nostalgic Americana (best 1.03-1.055) and Kodak Ektar 100 (best 1.055-1.08). No pair with Color alone was found, so this one is the least certain |

Check: on those two pairs, the factory-default JPEG through the model with the recipe's settings and a fitted white balance comes closer to the camera's recipe JPEG than the white balance alone (mean ΔE 6.08 to 4.91, 5.57 to 5.23); without Shadow or Color Chrome it is clearly worse. Dynamic range is not modelled: pairs with DR400 do not fit, so a recipe with DR400 waits for it.

## The recipes

| Effect | Recipe | Settings |
|---|---|---|
| `fj-reggies-portra-v1` | Reggie's Portra by Reggie Ballesteros, published by Fuji X Weekly (https://fujixweekly.com/2022/06/11/fujifilm-x-trans-iv-film-simulation-recipe-reggies-portra/) | Classic Chrome, DR-Auto, Highlight -1, Shadow -1, Color +2, Color Chrome Effect Strong, FX Blue Weak, White Balance Auto R+2 B-4; Grain Weak Small (the Grain module) |
