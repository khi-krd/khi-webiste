/** Number of gallery tiles on the homepage image bento (3×5). */
export const HOME_IMAGE_BENTO_COUNT = 15;

/** Square tile — height follows width via aspect-ratio. */
export const HOME_IMAGE_BENTO_CELL_CLASS =
	"relative aspect-square min-h-0 min-w-0";

/**
 * 3 rows × 5 columns — square cells span the full tray width.
 *
 * Fewer columns on narrow screens. Five squares across a phone works out at
 * about 60px a side, which is too small to read a photograph in; the collage
 * keeps its full 5-up form from `lg`, where the layout is designed.
 */
export const HOME_IMAGE_BENTO_GRID_CLASS =
	"grid w-full grid-cols-3 gap-1 sm:grid-cols-4 sm:gap-1.5 lg:grid-cols-5 lg:gap-2";

/** Full-width collage inside the tray. */
export const HOME_IMAGE_BENTO_GRID_WRAPPER_CLASS = "w-full";

/**
 * Inset frame around the collage — like the reference poster margin.
 * Fixed radius by design (user request): the tray and its tiles stay rounded
 * even though the site theme is square, so no `rounded-*` token here.
 *
 * Deliberately NOT `h-full`: the tray is sized by its own grid (aspect-square
 * cells scale with width, not the section's height), so a shorter tray —
 * fewer rows, or a very wide viewport that widens each cell — lets the
 * body's `justify-center` (below) center it instead of stretching a mostly
 * empty frame down the rest of the `h-svh` section.
 */
export const HOME_IMAGE_BENTO_TRAY_CLASS =
	"w-full overflow-hidden rounded-[1rem] bg-foreground p-2 ring-1 ring-border/60 ring-inset sm:p-3 lg:p-4";

/** Same deliberate fixed radius for each gallery tile inside the tray. */
export const HOME_IMAGE_BENTO_TILE_RADIUS_CLASS = "rounded-[0.5rem]";

/** Inner layout — the section (`h-svh`) sets the ceiling; the body centers the tray within it. */
export const HOME_IMAGE_BENTO_SECTION_CLASS =
	"flex min-h-0 w-full flex-1 flex-col";

export const HOME_IMAGE_BENTO_HEADER_CLASS =
	"shrink-0 px-6 pt-10 pb-4 sm:px-8 sm:pt-12 sm:pb-5 lg:pt-14 lg:pb-5";

export const HOME_IMAGE_BENTO_BODY_CLASS =
	"flex min-h-0 flex-1 flex-col justify-center px-6 pb-8 sm:px-8 sm:pb-10 lg:pb-10";
