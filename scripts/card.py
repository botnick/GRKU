"""Write GRKU to the SD card from a package ZIP, whether the card is in a card reader or in
the camera over its USB-C cable (USB Connection: MSC, so the card shows as a drive). No
dependencies.

    python3 -I scripts/card.py write dist/GRKU-gr4.zip            # update: replace SCRIPT, keep GRKIT
    python3 -I scripts/card.py write dist/GRKU-gr4.zip --first    # first install: also the ModeSet files
    python3 -I scripts/card.py effects dist/GRKU-film-library.zip effects/defaults.txt
                                                                    # put these effects (one id per line,
                                                                    # at most 40) into SCRIPT/GRKIT/EFFECTS
    python3 -I scripts/card.py status                               # what the card holds
    python3 -I scripts/card.py feet on|off                          # snap focus distances in feet

The card is the mounted volume that has a DCIM folder (or the one given with --card PATH).
GRKU keeps its settings in the GRKIT folder of the card; `write` never touches it. After
`write` or `effects`, eject the card (or the camera), then turn the camera on normally.
"""
import argparse, hashlib, io, json, os, pathlib, shutil, subprocess, sys, zipfile

VOLUMES = pathlib.Path('/Volumes')


def find_card(given):
    if given:
        card = pathlib.Path(given)
        if not card.is_dir():
            sys.exit(f'No card at {card}')
        return card
    cards = [v for v in VOLUMES.iterdir() if (v / 'DCIM').is_dir()] if VOLUMES.is_dir() else []
    if not cards:
        sys.exit('No card: no mounted volume has a DCIM folder. Insert the card, or connect the camera '
                 'by USB-C with USB Connection set to MSC, or give --card PATH.')
    if len(cards) > 1:
        sys.exit('Several cards are mounted: ' + ', '.join(str(c) for c in cards) + '. Give --card PATH.')
    return cards[0]


def sd_root(zf):
    names = zf.namelist()
    roots = {n.split('/')[0] for n in names if '/' in n}
    if 'SD_ROOT' not in roots:
        sys.exit('The ZIP has no SD_ROOT folder; is it a GRKU package?')
    return [n for n in names if n.startswith('SD_ROOT/') and not n.endswith('/')]


def write(args):
    card = find_card(args.card)
    with zipfile.ZipFile(args.package) as zf:
        files = sd_root(zf)
        script = card / 'SCRIPT'
        if script.exists():
            shutil.rmtree(script)
        count = 0
        for name in files:
            rel = name[len('SD_ROOT/'):]
            top = rel.split('/')[0]
            if top != 'SCRIPT' and not args.first:
                continue  # the ModeSet files turn SD scripts on; an update does not need them
            target = card / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            with zf.open(name) as src, open(target, 'wb') as dst:
                shutil.copyfileobj(src, dst)
            count += 1
    for stale in ['SCRIPT/GRKIT/INSTALL.ERR']:
        (card / stale).unlink(missing_ok=True)
    flush()
    effects = card / 'SCRIPT' / 'GRKIT' / 'EFFECTS'
    print(f'wrote {count} files to {card}; effects: {len(list(effects.glob("*.GRF"))) if effects.is_dir() else 0}; '
          f'settings folder GRKIT {"kept" if (card / "GRKIT").is_dir() else "absent (first start makes it)"}')
    print('package sha256', hashlib.sha256(pathlib.Path(args.package).read_bytes()).hexdigest())
    print('Now eject the card or the camera, then turn the camera on' + (' holding MENU' if args.first else '') + '.')


def effects(args):
    card = find_card(args.card)
    ids = [line.strip() for line in pathlib.Path(args.list).read_text().splitlines()
           if line.strip() and not line.startswith('#')]
    if not 1 <= len(ids) <= 40:
        sys.exit(f'{len(ids)} effects listed; the camera installs 1 to 40')
    folder = card / 'SCRIPT' / 'GRKIT' / 'EFFECTS'
    if not (card / 'SCRIPT' / 'GRKIT').is_dir():
        sys.exit('The card has no SCRIPT/GRKIT: write a package first')
    with zipfile.ZipFile(args.library) as zf:
        index = {}
        for line in zf.read('INDEX.txt').decode().splitlines():
            parts = line.split('  ')
            if len(parts) >= 2:
                index[parts[1]] = parts[0]
        missing = [i for i in ids if i not in index]
        if missing:
            sys.exit('Not in the library: ' + ', '.join(missing))
        if folder.exists():
            shutil.rmtree(folder)
        folder.mkdir(parents=True)
        for eid in ids:
            (folder / index[eid]).write_bytes(zf.read(f'EFFECTS/{index[eid]}'))
    # The installer compares the EFFECTS folder with GRKIT/IMPORTED.TXT at each start and
    # copies what differs (runtime/install_library.h), so nothing else needs to change.
    flush()
    print(f'{len(ids)} effects in {folder}. Eject, then turn the camera on; the first start installs them.')


def status(args):
    card = find_card(args.card)
    script = card / 'SCRIPT' / 'GRKIT'
    print('card', card)
    print('SCRIPT/GRKIT', 'present' if script.is_dir() else 'absent')
    for name in ['PACKAGE.TXT', 'BOOT.TXT', 'INSTALL.ERR', 'DIAG.TXT']:
        p = script / name
        if p.is_file():
            text = p.read_text(errors='replace').strip().splitlines()
            print(f'  {name}: {text[0][:100] if text else ""}' + (f' (+{len(text) - 1} lines)' if len(text) > 1 else ''))
    effects = script / 'EFFECTS'
    print('  effects:', len(list(effects.glob('*.GRF'))) if effects.is_dir() else 0)
    print('GRKIT (settings)', 'present' if (card / 'GRKIT').is_dir() else 'absent')
    report = card / 'GRKIT' / 'REPORT.TXT'
    if report.is_file():
        print('  REPORT.TXT:', report.read_text(errors='replace').strip().splitlines()[0][:100])


def feet(args):
    """GRKIT/FEET.TXT on the card makes INSTALL label the snap focus distances in feet."""
    card = find_card(args.card)
    marker = card / 'GRKIT' / 'FEET.TXT'
    if args.state == 'on':
        marker.parent.mkdir(exist_ok=True)
        marker.write_text('The snap focus distance labels show feet while this file is on the card.\n')
        print('feet on:', marker, '(takes effect at the next power-on)')
    else:
        marker.unlink(missing_ok=True)
        print('feet off: the labels show meters again at the next power-on')
    flush()


def flush():
    if sys.platform == 'darwin':
        subprocess.run(['sync'], check=False)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--card', help='the mounted card (default: the volume with a DCIM folder)')
    sub = parser.add_subparsers(dest='command', required=True)
    w = sub.add_parser('write', help='write a package: replace SCRIPT, keep the GRKIT settings folder')
    w.add_argument('package'); w.add_argument('--first', action='store_true', help='also write the ModeSet files that turn SD scripts on')
    e = sub.add_parser('effects', help='replace SCRIPT/GRKIT/EFFECTS with the listed effects from the library ZIP')
    e.add_argument('library'); e.add_argument('list')
    sub.add_parser('status', help='what the card holds')
    f = sub.add_parser('feet', help='label the snap focus distances in feet (on) or meters (off)')
    f.add_argument('state', choices=['on', 'off'])
    args = parser.parse_args()
    {'write': write, 'effects': effects, 'status': status, 'feet': feet}[args.command](args)
