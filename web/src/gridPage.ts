/**
 * The looks of one page of the workbench grid, the import tile included: whole rows at 4, 6, and
 * 8 columns. "Load more" adds the next page.
 */
export const GRID_PAGE = 24;

/**
 * The looks of `matching` that the grid shows on `pages` pages. The import tile, when there is
 * one, takes the last place of the last page. The previewed look at `previewAt` (or -1) always
 * shows: from beyond the pages it takes the last place of the page, so the rows stay whole and the
 * grid never hides the look that the preview shows.
 */
export function gridLooks<T>(matching: readonly T[], pages: number, importTile: boolean, previewAt: number): T[] {
  const places = pages * GRID_PAGE - (importTile ? 1 : 0);
  if (matching.length <= places) return [...matching];
  if (previewAt < places) return matching.slice(0, places);
  return [...matching.slice(0, places - 1), matching[previewAt]!];
}
