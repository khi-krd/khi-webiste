/** Coerce API DTO shapes into forms the website Zod schemas expect. */

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return null;
	}
	return value as UnknownRecord;
}

function coerceStringArray(raw: unknown): string[] {
	if (!raw) return [];
	if (Array.isArray(raw)) return raw.map(String);
	return [];
}

/** Flat `tagsCkb`/`tagsKmr` or nested `tags.ckb` → `{ ckb, kmr }`. */
export function normalizeBilingualSet(
	raw: unknown,
	flatCkbKey = "tagsCkb",
	flatKmrKey = "tagsKmr",
): { ckb: string[]; kmr: string[] } {
	const record = asRecord(raw);
	if (!record) {
		return { ckb: [], kmr: [] };
	}

	const nested = asRecord(record.tags ?? record.keywords);
	const nestedKeywords = asRecord(record.keywords);
	const source = nested ?? record;

	return {
		ckb: coerceStringArray(
			source.ckb ??
				record[flatCkbKey] ??
				record.tagsCkb ??
				nestedKeywords?.ckb ??
				record.keywordsCkb,
		),
		kmr: coerceStringArray(
			source.kmr ??
				record[flatKmrKey] ??
				record.tagsKmr ??
				nestedKeywords?.kmr ??
				record.keywordsKmr,
		),
	};
}

export function normalizeBilingualTags(record: UnknownRecord): UnknownRecord {
	return {
		...record,
		tags: normalizeBilingualSet(record, "tagsCkb", "tagsKmr"),
		keywords: normalizeBilingualSet(
			{ ...record, tags: record.keywords },
			"keywordsCkb",
			"keywordsKmr",
		),
	};
}

const KNOWN_BOOK_GENRES = new Set([
	"POETRY",
	"NOVEL",
	"SHORT_STORY",
	"DRAMA",
	"HISTORY",
	"BIOGRAPHY",
	"PHILOSOPHY",
	"RELIGION",
	"FOLKLORE",
	"POLITICS",
	"SOCIOLOGY",
	"ECONOMICS",
	"LAW",
	"LINGUISTICS",
	"ARTS",
	"CULTURAL",
	"SCIENCE",
	"MEDICINE",
	"EDUCATIONAL",
	"CHILDREN",
	"TRAVEL",
	"OTHER",
	"ESSAY",
	"POLITICAL",
	"GEOGRAPHY",
	"ACADEMIC",
	"REFERENCE",
	"RELIGIOUS",
]);

export function normalizeBookGenres(raw: unknown): string[] {
	return coerceStringArray(raw).filter((genre) => KNOWN_BOOK_GENRES.has(genre));
}

function normalizeSeriesBlock(raw: unknown): unknown {
	const series = asRecord(raw);
	if (!series) return raw;
	return {
		...series,
		seriesName: series.seriesName ?? null,
		seriesId: series.seriesId ?? null,
		seriesOrder: series.seriesOrder ?? null,
		parentBookId: series.parentBookId ?? null,
		totalBooks: series.totalBooks ?? null,
	};
}

export function normalizeWritingRecord(raw: unknown): unknown {
	const record = asRecord(raw);
	if (!record) return raw;

	const withTags = normalizeBilingualTags(record);
	return {
		...withTags,
		bookGenres: normalizeBookGenres(record.bookGenres ?? record.book_genres),
		publishedByInstitute: record.publishedByInstitute ?? false,
		series: normalizeSeriesBlock(record.series),
		seriesInfo: normalizeSeriesBlock(record.seriesInfo ?? record.series_info),
		createdAt: record.createdAt ?? record.created_at ?? "",
		updatedAt: record.updatedAt ?? record.updated_at ?? "",
	};
}

const AUDIO_CONTAINER_TYPES = new Set([
	"MP3",
	"WAV",
	"OGG",
	"AAC",
	"FLAC",
	"M4A",
	"WEBM",
]);

function asOptionalString(value: unknown): string | null {
	if (value == null) {
		return null;
	}
	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed.length > 0 ? trimmed : null;
	}
	if (typeof value === "number" && Number.isFinite(value)) {
		return String(value);
	}
	return null;
}

