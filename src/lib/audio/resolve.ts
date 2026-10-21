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

/** Locale-ordered file title: titleCkb/titleKmr, then the legacy mirror. */
function localizedFileTitle(
	locale: string,
	file: { title?: string | null; titleCkb?: string | null; titleKmr?: string | null },
): string | null {
	return locale === "ckb"
		? firstNonBlank(file.titleCkb, file.title, file.titleKmr)
		: firstNonBlank(file.titleKmr, file.titleCkb, file.title);
}

function localizedCaption(
	locale: string,
	item: {
		caption?: string | null;
		captionCkb?: string | null;
		captionKmr?: string | null;
	},
): string | null {
	return locale === "ckb"
		? firstNonBlank(item.captionCkb, item.caption, item.captionKmr)
		: firstNonBlank(item.captionKmr, item.captionCkb, item.caption);
}

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

/** Every linked topic, locale-ordered names; falls back to the singular pair
 * for responses that predate the plural field. */
export function resolveAudioTopicNames(
	locale: string,
	track: SoundTrack,
): string[] {
	const names = (track.topics ?? [])
		.map((topic) =>
			locale === "ckb"
				? firstNonBlank(topic.nameCkb, topic.nameKmr)
				: firstNonBlank(topic.nameKmr, topic.nameCkb),
		)
		.filter((name): name is string => Boolean(name));
	if (names.length > 0) return names;
	const single = resolveAudioTopicName(locale, track);
	return single ? [single] : [];
}

export function resolveAudioTopicIds(track: SoundTrack): number[] {
	if (track.topics?.length) return track.topics.map((topic) => topic.id);
	return track.topicId != null ? [track.topicId] : [];
}

