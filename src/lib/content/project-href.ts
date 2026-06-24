import { projectDetailHref as projectsDetailPath } from "@/lib/projects-url";

/**
 * Project-card slug → locale-relative projects detail path.
 *
 * Deliberately standalone: this is the only piece of the href helpers that the
 * (client) nav config needs, and keeping it free of the zod-backed
 * `@/types/*` + `resolve` imports stops zod from being pulled into every
 * route's header bundle. See `@/lib/content/href` for the richer helpers.
 */
const LEGACY_PROJECT_IDS: Record<string, string> = {
	"oral-history-archive": "1",
	"manuscript-digitization": "2",
	"folk-music-collection": "3",
	"traditional-dress-archive": "4",
	"photographic-heritage": "5",
};

/** Locale-relative project card path — maps legacy slugs to numeric project ids. */
export function projectDetailHref(slug: string): string {
	const id = LEGACY_PROJECT_IDS[slug] ?? slug;
	return projectsDetailPath(id);
}

/** Primary projects index route. */
export function projectsIndexHref(): string {
	return "/projects";
}