function normalizeSoundFile(raw: unknown): unknown {
	const file = asRecord(raw);
	if (!file) return raw;

	const rawFileType = String(file.fileType ?? file.file_type ?? "AUDIO")
		.trim()
		.toUpperCase();
	const normalizedType =
		rawFileType === "VIDEO" || rawFileType === "OTHER" ? rawFileType : "AUDIO";
	const fileFormat =
		asOptionalString(file.fileFormat ?? file.file_format) ??
		(AUDIO_CONTAINER_TYPES.has(rawFileType) ? rawFileType : null);

	return {
		...file,
		fileUrl: file.fileUrl ?? file.file_url ?? null,
		externalUrl: file.externalUrl ?? file.external_url ?? null,
		embedUrl: file.embedUrl ?? file.embed_url ?? null,
		thumbUrl: file.thumbUrl ?? file.thumb_url ?? null,
		fileType: normalizedType,
		publishmentYear: file.publishmentYear ?? file.publishment_year ?? null,
		fileFormat,
		sizeBytes: file.sizeBytes ?? file.size_bytes ?? null,
		durationSeconds: file.durationSeconds ?? file.duration_seconds ?? null,
		durationMinutes: file.durationMinutes ?? file.duration_minutes ?? null,
		bitRate: asOptionalString(file.bitRate ?? file.bit_rate),
		sampleRate: asOptionalString(file.sampleRate ?? file.sample_rate),
		audioChannel: file.audioChannel ?? file.audio_channel ?? null,
		form: asOptionalString(file.form),
		genre: asOptionalString(file.genre),
		recordingVenue: asOptionalString(
			file.recordingVenue ?? file.recording_venue,
		),
		brochures: Array.isArray(file.brochures)
			? file.brochures.map((brochure) => {
					const item = asRecord(brochure);
					if (!item) return brochure;
					return {
						...item,
						imageUrl: item.imageUrl ?? item.image_url ?? null,
						caption: item.caption ?? null,
						brochureOrder: item.brochureOrder ?? item.brochure_order ?? null,
					};
				})
			: [],
	};
}

export function normalizeSoundTrackRecord(raw: unknown): unknown {
	const record = asRecord(raw);
	if (!record) return raw;

	const withTags = normalizeBilingualTags(record);
	return {
		...withTags,
		soundType: record.soundType ?? record.sound_type ?? "",
		trackState: record.trackState ?? record.track_state ?? "SINGLE",
		albumOfMemories:
			record.albumOfMemories ?? record.album_of_memories ?? false,
		thisProjectOfInstitute:
			record.thisProjectOfInstitute ??
			record.this_project_of_institute ??
			false,
		files: Array.isArray(record.files)
			? record.files.map(normalizeSoundFile)
			: [],
		attachments: Array.isArray(record.attachments) ? record.attachments : [],
		locations: Array.isArray(record.locations) ? record.locations : [],
		directors: Array.isArray(record.directors) ? record.directors : [],
		publishmentYear: record.publishmentYear ?? record.publishment_year ?? null,
		cdNumber: record.cdNumber ?? record.cd_number ?? null,
		createdAt: record.createdAt ?? record.created_at ?? "",
		updatedAt: record.updatedAt ?? record.updated_at ?? "",
	};
}

function normalizeVideoContent(raw: unknown): unknown {
	const content = asRecord(raw);
	if (!content) return raw;

	return {
		...content,
		title: content.title ?? null,
		description: content.description ?? null,
		location: content.location ?? null,
		director: content.director ?? null,
		producer: content.producer ?? null,
	};
}

function normalizeVideoCastMember(raw: unknown): unknown {
	const member = asRecord(raw);
	if (!member) return raw;

	return {
		...member,
		nameCkb: member.nameCkb ?? member.name_ckb ?? null,
		nameKmr: member.nameKmr ?? member.name_kmr ?? null,
		roleCkb: member.roleCkb ?? member.role_ckb ?? null,
		roleKmr: member.roleKmr ?? member.role_kmr ?? null,
		photoUrl:
			member.photoUrl ??
			member.photo_url ??
			member.imageUrl ??
			member.image_url ??
			null,
	};
}

function normalizeVideoHighlightClip(raw: unknown): unknown {
	const clip = asRecord(raw);
	if (!clip) return raw;

	return {
		...clip,
		titleCkb: clip.titleCkb ?? clip.title_ckb ?? null,
		titleKmr: clip.titleKmr ?? clip.title_kmr ?? null,
		thumbnailUrl: clip.thumbnailUrl ?? clip.thumbnail_url ?? null,
		startSeconds: clip.startSeconds ?? clip.start_seconds ?? null,
		url: clip.url ?? null,
		embedUrl: clip.embedUrl ?? clip.embed_url ?? null,
		durationSeconds: clip.durationSeconds ?? clip.duration_seconds ?? null,
	};
}

