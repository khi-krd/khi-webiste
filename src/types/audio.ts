import { z } from "zod";
import { BilingualSetSchema, PageableSchema } from "@/types/writing";

export const TrackStateSchema = z.enum(["SINGLE", "MULTI"]);
export type TrackState = z.infer<typeof TrackStateSchema>;

export const SoundFileTypeSchema = z.enum(["AUDIO", "VIDEO", "OTHER"]);
export type SoundFileType = z.infer<typeof SoundFileTypeSchema>;

export const AudioChannelSchema = z.enum(["STEREO", "MONO"]);
export type AudioChannel = z.infer<typeof AudioChannelSchema>;

export const AttachmentTypeSchema = z.enum([
	"PDF",
	"VIDEO",
	"IMAGE",
	"AUDIO",
	"OTHER",
]);
export type AttachmentType = z.infer<typeof AttachmentTypeSchema>;

export const BrochureSchema = z.object({
	id: z.number(),
	imageUrl: z.string().nullish(),
	caption: z.string().nullish(),
	brochureOrder: z.number().nullish(),
});

export type Brochure = z.infer<typeof BrochureSchema>;

export const SoundTrackFileSchema = z.object({
	id: z.number(),
	fileUrl: z.string().nullish(),
	externalUrl: z.string().nullish(),
	embedUrl: z.string().nullish(),
	thumbUrl: z.string().nullish().optional(),
	title: z.string().nullish(),
	fileType: SoundFileTypeSchema.default("AUDIO"),
	publishmentYear: z.number().int().nullish(),
	fileFormat: z.string().nullish(),
	sizeBytes: z.number().nullish(),
	durationSeconds: z.number().nullish(),
	durationMinutes: z.number().nullish(),
	bitRate: z.string().nullish(),
	sampleRate: z.string().nullish(),
	audioChannel: AudioChannelSchema.nullish(),
	form: z.string().nullish(),
	genre: z.string().nullish(),
	recordingVenue: z.string().nullish(),
	brochures: z.array(BrochureSchema).default([]),
});

export type SoundTrackFile = z.infer<typeof SoundTrackFileSchema>;

export const SoundAttachmentSchema = z.object({
	id: z.number(),
	fileUrl: z.string().nullish(),
	title: z.string().nullish(),
	attachmentType: AttachmentTypeSchema.default("OTHER"),
	sizeBytes: z.number().nullish(),
	mimeType: z.string().nullish(),
	attachmentOrder: z.number().nullish(),
});

export type SoundAttachment = z.infer<typeof SoundAttachmentSchema>;

export const SoundContentSchema = z.object({
	title: z.string().nullish(),
	description: z.string().nullish(),
});

export type SoundContent = z.infer<typeof SoundContentSchema>;

export const SoundTrackSchema = z.object({
	id: z.number(),
	ckbCoverUrl: z.string().nullish(),
	kmrCoverUrl: z.string().nullish(),
	hoverCoverUrl: z.string().nullish(),
	soundType: z.string(),
	trackState: TrackStateSchema,
	albumOfMemories: z.boolean(),
	topicId: z.number().nullish(),
	topicNameCkb: z.string().nullish(),
	topicNameKmr: z.string().nullish(),
	contentLanguages: z.array(z.enum(["CKB", "KMR"])),
	ckbContent: SoundContentSchema.nullish(),
	kmrContent: SoundContentSchema.nullish(),
	locations: z.array(z.string()).optional().default([]),
	reader: z.string().nullish(),
	directors: z.array(z.string()).optional().default([]),
	terms: z.string().nullish(),
	thisProjectOfInstitute: z.boolean(),
	tags: BilingualSetSchema.default({ ckb: [], kmr: [] }),
	keywords: BilingualSetSchema.default({ ckb: [], kmr: [] }),
	files: z.array(SoundTrackFileSchema).default([]),
	totalDurationSeconds: z.number().nullish(),
	totalSizeBytes: z.number().nullish(),
	albumName: z.string().nullish(),
	publishmentYear: z.number().int().nullish(),
	cdNumber: z.number().int().nullish(),
	totalTracks: z.number().int().nullish(),
	attachments: z.array(SoundAttachmentSchema).default([]),
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
});

