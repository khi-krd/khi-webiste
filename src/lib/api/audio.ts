import "server-only";
import { z } from "zod";
import {
	apiFetch,
	apiFetchPage,
	apiFetchRaw,
	BULK_FETCH_SIZE,
	DEFAULT_REVALIDATE,
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
import {
	DEMO_SOUND_TOPICS,
	getAllDemoSoundTracks,
	getDemoSoundTrackById,
} from "@/lib/mock/audio";
import type {
	ResolvedAudioCard,
	ResolvedAudioDetail,
	SoundTrack,
	TrackState,
} from "@/types/audio";
import {
	SoundTopicSchema,
	SoundTrackSchema,
} from "@/types/audio";

const SOUND_TRACKS_ENDPOINT = "/api/v1/sound-tracks";
const SOUND_TRACKS_TAG = "sound-tracks";

export const AUDIO_GRID_PAGE_SIZE = 12;
export const AUDIO_MEMORIES_SIZE = 8;
export const SOUND_SECTION_CARD_COUNT = 4;

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
	query?: string | null;
	page?: number;
	size?: number;
};

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

async function fetchTracksBySoundType(soundType: string): Promise<SoundTrack[] | null> {
	const page = await apiFetchPage(`${SOUND_TRACKS_ENDPOINT}/by-sound-type`, {
		itemSchema: SoundTrackSchema,
		tags: [SOUND_TRACKS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { soundType, page: 0, size: BULK_FETCH_SIZE },
		normalizeItem: normalizeSoundTrackRecord,
	});
	return page?.content.length ? page.content : null;
}

async function fetchTracksByKeyword(keyword: string): Promise<SoundTrack[] | null> {
	const page = await apiFetchPage(`${SOUND_TRACKS_ENDPOINT}/search/keyword`, {
		itemSchema: SoundTrackSchema,
		tags: [SOUND_TRACKS_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { keyword, page: 0, size: BULK_FETCH_SIZE },
		normalizeItem: normalizeSoundTrackRecord,
	});
	return page?.content.length ? page.content : null;
}

async function fetchAllTracksFromApi(): Promise<SoundTrack[] | null> {
	return fetchTracksPage({ page: 0, size: BULK_FETCH_SIZE });
}

async function getAllSoundTracks(): Promise<SoundTrack[]> {
	const apiTracks = await fetchAllTracksFromApi();
	return apiTracks ?? getAllDemoSoundTracks();
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
	const { items } = await getAudioListing(locale, { page: 1, size });
	return items;
}

export async function getAudioListing(
	locale: string,
	{
		soundType,
		state,
		topicId,
		query,
		page = 1,
		size = AUDIO_GRID_PAGE_SIZE,
	}: AudioListingOptions = {},
): Promise<AudioListResult> {
	if (getApiBaseUrl()) {
		let apiTracks: SoundTrack[] | null = null;

		if (soundType?.trim()) {
			apiTracks = await fetchTracksBySoundType(soundType.trim());
		} else if (query?.trim()) {
			apiTracks = await fetchTracksByKeyword(query.trim());
		}

		if (apiTracks) {
			const allItems = apiTracks
				.map((track) => resolveAudioCard(locale, track))
				.filter((item): item is ResolvedAudioCard => item != null);
			const filtered = filterAudioTracks(allItems, {
				soundType,
				state,
				topicId,
				query: soundType?.trim() || query?.trim() ? null : query,
			});
			const sorted = sortAudioTracks(filtered);
			return paginateAudioTracks(sorted, page, size);
		}
	}

	const allItems = await getAllAudioCards(locale);
	const filtered = filterAudioTracks(allItems, {
		soundType,
		state,
		topicId,
		query,
	});
	const sorted = sortAudioTracks(filtered);
	return paginateAudioTracks(sorted, page, size);
}

/** Album-of-memories strip (`GET /api/v1/sound-tracks/album-of-memories`). */
export async function getAlbumOfMemories(
	locale: string,
	size = AUDIO_MEMORIES_SIZE,
): Promise<ResolvedAudioCard[]> {
	if (getApiBaseUrl()) {
		const page = await apiFetchPage(`${SOUND_TRACKS_ENDPOINT}/album-of-memories`, {
			itemSchema: SoundTrackSchema,
			tags: [SOUND_TRACKS_TAG, "album-of-memories"],
			revalidate: DEFAULT_REVALIDATE,
			searchParams: { page: 0, size },
			normalizeItem: normalizeSoundTrackRecord,
		});

		if (page?.content.length) {
			const items = page.content
				.map((track) => resolveAudioCard(locale, track))
				.filter((item): item is ResolvedAudioCard => item != null);
			if (items.length > 0) {
				return sortAudioTracks(items).slice(0, size);
			}
		}
	}

	const allItems = await getAllAudioCards(locale);
	return sortAudioTracks(allItems.filter((item) => item.albumOfMemories)).slice(
		0,
		size,
	);
}

export async function getAudioTrackById(
	locale: string,
	id: number,
): Promise<ResolvedAudioDetail | null> {
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
				return resolved;
			}
		}
	}

	const demoTrack = getDemoSoundTrackById(id);
	return demoTrack ? resolveAudioDetail(locale, demoTrack) : null;
}

export type AudioTopicOption = {
	id: number;
	name: string;
};

/** Topic options for the filter UI (`GET /api/v1/sound-tracks/topics`). */
export async function getAudioTopics(
	locale: string,
): Promise<AudioTopicOption[]> {
	if (getApiBaseUrl()) {
		const topics = await apiFetch(`${SOUND_TRACKS_ENDPOINT}/topics`, {
			schema: z.array(SoundTopicSchema),
			tags: [SOUND_TRACKS_TAG],
			revalidate: DEFAULT_REVALIDATE,
		});

		if (topics && topics.length > 0) {
			return topics
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

	return DEMO_SOUND_TOPICS.map((topic) => ({
		id: topic.id,
		name:
			locale === "ckb"
				? (topic.nameCkb ?? topic.nameKmr ?? "")
				: (topic.nameKmr ?? topic.nameCkb ?? ""),
	})).filter((topic) => topic.name.length > 0);
}

/** Distinct soundType values present in the catalogue — drives the type chips. */
export async function getAudioSoundTypes(locale: string): Promise<string[]> {
	const allItems = await getAllAudioCards(locale);
	return [...new Set(allItems.map((item) => item.soundType))];
}

// re-exported for server components that resolve topic labels themselves
export { resolveAudioTopicName };
