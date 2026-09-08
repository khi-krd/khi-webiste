import type { PlatformMediaKind } from "@/lib/platform/constants";

/**
 * Translation keys (under the "Search" namespace) for platform vocabulary
 * shared by the results page and the /archive detail pages. Kept zod-free
 * and component-free so both server and client trees can import it.
 */

export const KIND_LABEL_KEYS: Record<
	PlatformMediaKind,
	"kindAudio" | "kindVideo" | "kindImage" | "kindText"
> = {
	audio: "kindAudio",
	video: "kindVideo",
	image: "kindImage",
	text: "kindText",
};

/** "Matched in" fields the API reports → their labels. `code` is never shown. */
export const MATCHED_LABEL_KEYS: Record<string, string> = {
	title: "matchedTitle",
	creator: "matchedCreator",
	person: "matchedPerson",
	project: "matchedProject",
	category: "matchedCategory",
	tags: "matchedTags",
	keywords: "matchedKeywords",
	subject: "matchedSubject",
	genre: "matchedGenre",
	place: "matchedPlace",
	description: "matchedDescription",
};

export type TranslateFn = (
	key: string,
	values?: Record<string, string | number>,
) => string;

/** The creator's role as the platform reports it → a translated label. */
export function creatorRoleLabel(
	t: TranslateFn,
	role: string | null | undefined,
): string {
	switch (role) {
		case "singer":
			return t("roleSinger");
		case "speaker":
			return t("roleSpeaker");
		case "director":
			return t("roleDirector");
		case "photographer":
		case "creatorArtistPhotographer":
			return t("rolePhotographer");
		case "author":
			return t("roleAuthor");
		default:
			return t("roleCreator");
	}
}