export type SoundTrack = z.infer<typeof SoundTrackSchema>;

export const SoundTopicSchema = z.object({
	id: z.number(),
	nameCkb: z.string().nullish(),
	nameKmr: z.string().nullish(),
});

export type SoundTopic = z.infer<typeof SoundTopicSchema>;

/** Single global sound-section background video (`GET .../sound-reklam-video`). */
export const SoundReklamVideoSchema = z.object({
	id: z.number(),
	videoUrl: z.string().url(),
	sizeBytes: z.number().optional(),
	mimeType: z.string().optional(),
	createdAt: z.string().optional(),
	updatedAt: z.string().optional(),
});

export type SoundReklamVideo = z.infer<typeof SoundReklamVideoSchema>;

export const SoundTracksPageSchema = z.object({
	content: z.array(SoundTrackSchema),
	pageable: PageableSchema.optional(),
	totalElements: z.number(),
	totalPages: z.number(),
	number: z.number().optional(),
	size: z.number().optional(),
	last: z.boolean().optional(),
	first: z.boolean().optional(),
	numberOfElements: z.number().optional(),
	empty: z.boolean().optional(),
});

export type SoundTracksPage = z.infer<typeof SoundTracksPageSchema>;

/** Serializable play unit passed from server components to client play buttons. */
export type PlayerTrackPayload = {
	fileId: number;
	trackId: number;
	title: string;
	artist: string | null;
	coverUrl: string | null;
	audioUrl: string;
	href: string;
	durationSeconds: number | null;
};

export type ResolvedAudioCard = {
	id: number;
	title: string;
	subtitle: string | null;
	excerpt: string;
	coverUrl: string | null;
	hoverCoverUrl: string | null;
	soundType: string;
	trackState: TrackState;
	albumOfMemories: boolean;
	topicId: number | null;
	topicName: string | null;
	totalDurationSeconds: number | null;
	totalTracks: number | null;
	publishmentYear: number | null;
	thisProjectOfInstitute: boolean;
	tags: string[];
	keywords: string[];
	queue: PlayerTrackPayload[];
	createdAt: string;
};

export type ResolvedAudioFileRow = {
	id: number;
	title: string;
	thumbUrl: string | null;
	fileType: SoundFileType;
	playable: boolean;
	externalUrl: string | null;
	embedUrl: string | null;
	durationSeconds: number | null;
	sizeBytes: number | null;
	bitRate: string | null;
	sampleRate: string | null;
	audioChannel: AudioChannel | null;
	form: string | null;
	genre: string | null;
	recordingVenue: string | null;
	publishmentYear: number | null;
	fileFormat: string | null;
};

export type ResolvedBrochureItem = {
	id: number;
	imageUrl: string;
	caption: string | null;
	sortOrder: number;
};

export type ResolvedAlbumVideo = {
	url: string;
	posterUrl: string | null;
};

export type ResolvedAudioDetail = {
	id: number;
	title: string;
	description: string;
	coverUrl: string | null;
	hoverCoverUrl: string | null;
	soundType: string;
	trackState: TrackState;
	albumOfMemories: boolean;
	topicId: number | null;
	topicName: string | null;
	reader: string | null;
	directors: string[];
	locations: string[];
	terms: string | null;
	thisProjectOfInstitute: boolean;
	contentLanguages: ("CKB" | "KMR")[];
	genre: string | null;
	albumName: string | null;
	publishmentYear: number | null;
	cdNumber: number | null;
	totalTracks: number | null;
	totalDurationSeconds: number | null;
	totalSizeBytes: number | null;
	fileRows: ResolvedAudioFileRow[];
	brochures: ResolvedBrochureItem[];
	video: ResolvedAlbumVideo | null;
	attachments: SoundAttachment[];
	tags: string[];
	keywords: string[];
	queue: PlayerTrackPayload[];
	createdAt: string;
	updatedAt: string;
};
