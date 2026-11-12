## 1.8.5 (2026-11-12)

### Fixes

- Border puts its white or black border around the whole photo: the JPEG grows by the border and the photo keeps every pixel. Thin is 3% and Wide 6% of the short side, and the new Instant is 4% with a bottom three times as wide. In-camera RAW development adds the current border, and on GR IV a large border takes its memory from the image pool, narrower when the pool is low. Border is now a page of the core, so it costs no module memory, and U1 to U3 of the mode dial keep its border and color. Module ABI 2.8.
- Crop at 40 mm keeps the camera on a crop factor it knows: a power-off at 40 mm no longer leaves a factor that the camera without GRKU shows as an error in each live-view frame.
- Distance Unit in GRKU Settings of the GRKU section of MENU shows the Snap focus distances and the manual focus scale in meters or in feet, and a change applies at once. It replaces `GRKU/FEET.TXT`, which GRKU no longer reads: choose Feet in MENU instead.
- The print film looks keep more color in highlights, and saturated colors change more smoothly from one hue to the next.
- Bloom and Halation glow evenly around screens and other large bright areas at Strong, and sit centered on their light at every strength.
- Instax is no longer brighter than the meter reading, so its highlights keep more detail.
- A half-press after you select a built-in Image Control in ADJ now replaces the GRKU Film Look, as OK does.
- A recipe saved on the camera holds the border of the Border module too (its style, and the color of a border that is on), and applying it sets the border. Like the exposure settings, the border is not part of the look: it does not decide which recipe matches, and a recipe from the site without a border keeps the border of the camera. Without the Border module, applying leaves the border out and says so. The recipe file of an earlier GRKU still reads: its recipes hold no border.
- The recipe list in MENU keeps its mark on the recipe that your settings match after Rename and Delete.
- Reggie's Portra, the most popular Fujifilm recipe (by Reggie Ballesteros, published by Fuji X Weekly), joins the film library as a free camera look: FUJIFILM's own Classic Chrome LUT with the recipe's white balance shift, Highlight, Shadow, Color, Color Chrome, and FX Blue applied as the camera does, each measured on FUJIFILM camera JPEGs (`effects/sources/FUJIFILM_RECIPES.md`). Set Grain to Weak, Small for the whole recipe. The library has 146 looks.
- In live view, the GRKU icons move next to the camera's own information in the same row, so they no longer cover the dial guide of Snap mode on GR IV.

#### Crop shows the crop itself in the live view: at 40 and 70 mm the view zooms in, without frame lines, while the camera keeps its own 35 or 50 mm. Movies keep the camera's view. 90 mm (128 mm on GR IIIx) is gone, because the live view cannot zoom that far. The ADJ tiles of the crops name their focal lengths, with their own tiles on GR IIIx.

On GR IV the live view keeps the frame lines of the crop for now: the code of one of its live-view hooks differs in the memory of a GR IV 1.11 from the firmware file, so the install stopped (status 47). GR III and GR IIIx zoom the live view.

## 1.8.4 (2026-11-10)

### Fixes

- The site and `scripts/card.py` write the part of the start script that saves your settings before the start script itself, so a write that stops halfway cannot leave a card that starts GRKU but no longer saves.
- The site describes each FUJIFILM look in plain words, such as "Classic Chrome, a film simulation of the FUJIFILM cameras", instead of the technical note of its source.

## 1.8.3 (2026-11-10)

### Fixes

- The camera starts GRKU again: the start script of 1.8.0 to 1.8.2 had grown to 36.5 KB, and the GR IV refused it with "mem error" when MENU was held at power-on. The script now holds only the steps up to the install (8.5 KB), and the part that saves your settings is a file of its own, `SCRIPT/GRKU/RESIDENT.TTL`. A test keeps both files far below the size that failed.

## 1.8.2 (2026-11-10)

### Fixes

- Date Imprint, Bloom, Halation, and Grain get a Show Icon setting, as Framing has, to hide their icon in live view.
- The GRKU icons of the live view sit level with the text next to them, on the line of the focus distance.

## 1.8.1 (2026-11-10)

### Fixes

- The ADJ button closes the Recipes page without applying the highlighted recipe, running Save Settings, or Undo; only OK acts there.
- A recipe that you save on the camera now holds the exposure settings too, and applying it sets them. A recipe from the site that leaves them out keeps those of the camera.
- In live view, the GRKU icons show at the right of the second row, so they no longer cover the white balance shift.

## 1.8.0 (2026-11-10)

### Features

