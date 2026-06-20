/**
 * Project-card slug → closest live collection page.
 *
 * Deliberately standalone: this is the only piece of the href helpers that the
 * (client) nav config needs, and keeping it free of the zod-backed
 * `@/types/*` + `resolve` imports stops zod from being pulled into every
 * route's header bundle. See `@/lib/content/href` for the richer helpers.
 */
const PROJECT_HREFS: Record<string, string> = {
	"oral-history-archive": "/audio?type=speech",
	"manuscript-digitization": "/writings/manuscripts",
	"folk-music-collection": "/audio",
	"traditional-dress-archive": "/gallery/threads-of-identity",
	"photographic-heritage": "/gallery/city-of-poets",
};

/** Locale-relative project card path — maps to the closest live collection page. */
export function projectDetailHref(slug: string): string {
	return PROJECT_HREFS[slug] ?? "/about";
}
