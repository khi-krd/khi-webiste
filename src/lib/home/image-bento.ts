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

/**
 * Full-width collage inside the tray — top-anchored so the first row of tiles
 * starts flush at the band's top-start corner (top-right in RTL). Tiles size
 * from the full band width (the geometry the design was approved with); the
 * bottom row cropping under the section's h-svh clip is the deliberate
 * poster-style crop the layout always had. No width caps, no centering
 * (user request).
 */
export const HOME_IMAGE_BENTO_GRID_WRAPPER_CLASS = "w-full";

/**
 * Full-bleed band: the tray runs edge to edge with square corners (user
 * request), so no radius and no framing ring — the section's `border-t` is the
 * only separator; p-2/p-3/p-4 keeps the tiles off the viewport edge.
 *
 * `h-full` by design (user request): the tray always fills the section, even
 * when fewer than `HOME_IMAGE_BENTO_COUNT` tiles are available. Deliberately
 * NOT a flex column: the grid stays block-anchored at the very top of the
 * band, tiles at full size (user request).
 */
export const HOME_IMAGE_BENTO_TRAY_CLASS =
	"h-full min-h-0 w-full overflow-hidden bg-foreground p-2 sm:p-3 lg:p-4";

/** Same deliberate fixed radius for each gallery tile inside the tray. */
export const HOME_IMAGE_BENTO_TILE_RADIUS_CLASS = "rounded-[0.5rem]";

/** Inner layout — height comes from the section (`h-svh`). */
export const HOME_IMAGE_BENTO_SECTION_CLASS =
	"flex min-h-0 w-full flex-1 flex-col";

export const HOME_IMAGE_BENTO_HEADER_CLASS =
	"shrink-0 px-6 pt-10 pb-4 sm:px-8 sm:pt-12 sm:pb-5 lg:pt-14 lg:pb-5 2xl:px-[calc((100vw-var(--canvas))/2+2rem)]";

// No bottom padding: the dark band ends exactly where the tiles do and meets
// the next home section (the donate band) edge to edge (user request).
export const HOME_IMAGE_BENTO_BODY_CLASS =
	"flex min-h-0 flex-1 flex-col justify-center";
