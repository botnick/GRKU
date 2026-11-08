"""The menu tiles of GRKit: the module tiles of modules/*/tiles and the host tiles of
crates/grkit-core/assets/tiles, 40 x 40 RGBA with binary alpha. A list tile keeps the frame of
the native list icons (38 x 36, gray rim, dark body) and shows a small color picture of what
the row does: a film canister for Film Look, a landscape cropped to the ratio for Framing, the
guide lines over a landscape for Guides, an orange date stamp for Date Imprint, a street lamp
at night for Glow, and a grainy picture for Grain. The viewfinder tiles (vf-*) stay marks with
a black outline, so they read over any live view.

    python3 scripts/menu-tiles.py sheet OUT.png   # every tile at 4x, for review
    python3 scripts/menu-tiles.py write           # write the PNG files into the repository

Needs Pillow (`python3 -m pip install pillow`). Text is Roboto Condensed Bold
(crates/grkit-core/assets, SIL OFL 1.1), as the native menu text.
"""
import pathlib, random, sys

from PIL import Image, ImageDraw, ImageFont

REPO = pathlib.Path(__file__).resolve().parent.parent
BOLD = str(REPO / 'crates' / 'grkit-core' / 'assets' / 'RobotoCondensed-Bold.ttf')
SS = 4  # supersampling of the pictures

BODY, RIM = (51, 51, 51), (128, 128, 128)
WHITE, BLACK = (255, 255, 255), (0, 0, 0)
SKY_TOP, SKY_LOW = (62, 125, 210), (168, 208, 242)
SUN = (255, 214, 90)
HILL, GROUND, GROUND_LOW = (48, 128, 92), (58, 132, 66), (36, 92, 48)
NIGHT_TOP, NIGHT_LOW = (8, 12, 36), (30, 40, 92)
ORANGE = (255, 150, 30)
GLOW = (255, 222, 130)
HALATION = (235, 60, 40)

# 3 x 5 digits for the date stamp, as a quartz date back prints them.
DIGITS = {
    '0': "111 101 101 101 111", '1': "010 110 010 010 111", '2': "111 001 111 100 111", '3': "111 001 111 001 111",
    '4': "101 101 111 001 001", '5': "111 100 111 001 111", '6': "111 100 111 101 111", '7': "111 001 010 010 010",
    '8': "111 101 111 101 111", '9': "111 101 111 001 111", "'": "010 010 000 000 000", ':': "000 010 000 010 000",
    ' ': "000 000 000 000 000",
}


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def grey(color):
    v = round(0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2])
    return (v, v, v)


def frame(top=2, bottom=37):
    """A native list frame (rows 2 to 37), or the toolbar frame (rows 1 to 38)."""
    img = Image.new('RGBA', (40, 40), (0, 0, 0, 0))
    px = img.load()
    for y in range(top, bottom + 1):
        for x in range(1, 39):
            edge = x in (1, 38) or y in (top, bottom)
            px[x, y] = (RIM if edge else BODY) + (255,)
    return img


def canvas():
    return Image.new('RGBA', (40 * SS, 40 * SS), (0, 0, 0, 0))


def box(x0, y0, x1, y1):
    """The supersampled box of the pixels x0..x1, y0..y1 inclusive."""
    return [x0 * SS, y0 * SS, (x1 + 1) * SS - 1, (y1 + 1) * SS - 1]


def paste(img, picture, clip=(2, 3, 37, 36)):
    """Downsample a supersampled picture onto img, inside the pixels of `clip` only."""
    small = picture.resize((40, 40), Image.BOX)
    x0, y0, x1, y1 = clip
    img.alpha_composite(small.crop((x0, y0, x1 + 1, y1 + 1)), (x0, y0))


def binarize(img):
    px = img.load()
    for y in range(40):
        for x in range(40):
            r, g, b, a = px[x, y]
            px[x, y] = (r, g, b, 255) if a >= 128 else (0, 0, 0, 0)
    return img


