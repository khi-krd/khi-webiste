import { z } from "zod";

export const VideoTypeSchema = z.enum(["FILM", "VIDEO_CLIP"]);
export type VideoType = z.infer<typeof VideoTypeSchema>;

export const VideoContentLanguageSchema = z.enum(["CKB", "KMR"]);
export type VideoContentLanguage = z.infer<typeof VideoContentLanguageSchema>;

export const VideoContentSchema = z.object({
	title: z.string().nullable(),
	description: z.string().nullable(),
	location: z.string().nullish(),
	director: z.string().nullish(),
	producer: z.string().nullish(),
});

export type VideoContent = z.infer<typeof VideoContentSchema>;

export const VideoClipItemSchema = z.object({
	clipNumber: z.number().int(),
	url: z.string().nullish(),
	externalUrl: z.string().nullish(),
	embedUrl: z.string().nullish(),
	durationSeconds: z.number().int().nullish(),
	titleCkb: z.string().nullish(),
	titleKmr: z.string().nullish(),
	/** Per-clip still — prefer over the parent video cover. */
	coverUrl: z.string().nullish(),
	thumbnailUrl: z.string().nullish(),
	ckbCoverUrl: z.string().nullish(),
	kmrCoverUrl: z.string().nullish(),
	imageUrl: z.string().nullish(),
});

export type VideoClipItem = z.infer<typeof VideoClipItemSchema>;

export const VideoCastMemberSchema = z
	.object({
		nameCkb: z.string().nullable(),
		nameKmr: z.string().nullable(),
		roleCkb: z.string().nullable(),
		roleKmr: z.string().nullable(),
		photoUrl: z.string().nullable().optional(),
		imageUrl: z.string().nullable().optional(),
	})
	.transform((member) => ({
		nameCkb: member.nameCkb,
		nameKmr: member.nameKmr,
		roleCkb: member.roleCkb,
		roleKmr: member.roleKmr,
		photoUrl: member.photoUrl ?? member.imageUrl ?? null,
	}));

export type VideoCastMember = z.infer<typeof VideoCastMemberSchema>;

export const VideoHighlightClipSchema = z.object({
	titleCkb: z.string().nullable(),
	titleKmr: z.string().nullable(),
	thumbnailUrl: z.string().nullable(),
	startSeconds: z.number().int().nullable().optional(),
	url: z.string().nullable().optional(),
	embedUrl: z.string().nullable().optional(),
	durationSeconds: z.number().int().nullable().optional(),
});

export type VideoHighlightClip = z.infer<typeof VideoHighlightClipSchema>;

export const VideoTopicSchema = z.object({
	id: z.number(),
	nameCkb: z.string().nullable(),
	nameKmr: z.string().nullable(),
	nameEn: z.string().nullable().optional(),
});

export type VideoTopic = z.infer<typeof VideoTopicSchema>;

export const VideoSchema = z.object({
	id: z.number(),
	featured: z.boolean().optional().default(false),
	featuredOrder: z.number().int().nullable().optional(),
	videoType: VideoTypeSchema,
	albumOfMemories: z.boolean(),
	ckbCoverUrl: z.string().nullish(),
	kmrCoverUrl: z.string().nullish(),
	hoverCoverUrl: z.string().nullish(),
	clearTopic: z.boolean().optional(),
	topicId: z.number().nullish(),
	topicNameCkb: z.string().nullish(),
	topicNameKmr: z.string().nullish(),
	topicNameEn: z.string().nullish(),
	contentLanguages: z.array(VideoContentLanguageSchema),
	ckbContent: VideoContentSchema.nullish(),
	kmrContent: VideoContentSchema.nullish(),
	enContent: VideoContentSchema.nullish(),
	sourceUrl: z.string().nullish(),
	sourceExternalUrl: z.string().nullish(),
	sourceEmbedUrl: z.string().nullish(),
	videoClipItems: z.array(VideoClipItemSchema).nullish(),
	fileFormat: z.string().nullish(),
	durationSeconds: z.number().nullish(),
	publishmentDate: z.string().nullish(),
	resolution: z.string().nullish(),
	fileSizeMb: z.number().nullish(),
	tagsCkb: z.array(z.string()).optional().default([]),
	tagsKmr: z.array(z.string()).optional().default([]),
	tagsEn: z.array(z.string()).optional(),
	keywordsCkb: z.array(z.string()).optional().default([]),
	keywordsKmr: z.array(z.string()).optional().default([]),
	keywordsEn: z.array(z.string()).optional(),
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
	castMembers: z.array(VideoCastMemberSchema).optional(),
	highlightClips: z.array(VideoHighlightClipSchema).optional(),
});

