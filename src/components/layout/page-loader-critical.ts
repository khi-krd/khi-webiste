/** Near-black ink — matches --warm-900 / foreground (≈ #1A1813). */
export const PAGE_LOADER_BG = "#1A1813";
export const PAGE_LOADER_BG_RGB = "26, 24, 19";

export const PAGE_LOADING_ATTR = "data-page-loading";
export const PAGE_LOADING_EXITING = "exiting";
export const PAGE_LOADER_STATIC_ID = "page-loader-static";
export const KHI_APP_SHELL_ID = "khi-app-shell";
export const KHI_APP_HEADER_ID = "khi-app-header";
export const KHI_APP_CONTENT_ID = "khi-app-content";

/**
 * Blocking first-paint styles — inlined in <head> so the preloader wins before
 * the bundled CSS or client JS hydrate. Do not rely on Tailwind tokens here.
 */
export const PAGE_LOADER_CRITICAL_CSS = `
html[data-page-loading]:not([data-page-loading="${PAGE_LOADING_EXITING}"]),
html[data-page-loading]:not([data-page-loading="${PAGE_LOADING_EXITING}"]) body {
	background: ${PAGE_LOADER_BG} !important;
	overflow: hidden !important;
}
html[data-page-loading]:not([data-page-loading="${PAGE_LOADING_EXITING}"]) #${KHI_APP_SHELL_ID} {
	visibility: hidden !important;
}
html[data-page-loading] #page-loader-static {
	display: block !important;
}
html[data-page-loading="${PAGE_LOADING_EXITING}"] #${KHI_APP_SHELL_ID} {
	visibility: visible !important;
}
html[data-page-loading="${PAGE_LOADING_EXITING}"] #${KHI_APP_HEADER_ID} {
	opacity: 1 !important;
	filter: none !important;
}
html[data-page-loading="${PAGE_LOADING_EXITING}"],
html[data-page-loading="${PAGE_LOADING_EXITING}"] body {
	background: transparent !important;
	overflow: hidden !important;
}
@media (prefers-reduced-motion: reduce) {
	html[data-page-loading]:not([data-page-loading="${PAGE_LOADING_EXITING}"]),
	html[data-page-loading]:not([data-page-loading="${PAGE_LOADING_EXITING}"]) body {
		overflow: auto !important;
	}
	html[data-page-loading]:not([data-page-loading="${PAGE_LOADING_EXITING}"]) #${KHI_APP_SHELL_ID} {
		visibility: visible !important;
	}
	html[data-page-loading] #page-loader-static {
		display: none !important;
	}
	html[data-page-loading="${PAGE_LOADING_EXITING}"] #${KHI_APP_CONTENT_ID} {
		animation: none !important;
		filter: none !important;
		opacity: 1 !important;
	}
}
`.trim();

export function hidePageLoaderStatic() {
	const el = document.getElementById(PAGE_LOADER_STATIC_ID);
	if (el) {
		el.style.display = "none";
	}
}

/** Reveal app content underneath — called when the exit blur/fade begins. */
export function beginPageLoaderExit() {
	document.documentElement.setAttribute(
		PAGE_LOADING_ATTR,
		PAGE_LOADING_EXITING,
	);
}

export function clearPageLoadingState() {
	document.documentElement.removeAttribute(PAGE_LOADING_ATTR);
	hidePageLoaderStatic();
}
