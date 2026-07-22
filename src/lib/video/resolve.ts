import { classifyPlayableSource } from "@/lib/video/source";
import { plainTextFromRichContent } from "@/lib/rich-text";
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
	VideoType,
} from "@/types/video";

export const classifySource = classifyPlayableSource;

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
	if (locale === "ckb") {
		return video.ckbContent ?? video.kmrContent ?? null;
	}
	return video.kmrContent ?? video.ckbContent ?? null;
}

export function resolveVideoCoverUrl(
	locale: string,
	video: Video,
): string | null {
	if (locale === "ckb") {
		return firstNonBlank(
			video.ckbCoverUrl,
			video.kmrCoverUrl,
			video.hoverCoverUrl,
		);
	}
	return firstNonBlank(
		video.kmrCoverUrl,
		video.ckbCoverUrl,
		video.hoverCoverUrl,
	);
}

/** Direct file URL for thumbnail previews when the CMS has no cover image. */
export function resolveVideoPreviewUrl(video: Video): string | null {
	const clips = sortedClips(video) ?? [];

	for (const candidate of [
		video.sourceUrl,
		video.sourceExternalUrl,
		...clips.map((clip) => resolveClipUrl(clip)),
	]) {
		const classified = classifyPlayableSource(candidate);
		if (classified?.kind === "vidstack") {
			return classified.src;
		}
	}

	return null;
}

export function resolveVideoTopicName(
	locale: string,
	video: Video,
): string | null {
	if (locale === "ckb") {
		return firstNonBlank(video.topicNameCkb, video.topicNameKmr);
	}
	return firstNonBlank(video.topicNameKmr, video.topicNameCkb);
}

function resolveBilingualStrings(
	locale: string,
	ckb: string[],
	kmr: string[],
): string[] {
	if (locale === "ckb") {
		return ckb.length > 0 ? ckb : kmr;
	}
	return kmr.length > 0 ? kmr : ckb;
}

/** Locale-relative detail path consumed by the i18n-aware `Link`. */
export function videoDetailHref(id: number, clipNumber?: number | null): string {
	if (clipNumber != null && clipNumber > 0) {
		return `/videos/${id}?clip=${clipNumber}`;
	}
	return `/videos/${id}`;
}

/** Short-film detail path under the dedicated short-films section. */
export function shortFilmDetailHref(id: number): string {
	return `/videos/shortfilms/${id}`;
}

/** API `videoType` for films — there is no separate short-film enum value. */
export const SHORT_FILM_VIDEO_TYPE = "FILM" satisfies VideoType;

/** Listing filters for `/videos/shortfilms` and related film surfaces. */
export const SHORT_FILM_LISTING_FILTERS = {
	videoType: SHORT_FILM_VIDEO_TYPE,
} as const;

export function isShortFilm(
	video: Pick<ResolvedVideoCard, "videoType"> | VideoType,
): boolean {
	const videoType = typeof video === "string" ? video : video.videoType;
	return videoType === SHORT_FILM_VIDEO_TYPE;
}

function resolveClipUrl(
	clip?: NonNullable<Video["videoClipItems"]>[number] | null,
): string | null {
	if (!clip) {
		return null;
	}
	return firstNonBlank(clip.url, clip.externalUrl, clip.embedUrl);
}

function sortedClips(video: Video): Video["videoClipItems"] {
	if (!video.videoClipItems) {
		return null;
	}
	return [...video.videoClipItems].sort((a, b) => a.clipNumber - b.clipNumber);
}

/**
 * Resolve which source the detail player should mount.
 * VIDEO_CLIP always plays a clip (optional clipNumber, else the first).
 * FILM prefers the film source (direct → external → embed); when a clip is
 * requested or the film has no main source, fall back to videoClipItems.
 */
