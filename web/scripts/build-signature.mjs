// The build signature of the site: `GRKU·BOTNICK`, the GRKU version, and the commit of the build.
// vite.config.ts puts it in the scripts (__GRKU_SIG__) and the styles (--grku-sig), prerender.mjs
// and build-docs.mjs on the <html> of each page (data-grku). See HANDOFF.md, Signatures.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** The [workspace.package] version of Cargo.toml. */
export function workspaceVersion() {
  const manifest = readFileSync(fileURLToPath(new URL('../../Cargo.toml', import.meta.url)), 'utf8');
  const version = /^\[workspace\.package\][^[]*?^version = "([^"]+)"/m.exec(manifest)?.[1];
  if (!version) throw new Error('Cargo.toml has no [workspace.package] version');
  return version;
}

/** The commit of the build: GITHUB_SHA in CI, else git, else `local`. */
function buildId() {
  const sha = process.env.GITHUB_SHA;
  if (sha) return sha.slice(0, 8);
  try {
    return execFileSync('git', ['rev-parse', '--short=8', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return 'local';
  }
}

export const BUILD_SIGNATURE = `GRKU·BOTNICK·${workspaceVersion()}·${buildId()}`;