export type Video = z.infer<typeof VideoSchema>;

export const VideosPageSchema = z.object({
	content: z.array(VideoSchema),
	totalElements: z.number(),
	totalPages: z.number(),
	number: z.number().optional(),
	size: z.number().optional(),
});

export type VideosPage = z.infer<typeof VideosPageSchema>;

/** How the detail page mounts the source: rich player, raw embed, or nothing. */
export type VideoPlayerKind = "vidstack" | "iframe" | "none";

export type ResolvedVideoClip = {
	clipNumber: number;
	title: string;
	url: string;
	durationSeconds: number | null;
	/** Clip-specific still; null when the API only sent a playable URL. */
	coverUrl: string | null;
};

export type ResolvedVideoCard = {
	id: number;
	featured: boolean;
	featuredOrder: number | null;
	title: string;
	/** Director — the card's quiet sub-line. */
	subtitle: string | null;
	excerpt: string;
	coverUrl: string | null;
	/** Direct media URL used as a thumbnail when `coverUrl` is missing. */
	previewVideoUrl: string | null;
	hoverCoverUrl: string | null;
	videoType: VideoType;
	albumOfMemories: boolean;
	topicId: number | null;
	topicName: string | null;
	durationSeconds: number | null;
	/** Always null — clips are standalone, never a playlist count. */
	clipCount: number | null;
	/** When set, the card deep-links to this clip on the parent video. */
	clipNumber: number | null;
	year: number | null;
	tags: string[];
	keywords: string[];
	createdAt: string;
};

export type ResolvedVideoCastMember = {
	name: string;
	role: string;
	photoUrl: string | null;
};

export type ResolvedVideoHighlight = {
	title: string;
	thumbnailUrl: string | null;
	url: string | null;
	startSeconds: number | null;
};

export type ResolvedVideoDetail = {
	id: number;
	title: string;
	description: string;
	coverUrl: string | null;
	/** Direct media URL used as a thumbnail when `coverUrl` is missing. */
	previewVideoUrl: string | null;
	videoType: VideoType;
	albumOfMemories: boolean;
	topicId: number | null;
	topicName: string | null;
	director: string | null;
	producer: string | null;
	location: string | null;
	contentLanguages: VideoContentLanguage[];
	durationSeconds: number | null;
	resolution: string | null;
	fileFormat: string | null;
	publishmentDate: string | null;
	fileSizeMb: number | null;
	playerKind: VideoPlayerKind;
	/** Source fed to the player (FILM source, or the selected clip). */
	playableSrc: string | null;
	clips: ResolvedVideoClip[];
	/** Clip/scene currently selected for playback (gallery when length > 1). */
	activeClipNumber: number | null;
	cast: ResolvedVideoCastMember[];
	highlights: ResolvedVideoHighlight[];
	tags: string[];
	keywords: string[];
	createdAt: string;
	updatedAt: string;
};

/** Single global film-section background video (`GET /api/v1/videos/film-reklam-video`). */
export const FilmReklamVideoSchema = z.object({
	// Only the URL is required. Everything else is nullish so a stray null in an
	// unused metadata field cannot make the parse fail — which the section could
	// not tell apart from the documented "nothing uploaded" 404.
	id: z.number().optional(),
	videoUrl: z.string(),
	sizeBytes: z.number().nullish(),
	mimeType: z.string().nullish(),
	createdAt: z.string().nullish(),
	updatedAt: z.string().nullish(),
});

export type FilmReklamVideo = z.infer<typeof FilmReklamVideoSchema>;
