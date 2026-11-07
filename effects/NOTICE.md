# Effect attribution

Each film effect is a fit of one film simulation LUT to the effect model of the GR cameras: a
3 x 3 look matrix, optional hue sectors, three tone curves, and an optional post-curve matrix.
GRKit contributors made the fits. The repository and the SD packages contain the fitted
parameters, not the LUTs.

## spektrafilm

Portra 400, Gold 200, Ektar 100, Pro 400H, Superia 400, Vision3 250D, Vision3 500T, Portra 800 +2,
Kodachrome 64, Velvia 100, Ektachrome E100, Fujicolor C200, UltraMax 400, and Provia 100F derive
from LUTs of [spektrafilm](https://github.com/andreavolpato/spektrafilm) 0.3.4 by Andrea Volpato,
licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). These effect
definitions are also licensed under CC BY-SA 4.0.

`sources/SPEKTRAFILM_LICENSE.txt` contains the upstream notice. `sources/CHANGELOG.txt` describes
the changes: GRKit scans the four slide films directly instead of printing them, sets the scan
levels of Vision3 500T, and fits each LUT to the effect model.

## Spectral Film LUT

Tri-X 400, Tri-X 400 Red, Aerocolor IV, Eterna 500T, Instax, and Double-X 5222 derive from LUTs
of [Spectral Film LUT](https://github.com/JanLohse/spectral_film_lut) by Jan Lohse, licensed under
the MIT License. `sources/SPECTRAL_FILM_LUT_LICENSE.txt` contains its copyright and permission
notice. These effect definitions are also licensed under the MIT License. Tri-X 400 Red applies
the library's Kodak Wratten 25 data to Tri-X 400.

## t3mujinpack

HP5 Plus 400 and Vista 400 derive from HaldCLUTs of the darktable styles of
[t3mujinpack](https://github.com/t3mujin/t3mujinpack) by João Almeida, licensed under the MIT
License. `sources/T3MUJINPACK_LICENSE.txt` contains its notice. These effect definitions are also
licensed under the MIT License.

## Pat David

APX 25, APX 100, Neopan 1600, Acros 100, Delta 100, Delta 400, Delta 3200, FP4 Plus 125, HPS 800, Pan F Plus 50, XP2 Super 400, BW400CN, HIE Infrared, T-Max 100, T-Max 400, T-Max 3200, Polaroid 664, Polaroid 667, Polaroid 672, Ortho 25, Retro 80S, Retro 100 Tonal, Precisa 100, Astia 100F, Provia 400F, Provia 400X, Sensia 100, Superia 200 XPro, Velvia 50, Ektachrome 100GX, Ektachrome 100VS, Elite Chrome 200, Elite Chrome 400, Elite Extra 100, Kodachrome 25, Kodachrome 200, X-Pro Slide 200, Polachrome, Ultra Color 100, Vista 200, Superia 200, Superia HG 1600, Reala 100, X-Tra 800, Elite 100 XPro, Elite Color 200, Elite Color 400, Portra 160 NC, Portra 160 VC, Redscale 100, Pro 160C, Pro 800Z, Portra 160, Portra 800, Superia 100, Superia 800, Superia 1600, Portra 400 NC, Portra 400 UC, Portra 400 VC, PX-70, PX-70 Cold, PX-70 Warm, PX100UV Cold, PX100UV Warm, PX-680, PX-680 Cold, PX-680 Warm, Time Zero, FP-100C, FP-100C Cool, FP-100C Neg, FP-3000B, FP-3000B HC, FP-3000B Neg, Polaroid 665, Polaroid 665 Neg, Polaroid 669, Type 669 Cold, Polaroid 690, Type 690 Cold, and Type 690 Warm derive from HaldCLUTs of the film emulation presets of
[Pat David](https://patdavid.net) for G'MIC and RawTherapee, as the
[NatronGitHub/clut](https://github.com/NatronGitHub/clut) collection distributes them, licensed under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). These effect definitions are also
licensed under CC BY-SA 4.0. `sources/PATDAVID_LICENSE.txt` contains the upstream notice. The presets
are hand-made approximations of the films, not measured data, and the Polaroid, Fuji instant, and
Lomography looks keep the names of the collection.

## Names and limits

Effect names and film, paper, and filter names identify the simulated materials. Some of these
names are trademarks of their owners. GRKit is not affiliated with or endorsed by Eastman Kodak Company,
Kodak Alaris, Fujifilm, HARMAN technology Limited (Ilford Photo), Agfa, Polaroid, Lomography, or Rollei. The simulations are models
of published data or hand-made styles, not measured equivalents of the products.

The effects operate in the camera's native image-processing domain. They are not display-sRGB
JPEG transforms. They add no grain, halation, or other spatial effect. The fits assume 18% gray
at base-gamma index 7.8.

Icon text uses the Inter typeface (SIL Open Font License 1.1, see
`crates/grkit-core/assets/Inter-LICENSE.txt`). Icons show manufacturer and film names as
text in Inter or in a pixel font. They use no manufacturer logo.
The project code is licensed under the MIT License (see `LICENSE` at the repository root).

## Packages

Each SD package contains `LICENSES.md`, which gives these notices for the package files. Its source is
`resources/LICENSES.md`. When you add an effect or a source, update both files. A test checks that both
files name each catalog effect under its source.
