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

function normalizeSoundFile(raw: unknown): unknown {
	const file = asRecord(raw);
	if (!file) return raw;

	const fileType = String(file.fileType ?? file.file_type ?? "AUDIO").toUpperCase();
	const normalizedType =
		fileType === "VIDEO" || fileType === "OTHER" ? fileType : "AUDIO";

	return {
		...file,
		fileUrl: file.fileUrl ?? file.file_url ?? null,
		externalUrl: file.externalUrl ?? file.external_url ?? null,
		embedUrl: file.embedUrl ?? file.embed_url ?? null,
		thumbUrl: file.thumbUrl ?? file.thumb_url ?? null,
		fileType: normalizedType,
		publishmentYear:
			file.publishmentYear ?? file.publishment_year ?? null,
		fileFormat: file.fileFormat ?? file.file_format ?? null,
		bitRate: file.bitRate ?? file.bit_rate ?? null,
		sampleRate: file.sampleRate ?? file.sample_rate ?? null,
		form: file.form ?? null,
		genre: file.genre ?? null,
		recordingVenue: file.recordingVenue ?? file.recording_venue ?? null,
		brochures: Array.isArray(file.brochures) ? file.brochures : [],
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
			record.thisProjectOfInstitute ?? record.this_project_of_institute ?? false,
		files: Array.isArray(record.files)
			? record.files.map(normalizeSoundFile)
			: [],
		attachments: Array.isArray(record.attachments) ? record.attachments : [],
		locations: Array.isArray(record.locations) ? record.locations : [],
		directors: Array.isArray(record.directors) ? record.directors : [],
		createdAt: record.createdAt ?? record.created_at ?? "",
		updatedAt: record.updatedAt ?? record.updated_at ?? "",
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
		durationSeconds:
			clip.durationSeconds ?? clip.duration_seconds ?? null,
		titleCkb: clip.titleCkb ?? clip.title_ckb ?? null,
		titleKmr: clip.titleKmr ?? clip.title_kmr ?? null,
	};
}

export function normalizeVideoRecord(raw: unknown): unknown {
	const record = asRecord(raw);
	if (!record) return raw;

	return {
		...record,
		videoClipItems: Array.isArray(record.videoClipItems)
			? record.videoClipItems.map(normalizeVideoClip)
			: record.videoClipItems,
		castMembers: Array.isArray(record.castMembers) ? record.castMembers : [],
		highlightClips: Array.isArray(record.highlightClips)
			? record.highlightClips
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

export function normalizeSeriesBookRecord(raw: unknown): unknown {
	const record = asRecord(raw);
	if (!record) return raw;

	const ckbContent = asRecord(record.ckbContent ?? record.ckb_content);
	const kmrContent = asRecord(record.kmrContent ?? record.kmr_content);

	return {
		...record,
		titleCkb:
			record.titleCkb ??
			record.title_ckb ??
			ckbContent?.title ??
			null,
		titleKmr:
			record.titleKmr ??
			record.title_kmr ??
			kmrContent?.title ??
			null,
		seriesOrder:
			record.seriesOrder ?? record.series_order ?? null,
		createdAt: record.createdAt ?? record.created_at ?? "",
	};
}
