"""Copy the GRF files of the default effects (effects/defaults.txt) from a full effects build
into the directory that `grku package --effects` takes, and write OUT_DIR-INDEX.txt next to it
(the package takes GRF files only).
Usage: python3 -I scripts/defaults.py BUILD_DIR OUT_DIR"""
import hashlib, json, pathlib, shutil, sys

repo = pathlib.Path(__file__).resolve().parent.parent
build, out = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
ids = [line.strip() for line in (repo / 'effects' / 'defaults.txt').read_text().splitlines()
       if line.strip() and not line.startswith('#')]
assert len(ids) == len(set(ids)) <= 40, f'{len(ids)} default effects'
names = {}
for f in repo.glob('effects/*/effect.json'):
    d = json.loads(f.read_text())
    names[d['effect_id']] = d['name']
missing = [i for i in ids if i not in names]
assert not missing, f'unknown effect ids: {missing}'
if out.exists():
    shutil.rmtree(out)
out.mkdir(parents=True)
index = []
for eid in ids:
    grf = hashlib.sha256(eid.encode()).hexdigest()[:8].upper() + '.GRF'
    shutil.copyfile(build / grf, out / grf)
    index.append(f'{grf}  {eid}  {names[eid]}')
out.with_name(out.name + '-INDEX.txt').write_text('\n'.join(index) + '\n')
print(len(ids), 'default effects in', out)
