/** Number of gallery tiles on the homepage image bento (4×4 mobile, 8×2 desktop). */
export const HOME_IMAGE_BENTO_COUNT = 16;

/** Square tile — height follows width via aspect-ratio. */
export const HOME_IMAGE_BENTO_CELL_CLASS =
	"relative aspect-square min-h-0 min-w-0";

/** 4×4 on small screens; 8×2 on large — square cells span the full tray width. */
export const HOME_IMAGE_BENTO_GRID_CLASS =
	"grid w-full grid-cols-4 gap-1 sm:gap-1.5 lg:grid-cols-8 lg:gap-2";

/** Full-width collage inside the tray. */
export const HOME_IMAGE_BENTO_GRID_WRAPPER_CLASS = "w-full";

/** Inset frame around the collage — like the reference poster margin. */
export const HOME_IMAGE_BENTO_TRAY_CLASS =
	"h-full min-h-0 w-full overflow-hidden rounded-lg bg-foreground p-2 ring-1 ring-border/60 ring-inset sm:p-3 lg:p-4";

/** Inner layout — height comes from the section (`h-svh`). */
export const HOME_IMAGE_BENTO_SECTION_CLASS =
	"flex min-h-0 w-full flex-1 flex-col";

export const HOME_IMAGE_BENTO_HEADER_CLASS =
	"shrink-0 px-6 pt-10 pb-4 sm:px-8 sm:pt-12 sm:pb-5 lg:pt-14 lg:pb-5";

export const HOME_IMAGE_BENTO_BODY_CLASS =
	"flex min-h-0 flex-1 flex-col justify-center px-6 pb-8 sm:px-8 sm:pb-10 lg:pb-10";
