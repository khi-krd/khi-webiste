/** Number of gallery tiles on the homepage image bento. */
export const HOME_IMAGE_BENTO_COUNT = 16;

/**
 * Mobile: uniform 4×4 (16 cells). Desktop (lg): 8×4 bento with mixed spans.
 * Row totals on lg always equal 8 columns.
 */
export const HOME_IMAGE_BENTO_CELL_CLASS = [
	"col-span-1 row-span-1 lg:col-span-3 lg:row-span-2",
	"col-span-1 row-span-1 lg:col-span-2",
	"col-span-1 row-span-1 lg:col-span-1",
	"col-span-1 row-span-1 lg:col-span-2",
	"col-span-1 row-span-1 lg:col-span-2",
	"col-span-1 row-span-1 lg:col-span-1",
	"col-span-1 row-span-1 lg:col-span-2",
	"col-span-1 row-span-1 lg:col-span-2",
	"col-span-1 row-span-1 lg:col-span-1",
	"col-span-1 row-span-1 lg:col-span-1",
	"col-span-1 row-span-1 lg:col-span-2",
	"col-span-1 row-span-1 lg:col-span-2",
	"col-span-1 row-span-1 lg:col-span-2",
	"col-span-1 row-span-1 lg:col-span-1",
	"col-span-1 row-span-1 lg:col-span-1",
	"col-span-1 row-span-1 lg:col-span-4",
] as const;

/** Fills remaining viewport below the section header; rows stretch to fit. */
export const HOME_IMAGE_BENTO_GRID_CLASS =
	"grid h-full min-h-0 w-full grid-flow-dense grid-cols-4 grid-rows-4 gap-px bg-border/80 lg:grid-cols-8";

export const HOME_IMAGE_BENTO_TRAY_CLASS =
	"h-full min-h-0 overflow-hidden rounded-lg bg-border/80 ring-1 ring-border/60 ring-inset";

export const HOME_IMAGE_BENTO_CELL_BASE = "relative min-h-0 min-w-0";

/** Inner layout — height comes from the section (`h-svh`). */
export const HOME_IMAGE_BENTO_SECTION_CLASS =
	"flex min-h-0 w-full flex-1 flex-col";

export const HOME_IMAGE_BENTO_HEADER_CLASS =
	"shrink-0 px-6 pt-10 pb-4 sm:px-8 sm:pt-12 sm:pb-5 lg:pt-14 lg:pb-5";

export const HOME_IMAGE_BENTO_BODY_CLASS =
	"flex min-h-0 flex-1 flex-col px-6 pb-8 sm:px-8 sm:pb-10 lg:pb-10";
