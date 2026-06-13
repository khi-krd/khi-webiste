import { parseYouTubeVideoId } from "@/components/ui/video-player/video-source";
import { SHORT_FILMS_TOPIC_ID } from "@/lib/mock/videos";
import type {
	ResolvedVideoCard,
	ResolvedVideoCastMember,
	ResolvedVideoClip,
	ResolvedVideoDetail,
	ResolvedVideoHighlight,
	Video,
	VideoCastMember,
	VideoContent,
	VideoHighlightClip,
	VideoPlayerKind,
} from "@/types/video";

const EXCERPT_MAX_LENGTH = 120;

function firstNonBlank(
	...values: (string | null | undefined)[]
): string | null {
	for (const value of values) {
		if (value && value.trim().length > 0) {
			return value;
		}
	}
	return null;
}

function truncate(text: string, maxLength: number): string {
	if (text.length <= maxLength) {
		return text;
	}
	return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function resolveVideoContent(
	locale: string,
	video: Video,
): VideoContent | null {
	if (locale === "ku") {
		return video.kmrContent ?? video.ckbContent;
	}
	return video.ckbContent ?? video.kmrContent;
}

export function resolveVideoCoverUrl(
	locale: string,
	video: Video,
): string | null {
	if (locale === "ku") {
		return firstNonBlank(
			video.kmrCoverUrl,
			video.ckbCoverUrl,
			video.hoverCoverUrl,
		);
	}
	return firstNonBlank(
		video.ckbCoverUrl,
		video.kmrCoverUrl,
		video.hoverCoverUrl,
	);
}

export function resolveVideoTopicName(
	locale: string,
	video: Video,
): string | null {
	if (locale === "ku") {
		return firstNonBlank(video.topicNameKmr, video.topicNameCkb);
	}
	return firstNonBlank(video.topicNameCkb, video.topicNameKmr);
}

function resolveBilingualStrings(
	locale: string,
	ckb: string[],
	kmr: string[],
): string[] {
	if (locale === "ku") {
		return kmr.length > 0 ? kmr : ckb;
	}
	if (locale === "ckb") {
		return ckb.length > 0 ? ckb : kmr;
	}
	return [...new Set([...ckb, ...kmr])];
}

/** Locale-relative detail path consumed by the i18n-aware `Link`. */
export function videoDetailHref(id: number): string {
	return `/videos/${id}`;
}

/** Short-film detail path under the dedicated short-films section. */
export function shortFilmDetailHref(id: number): string {
	return `/videos/shortfilms/${id}`;
}

export function isShortFilm(topicId: number | null): boolean {
	return topicId === SHORT_FILMS_TOPIC_ID;
}

function sortedClips(video: Video): Video["videoClipItems"] {
	if (!video.videoClipItems) {
		return null;
	}
	return [...video.videoClipItems].sort((a, b) => a.clipNumber - b.clipNumber);
}

const MEDIA_FILE_PATTERN = /\.(mp4|webm|ogg|ogv|mov|m4v|m3u8|mpd)(\?|#|$)/i;

/** Classify a single URL into a player kind, or null if blank. */
function classifySource(
	url: string | null | undefined,
): { kind: Exclude<VideoPlayerKind, "none">; src: string } | null {
	const trimmed = url?.trim();
	if (!trimmed) {
		return null;
	}
	// Vidstack natively handles YouTube and direct media files.
	if (parseYouTubeVideoId(trimmed) || MEDIA_FILE_PATTERN.test(trimmed)) {
		return { kind: "vidstack", src: trimmed };
	}
	// Anything else (Vimeo, generic embed pages) → raw iframe.
	return { kind: "iframe", src: trimmed };
}

/**
 * Resolve which source the detail player should mount.
 * FILM follows the source priority (direct → external → embed); VIDEO_CLIP
 * plays its first clip and the client frame swaps between the rest.
 */
export function resolveVideoPlayer(video: Video): {
	playerKind: VideoPlayerKind;
	playableSrc: string | null;
} {
	if (video.videoType === "VIDEO_CLIP") {
		const first = sortedClips(video)?.[0];
		const classified = classifySource(first?.url);
		return classified
			? { playerKind: classified.kind, playableSrc: classified.src }
			: { playerKind: "none", playableSrc: null };
	}

	for (const candidate of [
		video.sourceUrl,
		video.sourceExternalUrl,
		video.sourceEmbedUrl,
	]) {
		const classified = classifySource(candidate);
		if (classified) {
			return { playerKind: classified.kind, playableSrc: classified.src };
		}
	}
	return { playerKind: "none", playableSrc: null };
}

function resolveCastMember(
	locale: string,
	member: VideoCastMember,
): ResolvedVideoCastMember | null {
	const name =
		locale === "ku"
			? firstNonBlank(member.nameKmr, member.nameCkb)
			: firstNonBlank(member.nameCkb, member.nameKmr);
	if (!name) {
		return null;
	}
	const role =
		(locale === "ku"
			? firstNonBlank(member.roleKmr, member.roleCkb)
			: firstNonBlank(member.roleCkb, member.roleKmr)) ?? "";

	return {
		name,
		role,
		photoUrl: firstNonBlank(member.photoUrl),
	};
}

function resolveHighlight(
	locale: string,
	highlight: VideoHighlightClip,
): ResolvedVideoHighlight | null {
	const title =
		locale === "ku"
			? firstNonBlank(highlight.titleKmr, highlight.titleCkb)
			: firstNonBlank(highlight.titleCkb, highlight.titleKmr);
	if (!title) {
		return null;
	}

	return {
		title,
		thumbnailUrl: firstNonBlank(highlight.thumbnailUrl),
		url: firstNonBlank(highlight.url) ?? null,
		startSeconds: highlight.startSeconds ?? null,
	};
}

function resolveClip(
	locale: string,
	clip: NonNullable<Video["videoClipItems"]>[number],
): ResolvedVideoClip {
	const title =
		locale === "ku"
			? firstNonBlank(clip.titleKmr, clip.titleCkb)
			: firstNonBlank(clip.titleCkb, clip.titleKmr);

	return {
		clipNumber: clip.clipNumber,
		title: title ?? String(clip.clipNumber),
		url: clip.url,
		durationSeconds: clip.durationSeconds,
	};
}

function publishmentYear(video: Video): number | null {
	const raw = video.publishmentDate?.slice(0, 4);
	if (!raw) {
		return null;
	}
	const parsed = Number.parseInt(raw, 10);
	return Number.isInteger(parsed) ? parsed : null;
}

function totalClipDuration(video: Video): number | null {
	const clips = video.videoClipItems;
	if (!clips || clips.length === 0) {
		return null;
	}
	const total = clips.reduce(
		(sum, clip) => sum + (clip.durationSeconds ?? 0),
		0,
	);
	return total > 0 ? total : null;
}

export function resolveVideoCard(
	locale: string,
	video: Video,
): ResolvedVideoCard | null {
	const content = resolveVideoContent(locale, video);
	if (!content?.title) {
		return null;
	}

	const description = content.description?.trim() ?? "";

	return {
		id: video.id,
		title: content.title,
		subtitle: firstNonBlank(content.director),
		excerpt: description ? truncate(description, EXCERPT_MAX_LENGTH) : "",
		coverUrl: resolveVideoCoverUrl(locale, video),
		hoverCoverUrl: video.hoverCoverUrl,
		videoType: video.videoType,
		albumOfMemories: video.albumOfMemories,
		topicId: video.topicId,
		topicName: resolveVideoTopicName(locale, video),
		durationSeconds: video.durationSeconds ?? totalClipDuration(video),
		clipCount:
			video.videoType === "VIDEO_CLIP"
				? (video.videoClipItems?.length ?? 0)
				: null,
		year: publishmentYear(video),
		tags: resolveBilingualStrings(locale, video.tagsCkb, video.tagsKmr),
		keywords: resolveBilingualStrings(
			locale,
			video.keywordsCkb,
			video.keywordsKmr,
		),
		createdAt: video.createdAt,
	};
}

export function resolveVideoDetail(
	locale: string,
	video: Video,
): ResolvedVideoDetail | null {
	const content = resolveVideoContent(locale, video);
	if (!content?.title) {
		return null;
	}

	const { playerKind, playableSrc } = resolveVideoPlayer(video);
	const clips = (sortedClips(video) ?? []).map((clip) =>
		resolveClip(locale, clip),
	);

	const cast = (video.castMembers ?? [])
		.map((member) => resolveCastMember(locale, member))
		.filter((member): member is ResolvedVideoCastMember => member != null);
	const highlights = (video.highlightClips ?? [])
		.map((highlight) => resolveHighlight(locale, highlight))
		.filter((highlight): highlight is ResolvedVideoHighlight => highlight != null);

	return {
		id: video.id,
		title: content.title,
		description: content.description?.trim() ?? "",
		coverUrl: resolveVideoCoverUrl(locale, video),
		videoType: video.videoType,
		albumOfMemories: video.albumOfMemories,
		topicId: video.topicId,
		topicName: resolveVideoTopicName(locale, video),
		director: firstNonBlank(content.director),
		producer: firstNonBlank(content.producer),
		location: firstNonBlank(content.location),
		contentLanguages: video.contentLanguages,
		durationSeconds: video.durationSeconds ?? totalClipDuration(video),
		resolution: firstNonBlank(video.resolution),
		fileFormat: firstNonBlank(video.fileFormat),
		publishmentDate: firstNonBlank(video.publishmentDate),
		fileSizeMb: video.fileSizeMb,
		playerKind,
		playableSrc,
		clips,
		cast,
		highlights,
		tags: resolveBilingualStrings(locale, video.tagsCkb, video.tagsKmr),
		keywords: resolveBilingualStrings(
			locale,
			video.keywordsCkb,
			video.keywordsKmr,
		),
		createdAt: video.createdAt,
		updatedAt: video.updatedAt,
	};
}
