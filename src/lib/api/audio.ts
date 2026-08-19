import "server-only";
import { z } from "zod";
import {
	apiFetch,
	apiFetchPage,
	apiFetchRaw,
	BULK_FETCH_SIZE,
	DEFAULT_REVALIDATE,
	sliceToCount,
	unwrapApiPayload,
} from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import { normalizeSoundTrackRecord } from "@/lib/api/normalize";
import {
	filterAudioTracks,
	paginateAudioTracks,
	sortAudioTracks,
} from "@/lib/audio/filter";
import {
	resolveAudioCard,
	resolveAudioDetail,
	resolveAudioTopicName,
} from "@/lib/audio/resolve";
import type {
	ResolvedAudioCard,
	ResolvedAudioDetail,
	SoundReklamVideo,
	SoundTrack,
	TrackState,
} from "@/types/audio";
import {
	SoundReklamVideoSchema,
	SoundTopicSchema,
	SoundTrackSchema,
	TrackStateSchema,
} from "@/types/audio";

const SOUND_TRACKS_ENDPOINT = "/api/v1/sound-tracks";
const SOUND_REKLAM_VIDEO_ENDPOINT = `${SOUND_TRACKS_ENDPOINT}/sound-reklam-video`;
const SOUND_TRACKS_TAG = "sound-tracks";

export const AUDIO_GRID_PAGE_SIZE = 12;
export const AUDIO_MEMORIES_SIZE = 8;
/** Home album wall: 5 columns × 2 rows at the widest breakpoint. */
export const SOUND_SECTION_CARD_COUNT = 10;

export type AudioListResult = {
	items: ResolvedAudioCard[];
	totalPages: number;
	totalElements: number;
	currentPage: number;
	empty: boolean;
};

export type AudioListingOptions = {
	soundType?: string | null;
	state?: TrackState | null;
	topicId?: number | null;
	tag?: string | null;
	query?: string | null;
	page?: number;
	size?: number;
};

/** Which filter dimension the upstream call already resolved for us. */
type ServedAudioDimension =
	| "query"
	| "tag"
	| "soundType"
	| "topicId"
	| "state"
	| null;

