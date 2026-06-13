import { z } from "zod";

export const VideoTypeSchema = z.enum(["FILM", "VIDEO_CLIP"]);
export type VideoType = z.infer<typeof VideoTypeSchema>;

export const VideoContentLanguageSchema = z.enum(["CKB", "KMR"]);
export type VideoContentLanguage = z.infer<typeof VideoContentLanguageSchema>;

export const VideoContentSchema = z.object({
	title: z.string().nullable(),
	description: z.string().nullable(),
	location: z.string().nullable(),
	director: z.string().nullable(),
	producer: z.string().nullable(),
});

export type VideoContent = z.infer<typeof VideoContentSchema>;

export const VideoClipItemSchema = z.object({
	clipNumber: z.number().int(),
	url: z.string(),
	durationSeconds: z.number().int().nullable(),
	titleCkb: z.string().nullable(),
	titleKmr: z.string().nullable(),
});

export type VideoClipItem = z.infer<typeof VideoClipItemSchema>;

export const VideoCastMemberSchema = z.object({
	nameCkb: z.string().nullable(),
	nameKmr: z.string().nullable(),
	roleCkb: z.string().nullable(),
	roleKmr: z.string().nullable(),
	photoUrl: z.string().nullable(),
});

export type VideoCastMember = z.infer<typeof VideoCastMemberSchema>;

export const VideoHighlightClipSchema = z.object({
	titleCkb: z.string().nullable(),
	titleKmr: z.string().nullable(),
	thumbnailUrl: z.string().nullable(),
	startSeconds: z.number().int().nullable().optional(),
	url: z.string().nullable().optional(),
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
	videoType: VideoTypeSchema,
	albumOfMemories: z.boolean(),
	ckbCoverUrl: z.string().nullable(),
	kmrCoverUrl: z.string().nullable(),
	hoverCoverUrl: z.string().nullable(),
	topicId: z.number().nullable(),
	topicNameCkb: z.string().nullable(),
	topicNameKmr: z.string().nullable(),
	topicNameEn: z.string().nullable().optional(),
	contentLanguages: z.array(VideoContentLanguageSchema),
	ckbContent: VideoContentSchema.nullable(),
	kmrContent: VideoContentSchema.nullable(),
	enContent: VideoContentSchema.nullable().optional(),
	sourceUrl: z.string().nullable(),
	sourceExternalUrl: z.string().nullable(),
	sourceEmbedUrl: z.string().nullable(),
	videoClipItems: z.array(VideoClipItemSchema).nullable(),
	fileFormat: z.string().nullable(),
	durationSeconds: z.number().nullable(),
	publishmentDate: z.string().nullable(),
	resolution: z.string().nullable(),
	fileSizeMb: z.number().nullable(),
	tagsCkb: z.array(z.string()),
	tagsKmr: z.array(z.string()),
	tagsEn: z.array(z.string()).optional(),
	keywordsCkb: z.array(z.string()),
	keywordsKmr: z.array(z.string()),
	keywordsEn: z.array(z.string()).optional(),
	createdAt: z.string(),
	updatedAt: z.string(),
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
};

export type ResolvedVideoCard = {
	id: number;
	title: string;
	/** Director — the card's quiet sub-line. */
	subtitle: string | null;
	excerpt: string;
	coverUrl: string | null;
	hoverCoverUrl: string | null;
	videoType: VideoType;
	albumOfMemories: boolean;
	topicId: number | null;
	topicName: string | null;
	durationSeconds: number | null;
	/** Clip count for VIDEO_CLIP records (null for FILM). */
	clipCount: number | null;
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
	/** Source fed to the player (FILM source, or the first clip for VIDEO_CLIP). */
	playableSrc: string | null;
	clips: ResolvedVideoClip[];
	cast: ResolvedVideoCastMember[];
	highlights: ResolvedVideoHighlight[];
	tags: string[];
	keywords: string[];
	createdAt: string;
	updatedAt: string;
};
