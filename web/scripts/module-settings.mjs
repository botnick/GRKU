// Writes src/docs/moduleSettings.generated.ts: every module of modules/ with its settings as the
// camera menu names them, in each menu language, their values, and their defaults, from
// modules/<module>/module.toml and modules/<module>/text/<language>.toml. The manual draws its
// settings tables from it, and src/docs/docs.test.ts fails when the file is out of date or a
// setting of a module is missing from the manual.
//
// Usage: node scripts/module-settings.mjs [--check]
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const modulesDir = join(web, '..', 'modules');
const out = join(web, 'src', 'docs', 'moduleSettings.generated.ts');
const MENU_LANGUAGES = ['en', 'zh-Hans', 'zh-Hant', 'ja', 'ko'];

/** The order of the Framing rows on the camera (runtime/framing_ratios.h: FRAMING_RATIO_ROWS), from the widest ratio. */
function framingOrder() {
  const text = readFileSync(join(web, '..', 'runtime', 'framing_ratios.h'), 'utf8');
  const orders = [...text.matchAll(/#define FRAMING_RATIO_ROWS ([\d,]+)/g)].map((m) => m[1]);
  if (orders.length === 0 || new Set(orders).size !== 1) throw new Error('runtime/framing_ratios.h: FRAMING_RATIO_ROWS differs by camera');
  return orders[0].split(',').map(Number);
}

/** The tables of a TOML file this small: `[a.b]` sections, `[[a]]` arrays, and `key = value` with JSON-like values. */
export function parseToml(text) {
  const root = {};
  let target = root;
  for (const raw of text.split('\n')) {
    const line = raw.replace(/\s+#.*$/, '').trim();
    if (!line || line.startsWith('#')) continue;
    let m;
    if ((m = /^\[\[(.+)\]\]$/.exec(line))) {
      const path = splitKey(m[1]);
      const parent = walk(root, path.slice(0, -1));
      const last = path[path.length - 1];
      (parent[last] ??= []).push((target = {}));
      continue;
    }
    if ((m = /^\[(.+)\]$/.exec(line))) {
      target = walk(root, splitKey(m[1]));
      continue;
    }
    if ((m = /^("[^"]+"|[\w.-]+)\s*=\s*(.+)$/.exec(line))) {
      target[m[1].replace(/^"|"$/g, '')] = value(m[2]);
    }
  }
  return root;
}
const splitKey = (key) => [...key.matchAll(/"([^"]+)"|([\w-]+)/g)].map((m) => m[1] ?? m[2]);
function walk(node, path) {
  let at = node;
  for (const part of path) {
    if (Array.isArray(at[part])) at = at[part][at[part].length - 1];
    else at = at[part] ??= {};
  }
  return at;
}
function value(text) {
  const t = text.trim();
  if (t === 'true' || t === 'false') return t === 'true';
  if (/^-?\d+$/.test(t)) return Number(t);
  if (t.startsWith('"') || t.startsWith('[')) {
    try {
      return JSON.parse(t);
    } catch {
      return t;
    }
  }
  if (t.startsWith('{')) return t;
  return t;
}

/** Every module with its settings, in the order of its page. */
export function moduleSettings() {
  const modules = [];
  for (const dir of readdirSync(modulesDir).sort()) {
    const manifestFile = join(modulesDir, dir, 'module.toml');
    if (!existsSync(manifestFile)) continue;
    const manifest = parseToml(readFileSync(manifestFile, 'utf8'));
    const text = Object.fromEntries(
      MENU_LANGUAGES.filter((code) => existsSync(join(modulesDir, dir, 'text', `${code}.toml`))).map((code) => [
        code,
        parseToml(readFileSync(join(modulesDir, dir, 'text', `${code}.toml`), 'utf8')),
      ]),
    );
    const own = new Map((manifest.settings ?? []).map((setting) => [setting.key, setting]));
    const page = manifest.page ?? {};
    // A page lists its settings, or a group page lists them in its children.
    const groups = page.kind === 'group' ? (page.children ?? []).map((child) => ({ key: child.key, settings: child.settings ?? [] })) : [{ key: null, settings: page.settings ?? (page.setting ? [page.setting] : []) }];
    const settings = [];
    for (const group of groups) {
      for (const key of group.settings) {
        const label = {};
        const values = {};
        for (const [code, t] of Object.entries(text)) {
          const s = t.settings?.[key] ?? {};
          label[code] = s.label ?? null;
          // The main setting of a page takes the rows of the page; Off comes first.
          values[code] = s.values ?? (key === page.setting ? (t.rows ?? null) : null);
        }
        // Framing shows its ratios from the widest (the text lists them in the order of their values).
        if (dir === 'framing' && key === page.setting) {
          const order = framingOrder();
          for (const code of Object.keys(values)) if (values[code]) values[code] = order.map((index) => values[code][index]);
        }
        const definition = own.get(key);
        // The main setting of Film Look and Recipes has no name: its rows are the looks and the recipes of the card.
        if (!Object.values(label).some(Boolean)) continue;
        settings.push({
          key,
          group: group.key,
          groupTitle: group.key ? Object.fromEntries(Object.entries(text).map(([code, t]) => [code, t.children?.[group.key]?.title ?? null])) : null,
          label,
          values,
          // A setting of the module says its default; a setting of the core (CORE.*) starts at 0.
          default: definition?.default ?? 0,
          core: key.startsWith('CORE.'),
          colorOnly: definition?.color_only === true,
        });
      }
    }
    modules.push({
      dir,
      id: manifest.id,
      title: Object.fromEntries(Object.entries(text).map(([code, t]) => [code, t.title ?? null])),
      colorOnly: manifest.color_only === true,
      options: page.options === true,
      settings,
    });
  }
  return modules;
}

const body = `// Generated by scripts/module-settings.mjs from modules/*/module.toml and modules/*/text/*.toml.
// Do not edit: change the modules, then run node scripts/module-settings.mjs.

export interface ModuleSetting {
  key: string;
  /** The child page of a group page (Glow: BLOOM or HALATION), or null. */
  group: string | null;
  groupTitle: Readonly<Record<string, string | null>> | null;
  /** The name of the row on the camera, in each menu language. */
  label: Readonly<Record<string, string | null>>;
  /** The values on the camera in each menu language, in order, or null when the page draws them (film looks). */
  values: Readonly<Record<string, readonly string[] | null>>;
  /** The value of a new card (the index of the value in the order of \`values\`; 0 is the first). */
  default: number;
  core: boolean;
  colorOnly: boolean;
}

export interface ModuleInfo {
  dir: string;
  id: string;
  title: Readonly<Record<string, string | null>>;
  colorOnly: boolean;
  /** Whether the page has Options and Order in MENU. */
  options: boolean;
  settings: readonly ModuleSetting[];
}

export const MODULE_SETTINGS: readonly ModuleInfo[] = ${JSON.stringify(moduleSettings(), null, 2)};
`;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--check')) {
    if (readFileSync(out, 'utf8') !== body) {
      console.error('src/docs/moduleSettings.generated.ts is out of date: run node scripts/module-settings.mjs');
      process.exit(1);
    }
  } else {
    writeFileSync(out, body);
    console.log(`module settings: ${moduleSettings().length} modules → ${out}`);
  }
}
export { body as generatedBody };
