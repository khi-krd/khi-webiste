import {
	PAGE_LOADER_BG,
	PAGE_LOADER_STATIC_ID,
} from "@/components/layout/page-loader-critical";

/**
 * SSR preloader shell — first paint before CSS bundle or client hydration.
 * Removed by PageLoaderOverlay once the animated loader is ready.
 */
export function PageLoaderStatic() {
	return (
		<div
			id={PAGE_LOADER_STATIC_ID}
			aria-hidden
			suppressHydrationWarning
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 2_147_483_647,
				backgroundColor: PAGE_LOADER_BG,
			}}
		/>
	);
}