export function resolveVideoPlayer(
	video: Video,
	clipNumber?: number | null,
): {
	playerKind: VideoPlayerKind;
	playableSrc: string | null;
} {
	const clips = sortedClips(video) ?? [];
	const selectedClip =
		clipNumber != null
			? (clips.find((clip) => clip.clipNumber === clipNumber) ?? clips[0])
			: clips[0];

	if (video.videoType === "VIDEO_CLIP") {
		const classified = classifyPlayableSource(resolveClipUrl(selectedClip));
		return classified
			? { playerKind: classified.kind, playableSrc: classified.src }
			: { playerKind: "none", playableSrc: null };
	}

	// Multi-scene FILM: honor an explicit scene deep-link first.
	if (clipNumber != null && selectedClip) {
		const classified = classifyPlayableSource(resolveClipUrl(selectedClip));
		if (classified) {
			return { playerKind: classified.kind, playableSrc: classified.src };
		}
	}

	for (const candidate of [
		video.sourceUrl,
		video.sourceExternalUrl,
		video.sourceEmbedUrl,
	]) {
		const classified = classifyPlayableSource(candidate);
		if (classified) {
			return { playerKind: classified.kind, playableSrc: classified.src };
		}
	}

	// No main source — play the first scene if the film is a multi-part reel.
	if (selectedClip) {
		const classified = classifyPlayableSource(resolveClipUrl(selectedClip));
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
		locale === "ckb"
			? firstNonBlank(member.nameCkb, member.nameKmr)
			: firstNonBlank(member.nameKmr, member.nameCkb);
	if (!name) {
		return null;
	}
	const role =
		(locale === "ckb"
			? firstNonBlank(member.roleCkb, member.roleKmr)
			: firstNonBlank(member.roleKmr, member.roleCkb)) ?? "";

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
		locale === "ckb"
			? firstNonBlank(highlight.titleCkb, highlight.titleKmr)
			: firstNonBlank(highlight.titleKmr, highlight.titleCkb);
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

function resolveClipCoverUrl(
	locale: string,
	clip: NonNullable<Video["videoClipItems"]>[number],
): string | null {
	if (locale === "ckb") {
		return firstNonBlank(
			clip.ckbCoverUrl,
			clip.kmrCoverUrl,
			clip.coverUrl,
			clip.thumbnailUrl,
			clip.imageUrl,
		);
	}
	return firstNonBlank(
		clip.kmrCoverUrl,
		clip.ckbCoverUrl,
		clip.coverUrl,
		clip.thumbnailUrl,
		clip.imageUrl,
	);
}

function resolveClip(
	locale: string,
	clip: NonNullable<Video["videoClipItems"]>[number],
	parentCoverUrl?: string | null,
): ResolvedVideoClip {
	const title =
		locale === "ckb"
			? firstNonBlank(clip.titleCkb, clip.titleKmr)
			: firstNonBlank(clip.titleKmr, clip.titleCkb);

	return {
		clipNumber: clip.clipNumber,
		title: title ?? "",
		url: resolveClipUrl(clip) ?? "",
		durationSeconds: clip.durationSeconds ?? null,
		coverUrl:
			resolveClipCoverUrl(locale, clip) ?? parentCoverUrl ?? null,
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
	const clips = sortedClips(video) ?? [];
	const singleClip = video.videoType === "VIDEO_CLIP" ? clips[0] : null;

	return {
		id: video.id,
		featured: video.featured ?? false,
		featuredOrder: video.featuredOrder ?? null,
		title: content.title,
		subtitle: firstNonBlank(content.director),
		excerpt: description
			? truncate(plainTextFromRichContent(description), EXCERPT_MAX_LENGTH)
			: "",
		coverUrl: resolveVideoCoverUrl(locale, video),
		previewVideoUrl: resolveVideoPreviewUrl(video),
		hoverCoverUrl: video.hoverCoverUrl ?? null,
		videoType: video.videoType,
		albumOfMemories: video.albumOfMemories,
		topicId: video.topicId ?? null,
		topicName: resolveVideoTopicName(locale, video),
		durationSeconds:
			singleClip?.durationSeconds ??
			video.durationSeconds ??
			totalClipDuration(video),
		/** Clips are standalone videos — never expose a playlist count. */
		clipCount: null,
		clipNumber: singleClip?.clipNumber ?? null,
		year: publishmentYear(video),
		tags: resolveBilingualStrings(locale, video.tagsCkb, video.tagsKmr),
		keywords: resolveBilingualStrings(
			locale,
			video.keywordsCkb,
			video.keywordsKmr,
		),
		createdAt: video.createdAt ?? "",
	};
}

/**
 * Expand VIDEO_CLIP parents so every clip appears as its own listing card.
 * FILM records stay one card. Ensures the catalogue shows all clips.
 */
export function resolveVideoCards(
	locale: string,
	video: Video,
): ResolvedVideoCard[] {
	const base = resolveVideoCard(locale, video);
	if (!base) {
		return [];
	}

	if (video.videoType !== "VIDEO_CLIP") {
		return [base];
	}

	const clips = (sortedClips(video) ?? []).map((clip) =>
		resolveClip(locale, clip, base.coverUrl),
	);
	if (clips.length <= 1) {
		return [base];
	}

	return clips
		.filter((clip) => clip.url.trim().length > 0)
		.map((clip) => ({
			...base,
			title: clip.title || base.title,
			durationSeconds: clip.durationSeconds,
			coverUrl: clip.coverUrl ?? base.coverUrl,
			clipCount: null,
			clipNumber: clip.clipNumber,
		}));
}

export function resolveVideoDetail(
	locale: string,
	video: Video,
	clipNumber?: number | null,
): ResolvedVideoDetail | null {
	const content = resolveVideoContent(locale, video);
	if (!content?.title) {
		return null;
	}

	const coverUrl = resolveVideoCoverUrl(locale, video);
	const previewVideoUrl = resolveVideoPreviewUrl(video);
	const clips = (sortedClips(video) ?? []).map((clip) =>
		resolveClip(locale, clip, coverUrl),
	);
	const activeClip =
		clipNumber != null
			? (clips.find((clip) => clip.clipNumber === clipNumber) ?? null)
			: null;
	const { playerKind, playableSrc } = resolveVideoPlayer(video, clipNumber);

	const cast = (video.castMembers ?? [])
		.map((member) => resolveCastMember(locale, member))
		.filter((member): member is ResolvedVideoCastMember => member != null);
	const highlights = (video.highlightClips ?? [])
		.map((highlight) => resolveHighlight(locale, highlight))
		.filter(
			(highlight): highlight is ResolvedVideoHighlight => highlight != null,
		);

	return {
		id: video.id,
		// One post → one title/description; clips are a gallery, not separate pages.
		title: content.title,
		description: content.description?.trim() ?? "",
		coverUrl,
		previewVideoUrl,
		videoType: video.videoType,
		albumOfMemories: video.albumOfMemories,
		topicId: video.topicId ?? null,
		topicName: resolveVideoTopicName(locale, video),
		director: firstNonBlank(content.director),
		producer: firstNonBlank(content.producer),
		location: firstNonBlank(content.location),
		contentLanguages: video.contentLanguages,
		durationSeconds:
			video.durationSeconds ?? totalClipDuration(video) ?? null,
		resolution: firstNonBlank(video.resolution),
		fileFormat: firstNonBlank(video.fileFormat),
		publishmentDate: firstNonBlank(video.publishmentDate),
		fileSizeMb: video.fileSizeMb ?? null,
		playerKind,
		playableSrc,
		clips,
		activeClipNumber: activeClip?.clipNumber ?? clips[0]?.clipNumber ?? null,
		cast,
		highlights,
		tags: resolveBilingualStrings(locale, video.tagsCkb, video.tagsKmr),
		keywords: resolveBilingualStrings(
			locale,
			video.keywordsCkb,
			video.keywordsKmr,
		),
		createdAt: video.createdAt ?? "",
		updatedAt: video.updatedAt ?? "",
	};
}
