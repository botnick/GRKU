"""Film box icons for the Film Look effects: 40 x 40 RGBA with binary alpha, rows 2 to 37
opaque like the native list frames, drawn after the real boxes: the brand band in the brand
colors, the body in the colors of the box of that film, the name in Roboto Condensed Bold and
the speed in Roboto Condensed Black (the fonts of crates/grkit-core/assets, SIL OFL 1.1), and a
film type stripe at the bottom: orange negative, sky blue slide, gray black-and-white, teal
motion picture, rose instant.

    python3 scripts/flap-icons.py embed           # write the icon of each effect into its effect.json
    python3 scripts/flap-icons.py sheet OUT.png   # a sheet of every icon at 3x, for review

Needs Pillow (`python3 -m pip install pillow`). The icon of each effect comes from its `cover`
fields: the template (box or cine), the brand, the name, and the number of the film box. The
same fields draw the cover of the effect on the site.
"""
import base64, io, json, pathlib, sys

from PIL import Image, ImageDraw, ImageFont

REPO = pathlib.Path(__file__).resolve().parent.parent
ASSETS = REPO / 'crates' / 'grkit-core' / 'assets'
BOLD = str(ASSETS / 'RobotoCondensed-Bold.ttf')
BLACK_FONT = str(ASSETS / 'RobotoCondensed-Black.ttf')

TOP, BOTTOM = 2, 37          # the opaque rows, as the native list frames
BAND_BOTTOM = 10             # the brand band: rows TOP..BAND_BOTTOM
WIDTH = 40

WHITE, BLACK, GREY = (255, 255, 255), (0, 0, 0), (128, 128, 128)
YELLOW, RED, GREEN, BLUE, ORANGE = (250, 200, 0), (210, 20, 30), (0, 140, 70), (20, 70, 150), (240, 140, 0)
PURPLE, PINK, TEAL, NAVY = (100, 40, 150), (235, 70, 150), (0, 150, 160), (20, 40, 90)
RAINBOW = [(237, 28, 36), (247, 148, 29), (255, 222, 0), (0, 166, 81), (0, 114, 188)]

# The brand band of each brand: background, text.
BANDS = {
    'Kodak': (YELLOW, RED), 'FUJIFILM': (GREEN, WHITE), 'ILFORD': (BLACK, WHITE), 'AGFA': (RED, WHITE),
    'POLAROID': (WHITE, BLACK), 'LOMO': (BLACK, WHITE), 'ROLLEI': (NAVY, WHITE), 'CINESTILL': (BLACK, WHITE),
    'HARMAN': (BLACK, ORANGE), 'RICOH': ((40, 40, 40), WHITE),
}
BAND_TEXT = {'Kodak': 'Kodak', 'FUJIFILM': 'FUJIFILM', 'ILFORD': 'ILFORD', 'AGFA': 'AGFA', 'POLAROID': 'Polaroid',
             'LOMO': 'LOMO', 'ROLLEI': 'ROLLEI', 'CINESTILL': 'CINESTILL', 'HARMAN': 'HARMAN', 'RICOH': 'RICOH'}
# The film type stripe at the bottom of each box, so the kind of film shows at a glance:
# orange for a color negative (the orange mask of C-41 film), sky blue for a slide film,
# gray for black-and-white, teal for a motion picture film, rose for an instant film.
KINDS = {'negative': (235, 120, 30), 'slide': (90, 170, 235), 'mono': (150, 150, 150),
         'cine': (0, 150, 140), 'instant': (240, 150, 180)}
SLIDE_NAMES = ('VELVIA', 'PROVIA', 'ASTIA', 'SENSIA', 'EKTACHROME', 'KODACHROME', 'ELITE', 'PRECISA',
               'AGFACHROME', 'AEROCHROME', 'X-PRO', 'POLACHROME', 'FORTIA')
INSTANT_NAMES = ('INSTAX', 'FP-', 'PX', 'TIME ZERO', 'POLAROID', 'TYPE')
# The label colors of the Kodak motion picture cans.
VISION_CODES = {'500T': (230, 60, 50), '250D': (60, 120, 220), '200T': (150, 80, 200), '50D': (80, 180, 90),
                '320T': (240, 150, 50), '100T': (240, 200, 60), '200D': (90, 170, 200)}


def shade(color, factor):
    return tuple(max(0, min(255, round(c * factor))) for c in color)


def luminance(color):
    return 0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2]


