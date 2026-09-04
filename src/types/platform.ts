import { z } from "zod";

/**
 * KHI Archive Platform (پلاتفۆڕم) — the sister backend documented in
 * `docs/external/10-website-search.md` / `11-frontend-api-guide.md` of the
 * platform repo. These schemas cover the three public endpoints the website
 * consumes: `/api/guest/media/search`, `/api/guest/media/{type}/{code}` and
 * `/api/guest/suggest`.
 *
 * Contract notes that shape everything below:
 * - `null` fields are OMITTED from the JSON, so nearly everything is optional.
 * - Empty arrays are kept; arrays are never `null`.
 * - Media paths are host-relative (`/api/guest/audio/AUD-1/stream`) — the
 *   server layer absolutizes them before anything reaches the client.
 * - `isTrending` serializes as `trending`.
 */

export {
	PLATFORM_MEDIA_KINDS,
	PLATFORM_SORTS,
	type PlatformMediaKind,
	type PlatformSort,
} from "@/lib/platform/constants";

import { PLATFORM_MEDIA_KINDS } from "@/lib/platform/constants";

export const PlatformMediaKindSchema = z.enum(PLATFORM_MEDIA_KINDS);

export const PlatformPersonSummarySchema = z
	.object({
		id: z.number().optional(),
		personCode: z.string().optional(),
		fullName: z.string().nullish(),
		nickname: z.string().nullish(),
		romanizedName: z.string().nullish(),
		mediaPortrait: z.string().nullish(),
	})
	.loose();
export type PlatformPersonSummary = z.infer<typeof PlatformPersonSummarySchema>;

export const PlatformCategorySummarySchema = z
	.object({
		id: z.number().optional(),
		categoryCode: z.string().optional(),
		name: z.string().nullish(),
	})
	.loose();
export type PlatformCategorySummary = z.infer<
	typeof PlatformCategorySummarySchema
>;

/**
 * The complete kind-specific DTO (`Audio` / `Video` / `Image` / `Text` in the
 * platform docs). The four shapes share most field names; the union of the
 * fields the detail page renders is modeled here, all optional, and the object
 * stays loose so new upstream fields never fail validation.
 */
export const PlatformFullMediaSchema = z
	.object({
		id: z.number().optional(),
		audioCode: z.string().optional(),
		videoCode: z.string().optional(),
		imageCode: z.string().optional(),
		textCode: z.string().optional(),

		projectCode: z.string().nullish(),
		projectName: z.string().nullish(),
		personMediaPortrait: z.string().nullish(),
		person: PlatformPersonSummarySchema.nullish(),
		categories: z.array(PlatformCategorySummarySchema).nullish(),

		// Audio names its titles differently from the other three kinds.
		originTitle: z.string().nullish(),
		alterTitle: z.string().nullish(),
		centralKurdishTitle: z.string().nullish(),
		originalTitle: z.string().nullish(),
		alternativeTitle: z.string().nullish(),
		titleInCentralKurdish: z.string().nullish(),
		romanizedTitle: z.string().nullish(),

		form: z.string().nullish(),
		typeOfBasta: z.string().nullish(),
		typeOfMaqam: z.string().nullish(),
		typeOfComposition: z.string().nullish(),
		typeOfPerformance: z.string().nullish(),
		subject: z.array(z.string()).nullish(),
		genre: z.array(z.string()).nullish(),
		event: z.string().nullish(),
		location: z.string().nullish(),

		abstractText: z.string().nullish(),
		description: z.string().nullish(),
		lyrics: z.string().nullish(),
		transcription: z.string().nullish(),

		speaker: z.string().nullish(),
		singer: z.string().nullish(),
		producer: z.string().nullish(),
		composer: z.string().nullish(),
		poet: z.string().nullish(),
		author: z.string().nullish(),
		creatorArtistDirector: z.string().nullish(),
		creatorArtistPhotographer: z.string().nullish(),
		contributor: z.string().nullish(),
		contributors: z.union([z.array(z.string()), z.string()]).nullish(),
		personShownInVideo: z.string().nullish(),
		personShownInImage: z.string().nullish(),

		language: z.string().nullish(),
		dialect: z.string().nullish(),
		region: z.string().nullish(),
		city: z.string().nullish(),
		recordingVenue: z.string().nullish(),
		audience: z.string().nullish(),
		subtitle: z.string().nullish(),

		colorOfVideo: z.array(z.string()).nullish(),
		colorOfImage: z.array(z.string()).nullish(),
		manufacturer: z.string().nullish(),
		model: z.string().nullish(),
		lens: z.string().nullish(),
		photostory: z.string().nullish(),

		documentType: z.string().nullish(),
		script: z.string().nullish(),
		isbn: z.string().nullish(),
		edition: z.string().nullish(),
		volume: z.string().nullish(),
		series: z.string().nullish(),
		printingHouse: z.string().nullish(),
		pageCount: z.number().nullish(),

		tags: z.array(z.string()).nullish(),
		keywords: z.array(z.string()).nullish(),
		whereThisVideoUsed: z.array(z.string()).nullish(),
		whereThisImageUsed: z.array(z.string()).nullish(),

		duration: z.string().nullish(),

		dateCreated: z.string().nullish(),
		datePublished: z.string().nullish(),
		dateModified: z.string().nullish(),
		printDate: z.string().nullish(),

		copyright: z.string().nullish(),
		rightOwner: z.string().nullish(),
		dateCopyrighted: z.string().nullish(),
		licenseType: z.string().nullish(),
		usageRights: z.string().nullish(),
		availability: z.string().nullish(),
		owner: z.string().nullish(),
		publisher: z.string().nullish(),

		audioFileUrl: z.string().nullish(),
		videoFileUrl: z.string().nullish(),
		imageFileUrl: z.string().nullish(),
		textFileUrl: z.string().nullish(),
		coverImageUrl: z.string().nullish(),

		trending: z.boolean().nullish(),
		trendingRank: z.number().nullish(),
		trendingScore: z.number().nullish(),
	})
	.loose();