def landscape(target, x0, y0, x1, y1, mono=False, night=False):
    """A small landscape in the pixels x0..x1, y0..y1 of the canvas c: sky, sun, a hill, and
    the ground. Nothing of it leaves the box."""
    temp = canvas()
    d = ImageDraw.Draw(temp)
    h = y1 - y0 + 1
    w = x1 - x0 + 1
    horizon = y0 + round(h * 0.62)
    top, low = (NIGHT_TOP, NIGHT_LOW) if night else (SKY_TOP, SKY_LOW)
    for y in range(y0, horizon):
        c = lerp(top, low, (y - y0) / max(1, horizon - 1 - y0))
        d.rectangle(box(x0, y, x1, y), fill=(grey(c) if mono else c) + (255,))
    if not night:
        r = max(1.5, h * 0.14)
        cx, cy = x0 + w * 0.74, y0 + h * 0.28
        c = grey(SUN) if mono else SUN
        d.ellipse([(cx - r) * SS, (cy - r) * SS, (cx + r) * SS, (cy + r) * SS], fill=c + (255,))
    # The hill: an ellipse that rises above the horizon on the left
    c = grey(HILL) if mono else HILL
    hw, hh = w * 0.7, h * 0.26
    hx, hy = x0 + w * 0.3, horizon
    d.ellipse([(hx - hw) * SS, (hy - hh) * SS, (hx + hw) * SS, (hy + hh) * SS], fill=c + (255,))
    for y in range(horizon, y1 + 1):
        g = lerp(GROUND, GROUND_LOW, (y - horizon) / max(1, y1 - horizon))
        d.rectangle(box(x0, y, x1, y), fill=(grey(g) if mono else g) + (255,))
    region = box(x0, y0, x1, y1)
    target.paste(temp.crop((region[0], region[1], region[2] + 1, region[3] + 1)), (region[0], region[1]))


def text(img, label, top, size=9, fill=WHITE, x0=1, x1=38):
    d = ImageDraw.Draw(img)
    f = ImageFont.truetype(BOLD, size)
    while size > 6:
        left, t, right, bottom = d.textbbox((0, 0), label, font=f)
        if right - left <= x1 - x0 - 3:
            break
        size -= 1
        f = ImageFont.truetype(BOLD, size)
    left, t, right, bottom = d.textbbox((0, 0), label, font=f)
    x = round(x0 + (x1 - x0 + 1 - (right - left)) / 2 - left)
    d.text((x, top - t), label, font=f, fill=fill + (255,))


def outlined_text(img, label, top, size, fill=WHITE):
    """Text with a one pixel black outline, for text over a picture."""
    d = ImageDraw.Draw(img)
    f = ImageFont.truetype(BOLD, size)
    left, t, right, bottom = d.textbbox((0, 0), label, font=f)
    x = round((40 - (right - left)) / 2 - left)
    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, 1), (-1, 1), (1, -1)]:
        d.text((x + dx, top - t + dy), label, font=f, fill=(0, 0, 0, 255))
    d.text((x, top - t), label, font=f, fill=fill + (255,))


def digits(img, s, x, y, color, shadow=None):
    """A string of 3 x 5 digits with its left top at x, y."""
    px = img.load()
    for ch in s:
        rows = DIGITS.get(ch, DIGITS[' ']).split(' ')
        for r, bits in enumerate(rows):
            for c, bit in enumerate(bits):
                if bit == '1':
                    if shadow and 0 <= x + c + 1 < 40 and 0 <= y + r + 1 < 40:
                        px[x + c + 1, y + r + 1] = shadow + (255,)
        x += 4
    x -= 4 * len(s)
    for ch in s:
        rows = DIGITS.get(ch, DIGITS[' ']).split(' ')
        for r, bits in enumerate(rows):
            for c, bit in enumerate(bits):
                if bit == '1' and 0 <= x + c < 40 and 0 <= y + r < 40:
                    px[x + c, y + r] = color + (255,)
        x += 4


