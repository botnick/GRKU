"""Film box end-flap icons for the Film Look effects: 40 x 40 RGBA with binary alpha, rows 3
to 36 opaque, like the GRKit film covers, in the brand colors, with a 3 x 5 pixel font and a
2x number. No dependencies.

    python3 -I scripts/flap-icons.py embed    # write the icon of each effect into its effect.json
    python3 -I scripts/flap-icons.py sheet OUT.png   # a sheet of every icon, for review

The icon of each effect comes from its `cover` fields: the brand, the name, and the number
of the film box. `cover` keeps the fields of the former box icon, so the site can show them.
"""
import json, struct, zlib, sys, pathlib

FONT = {
'A':"010 101 111 101 101", 'B':"110 101 110 101 110", 'C':"011 100 100 100 011", 'D':"110 101 101 101 110",
'E':"111 100 110 100 111", 'F':"111 100 110 100 100", 'G':"011 100 101 101 011", 'H':"101 101 111 101 101",
'I':"111 010 010 010 111", 'J':"001 001 001 101 010", 'K':"101 101 110 101 101", 'L':"100 100 100 100 111",
'M':"101 111 111 101 101", 'N':"110 101 101 101 101", 'O':"010 101 101 101 010", 'P':"110 101 110 100 100",
'Q':"010 101 101 111 011", 'R':"110 101 110 101 101", 'S':"011 100 010 001 110", 'T':"111 010 010 010 010",
'U':"101 101 101 101 111", 'V':"101 101 101 101 010", 'W':"101 101 111 111 101", 'X':"101 101 010 101 101",
'Y':"101 101 010 010 010", 'Z':"111 001 010 100 111",
'0':"111 101 101 101 111", '1':"010 110 010 010 111", '2':"111 001 111 100 111", '3':"111 001 111 001 111",
'4':"101 101 111 001 001", '5':"111 100 111 001 111", '6':"111 100 111 101 111", '7':"111 001 010 010 010",
'8':"111 101 111 101 111", '9':"111 101 111 001 111",
'-':"000 000 111 000 000", '+':"000 010 111 010 000", '.':"000 000 000 000 010", ' ':"000 000 000 000 000",
'/':"001 001 010 100 100", '&':"010 101 010 101 011",
}
def glyph(c): return [row for row in FONT.get(c.upper(), FONT[' ']).split(' ')]

def text_width(text, scale=1):
    n = len(text)
    return n * 3 * scale + (n - 1) * scale if n else 0

def draw_text(img, text, x, y, color, scale=1):
    for ch in text:
        rows = glyph(ch)
        for r, bits in enumerate(rows):
            for c, bit in enumerate(bits):
                if bit == '1':
                    for dy in range(scale):
                        for dx in range(scale):
                            put(img, x + c * scale + dx, y + r * scale + dy, color)
        x += 4 * scale

def put(img, x, y, color):
    if 0 <= x < 40 and 0 <= y < 40:
        img[y][x] = (color[0], color[1], color[2], 255)

def fill(img, x0, y0, x1, y1, color):
    for y in range(y0, y1):
        for x in range(x0, x1):
            put(img, x, y, color)

