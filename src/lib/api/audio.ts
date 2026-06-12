import "server-only";
import { z } from "zod";
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
	SoundTracksPageSchema,
} from "@/types/audio";
import { ApiResponseSchema } from "@/types/writing";

const SOUND_TRACKS_ENDPOINT = "/api/v1/sound-tracks";
const SOUND_TRACKS_TAG = "sound-tracks";
const SOUND_TRACKS_REVALIDATE_SECONDS = 600;
const SOUND_TRACKS_FETCH_ALL_SIZE = 200;

export const AUDIO_GRID_PAGE_SIZE = 12;
export const AUDIO_MEMORIES_SIZE = 8;

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

async function fetchAllTracksFromApi(): Promise<SoundTrack[] | null> {
	const apiBaseUrl = process.env.API_BASE_URL;
	if (!apiBaseUrl) {
		return null;
	}

	try {
		const endpoint = new URL(SOUND_TRACKS_ENDPOINT, apiBaseUrl);
		endpoint.searchParams.set("page", "0");
		endpoint.searchParams.set("size", String(SOUND_TRACKS_FETCH_ALL_SIZE));

		const response = await fetch(endpoint, {
			next: {
				revalidate: SOUND_TRACKS_REVALIDATE_SECONDS,
				tags: [SOUND_TRACKS_TAG],
			},
		});

		if (!response.ok) {
			return null;
		}

		const payload: unknown = await response.json();
		const parsed = ApiResponseSchema(SoundTracksPageSchema).safeParse(payload);

		if (!parsed.success) {
			return null;
		}

		const tracks = parsed.data.data.content;
		return tracks.length > 0 ? tracks : null;
	} catch {
		return null;
	}
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

/** Album-of-memories strip (future `GET /album-of-memories`). */
export async function getAlbumOfMemories(
	locale: string,
	size = AUDIO_MEMORIES_SIZE,
): Promise<ResolvedAudioCard[]> {
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
	const apiBaseUrl = process.env.API_BASE_URL;

	if (apiBaseUrl) {
		try {
			const endpoint = new URL(`${SOUND_TRACKS_ENDPOINT}/${id}`, apiBaseUrl);
			const response = await fetch(endpoint, {
				next: {
					revalidate: SOUND_TRACKS_REVALIDATE_SECONDS,
					tags: [SOUND_TRACKS_TAG, `sound-track-${id}`],
				},
			});

			if (response.ok) {
				const payload: unknown = await response.json();
				const parsed = ApiResponseSchema(SoundTrackSchema).safeParse(payload);
				if (parsed.success) {
					const detail = resolveAudioDetail(locale, parsed.data.data);
					if (detail?.id === id) {
						return detail;
					}
				}
			}
		} catch {
			// fall through to demo data
		}
	}

	const demoTrack = getDemoSoundTrackById(id);
	return demoTrack ? resolveAudioDetail(locale, demoTrack) : null;
}

export type AudioTopicOption = {
	id: number;
	name: string;
};

/** Topic options for the filter UI (future `GET /topics`). */
export async function getAudioTopics(
	locale: string,
): Promise<AudioTopicOption[]> {
	const apiBaseUrl = process.env.API_BASE_URL;

	if (apiBaseUrl) {
		try {
			const endpoint = new URL(`${SOUND_TRACKS_ENDPOINT}/topics`, apiBaseUrl);
			const response = await fetch(endpoint, {
				next: {
					revalidate: SOUND_TRACKS_REVALIDATE_SECONDS,
					tags: [SOUND_TRACKS_TAG],
				},
			});

			if (response.ok) {
				const payload: unknown = await response.json();
				const parsed = ApiResponseSchema(z.array(SoundTopicSchema)).safeParse(
					payload,
				);
				if (parsed.success && parsed.data.data.length > 0) {
					return parsed.data.data
						.map((topic) => ({
							id: topic.id,
							name:
								locale === "ku"
									? (topic.nameKmr ?? topic.nameCkb)
									: (topic.nameCkb ?? topic.nameKmr),
						}))
						.filter((topic): topic is AudioTopicOption => topic.name != null);
				}
			}
		} catch {
			// fall through to demo data
		}
	}

	return DEMO_SOUND_TOPICS.map((topic) => ({
		id: topic.id,
		name:
			locale === "ku"
				? (topic.nameKmr ?? topic.nameCkb ?? "")
				: (topic.nameCkb ?? topic.nameKmr ?? ""),
	})).filter((topic) => topic.name.length > 0);
}

/** Distinct soundType values present in the catalogue — drives the type chips. */
export async function getAudioSoundTypes(locale: string): Promise<string[]> {
	const allItems = await getAllAudioCards(locale);
	return [...new Set(allItems.map((item) => item.soundType))];
}

// re-exported for server components that resolve topic labels themselves
export { resolveAudioTopicName };