def hline(img, x0, x1, y, color):
    px = img.load()
    for x in range(x0, x1 + 1):
        if 0 <= x < 40 and 0 <= y < 40:
            px[x, y] = color + (255,)


def vline(img, x, y0, y1, color):
    px = img.load()
    for y in range(y0, y1 + 1):
        if 0 <= x < 40 and 0 <= y < 40:
            px[x, y] = color + (255,)


def rect_outline(img, x0, y0, x1, y1, color):
    hline(img, x0, x1, y0, color); hline(img, x0, x1, y1, color)
    vline(img, x0, y0, y1, color); vline(img, x1, y0, y1, color)


def bars(img, count, lit, x0=4, bottom=35, step=5, width=4, lit_color=WHITE, dim_color=(110, 110, 110), outline=None):
    """Strength bars that rise to the right: `lit` of `count` are lit."""
    px = img.load()
    for i in range(count):
        h = 3 + 2 * i
        x = x0 + i * (width + 1)
        color = lit_color if i < lit else dim_color
        for yy in range(bottom - h + 1, bottom + 1):
            for xx in range(x, x + width):
                px[xx, yy] = color + (255,)
        if outline:
            for yy in range(bottom - h, bottom + 2):
                for xx in range(x - 1, x + width + 1):
                    if px[xx, yy][3] == 0:
                        px[xx, yy] = outline + (255,)
    return img


def dim(img, factor=0.5):
    """Dim the drawing inside the frame halfway to the body, as the native Off icons do."""
    px = img.load()
    for y in range(3, 37):
        for x in range(2, 38):
            r, g, b, a = px[x, y]
            if a:
                px[x, y] = lerp((r, g, b), BODY, factor) + (255,)
    return img


def strike(img):
    """A white line with a black edge from the top left to the bottom right, as the native Off icons."""
    d = ImageDraw.Draw(img)
    d.line([(4, 5), (35, 36)], fill=(0, 0, 0, 255), width=5)
    d.line([(4, 5), (35, 36)], fill=(255, 255, 255, 255), width=3)
    return img


# ---- Film Look -----------------------------------------------------------------------------

def film_look_module():
    img = frame()
    c = canvas(); d = ImageDraw.Draw(c)
    # The film leader out of the canister, to the right, with its perforations
    d.rounded_rectangle(box(16, 12, 35, 28), radius=2 * SS, fill=(78, 52, 36, 255))
    d.rectangle(box(16, 12, 20, 28), fill=(78, 52, 36, 255))
    for x in (21, 25, 29, 33):
        d.rectangle(box(x, 14, x + 1, 15), fill=BODY + (255,))
        d.rectangle(box(x, 25, x + 1, 26), fill=BODY + (255,))
    # A frame on the leader, as an exposed negative
    d.rectangle(box(22, 17, 31, 23), fill=(150, 96, 60, 255))
    d.rectangle(box(23, 18, 30, 22), fill=(190, 130, 80, 255))
    # The canister: a yellow body with black caps and a red band
    d.rectangle(box(5, 9, 18, 31), fill=(250, 200, 0, 255))
    d.rectangle(box(5, 9, 18, 11), fill=(20, 20, 20, 255))
    d.rectangle(box(5, 29, 18, 31), fill=(20, 20, 20, 255))
    d.rectangle(box(9, 6, 14, 8), fill=(60, 60, 60, 255))     # the spool
    d.rectangle(box(5, 18, 18, 22), fill=(210, 20, 30, 255))
    d.rectangle(box(5, 9, 6, 31), fill=(230, 180, 0, 255))     # the shaded left edge
    d.rectangle(box(17, 12, 18, 28), fill=(200, 150, 0, 255))  # the shaded right edge
    paste(img, c)
    return binarize(img)


# ---- Framing -------------------------------------------------------------------------------

RATIOS = [('1-xpan', 'XPan', 32, 12), ('2-16-9', '16:9', 32, 18), ('3-4-3', '4:3', 24, 18), ('4-2-35', '2.35', 32, 14),
          ('5-1-1', '1:1', 18, 18), ('6-5-4', '5:4', 22, 18), ('7-7-6', '7:6', 21, 18)]


