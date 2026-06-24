import { z } from "zod";

export const MediaKindSchema = z.enum(["IMAGE", "VIDEO", "AUDIO"]);

export type MediaKind = z.infer<typeof MediaKindSchema>;

export type MediaItem = {
	url: string;
	kind: MediaKind;
	thumbnailUrl: string | null;
	caption: string | null;
	sortOrder: number;
};
