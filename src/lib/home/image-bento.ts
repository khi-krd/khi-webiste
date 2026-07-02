/** Number of gallery tiles on the homepage image bento. */
export const HOME_IMAGE_BENTO_COUNT = 16;

/** All tiles share one size; images crop with object-cover inside each cell. */
export const HOME_IMAGE_BENTO_CELL_CLASS = "col-span-1 row-span-1";

const HOME_IMAGE_BENTO_GRID_BASE =
	"grid h-full min-h-0 w-full auto-rows-fr gap-px bg-border/80";

/** Pick a uniform grid that fills the tray without empty slots for `count` tiles. */
export function homeImageBentoGridClass(itemCount: number): string {
	const count = Math.min(Math.max(itemCount, 1), HOME_IMAGE_BENTO_COUNT);

	if (count <= 6) {
		return `${HOME_IMAGE_BENTO_GRID_BASE} grid-cols-3 grid-rows-2 lg:grid-cols-6 lg:grid-rows-1`;
	}
	if (count <= 8) {
		return `${HOME_IMAGE_BENTO_GRID_BASE} grid-cols-4 grid-rows-2 lg:grid-cols-4 lg:grid-rows-2`;
	}
	if (count <= 10) {
		return `${HOME_IMAGE_BENTO_GRID_BASE} grid-cols-5 grid-rows-2 lg:grid-cols-5 lg:grid-rows-2`;
	}
	if (count <= 12) {
		return `${HOME_IMAGE_BENTO_GRID_BASE} grid-cols-4 grid-rows-3 lg:grid-cols-6 lg:grid-rows-2`;
	}
	return `${HOME_IMAGE_BENTO_GRID_BASE} grid-cols-4 grid-rows-4 lg:grid-cols-8 lg:grid-rows-2`;
}

export const HOME_IMAGE_BENTO_TRAY_CLASS =
	"h-full min-h-0 overflow-hidden rounded-lg bg-border/80 ring-1 ring-border/60 ring-inset";

export const HOME_IMAGE_BENTO_CELL_BASE =
	"relative h-full min-h-0 min-w-0 w-full";

/** Inner layout — height comes from the section (`h-svh`). */
export const HOME_IMAGE_BENTO_SECTION_CLASS =
	"flex min-h-0 w-full flex-1 flex-col";

export const HOME_IMAGE_BENTO_HEADER_CLASS =
	"shrink-0 px-6 pt-10 pb-4 sm:px-8 sm:pt-12 sm:pb-5 lg:pt-14 lg:pb-5";

export const HOME_IMAGE_BENTO_BODY_CLASS =
	"flex min-h-0 flex-1 flex-col px-6 pb-8 sm:px-8 sm:pb-10 lg:pb-10";