def framing_module():
    img = frame()
    c = canvas(); d = ImageDraw.Draw(c)
    landscape(c, 3, 4, 36, 35)
    paste(img, c)
    # Corner brackets of the frame
    for (x, y, dx, dy) in [(3, 4, 1, 1), (36, 4, -1, 1), (3, 35, 1, -1), (36, 35, -1, -1)]:
        hline(img, min(x, x + 7 * dx), max(x, x + 7 * dx), y, WHITE)
        vline(img, x, min(y, y + 7 * dy), max(y, y + 7 * dy), WHITE)
        hline(img, min(x, x + 7 * dx), max(x, x + 7 * dx), y + dy, BLACK)
        vline(img, x + dx, min(y, y + 7 * dy), max(y, y + 7 * dy), BLACK)
    return binarize(img)


def framing_ratio(label, w, h):
    img = frame()
    x0 = 20 - w // 2
    y0 = 5 + (18 - h) // 2
    c = canvas(); d = ImageDraw.Draw(c)
    landscape(c, x0 + 1, y0 + 1, x0 + w - 2, y0 + h - 2)
    paste(img, c)
    rect_outline(img, x0, y0, x0 + w - 1, y0 + h - 1, WHITE)
    text(img, label, 26, 9)
    return binarize(img)


# ---- Guides --------------------------------------------------------------------------------

def guide_lines(img, kind, x0, y0, x1, y1, color=WHITE):
    w, h = x1 - x0, y1 - y0
    if kind in ('thirds', 'thirds-center'):
        for t in (1 / 3, 2 / 3):
            vline(img, x0 + round(w * t), y0, y1, color)
            hline(img, x0, x1, y0 + round(h * t), color)
    if kind == 'golden':
        for t in (0.382, 0.618):
            vline(img, x0 + round(w * t), y0, y1, color)
            hline(img, x0, x1, y0 + round(h * t), color)
    if kind in ('center', 'thirds-center'):
        cx, cy = x0 + w // 2, y0 + h // 2
        hline(img, cx - 3, cx + 3, cy, color)
        vline(img, cx, cy - 3, cy + 3, color)
    if kind == 'diagonals':
        d = ImageDraw.Draw(img)
        d.line([(x0, y0), (x1, y1)], fill=color + (255,), width=1)
        d.line([(x1, y0), (x0, y1)], fill=color + (255,), width=1)


def guides_module():
    img = frame()
    c = canvas(); d = ImageDraw.Draw(c)
    landscape(c, 3, 4, 36, 35)
    paste(img, c)
    guide_lines(img, 'thirds', 3, 4, 36, 35)
    return binarize(img)


GUIDES = [('1-thirds', '3x3', 'thirds'), ('2-center', 'Ctr', 'center'), ('3-golden', 'Phi', 'golden'),
          ('4-diagonals', 'Diag', 'diagonals'), ('5-thirds-center', '3x3+', 'thirds-center')]


def guides_option(label, kind):
    img = frame()
    x0, y0, x1, y1 = 4, 5, 35, 24
    c = canvas(); d = ImageDraw.Draw(c)
    landscape(c, x0 + 1, y0 + 1, x1 - 1, y1 - 1)
    paste(img, c)
    rect_outline(img, x0, y0, x1, y1, (200, 200, 200))
    guide_lines(img, kind, x0, y0, x1, y1, (255, 240, 120))
    text(img, label, 26, 9)
    return binarize(img)


# ---- Date Imprint --------------------------------------------------------------------------

DATE_STAMP = "'26 11 8"
DATES = [('1-yy-m-d', 'YMD', "'26 11 8", None), ('2-yy-m-d-time', 'YMD', "'26 11 8", '01:45'),
         ('3-m-d-yy', 'MDY', "11 8 '26", None), ('4-d-m-yy', 'DMY', "8 11 '26", None),
         ('5-d-m-yy-time', 'DMY', "8 11 '26", '01:45')]