- Ten film simulations of the FUJIFILM cameras join the film library: Provia, Velvia, Astia, Classic Chrome, Classic Neg, Pro Neg Std, Reala Ace, Eterna, Eterna BB, and Acros. Each is a fit of the official FUJIFILM 3D LUT (F-Log2 to BT.709, GFX ETERNA 55), nine at grade A and Reala Ace at grade B. They sit with the camera looks, in a silver box, and are free: they take no slot and are in no pack. The library has 145 looks.
- GRKU supports the firmware that Ricoh released on 2026-11-10: GR III 2.21, GR IIIx 1.71, GR IV 1.21, and GR IV Monochrome 1.11. The GR III and GR IIIx packages hold a core file for 2.10 and one for 2.21, and the GR IV package one more for 1.21; the camera picks the one of its firmware at power-on. Crop, Recipes, the mode dial, and the keyboard of recipe names have their addresses in the new firmware too, checked against Ricoh's files. Not run on a camera with the new firmware yet.

### Fixes

- ADJ keeps opening where it closed last time after each power-off, not only after the first one.
- ADJ opens on GRKU after power-off when ADJ closed there last time, and on the same module row.

## 1.7.0 (2026-11-09)

### Features

- Thai installation guide: every camera has its guide in Thai as a PDF, and the ZIP from the Thai site carries it. The camera menus stay in English, because the camera has no Thai font. The guides no longer mention GRKit.

### Fixes

- The site builds GRKU.zip and writes the card for GR IV and GR IV Monochrome again: it stopped when the release had no build for the 1.20 firmware of the 30th Anniversary cameras (gr4-1.20-0528), which Ricoh does not publish. The site now leaves that build out, as the release packages do.
- The guides and the site show the card after copying `SD_ROOT` and the camera while MENU is held, and their screenshots say GRKU. The guides no longer print the repository address, and the terms name the feedback link of grku.app as the contact.
- The Thai site builds GRKU.zip and writes the card again: it failed with "เตรียม GRKU.zip ไม่ได้" because the package did not know the Thai language.

## 1.6.0 (2026-11-09)

### Features

- The new Border module paints a white or black edge over each photo, 3% or 6% of its width, as a print border.
- The new Crop module crops photos to 35, 40, 50, 70, or 90 mm, with a live view and a crop badge to match.
- New Diffusion module (`DIFFUSE.GRM`), after Glow in ADJ: the glow of a Black Pro-Mist diffusion filter at 1/8, 1/4, or 1/2 on JPEG photos, with a Black Mist veil over the shadows (Light or Heavy) and the blue or amber horizontal Streak of an anamorphic lens from point lights. Fn opens its settings. It is ported from the HDF Glow module of the MustafaCisse fork (MIT), without its halation ring, which Glow already has.
- Enable at Start in the GRKU section of MENU decides whether GRKU is on after each start: On, Off, or Keep Last.
- With `GRKU/FEET.TXT` on the card, the snap focus distance labels show feet (1', 3', 5', 7', 8', 16') instead of meters; `scripts/card.py feet on` writes the file.
- The film library has 104 looks: 83 new ones fitted from the film emulation presets of Pat David (CC BY-SA 4.0) and from t3mujinpack (MIT), with Ilford, Agfa, Polaroid, Fuji instant, Lomography, and Rollei films, the Kodak and Fuji slide and negative films that were missing, and black-and-white films. A package carries 40 of them; `GRKU-film-library.zip` has every effect file to copy into `GRKU/EFFECTS` on the card.
- Light Leak, a new module: a vignette, dust and hairs, a light leak, and scratches on JPEG photos, each Off, Light, Medium, or Strong, or the presets Faded, Dusty, Leaky, and Expired. They fall differently on every shot and follow the upright picture. Ported from the Overlay module of the kkasemsa fork.
- U1, U2, and U3 of the mode dial can keep your GRKU settings, framing included, apply a recipe, or turn GRKU off, and your own settings come back when you turn away; set them up in MENU or on the site.
- GRKU ships no fast-boot firmware: the Fast start page, its links and FAQ entries leave the site, and packages carry only the card scripts. GRKU stays a script on the SD card.
- GRKU loads with one request to the camera's Linux at each power-on: the core scans, installs, and reports in one process, reads each module and effect file once, and posts its progress to the loader in RAM, so the start makes about half the card requests of before. The boot log in `GRKU/BOOT.TXT` keeps its lines, and an empty `GRKU/DIAG` file writes `GRKU/DIAG.TXT` with the Linux side of the camera and the speed of the card at the next start.
- An effect can bring its own 40 x 40 icon as a PNG in its definition (`icon: {"png": ...}`), in color, as ahonn/GRKit#38 proposed. Every look in the catalog now shows a film box end flap in the colors of its brand.
- Every Film Look icon is now a film box in the colors of the real box, with the brand band, the name, and the speed in Roboto Condensed, and the menu tiles are small color pictures: a film canister for Film Look, a landscape cropped to each ratio for Framing, the guide lines for Guides, an orange date stamp for Date Imprint, a lamp at night for Glow, a grainy picture for Grain, and GRK on a strip of color film in the ADJ toolbar. Each box icon carries a film type stripe (orange negative, blue slide, gray black-and-white, teal motion picture, rose instant). The library has 135 looks: GR2 Positive from the Imprint repository (Apache-2.0), Positive GRII, a look of GRKU itself after the Positive Film setting of the GR II, and 15 new ones from the Fotufilm film profiles (CC BY-SA 4.0), with CineStill 800T and 400D, Harman Phoenix 200, the LomoChrome films, instax, Agfachrome, Kodacolor 100, Pro 160NS, and F-64D. The 40 effects of a package follow the 2026 popularity research in `docs/popular-films-2026.md`.
- Recipes save a look on the camera, or bring recipes from the site, and switch Film Look or Image Control, grain, glow, white balance, and the correction and exposure settings in one step in ADJ, with Undo; MENU lists, applies, renames, and deletes them.

