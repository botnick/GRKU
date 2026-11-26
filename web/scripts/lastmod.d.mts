/** The day (YYYY-MM-DD) of the last commit that changed one of `paths`, relative to `cwd`, or null. */
export function lastModified(cwd: string, paths: readonly string[]): string | null;