def palette(brand, name, number, cine):
    """The body of the box and the colors of its name and number, after the real boxes:
    (body, name color, number color, accent). The accent is a thin stripe at the bottom, or None."""
    n = name.upper()
    key = f'{n} {number}'.strip()
    if cine:
        if brand == 'Kodak':
            code = next((c for c in VISION_CODES if number.upper().endswith(c)), None)
            return ((25, 25, 25), WHITE, VISION_CODES.get(code, (230, 230, 230)), VISION_CODES.get(code))
        return ((25, 25, 25), WHITE, (120, 210, 130), (120, 210, 130))
    if brand == 'Kodak':
        if n.startswith('PORTRA'):
            return (WHITE, BLACK, {'160': (120, 170, 200), '400': (40, 70, 140), '800': (150, 40, 110)}.get(number[:3], BLACK), None)
        if n.startswith(('GOLD', 'COLORPLUS', 'KODACOLOR', 'KODACHROME')): return (YELLOW, RED, RED, None)
        if n.startswith('ULTRAMAX'): return (YELLOW, BLUE, BLUE, None)
        if n.startswith('EKTAR'): return (RED, WHITE, YELLOW, None)
        if n.startswith('TRI-X'): return (YELLOW, BLACK, BLACK, None)
        if n.startswith('T-MAX'): return (BLACK, WHITE, YELLOW, None)
        if n.startswith('EKTACHROME'): return (WHITE, BLUE, BLUE, None)
        if n.startswith('ELITE'): return (WHITE, BLUE, ORANGE, None)
        if n.startswith('AERO'): return ((100, 100, 100), WHITE, WHITE, None)
        if n.startswith('VERICOLOR'): return (WHITE, RED, BLACK, None)
        if n.startswith(('BW400', 'HIE', 'DOUBLE')): return (BLACK, WHITE, WHITE, None)
        return (WHITE, BLACK, BLACK, None)
    if brand == 'FUJIFILM':
        if n.startswith('VELVIA'): return ((0, 70, 40), WHITE, PINK if number.startswith('50') else ORANGE, None)
        if n.startswith('PROVIA'): return (BLUE, WHITE, WHITE, None)
        if n.startswith(('ASTIA', 'SENSIA')): return ((235, 215, 150), (40, 60, 40), (40, 60, 40), None)
        if n.startswith(('PRO', 'FUJICOLOR')): return (WHITE, GREEN, GREEN, None)
        if n.startswith(('SUPERIA', 'X-TRA', 'REALA')): return ((30, 160, 80), WHITE, WHITE, None)
        if n.startswith('NATURA'): return ((26, 42, 68), WHITE, (120, 180, 255), None)
        if n.startswith(('ACROS', 'NEOPAN')): return ((35, 35, 35), WHITE, WHITE, (120, 210, 130))
        if n.startswith('INSTAX'): return (WHITE, (91, 45, 144), (91, 45, 144), None)
        if n.startswith('FP-'): return (WHITE, BLUE, BLACK, None)
        if n.startswith(('ETERNA', '8')): return ((25, 25, 25), WHITE, (120, 210, 130), None)
        return (WHITE, GREEN, GREEN, None)
    if brand == 'ILFORD':
        accents = [('HP5', (225, 30, 40)), ('HPS', (225, 30, 40)), ('FP4', (0, 160, 150)), ('DELTA 100', (30, 100, 200)),
                   ('DELTA 400', (200, 30, 100)), ('DELTA 3200', (120, 40, 160)), ('PAN F', (250, 200, 0)),
                   ('XP2', ORANGE), ('SFX', (180, 20, 30)), ('ORTHO', (60, 170, 220))]
        accent = next((color for prefix, color in accents if key.startswith(prefix)), WHITE)
        return (BLACK, WHITE, accent, accent)
    if brand == 'AGFA':
        if n.startswith('APX'): return (BLACK, WHITE, RED, RED)
        if n.startswith('PRECISA'): return (WHITE, RED, RED, None)
        if n.startswith('ULTRA'): return ((230, 60, 30), WHITE, YELLOW, None)
        return (ORANGE, BLACK, WHITE, None)
    if brand == 'POLAROID':
        return (WHITE, BLACK, BLACK, None)
    if brand == 'LOMO':
        if 'PURPLE' in n: return (PURPLE, WHITE, WHITE, None)
        if 'TURQ' in n: return (TEAL, WHITE, WHITE, None)
        if 'METRO' in n: return ((60, 70, 80), WHITE, WHITE, None)
        if 'REDSCALE' in n: return ((190, 20, 40), WHITE, YELLOW, None)
        if 'X-PRO' in n or 'XPRO' in n: return (BLACK, (0, 200, 220), WHITE, None)
        return (BLACK, WHITE, WHITE, None)
    if brand == 'ROLLEI':
        return (BLACK, WHITE, ORANGE if 'ORTHO' in n or 'RETRO' in n else WHITE, (220, 40, 40))
    if brand == 'CINESTILL':
        accent = RED if 'T' in number.upper() else (ORANGE if '400' in number else (80, 170, 240))
        return (BLACK, WHITE, accent, accent)
    if brand == 'HARMAN':
        return ((214, 79, 30), BLACK, BLACK, None)
    if brand == 'RICOH':
        # A GR body: black, the name white, the model in the red of the GR badge.
        return ((28, 28, 28), WHITE, (210, 30, 45), None)
    return (WHITE, BLACK, BLACK, None)