def centered(img, text, y, color, scale=1, x0=0, x1=40):
    w = text_width(text, scale)
    draw_text(img, text, x0 + (x1 - x0 - w) // 2, y, color, scale)

WHITE, BLACK, GREY = (255, 255, 255), (0, 0, 0), (128, 128, 128)
BRANDS = {
    # band bg, band text, body bg, body text, rim
    'Kodak':    ((242, 196, 0), (215, 25, 32), (255, 255, 255), (0, 0, 0), None),
    'FUJIFILM': ((0, 153, 76), WHITE, WHITE, (0, 90, 50), None),
    'ILFORD':   (BLACK, WHITE, WHITE, BLACK, None),
    'AGFA':     ((226, 0, 26), WHITE, (255, 150, 0), BLACK, None),
    'POLAROID': (WHITE, BLACK, WHITE, BLACK, None),
    'LOMO':     (BLACK, WHITE, (255, 230, 0), BLACK, None),
    'ROLLEI':   ((20, 40, 90), WHITE, WHITE, (20, 40, 90), None),
    'CINE':     (BLACK, (242, 196, 0), (40, 40, 40), WHITE, GREY),
}
RAINBOW = [(237, 28, 36), (247, 148, 29), (255, 222, 0), (0, 166, 81), (0, 114, 188)]

def render(brand, name, number, cine=False):
    img = [[(0, 0, 0, 0)] * 40 for _ in range(40)]
    key = 'CINE' if cine else brand
    band_bg, band_fg, body_bg, body_fg, rim = BRANDS[key]
    fill(img, 0, 3, 40, 37, body_bg)
    fill(img, 0, 3, 40, 12, band_bg)
    if brand == 'POLAROID':
        for i, c in enumerate(RAINBOW):
            fill(img, 0, 3 + i * 2 - (1 if i else 0), 7, 3 + i * 2 + 1, c)
        centered(img, 'POLAROID', 5, band_fg, 1, 8, 40)
    else:
        centered(img, brand.upper(), 5, band_fg)
    # The name: one or two lines of at most 10 characters.
    words, lines, line = name.upper().split(), [], ''
    for w in words:
        if line and len(line) + 1 + len(w) > 10:
            lines.append(line); line = w
        else:
            line = (line + ' ' + w).strip()
    lines.append(line)
    lines = [l[:10] for l in lines[:2]]
    y = 14
    for l in lines:
        centered(img, l, y, body_fg); y += 6
    if number:
        scale = 2 if len(number) <= 5 and len(lines) == 1 else 1
        h = 5 * scale
        top = y + max(0, (36 - y - h) // 2)
        centered(img, number.upper(), top, body_fg, scale)
    if rim:
        for x in range(40):
            put(img, x, 3, rim); put(img, x, 36, rim)
        for yy in range(3, 37):
            put(img, 0, yy, rim); put(img, 39, yy, rim)
    return img

def png(img, scale=1):
    w = h = 40 * scale
    raw = bytearray()
    for y in range(h):
        raw.append(0)
        for x in range(w):
            raw += bytes(img[y // scale][x // scale])
    def chunk(t, d): return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(bytes(raw), 9)) + chunk(b'IEND', b'')

def sheet(imgs, cols=8, scale=4):
    rows = (len(imgs) + cols - 1) // cols
    w, h = cols * 44 * scale, rows * 44 * scale
    raw = bytearray()
    for y in range(h):
        raw.append(0)
        for x in range(w):
            i = (y // (44 * scale)) * cols + x // (44 * scale)
            ix, iy = (x // scale) % 44, (y // scale) % 44
            px = (0, 0, 0, 0)
            if i < len(imgs) and ix < 40 and iy < 40:
                px = imgs[i][iy][ix]
            if px[3] == 0: px = (30, 30, 30, 255)
            raw += bytes(px)
    def chunk(t, d): return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(bytes(raw), 9)) + chunk(b'IEND', b'')

BRAND_KEYS = {'Kodak': 'Kodak', 'FUJIFILM': 'FUJIFILM', 'ILFORD': 'ILFORD', 'AGFA': 'AGFA', 'POLAROID': 'POLAROID', 'LOMO': 'LOMO', 'ROLLEI': 'ROLLEI'}

def effect_icon(definition):
    """The icon of an effect definition from its `cover` fields, or from its box icon."""
    cover = definition.get('cover') or definition['icon']
    brand = BRAND_KEYS.get(cover.get('brand', 'Kodak'), 'Kodak')
    return render(brand, cover['name'], cover.get('number', ''), cine=cover.get('template') == 'cine')

if __name__ == '__main__':
    import base64
    repo = pathlib.Path(__file__).resolve().parent.parent
    command = sys.argv[1] if len(sys.argv) > 1 else 'sheet'
    imgs = []
    for f in sorted(repo.glob('effects/*/effect.json')):
        d = json.load(open(f))
        if 'template' in d['icon']:
            d['cover'] = d['icon']
        if 'cover' not in d:
            continue  # a label tile stays
        img = effect_icon(d)
        imgs.append(img)
        if command == 'embed':
            d['icon'] = {'png': base64.b64encode(png(img)).decode()}
            ordered = {}
            for k in ['schema', 'effect_id', 'name', 'flags', 'matrix', 'icon', 'cover', 'attribution']:
                if k in d: ordered[k] = d[k]
            for k, v in d.items():
                if k not in ordered: ordered[k] = v
            f.write_text(json.dumps(ordered, indent=2) + '\n')
    if command == 'sheet':
        pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else 'sheet.png').write_bytes(sheet(imgs, cols=13, scale=3))
    print(len(imgs), 'icons')
