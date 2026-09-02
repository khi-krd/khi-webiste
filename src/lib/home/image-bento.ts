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
 * Collage width. The tray is full-bleed and the section no longer carries the
 * old 2xl canvas inset, but grid height is fixed at 3 rows of square tiles —
 * ~3/5 of grid width — inside an h-svh overflow-hidden section with no shrink
 * path, so an uncapped grid outgrows the viewport on wide screens (16:9 and
 * up). From `lg` (where the 5-column layout starts) the wrapper caps its own
 * width instead: fit needs 3·(W−2rem)/5 + 1rem of gaps ≤ the height left
 * under the header (100svh minus ~15rem of header/padding chrome), i.e.
 * W ≤ (100svh−16rem)·5/3 + 2rem; `--canvas` keeps the collage on the shared
 * content canvas when a tall viewport would allow more. `mx-auto` centers the
 * capped grid inside the full-bleed band — the same content-inset-inside-a-
 * full-width-band move as sound-section's 2xl padding.
 */
export const HOME_IMAGE_BENTO_GRID_WRAPPER_CLASS =
	"mx-auto w-full lg:max-w-[min(var(--canvas),calc((100svh-16rem)*5/3+2rem))]";

/**
 * Full-bleed band: the tray runs edge to edge with square corners (user
 * request), so no radius and no framing ring — the section's `border-t` is the
 * only separator; p-2/p-3/p-4 keeps the tiles off the viewport edge.
 *
 * `h-full` by design (user request): the tray always fills the section, even
 * when fewer than `HOME_IMAGE_BENTO_COUNT` tiles are available.
 *
 * `lg:justify-center` parks the width-capped grid (see the wrapper class) in
 * the middle of the band; only from `lg`, where the cap guarantees the grid
 * fits — centering an overflowing grid would clip its top row too.
 */
export const HOME_IMAGE_BENTO_TRAY_CLASS =
	"flex h-full min-h-0 w-full flex-col overflow-hidden bg-foreground p-2 sm:p-3 lg:justify-center lg:p-4";

/** Same deliberate fixed radius for each gallery tile inside the tray. */
export const HOME_IMAGE_BENTO_TILE_RADIUS_CLASS = "rounded-[0.5rem]";

/** Inner layout — height comes from the section (`h-svh`). */
export const HOME_IMAGE_BENTO_SECTION_CLASS =
	"flex min-h-0 w-full flex-1 flex-col";

export const HOME_IMAGE_BENTO_HEADER_CLASS =
	"shrink-0 px-6 pt-10 pb-4 sm:px-8 sm:pt-12 sm:pb-5 lg:pt-14 lg:pb-5 2xl:px-[calc((100vw-var(--canvas))/2+2rem)]";

export const HOME_IMAGE_BENTO_BODY_CLASS =
	"flex min-h-0 flex-1 flex-col justify-center pb-8 sm:pb-10 lg:pb-10";