### Fixes

- Guides adds the Golden Spiral and Dynamic Symmetry of GRKit 1.5.2, with color tiles; the About row names GRKU's own site.

## 1.5.2 (2026-11-08)

### Fixes

- With the fast-boot firmware, GRKit still loads when the fast start fails, instead of showing an error.
- Guides adds a golden spiral and dynamic symmetry, and in ADJ, Fn turns the spiral to the next corner.

## 1.5.1 (2026-11-07)

### Fixes

- Bloom and Halation at Strong now glow visibly around lamps indoors and at dusk.
- In in-camera RAW Development, Fn on a Film Look adjusts its settings for that picture, as it does for a native Image Control.
- On the site, Edit changes the name and the icon of an imported LUT film look, without a new import.

## 1.5.0 (2026-11-06)

### Features

- With the optional fast-boot firmware, which grkit.app makes from the official firmware, GRKit loads soon after power-on.

### Fixes

- With Bloom and Halation both on, bright areas such as a sky or a screen no longer show rectangular patches with some Film Looks.

## 1.4.4 (2026-11-06)

### Fixes

- Photos with a Film Look now use the Shading and Clarity of its Fn adjustments, and no longer take the Shading, Clarity, or grain of the native Image Control, such as the grain of Hi-Contrast B&W.

## 1.4.3 (2026-11-05)

### Fixes

- On GR IV, MENU on the Glow page after Bloom or Halation returns to the GRKit section instead of playback.

## 1.4.2 (2026-11-05)

### Fixes

- In ADJ, Glow shows its name before its value, for example "Glow: Off", as the other modules do.
- Choose the color of Halation: Red, Orange, Gold, or White.
- GR IV Monochrome no longer loads Film Look, whose effects are made for color sensors.

## 1.4.1 (2026-11-04)

### Fixes

- Photos with Grain or Date Imprint save faster, most of all upright date stamps on portrait photos.
- In Guides Only mode, guides now line up with the composition frame instead of crossing the dark area outside it.

## 1.4.0 (2026-11-04)

### Features

- Add the Fujicolor C200, UltraMax 400, and Provia 100F film looks, and Cinema Yellow and Cinema Green from GR IV firmware for GR III and GR IIIx.
- Add a Guides Only mode for composition without cropping photos, with guides that also follow the camera’s native aspect ratio.
- Add Bloom and Halation to JPEG photos, with separate strength controls and the option to use both effects together.
- Write the name of the film look into each JPEG as a keyword, so that Lightroom and other photo catalogs can find photos by look.
- In-camera RAW development and Resize keep the framing and film look, and RAW development keeps the capture date and can apply another film look or Framing ratio.
- Show the Framing ratio, Date Imprint format, Grain, Bloom, and Halation in the viewfinder, with clearer Date Imprint, Glow, and Grain icons in ADJ.

### Fixes

- Fix missing composition guides after aspect ratio changes and preserve native RAW framing and digital crop settings when cropping JPEG photos.
- Make date stamps more reliable when photos are saved.

## 1.3.5 (2026-10-31)

### Fixes

