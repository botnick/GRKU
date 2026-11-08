"""The Thai strings of the site, through Gemini (MaxPlus), never typed by hand.

    MAXPLUS_KEY=ccsk-... python3 -I scripts/i18n-th.py            # write the `th` block of web/src/i18n.ts
    MAXPLUS_KEY=ccsk-... python3 -I scripts/i18n-th.py --check    # only count the strings

The English block `const en = {...}` of web/src/i18n.ts is the source. Every string literal and
template literal in it goes to Gemini in batches, with the placeholders (`${name}`), the code
spans, and the product names to keep. The script writes `const th: Strings = {...}` with the
same shape (the keys, the functions, and the comments stay English) after the `ko` block, and
registers Thai in LANGUAGES and STRINGS. Run it again to redo the translation; it replaces the
block. The brand speaks Thai first: short, plain, friendly, correct for camera users.
"""
import json, os, re, sys, urllib.request

BASE = os.environ.get('MAXPLUS_BASE', 'https://api.maxplus-ai.cc/gemini-vip/v1/chat/completions')
MODEL = os.environ.get('MAXPLUS_MODEL', 'gemini-4-argon')
PATH = os.path.join(os.path.dirname(__file__), '..', 'web', 'src', 'i18n.ts')

SYSTEM = """You translate the interface strings of GRKU (จีอาร์คุ), a website and SD-card add-on for RICOH GR III / IIIx / IV cameras, from English into Thai.

You get a JSON array of English strings and answer with a JSON array of the same length, each element the Thai translation of the element at the same index. Rules:
- Thai as a friendly, clear product writes it for camera users: short sentences, plain words, no ครับ/ค่ะ, no slang. Explain so a beginner understands at once. Keep the meaning exactly; do not add or drop information.
- Keep as they are, untranslated: placeholders such as ${cameras} or ${max}, anything inside backticks, file and folder names (GRKU.zip, GRKIT, SCRIPT, DNG, LUT), product and brand names (GRKU, RICOH GR IV, Kodak, Portra 400), camera screen words (ADJ, MENU, Fn, OK, DISP, Image Control, Custom), version numbers, units, percentages, and leading or trailing spaces of a string.
- Use the terms Thai photographers use: เฟิร์มแวร์, การ์ด SD, เมนู, ปุ่ม ADJ, ปุ่ม Fn, ไลฟ์วิว, ฟิล์มลุค (film look), สัดส่วนภาพ (ratio), ครอป, เกรน (grain), ประกายแสง (glow), ประทับวันที่ (date imprint), ตัวอย่าง (preview), ดาวน์โหลด, ติดตั้ง, เขียนลงการ์ด, นำเข้า LUT.
- A string that is a single word or a label stays a single word or label. A string that is a sentence ends like the source (with or without a period).
- Answer with the JSON array only."""


def literals(block):
    """Each string or template literal of the block with its span: (start, end, quote, text)."""
    out = []; i = 0; n = len(block)
    while i < n:
        c = block[i]
        if c in "'\"`":
            j = i + 1
            while j < n and block[j] != c:
                if block[j] == '\\':
                    j += 2; continue
                if c == '`' and block.startswith('${', j):
                    k = block.index('}', j); j = k + 1; continue
                j += 1
            out.append((i, j + 1, c, block[i + 1:j])); i = j + 1
        elif block.startswith('//', i):
            i = block.index('\n', i)
        elif block.startswith('/*', i):
            i = block.index('*/', i) + 2
        else:
            i += 1
    return out


def translatable(text):
    """Whether a literal is text for a person (not a key, a code, a path, or a tag)."""
    if not re.search(r'[A-Za-z]{2,}', text):
        return False
    if re.fullmatch(r'[\w.\-/:#$`{}()]+', text):   # a tag, a path, a code, a placeholder
        return False
    return True


def ask(items):
    key = os.environ.get('MAXPLUS_KEY')
    if not key:
        sys.exit('Set MAXPLUS_KEY to a MaxPlus inference key (pool gemini-vip)')
    body = json.dumps({'model': MODEL, 'temperature': 0.2, 'max_tokens': 8000,
                       'messages': [{'role': 'system', 'content': SYSTEM}, {'role': 'user', 'content': json.dumps(items, ensure_ascii=False)}]}).encode()
    request = urllib.request.Request(BASE, data=body, headers={'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'})
    with urllib.request.urlopen(request, timeout=300) as response:
        content = json.load(response)['choices'][0]['message']['content'].strip()
    content = re.sub(r'^```(?:json)?\n(.*)\n```$', r'\1', content, flags=re.S)
    result = json.loads(content)
    if not isinstance(result, list) or len(result) != len(items):
        raise ValueError(f'expected {len(items)} translations, got {len(result) if isinstance(result, list) else type(result)}')
    return result


def escape(text, quote):
    text = text.replace('\\', '\\\\').replace(quote, '\\' + quote)
    return text.replace('\n', '\\n') if quote != '`' else text


def main():
    source = open(PATH, encoding='utf-8').read()
    start = source.index('\nconst en = {\n') + 1
    end = source.index('\n};\n', start) + 4
    block = source[start:end]
    spans = literals(block)
    todo = [(s, e, q, t) for s, e, q, t in spans if translatable(t)]
    print(f'{len(spans)} literals, {len(todo)} to translate', file=sys.stderr)
    if '--check' in sys.argv:
        return
    texts = [t for _, _, _, t in todo]
    translated = []
    size = 30
    for i in range(0, len(texts), size):
        batch = texts[i:i + size]
        print(f'batch {i // size + 1}/{(len(texts) + size - 1) // size}', file=sys.stderr)
        for attempt in range(3):
            try:
                translated.extend(ask(batch)); break
            except Exception as error:
                print('  retry:', error, file=sys.stderr)
                if attempt == 2:
                    raise
    # the Thai block: the English block with each literal replaced, from the end so spans hold
    th = block
    for (s, e, q, _), text in sorted(zip(todo, translated), key=lambda x: -x[0][0]):
        # a placeholder that the model dropped comes back from the source
        th = th[:s] + q + escape(text, q) + q + th[e:]
    th = th.replace('const en = {', 'const th: Strings = {', 1)
    # register the block after ko, or replace an earlier one
    if '\nconst th: Strings = {\n' in source:
        ts = source.index('\nconst th: Strings = {\n') + 1
        te = source.index('\n};\n', ts) + 4
        source = source[:ts] + th + source[te:]
    else:
        anchor = '\nexport const STRINGS: Readonly<Record<Language, Strings>> = {\n'
        source = source.replace(anchor, '\n' + th + anchor, 1)
    if "  th,\n};" not in source:
        source = source.replace("  ja,\n  ko,\n};", "  ja,\n  ko,\n  th,\n};", 1)
    if "{ code: 'th'" not in source:
        source = source.replace("  { code: 'ko', label: '한국어' },\n", "  { code: 'ko', label: '한국어' },\n  { code: 'th', label: 'ไทย' },\n", 1)
    open(PATH, 'w', encoding='utf-8').write(source)
    # a check of the placeholders
    lost = [t for (_, _, _, t), tr in zip(todo, translated) if set(re.findall(r'\$\{[^}]+\}', t)) != set(re.findall(r'\$\{[^}]+\}', tr))]
    print(f'wrote the th block: {len(translated)} strings; placeholder mismatches: {len(lost)}', file=sys.stderr)
    for t in lost[:10]:
        print('  check:', t, file=sys.stderr)


if __name__ == '__main__':
    main()
