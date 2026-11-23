// The day a page last changed, for the <lastmod> of the sitemap: the day of the last commit that
// changed one of the files the page comes from. A build without the history (a shallow clone,
// a copy outside git) gives none, since a date that is not true makes search engines ignore
// the dates of the whole sitemap.
import { execFileSync } from 'node:child_process';

const git = (cwd, args) => execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

let history;
/** Whether `cwd` is in a git checkout with its full history. */
function hasHistory(cwd) {
  if (history === undefined) {
    try {
      history = git(cwd, ['rev-parse', '--is-shallow-repository']) === 'false';
    } catch {
      history = false;
    }
  }
  return history;
}

/**
 * The day (YYYY-MM-DD) of the last commit that changed one of `paths`, relative to `cwd`, or null.
 * A file with changes that are not committed yet counts as changed today.
 */
export function lastModified(cwd, paths) {
  if (!hasHistory(cwd)) return null;
  try {
    if (git(cwd, ['status', '--porcelain', '--', ...paths]) !== '') return new Date().toISOString().slice(0, 10);
    return git(cwd, ['log', '-1', '--format=%cs', '--', ...paths]) || null;
  } catch {
    return null;
  }
}