def font(path, size):
    return ImageFont.truetype(path, size)


def measure(draw, text, f):
    left, top, right, bottom = draw.textbbox((0, 0), text, font=f)
    return right - left, left, top, bottom


def fit(draw, text, path, size, width, smallest=6):
    f = font(path, size)
    while size > smallest and measure(draw, text, f)[0] > width:
        size -= 1
        f = font(path, size)
    return f


def centered(draw, text, top, f, fill, x0=0, x1=WIDTH):
    """Draw text with its glyph box centered between x0 and x1 and its top at `top`.
    Returns the height of the glyph box."""
    w, left, t, bottom = measure(draw, text, f)
    x = round(x0 + (x1 - x0 - w) / 2 - left)
    draw.text((x, top - t), text, font=f, fill=fill + (255,))
    return bottom - t


def wrap(draw, name, path, size, width):
    """One or two lines of the name, by words, that fit `width` at `size`."""
    f = font(path, size)
    lines, line = [], ''
    for word in name.upper().split():
        trial = (line + ' ' + word).strip()
        if line and measure(draw, trial, f)[0] > width:
            lines.append(line)
            line = word
        else:
            line = trial
    lines.append(line)
    return lines[:2]


def render(brand, name, number, cine=False, kind=None):
    """The icon as a Pillow RGBA image with binary alpha."""
    img = Image.new('RGBA', (WIDTH, WIDTH), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    band_bg, band_fg = BANDS.get(brand, (YELLOW, RED))
    if cine and brand == 'Kodak':
        band_bg, band_fg = YELLOW, BLACK      # the yellow label of a black can
    body, name_fg, number_fg, accent = palette(brand, name, number, cine)
    d.rectangle([0, TOP, WIDTH - 1, BOTTOM], fill=body + (255,))
    d.rectangle([0, TOP, WIDTH - 1, BAND_BOTTOM], fill=band_bg + (255,))
    # The brand
    if brand == 'POLAROID':
        for i, color in enumerate(RAINBOW):
            d.rectangle([1, TOP + 2 + i, 6, TOP + 2 + i], fill=color + (255,))
        centered(d, BAND_TEXT[brand], TOP + 2, fit(d, BAND_TEXT[brand], BOLD, 8, 30), band_fg, 8, WIDTH)
    elif brand == 'Kodak' and not cine:
        # The red Kodak mark with its yellow K, then the name
        d.rounded_rectangle([2, TOP + 1, 9, TOP + 7], radius=1, fill=RED + (255,))
        d.text((4, TOP), 'K', font=font(BLACK_FONT, 8), fill=YELLOW + (255,))
        centered(d, BAND_TEXT[brand], TOP + 2, fit(d, BAND_TEXT[brand], BOLD, 8, 26), band_fg, 11, WIDTH)
    else:
        centered(d, BAND_TEXT[brand], TOP + 2, fit(d, BAND_TEXT[brand], BOLD, 8, 36), band_fg)
    # The name: one or two lines, or large when there is no number
    y = BAND_BOTTOM + 2
    floor = BOTTOM - (3 if kind else 1)   # the rows above the film type stripe
    # A name that only repeats the brand, as CineStill 800T, leaves the room to the number.
    lines = [] if name.upper() == BAND_TEXT[brand].upper() else wrap(d, name, BOLD, 8, 36)
    if not number and lines:
        size = 12 if len(lines) == 1 else 10
        pitch = size - 1
        total = pitch * len(lines)
        y += max(0, (floor - y - total) // 2)
        for line in lines:
            centered(d, line, y, fit(d, line, BLACK_FONT, size, 38), name_fg)
            y += pitch
    else:
        for line in lines:
            centered(d, line, y, fit(d, line, BOLD, 8, 38), name_fg)
            y += 7
    # The number, as large as the room below the name allows
    if number:
        size = 19 if len(lines) <= 1 else 12
        f = fit(d, number.upper(), BLACK_FONT, size, 38)
        w, left, t, bottom = measure(d, number.upper(), f)
        h = bottom - t
        room = floor - y
        centered(d, number.upper(), y + max(0, (room - h) // 2), f, number_fg)
    # A stripe in the accent color under the band, as Ilford and the cine cans have
    if accent:
        d.rectangle([0, BAND_BOTTOM + 1, WIDTH - 1, BAND_BOTTOM + 1], fill=accent + (255,))
    # The film type stripe at the bottom
    if kind:
        d.rectangle([0, BOTTOM - 1, WIDTH - 1, BOTTOM], fill=KINDS[kind] + (255,))
    # The light on the box: a little brighter under the band, darker toward the bottom
    px = img.load()
    body_rows = range(BAND_BOTTOM + 1, BOTTOM - (2 if kind else 0))
    for yy in body_rows:
        t = (yy - (BAND_BOTTOM + 1)) / max(1, len(body_rows) - 1)
        factor = 1.06 - 0.12 * t
        for x in range(WIDTH):
            r, g, b, a = px[x, yy]
            if (r, g, b) == body:
                px[x, yy] = shade(body, factor) + (255,)
    # The edges of a box: light at the top and left, dark at the right and bottom
    for x in range(WIDTH):
        r, g, b, a = px[x, TOP]; px[x, TOP] = shade((r, g, b), 1.3) + (255,)
        r, g, b, a = px[x, BOTTOM]; px[x, BOTTOM] = shade((r, g, b), 0.5) + (255,)
    for yy in range(TOP, BOTTOM + 1):
        r, g, b, a = px[0, yy]; px[0, yy] = shade((r, g, b), 1.2) + (255,)
        r, g, b, a = px[WIDTH - 1, yy]; px[WIDTH - 1, yy] = shade((r, g, b), 0.5) + (255,)
    # A dark body gets a gray rim, so it does not melt into the menu
    if luminance(body) < 60:
        for x in range(WIDTH):
            px[x, TOP] = (110, 110, 110, 255); px[x, BOTTOM] = (90, 90, 90, 255)
        for yy in range(TOP, BOTTOM + 1):
            px[0, yy] = (110, 110, 110, 255); px[WIDTH - 1, yy] = (90, 90, 90, 255)
    # Binary alpha
    for yy in range(WIDTH):
        for x in range(WIDTH):
            r, g, b, a = px[x, yy]
            px[x, yy] = (r, g, b, 255) if a >= 128 else (0, 0, 0, 0)
    return img


def png_bytes(img):
    out = io.BytesIO()
    img.save(out, 'PNG', optimize=True)
    return out.getvalue()


def film_kind(definition):
    """The kind of film of an effect: mono, cine, instant, slide, or negative."""
    cover = definition.get('cover') or definition['icon']
    name = cover['name'].upper()
    target = definition.get('attribution', {}).get('target', '').lower()
    if definition.get('flags', 0) & 1:
        return 'mono'
    if cover.get('template') == 'cine':
        return 'cine'
    if cover.get('brand') == 'POLAROID' or name.startswith(INSTANT_NAMES) or 'instax' in target:
        return 'instant'
    if name.startswith(SLIDE_NAMES) or 'projected' in target or 'slide' in target:
        return 'slide'
    if cover.get('brand') == 'RICOH':
        return None
    return 'negative'


def effect_icon(definition):
    """The icon of an effect definition from its `cover` fields."""
    cover = definition.get('cover') or definition['icon']
    brand = cover.get('brand', 'Kodak')
    if brand not in BANDS:
        brand = 'Kodak'
    return render(brand, cover['name'], cover.get('number', ''), cine=cover.get('template') == 'cine',
                  kind=film_kind(definition))


def sheet(images, cols=13, scale=3):
    rows = (len(images) + cols - 1) // cols
    out = Image.new('RGBA', (cols * 44 * scale, rows * 44 * scale), (30, 30, 30, 255))
    for i, img in enumerate(images):
        big = img.resize((WIDTH * scale, WIDTH * scale), Image.NEAREST)
        out.alpha_composite(big, ((i % cols) * 44 * scale + 2 * scale, (i // cols) * 44 * scale + 2 * scale))
    return out


if __name__ == '__main__':
    command = sys.argv[1] if len(sys.argv) > 1 else 'sheet'
    images = []
    for f in sorted(REPO.glob('effects/*/effect.json')):
        d = json.loads(f.read_text())
        if 'template' in d['icon']:
            d['cover'] = d['icon']
        if 'cover' not in d:
            continue  # a label tile stays
        img = effect_icon(d)
        images.append(img)
        if command == 'embed':
            d['icon'] = {'png': base64.b64encode(png_bytes(img)).decode()}
            ordered = {}
            for k in ['schema', 'effect_id', 'name', 'flags', 'matrix', 'icon', 'cover', 'attribution']:
                if k in d:
                    ordered[k] = d[k]
            for k, v in d.items():
                if k not in ordered:
                    ordered[k] = v
            f.write_text(json.dumps(ordered, indent=2) + '\n')
    if command == 'sheet':
        sheet(images).save(sys.argv[2] if len(sys.argv) > 2 else 'sheet.png')
    print(len(images), 'icons')
