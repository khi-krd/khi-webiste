/**
 * Platform (پلاتفۆڕم) runtime constants, kept zod-free on purpose: the URL
 * builder is imported by client components that ship in the header bundle,
 * and it must not drag the schema layer with it.
 */

export const PLATFORM_MEDIA_KINDS = [
	"audio",
	"video",
	"image",
	"text",
] as const;
export type PlatformMediaKind = (typeof PLATFORM_MEDIA_KINDS)[number];

/** Sort orders `/api/guest/media/search` accepts. */
export const PLATFORM_SORTS = [
	"relevance",
	"newest",
	"oldest",
	"title",
	"trending",
] as const;
export type PlatformSort = (typeof PLATFORM_SORTS)[number];
