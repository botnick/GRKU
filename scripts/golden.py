"""Regenerate effects/golden.json from a compiled catalog: the SHA-256 of each GRF file and of
each icon. Usage: python3 -I scripts/golden.py BUILD_DIR (the --out of `grku effects build`)."""
import hashlib, json, pathlib, sys
repo = pathlib.Path(__file__).resolve().parent.parent
build = pathlib.Path(sys.argv[1])
GRF_ICON, ICON_SIZE = 1684, 6400  # runtime/abi.h GRKU_GRF_ICON, GRKU_GRF_ICON_SIZE
golden = json.load(open(repo / 'effects/golden.json'))
grf, icons = {}, {}
for f in sorted(repo.glob('effects/*/effect.json')):
    eid = json.load(open(f))['effect_id']
    name = hashlib.sha256(eid.encode()).hexdigest()[:8].upper() + '.GRF'
    blob = (build / name).read_bytes()
    grf[name] = hashlib.sha256(blob).hexdigest()
    icons[eid] = hashlib.sha256(blob[GRF_ICON:GRF_ICON + ICON_SIZE]).hexdigest()
golden['grf'] = dict(sorted(grf.items()))
golden['icons'] = dict(sorted(icons.items()))
(repo / 'effects/golden.json').write_text(json.dumps(golden, indent=2) + '\n')
print(len(grf), 'effects pinned')