function normalizeVideoClip(raw: unknown): unknown {
	const clip = asRecord(raw);
	if (!clip) return raw;

	return {
		...clip,
		url:
			clip.url ??
			clip.externalUrl ??
			clip.external_url ??
			clip.embedUrl ??
			clip.embed_url ??
			null,
		durationSeconds: clip.durationSeconds ?? clip.duration_seconds ?? null,
		titleCkb: clip.titleCkb ?? clip.title_ckb ?? null,
		titleKmr: clip.titleKmr ?? clip.title_kmr ?? null,
		coverUrl: clip.coverUrl ?? clip.cover_url ?? null,
		thumbnailUrl: clip.thumbnailUrl ?? clip.thumbnail_url ?? null,
		ckbCoverUrl: clip.ckbCoverUrl ?? clip.ckb_cover_url ?? null,
		kmrCoverUrl: clip.kmrCoverUrl ?? clip.kmr_cover_url ?? null,
		imageUrl: clip.imageUrl ?? clip.image_url ?? null,
	};
}

type NormalizedVideoSource = {
	url: string;
	main: boolean;
	coverUrl: string | null;
};

function normalizeVideoSource(raw: unknown): NormalizedVideoSource | null {
	const source = asRecord(raw);
	if (!source) {
		return null;
	}

	const url = asOptionalString(source.url);
	if (!url) {
		return null;
	}

	return {
		url,
		main: source.main === true,
		coverUrl: asOptionalString(
			source.thumbnailUrl ??
				source.thumbnail_url ??
				source.coverUrl ??
				source.cover_url ??
				source.posterUrl ??
				source.poster_url,
		),
	};
}

/** FILM records may send `videoSources` instead of `videoClipItems`. */
function orderVideoSources(
	sources: NormalizedVideoSource[],
): NormalizedVideoSource[] {
	const mainIndex = sources.findIndex((source) => source.main);
	if (mainIndex <= 0) {
		return sources;
	}

	return [
		sources[mainIndex],
		...sources.slice(0, mainIndex),
		...sources.slice(mainIndex + 1),
	];
}

function videoSourcesToClipItems(sources: NormalizedVideoSource[]): unknown[] {
	return orderVideoSources(sources).map((source, index) =>
		normalizeVideoClip({
			clipNumber: index + 1,
			url: source.url,
			coverUrl: source.coverUrl,
		}),
	);
}

export function normalizeVideoRecord(raw: unknown): unknown {
	const record = asRecord(raw);
	if (!record) return raw;

	const rawVideoSources = record.videoSources ?? record.video_sources;
	const videoSources = Array.isArray(rawVideoSources)
		? rawVideoSources
				.map(normalizeVideoSource)
				.filter((source): source is NormalizedVideoSource => source != null)
		: [];

	const normalizedClipItems: unknown = Array.isArray(record.videoClipItems)
		? record.videoClipItems.map(normalizeVideoClip)
		: record.videoClipItems;

	const hasClipItems =
		Array.isArray(normalizedClipItems) && normalizedClipItems.length > 0;

	const videoClipItems =
		!hasClipItems && videoSources.length > 0
			? videoSourcesToClipItems(videoSources)
			: normalizedClipItems;

	const mainSourceUrl =
		videoSources.find((source) => source.main)?.url ??
		videoSources[0]?.url ??
		null;

	return {
		...record,
		featured: record.featured === true,
		featuredOrder: record.featuredOrder ?? record.featured_order ?? null,
		ckbContent:
			record.ckbContent != null
				? normalizeVideoContent(record.ckbContent)
				: record.ckbContent,
		kmrContent:
			record.kmrContent != null
				? normalizeVideoContent(record.kmrContent)
				: record.kmrContent,
		enContent:
			record.enContent != null
				? normalizeVideoContent(record.enContent)
				: record.enContent,
		sourceUrl:
			asOptionalString(record.sourceUrl ?? record.source_url) ?? mainSourceUrl,
		videoClipItems,
		castMembers: Array.isArray(record.castMembers)
			? record.castMembers.map(normalizeVideoCastMember)
			: [],
		highlightClips: Array.isArray(record.highlightClips)
			? record.highlightClips.map(normalizeVideoHighlightClip)
			: [],
		tagsCkb: coerceStringArray(record.tagsCkb ?? record.tags_ckb),
		tagsKmr: coerceStringArray(record.tagsKmr ?? record.tags_kmr),
		keywordsCkb: coerceStringArray(record.keywordsCkb ?? record.keywords_ckb),
		keywordsKmr: coerceStringArray(record.keywordsKmr ?? record.keywords_kmr),
		createdAt: record.createdAt ?? record.created_at ?? "",
		updatedAt: record.updatedAt ?? record.updated_at ?? "",
	};
}

