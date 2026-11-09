# Built-in icon guidelines

These guidelines apply to the GRKU built-in icons. They state the design
intent. The exact geometry, sizes, and colors are in the tile generator
[scripts/menu-tiles.py](../scripts/menu-tiles.py) (the module tiles of
`modules/*/tiles` and the host tiles of `crates/grku-core/assets/tiles`), in
the film box generator [scripts/flap-icons.py](../scripts/flap-icons.py), and
in the [core artwork](../crates/grku-core/src/artwork.rs) for the text tiles.
The former monochrome tiles are what the
[example generator](../crates/grku-core/examples/module-icons.rs) draws. If
this page and the code disagree, the code is correct and this page needs an
update.

## Principles

- Sit well next to the camera. Keep the frame, size, and placement of the
  native GR icons, and put GRKU icons next to native icons when you review
  them. Inside the frame, a tile shows a small color picture of what the row
  does: a film box in the colors of the real box, a landscape cropped to the
  ratio, a date stamp in the orange of a date back, a lamp at night for Glow.
  Color carries meaning, not decoration: the accent of an Ilford film, the
  label color of a Vision3 can, the red of halation.
- Give each element one job. The symbol identifies the module or the effect.
  A caption, a strength wedge, or a label gives the value.
- Keep the structure stable across variants. Change only the part that
  carries the value, so the user can compare variants at a glance.
- An example value is fine when it shows what the setting means, as the
  date stamp `'26 11 8` of a Date Imprint style does, but it must not look like
  live camera data in the viewfinder.
- Judge the icon at its original size. Use an enlargement only to find raster
  defects.
- Balance by eye. Equal bounding boxes do not make equal visual weight. A
  dense symbol looks larger than a light symbol of the same size.

## Roles

Select the role before you draw. Each role has its own template.

| Role | Use | Style |
| --- | --- | --- |
| List tile | Module entries, their options, and the core entries | The native list frame and fill |
| Toolbar tile | The GRKU entry in the native ADJ toolbar | The native toolbar frame |
| Film cover | Film Looks | Its own bands and typography |
| Viewfinder status | Indicators in the live-view status row | No frame, no fill |

A module's root entry is a list tile, also inside ADJ.

## Layouts

| Layout | Use |
| --- | --- |
| Centered symbol | Root entries |
| Symbol with caption | Options that a short name identifies, such as a ratio or a guide |
| Symbol with strength wedge | Options that set a strength |
| Text | Entries that only a word identifies, such as OFF and VER, and the Date formats |
| Film cover | Film Looks |

Each symbol keeps its own proportions. A frame, a grid, and a ring need
different shapes. Do not force one bounding box on all symbols.

## Captions and text

- Use one font, one size, and one baseline for all captions of a family.
- Center the symbol and its caption as one block in the frame.
- Make secondary text smaller than primary text, for example the time line
  below a date format.
- Draw thin diagrams with gray lines, not white lines, so that they do not
  look heavier than the caption.

## Strength

Show a strength with the native strength wedge. The wedge is a ramp along the
bottom of the icon. It rises to the right and has one segment for each level.

- The symbol is the same at each level. Do not express a strength through
  stroke width, brightness, particle count, or size.
- In list tiles, draw only the segments up to the current level, as the native
  icons do.
- In the viewfinder, draw all segments. Dim the segments above the current
  level, so the user can read the level without a second icon to compare.

## Off

Draw Off as the native Off icons do: dim the symbol and strike it with the
native line from corner to corner.

- A root row keeps its module icon while the module is Off. The detail text
  says Off.
- A setting with strength steps shows its symbol centered, without steps,
  and struck, as its Off value.
- A value list of other settings shows the OFF text tile for Off.
- The viewfinder hides an indicator that is Off. It needs no Off icon.

## Viewfinder status

The status row shows indicators over the live view, next to the native status
icons.

- Draw white marks with a black outline on a transparent background, like the
  unframed native status icons. A framed tile covers the picture and looks
  like a button.
- Keep a transparent margin at the tile edges, so the outline stays inside
  the tile.
- Show a value that is a word or a ratio as a core live-view label, not as a
  tile. The labels use the native live-view typeface. A ratio does not fit a
  tile at that type size.
- Keep the row clear of the native information on the right and of the load
  cue. If an indicator does not fit, do not show it.

## Workflow

1. Select the role and the layout.
2. Put the geometry in the generator as parameters. Derive the variants of a
   family from the same parameters.
3. Use the shared frame, palette, and typography helpers.
4. Render directly at the final size.
5. Compare the result at original size with native icons and with the
   other GRKU icons of the family.
6. Update the PNGs and the tests. Then check the icons on the camera.

Run from the repository root:

```sh
cargo run --locked -p grku-core --example module-icons
cargo test --locked -p grku-core --test effects
```

A second run of the generator does not change the files. Module PNGs that the
generator does not draw are their own source artwork.
