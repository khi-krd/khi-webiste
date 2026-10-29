// Formerly the demo image-collection list — now only the shared type production
// code still imports. All records come from the CMS via
// `@/lib/api/image-collection`.

export type ImageCollectionItem = {
	id: string;
	slug: string;
	title: string;
	subtitle: string;
	catalogRef: string;
	image: {
		url: string;
		alt?: string;
	};
	/** Alternate cover shown while the card is hovered (`hoverCoverUrl`). */
	hoverImageUrl?: string | null;
};