- The exposure box of ISO Setting no longer stays over GRKit in ADJ.
- In ADJ, a touch on a GRKit row now selects it as on a native entry, and no longer changes the setting that was selected before GRKit, such as Outdoor View Setting.
- GRKit installs up to 40 effects, instead of 20, Film Stock and Options in MENU list all of them, and Film Look in ADJ scrolls through them as a native list.
- On GR IV 1.20, GR IV HDF 1.20, and GR IV Monochrome, the Fn adjustments of an effect change its own Shading and Clarity, and no longer change the Shading of the native Standard.
- Enable GRKit, a switch in the GRKit section of MENU and in ADJ, turns all modules off and on again at once, and keeps the settings of each module.
- While Film Look is off, the viewfinder shows the native Image Control icon, and turning Framing on or off changes the crop of the next picture at once.

## 1.3.4 (2026-10-30)

### Fixes

- ADJ opens as usual again after the Fn adjustments page was left for playback or MENU.
- In MENU, a module settings page shows its whole title, and ADJ Order lists only the modules that ADJ shows.
- On GR IV, a photo in an aspect ratio set in the camera menu keeps its full size, where a saved Framing ratio of 5:4, 1:1, or 7:6 cropped it.
- The camera no longer stops when a MENU item with its own list, such as ISO Setting, was opened before GRKit loaded and is opened again after it loads.

## 1.3.3 (2026-10-29)

### Fixes

- The Fn adjustments of a Film Look effect stay on screen after a half-press, where they showed and changed the native Image Control settings.
- GRKit loads again on every start with a new card, after an update, and with cards that macOS copied files to, where 1.3.1 and 1.3.2 could miss GRK, Film Look, or effects.

## 1.3.2 (2026-10-29)

### Fixes

- The viewfinder shows DATE while Date Imprint is on.
- Framing has a 7:6 ratio, the 6x7 frame of medium-format film.
- Grain has an Extra Strong level, half again as strong as Strong.
- The histogram reaches its right edge and shows the clipping line again while a Film Look effect is on.
- GRKit is in Korean on a camera set to 한국어, and on grkit.app and in its guides, and a module built for an earlier GRKit must be built again with a Korean text file.
- GRKit loads again on the first starts with a new card or after an update, where 1.3.1 could stop with no GRK in ADJ.

## 1.3.1 (2026-10-28)

### Fixes

- GRKit now loads in about 40% less time after power-on on GR III and GR IIIx, and in about half the time on GR IV.
- On GR III and GR IIIx, medium and large grain no longer make the camera slow to save a photo, open playback, or turn off.
- GRKit holds up to 10 modules, and ADJ Order lists all of them in one MENU row.

## 1.3.0 (2026-10-27)

### Features

- Updates keep your settings and effects: delete the old SCRIPT folder and copy the new one, or update on grkit.app, which also keeps those of GRKit 1.2.
- Date Imprint has a Position setting: Upright keeps the date at the bottom right of vertical photos.
- Image Control in GRKit is now called Film Look.
- Framing keeps a 3:2 viewfinder for every ratio, and can show a black mask or frame lines and hide its label.
- Grain has a Size setting: Auto (by ISO), Small, Medium, or Large.
- Guides can be white or yellow, opaque, and shown while DISP hides the camera information.
- All GRKit settings are now in MENU, at the end of the Customize tab, where you turn features and their options on or off at once.
- In Chrome or Edge on a computer, grkit.app installs, updates, and uninstalls GRKit directly on the SD card.

### Fixes

- The highlight warning shows the brightest areas again while a Film Look effect is on.

## 1.2.1 (2026-10-24)

### Fixes

- Packages add the Ektachrome E100, Eterna 500T, Instax, Double-X 5222, and HP5 Plus 400 effects, and no longer include Portra 160, EXR 200T, and FP-100C.
- Framing offers XPan, 2.35:1, 16:9, 4:3, 5:4, and 1:1 on every camera, and uses the camera's own aspect ratio where it has one.
- GR IV Monochrome firmware 1.10 is supported as experimental, with the GR IV package.
- One GR IV package installs on firmware 1.11 and 1.20, and the 1.20 firmware that GR IV 30th Anniversary Edition cameras have from the factory is supported as experimental.
- The live view builds the curves of an effect only when they change, Framing does less work to draw the area outside the photo, and GRKit saves menu selections to the card only after they stop changing, so the camera uses less power.
- The shooting screen shows GRKit for a few seconds when GRKit has loaded.
- Menu icons, effect icons, and the Framing label use Roboto Condensed, which looks like the camera's own text.
- Vision3 500T now looks like the film printed on photo paper and scanned, as CineStill 800T is, and the motion picture print version is removed (Eterna 500T gives that look; delete `SCRIPT/PLUGINS/EFFECTS/1A3DC043.GRF` from the card if the menu shows Vision3 500T twice).