export function normalizeImageCollectionRecord(raw: unknown): unknown {
	const record = asRecord(raw);
	if (!record) return raw;

	const withTags = normalizeBilingualTags(record);
	const imageAlbum = Array.isArray(record.imageAlbum)
		? record.imageAlbum.map((item) => {
				const album = asRecord(item);
				if (!album) return item;
				return {
					...album,
					sortOrder: album.sortOrder ?? album.sort_order ?? 0,
				};
			})
		: [];

	return {
		...withTags,
		imageAlbum,
	};
}

function coerceNumberArray(raw: unknown): number[] {
	if (!Array.isArray(raw)) {
		return [];
	}

	return raw
		.map((value) => Number(value))
		.filter((value) => Number.isFinite(value));
}

function normalizeGalleryMediaItem(raw: unknown): UnknownRecord | null {
	const item = asRecord(raw);
	if (!item) {
		return null;
	}

	const url =
		(typeof item.url === "string" ? item.url.trim() : "") ||
		(typeof item.mediaUrl === "string" ? item.mediaUrl.trim() : "") ||
		(typeof item.media_url === "string" ? item.media_url.trim() : "");
	if (!url) {
		return null;
	}

	const posterRaw =
		item.posterUrl ??
		item.poster_url ??
		item.thumbnailUrl ??
		item.thumbnail_url;

	return {
		...item,
		type: item.type ?? item.mediaType ?? item.media_type ?? "IMAGE",
		url,
		posterUrl: typeof posterRaw === "string" ? posterRaw.trim() || null : null,
		alt: typeof item.alt === "string" ? item.alt.trim() || null : null,
	};
}

export function normalizeServiceRecord(raw: unknown): unknown {
	const record = asRecord(raw);
	if (!record) {
		return raw;
	}

	const gallerySource = record.galleryMedia ?? record.gallery_media;
	const galleryMedia = Array.isArray(gallerySource)
		? gallerySource
				.map(normalizeGalleryMediaItem)
				.filter((item): item is UnknownRecord => item != null)
		: [];

	return {
		...record,
		active: record.active ?? true,
		contents: Array.isArray(record.contents) ? record.contents : [],
		galleryMedia,
		featureImageUrls: coerceStringArray(
			record.featureImageUrls ?? record.feature_image_urls,
		).filter(Boolean),
		thumbnailUrls: coerceStringArray(
			record.thumbnailUrls ?? record.thumbnail_urls,
		).filter(Boolean),
		partnerIds: coerceNumberArray(record.partnerIds),
		sortOrder: record.sortOrder ?? record.sort_order ?? null,
		navAnchorId: record.navAnchorId ?? record.nav_anchor_id ?? null,
		heroVideoUrl: record.heroVideoUrl ?? record.hero_video_url ?? null,
		heroPosterUrl: record.heroPosterUrl ?? record.hero_poster_url ?? null,
		serviceType: record.serviceType ?? record.service_type ?? null,
		layoutType: record.layoutType ?? record.layout_type ?? null,
		publishedAt: record.publishedAt ?? record.published_at ?? null,
		createdAt: record.createdAt ?? record.created_at ?? null,
		updatedAt: record.updatedAt ?? record.updated_at ?? null,
	};
}

export function normalizeSeriesBookRecord(raw: unknown): unknown {
	const record = asRecord(raw);
	if (!record) return raw;

	const ckbContent = asRecord(record.ckbContent ?? record.ckb_content);
	const kmrContent = asRecord(record.kmrContent ?? record.kmr_content);

	return {
		...record,
		titleCkb: record.titleCkb ?? record.title_ckb ?? ckbContent?.title ?? null,
		titleKmr: record.titleKmr ?? record.title_kmr ?? kmrContent?.title ?? null,
		seriesOrder: record.seriesOrder ?? record.series_order ?? null,
		createdAt: record.createdAt ?? record.created_at ?? "",
	};
}
