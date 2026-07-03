/** Number of gallery tiles on the homepage image bento (4×4 grid). */
export const HOME_IMAGE_BENTO_COUNT = 16;

/** Fills one quadrant of the square 4×4 grid. */
export const HOME_IMAGE_BENTO_CELL_CLASS = "relative h-full min-h-0 min-w-0";

/** 4 equal columns; fills the square wrapper. */
export const HOME_IMAGE_BENTO_GRID_CLASS =
	"grid h-full w-full grid-cols-4 grid-rows-4 gap-1 sm:gap-1.5 lg:gap-2";

/** Keeps the 4×4 collage square and within the tray height. */
export const HOME_IMAGE_BENTO_GRID_WRAPPER_CLASS =
	"aspect-square h-full w-auto max-w-full min-h-0 shrink-0";

/** Inset frame around the collage — like the reference poster margin. */
export const HOME_IMAGE_BENTO_TRAY_CLASS =
	"flex h-full min-h-0 w-full items-center justify-center overflow-hidden rounded-lg bg-foreground p-2 ring-1 ring-border/60 ring-inset sm:p-3 lg:p-4";

/** Inner layout — height comes from the section (`h-svh`). */
export const HOME_IMAGE_BENTO_SECTION_CLASS =
	"flex min-h-0 w-full flex-1 flex-col";

export const HOME_IMAGE_BENTO_HEADER_CLASS =
	"shrink-0 px-6 pt-10 pb-4 sm:px-8 sm:pt-12 sm:pb-5 lg:pt-14 lg:pb-5";

export const HOME_IMAGE_BENTO_BODY_CLASS =
	"flex min-h-0 flex-1 flex-col justify-center px-6 pb-8 sm:px-8 sm:pb-10 lg:pb-10";
