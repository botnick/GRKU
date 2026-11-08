"""Thai text for this project goes through Gemini (MaxPlus, pool gemini-vip), never written by
hand: a faithful translation of an English Markdown file, in the Thai that camera users write
and read, with the Markdown, links, code, file names, and product names kept as they are.

    MAXPLUS_KEY=ccsk-... python3 -I scripts/translate-th.py README.md README.th.md
    MAXPLUS_KEY=ccsk-... python3 -I scripts/translate-th.py --text "One sentence to translate"

The key is an inference key of https://maxplus-ai.cc (pool gemini-vip). The model is
gemini-4-argon unless MAXPLUS_MODEL says otherwise. A translation of a long file goes in
sections (split at level-2 headings), so each request stays small and the structure of the
source survives: the script checks that the headings, links, and code spans of the source are
all in the result, and says so when one is missing.
"""
import json, os, re, sys, urllib.request

BASE = os.environ.get('MAXPLUS_BASE', 'https://api.maxplus-ai.cc/gemini-vip/v1/chat/completions')
MODEL = os.environ.get('MAXPLUS_MODEL', 'gemini-4-argon')

SYSTEM = """You translate the documentation of GRku, an SD-card add-on for RICOH GR III / IIIx / IV cameras, from English into Thai.

Rules:
- Faithful translation: every sentence of the source, in order, nothing added, nothing left out, no summaries, no notes of your own.
- Thai as Thai photographers write it: natural sentence rhythm, polite neutral register (no ครับ/ค่ะ), ordinary spelling. Use the terms Thai camera users use: เฟิร์มแวร์, การ์ด SD, เมนู, ปุ่ม ADJ, ปุ่ม Fn, ไลฟ์วิว, ฟิล์มลุค (for "film look"), สัดส่วนภาพ, เกรน, โฟกัส, ชัตเตอร์, ค่าแสง. Keep the camera's own on-screen words in English as they appear on the camera (ADJ, MENU, Fn, OK, DISP, Image Control, Custom, Snap).
- Keep exactly as in the source: Markdown structure and heading levels, links and their URLs, inline code and code blocks, file and folder names (GRKIT, SCRIPT, GRku.zip), product and brand names (GRku, GRKit, RICOH GR IV, Kodak Portra 400), version numbers, and numbers with their units.
- Thai text has no spaces between words inside a sentence; use a space between sentences and around English words, numbers, and code, as Thai typography does.
- Output only the translated Markdown, no preamble, no code fence around the whole answer."""


def ask(text: str) -> str:
    key = os.environ.get('MAXPLUS_KEY')
    if not key:
        sys.exit('Set MAXPLUS_KEY to a MaxPlus inference key (pool gemini-vip)')
    body = json.dumps({
        'model': MODEL,
        'messages': [{'role': 'system', 'content': SYSTEM}, {'role': 'user', 'content': text}],
        'temperature': 0.3,
        'max_tokens': 8000,
    }).encode()
    request = urllib.request.Request(BASE, data=body, headers={'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'})
    with urllib.request.urlopen(request, timeout=300) as response:
        data = json.load(response)
    content = data['choices'][0]['message']['content'].strip()
    # a fence around the whole answer, if the model adds one
    content = re.sub(r'^```(?:markdown|md)?\n(.*)\n```$', r'\1', content, flags=re.S)
    return content


def sections(markdown: str) -> list[str]:
    """The source in pieces that each start at a level-2 heading, the first piece before it."""
    parts = re.split(r'(?m)^(?=## )', markdown)
    return [p for p in parts if p.strip()]


def check(source: str, result: str) -> list[str]:
    missing = []
    for pattern, what in [(r'(?m)^#{1,6} ', 'heading'), (r'\]\(([^)\s]+)\)', 'link'), (r'`[^`\n]+`', 'code span')]:
        if what == 'heading':
            if len(re.findall(pattern, source)) != len(re.findall(pattern, result)):
                missing.append('a heading count differs')
            continue
        for found in re.findall(pattern, source):
            if found not in result:
                missing.append(f'{what} {found}')
    return missing


if __name__ == '__main__':
    args = sys.argv[1:]
    if args[:1] == ['--text']:
        print(ask(' '.join(args[1:])))
        sys.exit()
    source_path, target_path = args
    source = open(source_path, encoding='utf-8').read()
    out = []
    pieces = sections(source)
    for i, piece in enumerate(pieces, 1):
        print(f'section {i}/{len(pieces)} ({len(piece)} chars)', file=sys.stderr)
        out.append(ask(piece))
    result = '\n\n'.join(out).rstrip() + '\n'
    problems = check(source, result)
    open(target_path, 'w', encoding='utf-8').write(result)
    print(f'wrote {target_path}: {len(result)} chars', file=sys.stderr)
    for p in problems:
        print('check:', p, file=sys.stderr)
