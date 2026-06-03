/** Custom event fired on each Lenis scroll tick for decoupled UI (e.g. header). */
export const APP_SCROLL_EVENT = "app:scroll";

export type AppScrollDetail = {
	scroll: number;
	/** -1 = toward top, 1 = toward bottom, 0 = idle */
	direction: -1 | 0 | 1;
};

export function dispatchAppScroll(detail: AppScrollDetail) {
	window.dispatchEvent(
		new CustomEvent<AppScrollDetail>(APP_SCROLL_EVENT, { detail }),
	);
}