def date_module():
    img = frame()
    c = canvas(); d = ImageDraw.Draw(c)
    landscape(c, 3, 4, 36, 35)
    paste(img, c)
    width = 4 * len(DATE_STAMP) - 1
    digits(img, DATE_STAMP, 35 - width, 28, ORANGE, shadow=(90, 40, 0))
    return binarize(img)


def date_option(label, stamp, time):
    img = frame()
    text(img, label + (' HM' if time else ''), 5, 9)
    y = 17 if time else 20
    digits(img, stamp, 20 - (4 * len(stamp) - 1) // 2, y, ORANGE, shadow=(90, 40, 0))
    if time:
        digits(img, time, 20 - (4 * len(time) - 1) // 2, 26, ORANGE, shadow=(90, 40, 0))
    return binarize(img)


# ---- Glow ----------------------------------------------------------------------------------

def night(d, x0=3, y0=4, x1=36, y1=35):
    h = y1 - y0 + 1
    for y in range(y0, y1 + 1):
        c = lerp(NIGHT_TOP, NIGHT_LOW, (y - y0) / max(1, h - 1))
        d.rectangle(box(x0, y, x1, y), fill=c + (255,))


def lamp(d, cx, cy, bloom=0, halation=0, core=3.2):
    """A light at cx, cy: a soft warm bloom of radius `bloom`, a red halation ring of width
    `halation`, and a white core."""
    if bloom:
        steps = 24
        for i in range(steps):
            r = core + bloom * (1 - i / steps)
            t = (i + 1) / steps
            c = lerp(NIGHT_LOW, GLOW, 0.1 + 0.9 * t ** 1.8)
            d.ellipse([(cx - r) * SS, (cy - r) * SS, (cx + r) * SS, (cy + r) * SS], fill=c + (255,))
    if halation:
        for i in range(halation * 2):
            r = core + 0.6 + halation - i / 2
            t = i / max(1, halation * 2 - 1)
            c = lerp(HALATION, (255, 160, 90), t)
            d.ellipse([(cx - r) * SS, (cy - r) * SS, (cx + r) * SS, (cy + r) * SS], fill=c + (255,))
    d.ellipse([(cx - core) * SS, (cy - core) * SS, (cx + core) * SS, (cy + core) * SS], fill=(255, 255, 255, 255))


def glow_module():
    img = frame()
    c = canvas(); d = ImageDraw.Draw(c)
    night(d)
    # A street lamp with a glowing head over a dark ground
    lamp(d, 20, 14, bloom=11, halation=2)
    d.rectangle(box(3, 32, 36, 35), fill=(4, 6, 16, 255))
    d.rectangle(box(19, 17, 20, 32), fill=(10, 12, 20, 255))
    paste(img, c)
    return binarize(img)


def glow_option(kind, level):
    img = frame()
    c = canvas(); d = ImageDraw.Draw(c)
    night(d)
    if kind == 'bloom':
        lamp(d, 20, 15, bloom=[0, 5, 7.5, 10][level])
    else:
        lamp(d, 20, 15, halation=[0, 1, 2, 3][level])
    paste(img, c)
    bars(img, 3, level, x0=22, bottom=34)
    return binarize(img)


def glow_vf(kind, level):
    img = Image.new('RGBA', (40, 40), (0, 0, 0, 0))
    c = canvas(); d = ImageDraw.Draw(c)
    cx, cy = 20, 12
    if kind == 'bloom':
        ring = [0, 5, 6.5, 8][level]
        d.ellipse([(cx - ring - 1) * SS, (cy - ring - 1) * SS, (cx + ring + 1) * SS, (cy + ring + 1) * SS], fill=(0, 0, 0, 255))
        d.ellipse([(cx - ring) * SS, (cy - ring) * SS, (cx + ring) * SS, (cy + ring) * SS], fill=GLOW + (255,))
        d.ellipse([(cx - ring + 2) * SS, (cy - ring + 2) * SS, (cx + ring - 2) * SS, (cy + ring - 2) * SS], fill=(0, 0, 0, 255))
    else:
        ring = 5 + level
        d.ellipse([(cx - ring - 1) * SS, (cy - ring - 1) * SS, (cx + ring + 1) * SS, (cy + ring + 1) * SS], fill=(0, 0, 0, 255))
        d.ellipse([(cx - ring) * SS, (cy - ring) * SS, (cx + ring) * SS, (cy + ring) * SS], fill=HALATION + (255,))
        inner = ring - 1 - level * 0.5
        d.ellipse([(cx - inner) * SS, (cy - inner) * SS, (cx + inner) * SS, (cy + inner) * SS], fill=(0, 0, 0, 255))
    d.ellipse([(cx - 4) * SS, (cy - 4) * SS, (cx + 4) * SS, (cy + 4) * SS], fill=(0, 0, 0, 255))
    d.ellipse([(cx - 3) * SS, (cy - 3) * SS, (cx + 3) * SS, (cy + 3) * SS], fill=(255, 255, 255, 255))
    paste(img, c)
    bars(img, 3, level, x0=12, bottom=35, outline=BLACK)
    return binarize(img)


# ---- Grain ---------------------------------------------------------------------------------

def speckle(img, x0, y0, x1, y1, count, seed, big=0):
    rng = random.Random(seed)
    px = img.load()
    for i in range(count):
        x, y = rng.randint(x0, x1), rng.randint(y0, y1)
        v = rng.choice([235, 250, 40, 60, 200])
        px[x, y] = (v, v, v, 255)
        if i < big and x < x1 and y < y1:
            px[x + 1, y] = (v, v, v, 255)
            px[x, y + 1] = (v, v, v, 255)


def grain_module():
    img = frame()
    c = canvas(); d = ImageDraw.Draw(c)
    landscape(c, 3, 4, 36, 35, mono=True)
    paste(img, c)
    speckle(img, 3, 4, 36, 35, 110, seed=7, big=16)
    return binarize(img)


def grain_option(level):
    img = frame()
    x0, y0, x1, y1 = 4, 5, 35, 24
    c = canvas(); d = ImageDraw.Draw(c)
    landscape(c, x0, y0, x1, y1, mono=True)
    paste(img, c)
    speckle(img, x0, y0, x1, y1, [0, 30, 60, 100, 150][level], seed=level, big=[0, 0, 0, 10, 30][level])
    bars(img, 4, level, x0=10, bottom=34)
    return binarize(img)


def grain_vf(level):
    img = Image.new('RGBA', (40, 40), (0, 0, 0, 0))
    rng = random.Random(100 + level)
    px = img.load()
    count = [0, 7, 11, 15, 20][level]
    for _ in range(count):
        x, y = rng.randint(6, 33), rng.randint(3, 19)
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                if px[x + dx, y + dy][3] == 0:
                    px[x + dx, y + dy] = (0, 0, 0, 255)
        px[x, y] = (255, 255, 255, 255)
    bars(img, 4, level, x0=10, bottom=35, outline=BLACK)
    return binarize(img)


# ---- Host tiles ----------------------------------------------------------------------------

def grk_tile():
    """The GRKit entry of the ADJ toolbar: a strip of color film with GRK on it."""
    img = frame(1, 38)
    px = img.load()
    for y in range(8, 32):
        for x in range(2, 38):
            px[x, y] = (24, 24, 24, 255)
    for x in range(4, 38, 6):
        for y in (10, 11, 28, 29):
            for xx in range(x, x + 3):
                px[xx, y] = (190, 190, 190, 255)
    for i, color in enumerate([(205, 80, 60), (70, 150, 100), (60, 110, 200)]):
        x0 = 3 + i * 12
        for y in range(14, 26):
            for x in range(x0, x0 + 11):
                px[x, y] = color + (255,)
    outlined_text(img, 'GRK', 14, 13)
    return binarize(img)


def version_tile():
    img = frame()
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([5, 12, 34, 27], radius=3, fill=(30, 90, 180, 255))
    text(img, 'VER', 14, 11)
    return binarize(img)


def modules_tile():
    img = frame()
    d = ImageDraw.Draw(img)
    for (x, y), color in zip([(10, 5), (21, 5), (10, 16), (21, 16)],
                             [(215, 60, 50), (250, 190, 0), (50, 160, 90), (50, 110, 210)]):
        d.rectangle([x, y, x + 8, y + 8], fill=color + (255,))
    text(img, 'MOD', 27, 9)
    return binarize(img)


def all_tiles():
    tiles = {}
    tiles['modules/film-look/tiles/0-module.png'] = film_look_module()
    tiles['modules/framing/tiles/0-module.png'] = framing_module()
    for file, label, w, h in RATIOS:
        tiles[f'modules/framing/tiles/{file}.png'] = framing_ratio(label, w, h)
    tiles['modules/guides/tiles/0-module.png'] = guides_module()
    for file, label, kind in GUIDES:
        tiles[f'modules/guides/tiles/{file}.png'] = guides_option(label, kind)
    tiles['modules/date/tiles/0-module.png'] = date_module()
    for file, label, stamp, time in DATES:
        tiles[f'modules/date/tiles/{file}.png'] = date_option(label, stamp, time)
    tiles['modules/glow/tiles/0-module.png'] = glow_module()
    for kind, names in [('bloom', ['1-bloom-weak', '1-bloom', '3-bloom-strong']),
                        ('halation', ['4-halation-weak', '2-halation', '6-halation-strong'])]:
        for level, name in enumerate(names, 1):
            tiles[f'modules/glow/tiles/{name}.png'] = glow_option(kind, level)
        tiles[f'modules/glow/tiles/off-{kind}.png'] = strike(dim(glow_option(kind, 2)))
        for level, name in enumerate(['weak', 'medium', 'strong'], 1):
            tiles[f'modules/glow/tiles/vf-{kind}-{name}.png'] = glow_vf(kind, level)
    tiles['modules/grain/tiles/0-module.png'] = grain_module()
    for level, name in enumerate(['1-weak', '2-medium', '3-strong', '4-extra'], 1):
        tiles[f'modules/grain/tiles/{name}.png'] = grain_option(level)
        tiles[f'modules/grain/tiles/vf-{name}.png'] = grain_vf(level)
    tiles['modules/grain/tiles/off.png'] = strike(dim(grain_option(2)))
    tiles['crates/grkit-core/assets/tiles/grk.png'] = grk_tile()
    tiles['crates/grkit-core/assets/tiles/ver.png'] = version_tile()
    tiles['crates/grkit-core/assets/tiles/mod.png'] = modules_tile()
    tiles['crates/grkit-core/assets/tiles/mod-off.png'] = strike(dim(modules_tile()))
    return tiles


def sheet(tiles, cols=10, scale=4):
    names = list(tiles)
    rows = (len(names) + cols - 1) // cols
    out = Image.new('RGBA', (cols * 46 * scale, rows * 46 * scale), (30, 30, 30, 255))
    for i, name in enumerate(names):
        big = tiles[name].resize((40 * scale, 40 * scale), Image.NEAREST)
        out.alpha_composite(big, ((i % cols) * 46 * scale + 3 * scale, (i // cols) * 46 * scale + 3 * scale))
    return out


if __name__ == '__main__':
    command = sys.argv[1] if len(sys.argv) > 1 else 'sheet'
    tiles = all_tiles()
    if command == 'write':
        for name, img in tiles.items():
            path = REPO / name
            path.parent.mkdir(parents=True, exist_ok=True)
            img.save(path, 'PNG', optimize=True)
    else:
        sheet(tiles).save(sys.argv[2] if len(sys.argv) > 2 else 'tiles.png')
    print(len(tiles), 'tiles')