export function resolveAudioSoundTypes(track: SoundTrack): string[] {
	if (track.soundTypes?.length) return track.soundTypes;
	return track.soundType ? [track.soundType] : [];
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

/** Files ride the entity's `sortOrder`; unsorted rows fall back to API order. */
/** Map a brochure's declared type / mime onto the render buckets the detail
 * page understands. Images feed the flipbook; PDFs and anything else open as
 * document links. */
function brochureKind(
	fileType: string | null | undefined,
	mimeType: string | null | undefined,
): ResolvedBrochureItem["kind"] {
	const mime = mimeType?.toLowerCase() ?? "";
	if (fileType === "IMAGE" || mime.startsWith("image/")) return "image";
	if (fileType === "PDF" || mime === "application/pdf") return "pdf";
	return "other";
}

function sortedTrackFiles(track: SoundTrack): SoundTrack["files"] {
	return [...track.files].sort(
		(a, b) =>
			(a.sortOrder ?? Number.MAX_SAFE_INTEGER) -
			(b.sortOrder ?? Number.MAX_SAFE_INTEGER),
	);
}

export function buildPlayerQueue(
	locale: string,
	track: SoundTrack,
): PlayerTrackPayload[] {
	const content = resolveAudioContent(locale, track);
	const trackTitle = content?.title?.trim() || String(track.id);
	const coverUrl = resolveAudioCoverUrl(locale, track);
	const artist = firstNonBlank(track.reader, track.albumName);
	const files = sortedTrackFiles(track);

	return files.filter(isPlayable).map((file, index) => ({
		fileId: file.id,
		trackId: track.id,
		title:
			localizedFileTitle(locale, file) ??
			(files.length > 1 ? `${trackTitle} — ${index + 1}` : trackTitle),
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
		soundTypes: resolveAudioSoundTypes(track),
		trackState: track.trackState,
		albumOfMemories: track.albumOfMemories,
		topicId: track.topicId ?? null,
		topicName: resolveAudioTopicName(locale, track),
		topicIds: resolveAudioTopicIds(track),
		topicNames: resolveAudioTopicNames(locale, track),
		totalDurationSeconds: track.totalDurationSeconds ?? null,
		totalTracks:
			track.totalTracks ??
			(track.trackState === "MULTI" ? track.files.length : null),
		publishmentYear:
			track.publishmentYear ??
			sortedTrackFiles(track)[0]?.publishmentYear ??
			null,
		thisProjectOfInstitute: track.thisProjectOfInstitute,
		tags: resolveBilingualStrings(locale, track.tags.ckb, track.tags.kmr),
		keywords: resolveBilingualStrings(
			locale,
			track.keywords.ckb,
			track.keywords.kmr,
		),
		queue: buildPlayerQueue(locale, track),
		sortOrder: track.sortOrder ?? null,
		createdAt: track.createdAt ?? "",
	};
}

function resolveFileRow(
	locale: string,
	file: SoundTrackFile,
	trackTitle: string,
	index: number,
	totalFiles: number,
	coverUrl: string | null,
): ResolvedAudioFileRow {
	const durationSeconds =
		file.durationSeconds ??
		(file.durationMinutes != null && file.durationMinutes > 0
			? Math.round(file.durationMinutes * 60)
			: null);

	return {
		id: file.id,
		title:
			localizedFileTitle(locale, file) ??
			(totalFiles > 1 ? `${trackTitle} — ${index + 1}` : trackTitle),
		thumbUrl: firstNonBlank(file.thumbUrl, coverUrl),
		fileType: file.fileType,
		playable: isPlayable(file),
		externalUrl: file.externalUrl ?? null,
		embedUrl: file.embedUrl ?? null,
		durationSeconds,
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

	const videoFile = sortedTrackFiles(track).find(
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
	const files = sortedTrackFiles(track);

	// Album-level brochures (the independent, mixed-type list) come first;
	// legacy per-file brochure images still render after them.
	const albumBrochures: ResolvedBrochureItem[] = (track.brochures ?? [])
		.map((brochure, index): ResolvedBrochureItem | null => {
			const fileUrl = brochure.fileUrl?.trim();
			if (!fileUrl) {
				return null;
			}
			const kind = brochureKind(brochure.fileType, brochure.mimeType);
			return {
				id: brochure.id,
				fileUrl,
				kind,
				caption: localizedFileTitle(locale, brochure) ?? null,
				sortOrder: brochure.brochureOrder ?? index,
			};
		})
		.filter((brochure): brochure is ResolvedBrochureItem => brochure != null)
		.sort((a, b) => a.sortOrder - b.sortOrder);

	const fileBrochures: ResolvedBrochureItem[] = files
		.flatMap((file) => file.brochures)
		.map((brochure, index): ResolvedBrochureItem | null => {
			const imageUrl = brochure.imageUrl?.trim();
			if (!imageUrl) {
				return null;
			}
			return {
				id: brochure.id,
				fileUrl: imageUrl,
				kind: "image",
				caption: localizedCaption(locale, brochure) ?? null,
				sortOrder: brochure.brochureOrder ?? index,
			};
		})
		.filter((brochure): brochure is ResolvedBrochureItem => brochure != null)
		.sort((a, b) => a.sortOrder - b.sortOrder);

	const brochures = [...albumBrochures, ...fileBrochures];

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
		soundTypes: resolveAudioSoundTypes(track),
		trackState: track.trackState,
		albumOfMemories: track.albumOfMemories,
		topicId: track.topicId ?? null,
		topicName: resolveAudioTopicName(locale, track),
		topicIds: resolveAudioTopicIds(track),
		topicNames: resolveAudioTopicNames(locale, track),
		reader: track.reader ?? null,
		directors: track.directors,
		locations: track.locations,
		terms: track.terms ?? null,
		thisProjectOfInstitute: track.thisProjectOfInstitute,
		contentLanguages: track.contentLanguages,
		genre: firstNonBlank(...files.map((file) => file.genre)),
		albumName: track.albumName ?? null,
		publishmentYear: track.publishmentYear ?? files[0]?.publishmentYear ?? null,
		cdNumber: track.cdNumber ?? null,
		totalTracks:
			track.totalTracks ?? (track.trackState === "MULTI" ? files.length : null),
		totalDurationSeconds: track.totalDurationSeconds ?? null,
		totalSizeBytes: track.totalSizeBytes ?? null,
		fileRows: files.map((file, index) =>
			resolveFileRow(locale, file, trackTitle, index, files.length, coverUrl),
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
