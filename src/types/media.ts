import { z } from "zod";

export const MediaKindSchema = z.enum(["IMAGE", "VIDEO", "AUDIO"]);

export type MediaKind = z.infer<typeof MediaKindSchema>;

export type MediaItem = {
	url: string;
	kind: MediaKind;
	/** External page link (SoundCloud track page, YouTube watch URL, …). */
	externalUrl?: string | null;
	/** Provider/player iframe URL rendered directly in an <iframe>. */
	embedUrl?: string | null;
	thumbnailUrl: string | null;
	caption: string | null;
	sortOrder: number;
};
