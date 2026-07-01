import { plainTextFromRichContent } from "@/lib/rich-text";
import type {
	PlayerTrackPayload,
	ResolvedAlbumVideo,
	ResolvedAudioCard,
	ResolvedAudioDetail,
	ResolvedAudioFileRow,
	ResolvedBrochureItem,
	SoundContent,
	SoundTrack,
	SoundTrackFile,
} from "@/types/audio";

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

export function resolveAudioContent(
	locale: string,
	track: SoundTrack,
): SoundContent | null {
	if (locale === "ckb") {
		return track.ckbContent ?? track.kmrContent ?? null;
	}
	return track.kmrContent ?? track.ckbContent ?? null;
}

export function resolveAudioCoverUrl(
	locale: string,
	track: SoundTrack,
): string | null {
	if (locale === "ckb") {
		return firstNonBlank(
			track.ckbCoverUrl,
			track.kmrCoverUrl,
			track.hoverCoverUrl,
		);
	}
	return firstNonBlank(
		track.kmrCoverUrl,
		track.ckbCoverUrl,
		track.hoverCoverUrl,
	);
}

export function resolveAudioTopicName(
	locale: string,
	track: SoundTrack,
): string | null {
	if (locale === "ckb") {
		return firstNonBlank(track.topicNameCkb, track.topicNameKmr);
	}
	return firstNonBlank(track.topicNameKmr, track.topicNameCkb);
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

function resolvePlayableAudioUrl(file: SoundTrackFile): string | null {
	return firstNonBlank(file.fileUrl, file.externalUrl);
}

function isPlayable(file: SoundTrackFile): boolean {
	return file.fileType === "AUDIO" && Boolean(resolvePlayableAudioUrl(file));
}

/** Locale-relative detail path consumed by the i18n-aware `Link`. */
export function audioDetailHref(id: number): string {
	return `/audio/${id}`;
}

export function buildPlayerQueue(
	locale: string,
	track: SoundTrack,
): PlayerTrackPayload[] {
	const content = resolveAudioContent(locale, track);
	const trackTitle = content?.title?.trim() || String(track.id);
	const coverUrl = resolveAudioCoverUrl(locale, track);
	const artist = firstNonBlank(track.reader, track.albumName);

	return track.files.filter(isPlayable).map((file, index) => ({
		fileId: file.id,
		trackId: track.id,
		title:
			firstNonBlank(file.title) ??
			(track.files.length > 1 ? `${trackTitle} — ${index + 1}` : trackTitle),
		artist,
		coverUrl,
		// biome-ignore lint/style/noNonNullAssertion: isPlayable guarantees a source URL
		audioUrl: resolvePlayableAudioUrl(file)!,
		href: audioDetailHref(track.id),
		durationSeconds: file.durationSeconds ?? null,
	}));
}

export function resolveAudioCard(
	locale: string,
	track: SoundTrack,
): ResolvedAudioCard | null {
	const content = resolveAudioContent(locale, track);
	if (!content?.title) {
		return null;
	}

	const description = content.description?.trim() ?? "";
	const subtitle = firstNonBlank(track.reader, track.albumName);

	return {
		id: track.id,
		title: content.title,
		// albumName often repeats the resolved title for MULTI records
		subtitle: subtitle === content.title ? null : subtitle,
		excerpt: description
			? truncate(plainTextFromRichContent(description), EXCERPT_MAX_LENGTH)
			: "",
		coverUrl: resolveAudioCoverUrl(locale, track),
		hoverCoverUrl: track.hoverCoverUrl ?? null,
		soundType: track.soundType,
		trackState: track.trackState,
		albumOfMemories: track.albumOfMemories,
		topicId: track.topicId ?? null,
		topicName: resolveAudioTopicName(locale, track),
		totalDurationSeconds: track.totalDurationSeconds ?? null,
		totalTracks:
			track.totalTracks ??
			(track.trackState === "MULTI" ? track.files.length : null),
		publishmentYear:
			track.publishmentYear ?? track.files[0]?.publishmentYear ?? null,
		thisProjectOfInstitute: track.thisProjectOfInstitute,
		tags: resolveBilingualStrings(locale, track.tags.ckb, track.tags.kmr),
		keywords: resolveBilingualStrings(
			locale,
			track.keywords.ckb,
			track.keywords.kmr,
		),
		queue: buildPlayerQueue(locale, track),
		createdAt: track.createdAt ?? "",
	};
}

function resolveFileRow(
	file: SoundTrackFile,
	trackTitle: string,
	index: number,
	totalFiles: number,
	coverUrl: string | null,
): ResolvedAudioFileRow {
	return {
		id: file.id,
		title:
			firstNonBlank(file.title) ??
			(totalFiles > 1 ? `${trackTitle} — ${index + 1}` : trackTitle),
		thumbUrl: firstNonBlank(file.thumbUrl, coverUrl),
		fileType: file.fileType,
		playable: isPlayable(file),
		externalUrl: file.externalUrl ?? null,
		embedUrl: file.embedUrl ?? null,
		durationSeconds: file.durationSeconds ?? null,
		sizeBytes: file.sizeBytes ?? null,
		bitRate: file.bitRate ?? null,
		sampleRate: file.sampleRate ?? null,
		audioChannel: file.audioChannel ?? null,
		form: file.form ?? null,
		genre: file.genre ?? null,
		recordingVenue: file.recordingVenue ?? null,
		publishmentYear: file.publishmentYear ?? null,
		fileFormat: file.fileFormat ?? null,
	};
}

function resolvePosterUrl(track: SoundTrack): string | null {
	const poster = track.attachments.find(
		(attachment) =>
			attachment.attachmentType === "IMAGE" &&
			(attachment.title?.toLowerCase().includes("poster") ||
				attachment.fileUrl?.toLowerCase().includes("poster")),
	);
	return poster?.fileUrl ?? null;
}

function resolveAlbumVideo(track: SoundTrack): ResolvedAlbumVideo | null {
	const posterUrl = resolvePosterUrl(track);

	const videoFile = track.files.find(
		(file) =>
			file.fileType === "VIDEO" &&
			Boolean(file.fileUrl?.trim() || file.externalUrl?.trim()),
	);
	if (videoFile) {
		const url = firstNonBlank(videoFile.fileUrl, videoFile.externalUrl);
		if (url) {
			return { url, posterUrl };
		}
	}

	const videoAttachment = track.attachments.find(
		(attachment) => attachment.attachmentType === "VIDEO",
	);
	if (videoAttachment?.fileUrl) {
		return {
			url: videoAttachment.fileUrl,
			posterUrl,
		};
	}

	return null;
}

export function resolveAudioDetail(
	locale: string,
	track: SoundTrack,
): ResolvedAudioDetail | null {
	const content = resolveAudioContent(locale, track);
	if (!content?.title) {
		return null;
	}

	const trackTitle = content.title;
	const coverUrl = resolveAudioCoverUrl(locale, track);

	const brochures: ResolvedBrochureItem[] = track.files
		.flatMap((file) => file.brochures)
		.map((brochure, index) => {
			const imageUrl = brochure.imageUrl?.trim();
			if (!imageUrl) {
				return null;
			}
			return {
				id: brochure.id,
				imageUrl,
				caption: brochure.caption,
				sortOrder: brochure.brochureOrder ?? index,
			};
		})
		.filter((brochure): brochure is ResolvedBrochureItem => brochure != null)
		.sort((a, b) => a.sortOrder - b.sortOrder);

	const attachments = [...track.attachments].sort(
		(a, b) => (a.attachmentOrder ?? 0) - (b.attachmentOrder ?? 0),
	);

	return {
		id: track.id,
		title: trackTitle,
		description: content.description?.trim() ?? "",
		coverUrl,
		hoverCoverUrl: track.hoverCoverUrl ?? null,
		soundType: track.soundType,
		trackState: track.trackState,
		albumOfMemories: track.albumOfMemories,
		topicName: resolveAudioTopicName(locale, track),
		reader: track.reader ?? null,
		directors: track.directors,
		locations: track.locations,
		terms: track.terms,
		thisProjectOfInstitute: track.thisProjectOfInstitute,
		contentLanguages: track.contentLanguages,
		genre: firstNonBlank(...track.files.map((file) => file.genre)),
		albumName: track.albumName,
		publishmentYear:
			track.publishmentYear ?? track.files[0]?.publishmentYear ?? null,
		cdNumber: track.cdNumber,
		totalTracks:
			track.totalTracks ??
			(track.trackState === "MULTI" ? track.files.length : null),
		totalDurationSeconds: track.totalDurationSeconds,
		totalSizeBytes: track.totalSizeBytes,
		fileRows: track.files.map((file, index) =>
			resolveFileRow(file, trackTitle, index, track.files.length, coverUrl),
		),
		brochures,
		video: resolveAlbumVideo(track),
		attachments,
		tags: resolveBilingualStrings(locale, track.tags.ckb, track.tags.kmr),
		keywords: resolveBilingualStrings(
			locale,
			track.keywords.ckb,
			track.keywords.kmr,
		),
		queue: buildPlayerQueue(locale, track),
		createdAt: track.createdAt ?? "",
		updatedAt: track.updatedAt ?? "",
	};
}
