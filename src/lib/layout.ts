/**
 * Homepage full-bleed horizontal inset — matches LatestUpdates, VideoSection, etc.
 *
 * At 2xl the padding grows so content sits in a centered 96rem canvas while the
 * element itself (and any background/border it carries) stays full-bleed. The
 * calc equals 2rem exactly at 1536px, so the transition is seamless.
 */
export const homeInsetClass =
	"px-6 sm:px-8 2xl:px-[calc((100vw-96rem)/2+2rem)]";