## 1.2.0 (2026-10-22)

### Features

- OK on Date Imprint in the GRK menu opens its settings, where Date Look selects the digits of the date imprint: the classic seven-segment digits, the dot matrix of the GR1s, or the digits of the GR II.
- Color film looks and imported LUTs follow their source more closely with the camera's hue-sector color stage, in photos and in the viewfinder.
- Fn on the Image Control row of the GRK menu opens the adjustments of the selected effect.
- GR III and GR III HDF firmware 2.20 and GR IIIx and GR IIIx HDF firmware 1.70 are supported as experimental, with the same package as 2.10 and 1.60.
- GR IV and GR IV HDF firmware 1.20 are supported as experimental, with a package of their own.

### Fixes

- Guides draw 2-pixel lines in the color of the native grid guide, at the positions of the native thirds.
- GRKit starts 2 seconds later after power-on, which avoids a stop of the camera when the script talks to the camera before it is ready.
- Playback shows the Fn adjustments of the effect that took the photo, not the parameters of the camera's Image Control setting.
- The date stamp is white on monochrome pictures, including the camera's monochrome Image Control types and GR IV Monochrome.

## 1.1.1 (2026-10-21)

### Fixes

- On another build of firmware 1.11, GR IV and GR IV HDF no longer stop when GRKit loads.
- The GRK icon in the ADJ toolbar has the size of the native toolbar icons.
- Guides hide while DISP hides the live-view information, and the Framing ratio label shows only with the full display.
- The GRKit menu icons have the size of the native list icons, and their text keeps clear of the frame.

## 1.1.0 (2026-10-20)

### Features

- Left and Right on a GRKit page move to the next ADJ entry, as they do on the GRKit root.
- OK or an ADJ press on a GRKit page selects the highlighted row and closes ADJ.
- GRKit opens on the row that was last used, and ADJ opens on GRKit if ADJ closed while GRKit was open.
- GRKit in ADJ shows all of its rows and scrolls a long page one row at a time, as a native ADJ entry does.
- Add a Date Stamp style with the day first and the time: `D M 'YY  H:MM`.
- Add a Guides style that shows the thirds grid and the center cross together.

### Fixes

- The About row of the GRKit menu shows a VER icon, so the GRKit root shows only one GRK icon.
- An ADJ press or one MENU press on the GRKit root closes ADJ.
- GR IV and GR IV HDF install effects from an exFAT card with long file names, such as the `._` files that macOS writes.
- On another build of firmware 1.11, GR IV and GR IV HDF install GRKit, or stop with status 47 and list missing addresses in `INSTALL.ERR`.
- The camera runtime has room for more plugins, and saved selections, Fn adjustments, and effects keep working after the update.

## 1.0.1 (2026-10-19)

### Fixes

- Show the film numbers 5219, 5207, and 5293 on the icons of Vision3 500T, Vision3 250D, and EXR 200T, in the camera menu, the viewfinder, and playback.
- Remove the experimental label from GR IV and GR IV HDF firmware 1.11, after a user tested GRKit on a GR IV.
- Support RICOH GR III HDF and GR IIIx HDF. They run the GR III 2.10 and GR IIIx 1.60 firmware and use the same packages, and the site shows each with its base camera.
- Draw the film icons on the site with web fonts, so they stay sharp. The camera keeps its 40 x 40 pixel icons.
- Show the film number under the name of each motion picture and aerial film look on the site, for example "5219 · 2393 print" under Vision3 500T.

## 1.0.0 (2026-10-19)

### Features

- Add GRK, a sixth entry of ADJ mode, with five modules: Image Control, Framing, Guides, Date Stamp, and Grain.
- Add 16 film looks to Image Control, with film cover icons and a live-view preview.
- Adjust each film look with Fn. The adjustments stay with that look and do not change the native Image Control settings.
- Show the GRKit version in the last row of GRK.
- Support RICOH GR III firmware 2.10 and GR IIIx firmware 1.60. GR IV and GR IV HDF firmware 1.11 support is experimental.
- Add the GRKit site, which builds a package in the browser from the selected camera, modules, and effects.
- Preview the effects on a GR IIIx sample or on your own DNG. The site develops the RAW data in the browser.
- Show the camera menu, the site, and the guides in English, Simplified Chinese, Traditional Chinese, and Japanese.
