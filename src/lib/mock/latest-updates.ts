// Formerly the demo latest-updates list — now only the shared types production
// code still imports. All records come from the CMS via `@/lib/api/news`.

export type LatestUpdateCategory =
	| "culture"
	| "history"
	| "language"
	| "heritage"
	| "society";

export type LatestUpdateItem = {
	id: string;
	slug: string;
	title: string;
	excerpt: string;
	category: LatestUpdateCategory;
	image: {
		url: string;
		alt?: string;
	};
};
