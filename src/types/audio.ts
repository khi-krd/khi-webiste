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
	imageUrl: z.string(),
	caption: z.string().nullable(),
	brochureOrder: z.number().nullable(),
});

export type Brochure = z.infer<typeof BrochureSchema>;

export const SoundTrackFileSchema = z.object({
	id: z.number(),
	fileUrl: z.string().nullable(),
	externalUrl: z.string().nullable(),
	embedUrl: z.string().nullable(),
	title: z.string().nullable(),
	fileType: SoundFileTypeSchema,
	publishmentYear: z.number().int().nullable(),
	fileFormat: z.string().nullable(),
	sizeBytes: z.number().nullable(),
	durationSeconds: z.number().nullable(),
	durationMinutes: z.number().nullable(),
	bitRate: z.string().nullable(),
	sampleRate: z.string().nullable(),
	audioChannel: AudioChannelSchema.nullable(),
	form: z.string().nullable(),
	genre: z.string().nullable(),
	recordingVenue: z.string().nullable(),
	brochures: z.array(BrochureSchema),
});

export type SoundTrackFile = z.infer<typeof SoundTrackFileSchema>;

export const SoundAttachmentSchema = z.object({
	id: z.number(),
	fileUrl: z.string(),
	title: z.string().nullable(),
	attachmentType: AttachmentTypeSchema,
	sizeBytes: z.number().nullable(),
	mimeType: z.string().nullable(),
	attachmentOrder: z.number().nullable(),
});

export type SoundAttachment = z.infer<typeof SoundAttachmentSchema>;

export const SoundContentSchema = z.object({
	title: z.string().nullable(),
	description: z.string().nullable(),
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
	locations: z.array(z.string()),
	reader: z.string().nullable(),
	directors: z.array(z.string()),
	terms: z.string().nullable(),
	thisProjectOfInstitute: z.boolean(),
	tags: BilingualSetSchema,
	keywords: BilingualSetSchema,
	files: z.array(SoundTrackFileSchema),
	totalDurationSeconds: z.number().nullable(),
	totalSizeBytes: z.number().nullable(),
	albumName: z.string().nullable(),
	publishmentYear: z.number().int().nullable(),
	cdNumber: z.number().int().nullable(),
	totalTracks: z.number().int().nullable(),
	attachments: z.array(SoundAttachmentSchema),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type SoundTrack = z.infer<typeof SoundTrackSchema>;

export const SoundTopicSchema = z.object({
	id: z.number(),
	nameCkb: z.string().nullable(),
	nameKmr: z.string().nullable(),
});

export type SoundTopic = z.infer<typeof SoundTopicSchema>;

export const SoundTracksPageSchema = z.object({
	content: z.array(SoundTrackSchema),
	pageable: PageableSchema,
	totalElements: z.number(),
	totalPages: z.number(),
	last: z.boolean(),
	first: z.boolean(),
	numberOfElements: z.number(),
	empty: z.boolean(),
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

export type ResolvedAudioDetail = {
	id: number;
	title: string;
	description: string;
	coverUrl: string | null;
	hoverCoverUrl: string | null;
	soundType: string;
	trackState: TrackState;
	albumOfMemories: boolean;
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
	attachments: SoundAttachment[];
	tags: string[];
	keywords: string[];
	queue: PlayerTrackPayload[];
	createdAt: string;
	updatedAt: string;
};