async function fetchTracksPage(
	searchParams: Record<string, string | number | undefined>,
): Promise<SoundTrack[] | null> {
	const page = await apiFetchPage(SOUND_TRACKS_ENDPOINT, {
		itemSchema: SoundTrackSchema,
		tags: [SOUND_TRACKS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams,
		normalizeItem: normalizeSoundTrackRecord,
	});

	return page?.content.length ? page.content : null;
}

async function fetchTracksBySoundType(
	soundType: string,
): Promise<SoundTrack[] | null> {
	const page = await apiFetchPage(`${SOUND_TRACKS_ENDPOINT}/by-sound-type`, {
		itemSchema: SoundTrackSchema,
		tags: [SOUND_TRACKS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { soundType, page: 0, size: BULK_FETCH_SIZE },
		normalizeItem: normalizeSoundTrackRecord,
	});
	return page?.content.length ? page.content : null;
}

async function fetchTracksByKeyword(
	keyword: string,
): Promise<SoundTrack[] | null> {
	const page = await apiFetchPage(`${SOUND_TRACKS_ENDPOINT}/search/keyword`, {
		itemSchema: SoundTrackSchema,
		tags: [SOUND_TRACKS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { keyword, page: 0, size: BULK_FETCH_SIZE },
		normalizeItem: normalizeSoundTrackRecord,
	});
	return page?.content.length ? page.content : null;
}

/** Widest text net — also spans description, album name and topic names. */
async function fetchTracksBySearch(q: string): Promise<SoundTrack[] | null> {
	const term = q.trim();
	// A blank term answers 400, so it never leaves the client.
	if (!term) {
		return null;
	}

	const page = await apiFetchPage(`${SOUND_TRACKS_ENDPOINT}/search`, {
		itemSchema: SoundTrackSchema,
		tags: [SOUND_TRACKS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { q: term, page: 0, size: BULK_FETCH_SIZE },
		normalizeItem: normalizeSoundTrackRecord,
	});
	return page?.content.length ? page.content : null;
}

async function fetchTracksByTag(tag: string): Promise<SoundTrack[] | null> {
	const term = tag.trim();
	if (!term) {
		return null;
	}

	const page = await apiFetchPage(`${SOUND_TRACKS_ENDPOINT}/search/tag`, {
		itemSchema: SoundTrackSchema,
		tags: [SOUND_TRACKS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { tag: term, page: 0, size: BULK_FETCH_SIZE },
		normalizeItem: normalizeSoundTrackRecord,
	});
	return page?.content.length ? page.content : null;
}

async function fetchTracksByTopic(
	topicId: number,
): Promise<SoundTrack[] | null> {
	// A missing or non-positive id answers 400.
	if (!Number.isInteger(topicId) || topicId <= 0) {
		return null;
	}

	const page = await apiFetchPage(`${SOUND_TRACKS_ENDPOINT}/by-topic`, {
		itemSchema: SoundTrackSchema,
		tags: [SOUND_TRACKS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { topicId, page: 0, size: BULK_FETCH_SIZE },
		normalizeItem: normalizeSoundTrackRecord,
	});
	return page?.content.length ? page.content : null;
}

async function fetchTracksByState(
	state: TrackState,
): Promise<SoundTrack[] | null> {
	// An unrecognised enum value answers 500 rather than 400, and the option is
	// only compile-time typed, so re-check it before building the URL.
	if (!TrackStateSchema.safeParse(state).success) {
		return null;
	}

	const page = await apiFetchPage(`${SOUND_TRACKS_ENDPOINT}/by-state`, {
		itemSchema: SoundTrackSchema,
		tags: [SOUND_TRACKS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { state, page: 0, size: BULK_FETCH_SIZE },
		normalizeItem: normalizeSoundTrackRecord,
	});
	return page?.content.length ? page.content : null;
}

async function fetchAllTracksFromApi(): Promise<SoundTrack[] | null> {
	return fetchTracksPage({ page: 0, size: BULK_FETCH_SIZE });
}

async function getAllSoundTracks(): Promise<SoundTrack[]> {
	const apiTracks = await fetchAllTracksFromApi();
	return apiTracks ?? [];
}

/** Full resolved card set for in-memory filter/sort/paginate. */
export async function getAllAudioCards(
	locale: string,
): Promise<ResolvedAudioCard[]> {
	const tracks = await getAllSoundTracks();
	return tracks
		.map((track) => resolveAudioCard(locale, track))
		.filter((item): item is ResolvedAudioCard => item != null);
}

/** Featured audio cards for the homepage sound section. */
export async function getAudioCarousel(
	locale: string,
	size = SOUND_SECTION_CARD_COUNT,
): Promise<ResolvedAudioCard[]> {
	let apiItems: ResolvedAudioCard[] = [];

	if (getApiBaseUrl()) {
		const apiTracks = await fetchAllTracksFromApi();
		if (apiTracks) {
			apiItems = sortAudioTracks(
				apiTracks
					.map((track) => resolveAudioCard(locale, track))
					.filter((item): item is ResolvedAudioCard => item != null),
			).slice(0, size);
		}
	}

	return sliceToCount(apiItems, size);
}

export async function getAudioListing(
	locale: string,
	{
		soundType,
		state,
		topicId,
		tag,
		query,
		page = 1,
		size = AUDIO_GRID_PAGE_SIZE,
	}: AudioListingOptions = {},
): Promise<AudioListResult> {
	if (getApiBaseUrl()) {
		const trimmedQuery = query?.trim() ?? "";
		const trimmedTag = tag?.trim() ?? "";
		const trimmedSoundType = soundType?.trim() ?? "";

		let served: ServedAudioDimension = null;
		let apiTracks: SoundTrack[] | null = null;

		// Text dimensions go first because refining them in memory is lossy —
		// the local haystack has no album name, no terms and only the truncated
		// excerpt, and card tags are resolved to a single dialect. The remaining
		// dimensions are exact comparisons, so they refine losslessly.
		if (trimmedQuery) {
			apiTracks =
				(await fetchTracksBySearch(trimmedQuery)) ??
				(await fetchTracksByTag(trimmedQuery)) ??
				(await fetchTracksByKeyword(trimmedQuery));
			served = "query";
		} else if (trimmedTag) {
			apiTracks = await fetchTracksByTag(trimmedTag);
			served = "tag";
		} else if (trimmedSoundType) {
			apiTracks = await fetchTracksBySoundType(trimmedSoundType);
			served = "soundType";
		} else if (topicId != null) {
			apiTracks = await fetchTracksByTopic(topicId);
			served = "topicId";
		} else if (state) {
			apiTracks = await fetchTracksByState(state);
			served = "state";
		} else {
			apiTracks = await fetchAllTracksFromApi();
		}

		// A dedicated endpoint collapses "no matches" and "request failed" into
		// the same null. Retrying against the bulk set and letting the in-memory
		// pass apply every dimension keeps a failing endpoint from emptying a
		// grid that filtered fine before these endpoints were wired up.
		if (apiTracks == null && served != null) {
			apiTracks = await fetchAllTracksFromApi();
			served = null;
		}

		if (apiTracks) {
			const allItems = apiTracks
				.map((track) => resolveAudioCard(locale, track))
				.filter((item): item is ResolvedAudioCard => item != null);
			// Only the dimension the endpoint already applied is dropped; every
			// other one still has to narrow the fetched set.
			const filtered = filterAudioTracks(allItems, {
				soundType: served === "soundType" ? null : soundType,
				state: served === "state" ? null : state,
				topicId: served === "topicId" ? null : topicId,
				tag: served === "tag" ? null : tag,
				query: served === "query" ? null : query,
			});
			const sorted = sortAudioTracks(filtered);
			return paginateAudioTracks(sorted, page, size);
		}
	}

	// API unavailable or empty — an empty page, not demo tracks.
	return paginateAudioTracks([], page, size);
}

/** Album-of-memories strip (`GET /api/v1/sound-tracks/album-of-memories`). */
export async function getAlbumOfMemories(
	locale: string,
	size = AUDIO_MEMORIES_SIZE,
): Promise<ResolvedAudioCard[]> {
	let apiItems: ResolvedAudioCard[] = [];

	if (getApiBaseUrl()) {
		const page = await apiFetchPage(
			`${SOUND_TRACKS_ENDPOINT}/album-of-memories`,
			{
				itemSchema: SoundTrackSchema,
				tags: [SOUND_TRACKS_TAG, "album-of-memories"],
				revalidate: DEFAULT_REVALIDATE,
				searchParams: { page: 0, size },
				normalizeItem: normalizeSoundTrackRecord,
			},
		);

		if (page?.content.length) {
			apiItems = sortAudioTracks(
				page.content
					.map((track) => resolveAudioCard(locale, track))
					.filter((item): item is ResolvedAudioCard => item != null),
			).slice(0, size);
		}
	}

	return apiItems;
}

export async function getAudioTrackById(
	locale: string,
	id: number,
): Promise<ResolvedAudioDetail | null> {
	let apiDetail: ResolvedAudioDetail | null = null;

	if (getApiBaseUrl()) {
		const raw = await apiFetchRaw(`${SOUND_TRACKS_ENDPOINT}/${id}`, {
			tags: [SOUND_TRACKS_TAG, `sound-track-${id}`],
			revalidate: DEFAULT_REVALIDATE,
		});
		const unwrapped = unwrapApiPayload(raw);
		const parsed = unwrapped
			? SoundTrackSchema.safeParse(normalizeSoundTrackRecord(unwrapped))
			: null;

		if (parsed?.success) {
			const resolved = resolveAudioDetail(locale, parsed.data);
			if (resolved?.id === id) {
				apiDetail = resolved;
			}
		}
	}

	return apiDetail;
}

const RELATED_AUDIO_LIMIT = 4;

/** Prev/next neighbours in the catalogue (newest-first order). */
export async function getAudioNeighbors(
	locale: string,
	id: number,
): Promise<{
	previous: ResolvedAudioCard | null;
	next: ResolvedAudioCard | null;
}> {
	const allItems = sortAudioTracks(await getAllAudioCards(locale));
	const index = allItems.findIndex((item) => item.id === id);
	if (index < 0) {
		return { previous: null, next: null };
	}
	return {
		previous: index > 0 ? (allItems[index - 1] ?? null) : null,
		next: index < allItems.length - 1 ? (allItems[index + 1] ?? null) : null,
	};
}

/**
 * Related catalogue cards ranked by shared tags/keywords, topic, and type.
 * Fills with recent peers when scored matches are scarce.
 */
export async function getRelatedAudio(
	locale: string,
	detail: ResolvedAudioDetail,
	options?: {
		limit?: number;
		excludeIds?: ReadonlyArray<number>;
	},
): Promise<ResolvedAudioCard[]> {
	const limit = options?.limit ?? RELATED_AUDIO_LIMIT;
	const allItems = await getAllAudioCards(locale);
	const exclude = new Set<number>([detail.id, ...(options?.excludeIds ?? [])]);
	const tagSet = new Set(
		[...detail.tags, ...detail.keywords]
			.map((tag) => tag.trim().toLowerCase())
			.filter(Boolean),
	);

	const ranked = allItems
		.filter((entry) => !exclude.has(entry.id))
		.map((entry) => {
			const sharedTags = [...entry.tags, ...entry.keywords].filter((tag) =>
				tagSet.has(tag.trim().toLowerCase()),
			).length;
			const sameTopic =
				detail.topicId != null && entry.topicId === detail.topicId ? 1 : 0;
			const sameType = entry.soundType === detail.soundType ? 1 : 0;
			const sameMemories =
				detail.albumOfMemories && entry.albumOfMemories ? 1 : 0;
			return {
				entry,
				score: sharedTags * 10 + sameTopic * 5 + sameType * 3 + sameMemories,
			};
		})
		.sort((a, b) => {
			if (b.score !== a.score) {
				return b.score - a.score;
			}
			return b.entry.createdAt.localeCompare(a.entry.createdAt);
		});

	const results: ResolvedAudioCard[] = [];
	const used = new Set(exclude);

	for (const { entry, score } of ranked) {
		if (results.length >= limit) {
			break;
		}
		if (score <= 0 || used.has(entry.id)) {
			continue;
		}
		results.push(entry);
		used.add(entry.id);
	}

	if (results.length < limit) {
		for (const item of sortAudioTracks(allItems)) {
			if (results.length >= limit) {
				break;
			}
			if (used.has(item.id)) {
				continue;
			}
			results.push(item);
			used.add(item.id);
		}
	}

	return results;
}

export type AudioTopicOption = {
	id: number;
	name: string;
};

/** Topic options for the filter UI (`GET /api/v1/sound-tracks/topics`). */
export async function getAudioTopics(
	locale: string,
): Promise<AudioTopicOption[]> {
	let apiItems: AudioTopicOption[] = [];

	if (getApiBaseUrl()) {
		const topics = await apiFetch(`${SOUND_TRACKS_ENDPOINT}/topics`, {
			schema: z.array(SoundTopicSchema),
			tags: [SOUND_TRACKS_TAG],
			revalidate: DEFAULT_REVALIDATE,
		});

		if (topics && topics.length > 0) {
			apiItems = topics
				.map((topic) => ({
					id: topic.id,
					name:
						locale === "ckb"
							? (topic.nameCkb ?? topic.nameKmr)
							: (topic.nameKmr ?? topic.nameCkb),
				}))
				.filter((topic): topic is AudioTopicOption => topic.name != null);
		}
	}

	return apiItems;
}

/** Distinct soundType values present in the catalogue — drives the type chips. */
export async function getAudioSoundTypes(locale: string): Promise<string[]> {
	const allItems = await getAllAudioCards(locale);
	return [...new Set(allItems.map((item) => item.soundType))];
}

/** Homepage sound-section background video (`GET .../sound-reklam-video`). */
export async function getSoundReklamVideo(): Promise<SoundReklamVideo | null> {
	if (!getApiBaseUrl()) {
		return null;
	}

	return apiFetch(SOUND_REKLAM_VIDEO_ENDPOINT, {
		schema: SoundReklamVideoSchema,
		tags: [SOUND_TRACKS_TAG, "sound-reklam-video"],
		revalidate: DEFAULT_REVALIDATE,
	});
}

// re-exported for server components that resolve topic labels themselves
export { resolveAudioTopicName };