export type PlatformFullMedia = z.infer<typeof PlatformFullMediaSchema>;

/** The flat result card (`GuestMediaHitDTO`) — identical for all four kinds. */
export const PlatformHitSchema = z
	.object({
		type: PlatformMediaKindSchema,
		code: z.string(),
		id: z.number().optional(),

		title: z.string().nullish(),
		subtitle: z.string().nullish(),
		titleInCentralKurdish: z.string().nullish(),
		romanizedTitle: z.string().nullish(),
		description: z.string().nullish(),

		creator: z.string().nullish(),
		creatorRole: z.string().nullish(),

		projectCode: z.string().nullish(),
		projectName: z.string().nullish(),
		person: PlatformPersonSummarySchema.nullish(),
		categories: z.array(PlatformCategorySummarySchema).nullish(),

		language: z.string().nullish(),
		dialect: z.string().nullish(),
		region: z.string().nullish(),
		subject: z.array(z.string()).nullish(),
		genre: z.array(z.string()).nullish(),
		tags: z.array(z.string()).nullish(),
		keywords: z.array(z.string()).nullish(),

		duration: z.string().nullish(),
		pageCount: z.number().nullish(),
		documentType: z.string().nullish(),

		dateCreated: z.string().nullish(),
		datePublished: z.string().nullish(),

		mediaUrl: z.string().nullish(),
		thumbnailUrl: z.string().nullish(),
		detailUrl: z.string().nullish(),

		score: z.number().nullish(),
		matchedIn: z.array(z.string()).nullish(),

		trending: z.boolean().nullish(),
		trendingRank: z.number().nullish(),
		trendingScore: z.number().nullish(),

		audio: PlatformFullMediaSchema.nullish(),
		video: PlatformFullMediaSchema.nullish(),
		image: PlatformFullMediaSchema.nullish(),
		text: PlatformFullMediaSchema.nullish(),
	})
	.loose();
export type PlatformHit = z.infer<typeof PlatformHitSchema>;

export const PlatformCountsSchema = z.object({
	total: z.number().catch(0),
	audio: z.number().catch(0),
	video: z.number().catch(0),
	image: z.number().catch(0),
	text: z.number().catch(0),
});
export type PlatformCounts = z.infer<typeof PlatformCountsSchema>;

export const PlatformFacetBucketSchema = z
	.object({
		code: z.string().nullish(),
		label: z.string(),
		count: z.number().catch(0),
	})
	.loose();
export type PlatformFacetBucket = z.infer<typeof PlatformFacetBucketSchema>;

const bucketList = z.array(PlatformFacetBucketSchema);

// NOT loose: a loose object widens `keyof` to string, and the refine panel
// iterates these keys. Unknown future facet lists are simply dropped.
export const PlatformFacetsSchema = z.object({
	languages: bucketList.optional(),
	dialects: bucketList.optional(),
	regions: bucketList.optional(),
	subjects: bucketList.optional(),
	genres: bucketList.optional(),
	tags: bucketList.optional(),
	keywords: bucketList.optional(),
	persons: bucketList.optional(),
	projects: bucketList.optional(),
	decades: bucketList.optional(),
});
export type PlatformFacets = z.infer<typeof PlatformFacetsSchema>;

/**
 * `/api/guest/media/search` envelope. NOT the Spring page envelope — this one
 * uses `page`, not `number`.
 */
export const PlatformSearchResponseSchema = z
	.object({
		query: z.string().catch(""),
		sort: z.string().catch("relevance"),
		counts: PlatformCountsSchema,
		content: z.array(PlatformHitSchema).catch([]),

		page: z.number().catch(0),
		size: z.number().catch(24),
		totalElements: z.number().catch(0),
		totalPages: z.number().catch(0),
		numberOfElements: z.number().catch(0),
		first: z.boolean().catch(true),
		last: z.boolean().catch(true),
		empty: z.boolean().catch(false),
		hasNext: z.boolean().catch(false),
		hasPrevious: z.boolean().catch(false),

		facets: PlatformFacetsSchema.nullish(),
		truncated: z.boolean().catch(false),
	})
	.loose();
export type PlatformSearchResponse = z.infer<
	typeof PlatformSearchResponseSchema
>;

/** `/api/guest/media/{type}/{code}` — one item plus its collection rail. */
export const PlatformDetailResponseSchema = z
	.object({
		type: PlatformMediaKindSchema,
		code: z.string(),
		item: PlatformHitSchema,
		audio: PlatformFullMediaSchema.nullish(),
		video: PlatformFullMediaSchema.nullish(),
		image: PlatformFullMediaSchema.nullish(),
		text: PlatformFullMediaSchema.nullish(),
		related: z.array(PlatformHitSchema).nullish(),
	})
	.loose();
export type PlatformDetailResponse = z.infer<
	typeof PlatformDetailResponseSchema
>;

export const PlatformSuggestionSchema = z
	.object({
		value: z.string(),
		kind: z.string(),
		code: z.string(),
	})
	.loose();
export type PlatformSuggestion = z.infer<typeof PlatformSuggestionSchema>;

export const PlatformSuggestionsSchema = z.array(PlatformSuggestionSchema);
