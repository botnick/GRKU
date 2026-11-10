# Licenses

This file gives the licenses of the files in this package.

## GRKU

The files in `SD_ROOT/` are GRKU software, except the effect files. GRKU is licensed under the MIT License. The license text is in "GRKU license" below.

Each `CORE.BIN` file (`CORE1.BIN` and on, in a package for several firmware builds) also contains some bytes of the official RICOH firmware. GRKU uses them to identify the firmware before it changes the camera memory. These bytes are not GRKU software, and the MIT License does not apply to them.

The text in the menu icons and in the live view uses the [Roboto Condensed](https://github.com/googlefonts/roboto-classic) typeface, which is licensed under the SIL Open Font License 1.1. GRKU uses its Light, Bold, and Black weights, with only the ASCII characters.

The installation guide uses the [Noto Sans CJK](https://github.com/notofonts/noto-cjk) typefaces, which are licensed under the SIL Open Font License 1.1. Its code text uses DejaVu Sans Mono, which is licensed under the DejaVu Fonts License.

The screenshots in the README and the installation guide show the photo [Sakiko buys a delicious soup at Kitchen Grizzly](https://www.flickr.com/photos/mujitra/53311001084/) by MIKI Yoshihito, which is licensed under [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/). The photo is cropped and scaled, and the screenshot shows the GRKU menu and the Portra 400 effect over it.

## Effects

Each file in `SD_ROOT/GRKU/EFFECTS/` is one Film Look effect. Each effect of the GRKU catalog is a fit of one film simulation LUT. GRKU contributors made the fits. The files contain the fitted parameters, not the LUTs. "Changes to the LUTs" below describes the changes.

If an effect is not in the GRKU catalog, its author gives its license.

### spektrafilm

Portra 400, Gold 200, Ektar 100, Pro 400H, Superia 400, Vision3 250D, Vision3 500T, Portra 800 +2, Kodachrome 64, Velvia 100, Ektachrome E100, Fujicolor C200, UltraMax 400, Provia 100F, Portra 160, Portra 800, Vision3 50D, Vision3 200T, and Verita 200D derive from LUTs of [spektrafilm](https://github.com/andreavolpato/spektrafilm) 0.3.4 by Andrea Volpato.

These effects are licensed under the [Creative Commons Attribution-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-sa/4.0/) (CC BY-SA 4.0). The upstream notice is at <https://github.com/andreavolpato/spektrafilm/blob/main/SPEKTRAFILM_LICENSE.txt>. The effects are provided as is, without warranty. Section 5 of the license gives the disclaimer.

### Spectral Film LUT

Tri-X 400, Tri-X 400 Red, Aerocolor IV, Eterna 500T, Instax, Double-X 5222, Natura 1600, Pro 160S, Reala 100, Velvia 50, Vista 100, Vericolor III, Eastman 100T, EXR 100T, EXR 200T, Vision 320T, Vivid 500T, Ektachrome 100D, and Aerochrome 1443 derive from LUTs of [Spectral Film LUT](https://github.com/JanLohse/spectral_film_lut) by Jan Lohse.

These effects are licensed under the MIT License. The copyright and permission notice is in "Spectral Film LUT license" below.

### t3mujinpack

HP5 Plus 400 and Vista 400 derive from HaldCLUTs of [t3mujinpack](https://github.com/t3mujin/t3mujinpack) by João Almeida, a set of darktable film styles.

These effects are licensed under the MIT License. The copyright and permission notice is in "t3mujinpack license" below.

### Pat David

APX 25, APX 100, Neopan 1600, Acros 100, Delta 100, Delta 400, Delta 3200, FP4 Plus 125, HPS 800, Pan F Plus 50, XP2 Super 400, BW400CN, HIE Infrared, T-Max 100, T-Max 400, T-Max 3200, Polaroid 664, Polaroid 667, Polaroid 672, Ortho 25, Retro 80S, Retro 100 Tonal, Precisa 100, Astia 100F, Provia 400F, Provia 400X, Sensia 100, Superia 200 XPro, Ektachrome 100GX, Ektachrome 100VS, Elite Chrome 200, Elite Chrome 400, Elite Extra 100, Kodachrome 25, Kodachrome 200, X-Pro Slide 200, Polachrome, Ultra Color 100, Vista 200, Superia 200, Superia HG 1600, X-Tra 800, Elite 100 XPro, Elite Color 200, Elite Color 400, Portra 160 NC, Portra 160 VC, Redscale 100, Pro 160C, Pro 800Z, Superia 100, Superia 800, Superia 1600, Portra 400 NC, Portra 400 UC, Portra 400 VC, PX-70, PX-70 Cold, PX-70 Warm, PX100UV Cold, PX100UV Warm, PX-680, PX-680 Cold, PX-680 Warm, Time Zero, FP-100C, FP-100C Cool, FP-100C Neg, FP-3000B, FP-3000B HC, FP-3000B Neg, Polaroid 665, Polaroid 665 Neg, Polaroid 669, Type 669 Cold, Polaroid 690, Type 690 Cold, and Type 690 Warm derive from HaldCLUTs of the film emulation presets of [Pat David](https://patdavid.net) for G'MIC and RawTherapee, as the [NatronGitHub/clut](https://github.com/NatronGitHub/clut) collection distributes them.

These effects are licensed under the [Creative Commons Attribution-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-sa/4.0/) (CC BY-SA 4.0). The upstream notice is at <https://github.com/NatronGitHub/clut/blob/af7b50d4caf6244fb6895a647f5b6a84efe7931a/README.md>. The presets are hand-made approximations of the films, not measured data. The effects are provided as is, without warranty. Section 5 of the license gives the disclaimer.

### Fotufilm

CineStill 800T, CineStill 400D, Phoenix 200, Purple 400, Turquoise 400, Metropolis 400, Lomo Color 100, Instax Mini, Instax Wide, Agfachrome 50, Agfachrome 100, Agfachrome 200, Kodacolor 100, Pro 160NS, and Fujicolor F-64D derive from renders of the film profiles of [Fotufilm](https://fotufilm.com) (MUAStudio Inc.) by the [fotufilm-engine](https://github.com/DhaliwalX/fotufilm-engine) at revision 042e605 on a HaldCLUT identity image, with grain, halation, flare, and local tone off, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). These effect definitions are also licensed under CC BY-SA 4.0. `sources/FOTUFILM_LICENSE.txt` contains the upstream notice, and `sources/bake_fotufilm.sh` the render recipe of each effect.

### GRKU looks

Positive GRII is a look of this repository, in the spirit of the Positive Film image setting of the RICOH GR II: deep blacks, a hard curve, a warm cast that fades toward white, more saturation, blues toward teal, greens toward yellow-olive. `sources/make_positive_grii.py` writes its LUT (a HaldCLUT on the Standard JPEG) from parameters set by eye against GR II photographs, not from camera data; `grku effects import --input standard` fits it. It is licensed under the MIT License of GRKU. RICOH and GR are trademarks of RICOH IMAGING COMPANY, LTD.; the name says which camera setting the look follows.

### Imprint

GR2 Positive derives from the GR2 Positive Film LUT of the Ricoh GR2 Film Look for Photoshop in the [Imprint](https://github.com/luqie0106/Imprint) repository of luqie0106 (revision 3916a11), a stylized imitation of the Positive Film setting of the RICOH GR II from a few parameters (contrast, saturation, cool shadows, warm highlights), not camera data, licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0). `sources/IMPRINT_LICENSE.txt` contains the upstream notice and the license. GRKU fits the LUT to the effect model; the change is the fit.

### FUJIFILM

Provia, Velvia, Astia, Classic Chrome, Classic Neg, Pro Neg Std, Reala Ace, Eterna, Eterna BB, and Acros are the film simulations of the FUJIFILM digital cameras. They derive from the official 3D LUTs of FUJIFILM Corporation for the GFX ETERNA 55 (F-Log2 and F-Gamut to BT.709, 65 grid, V.1.00), downloaded from https://www.fujifilm-x.com/global/support/download/lut/. `sources/manifest.json` pins each LUT by SHA-256; the LUTs are not in the repository. GRKU fits each LUT to the effect model; the change is the fit. FUJIFILM, PROVIA, Velvia, ASTIA, CLASSIC CHROME, CLASSIC Neg., PRO Neg., REALA ACE, ETERNA, and ACROS are trademarks of FUJIFILM Corporation. GRKU is not affiliated with or endorsed by FUJIFILM Corporation.

### Names

Effect names and film, paper, and filter names identify the simulated materials. Some of these names are trademarks of their owners. GRKU is not affiliated with or endorsed by RICOH IMAGING COMPANY, LTD., Eastman Kodak Company, Kodak Alaris, Fujifilm, HARMAN technology Limited (Ilford Photo), Agfa, Polaroid, Lomography, Rollei, or CineStill. The simulations are models of published data or hand-made styles, not measured equivalents of the products.
