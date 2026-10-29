// Formerly the demo about-page data — now only the shared types production
// code still imports. All records come from the CMS via `@/lib/api/about`.

export type TeamMember = {
	id: string;
	image: {
		url: string;
		alt?: string;
	};
	/** Populated when sourced from the API. */
	name?: string;
	role?: string;
	/** Localized biography from the CMS; rendered under the role. */
	bio?: string;
};

export type OfficeTeam = {
	id: "sulaymaniyah" | "duhok";
	members: TeamMember[];
};

export type FounderPerson = {
	image: {
		url: string;
		alt?: string;
	};
};

export type PartnerItem = {
	id: string;
	slug: string;
	image: {
		url: string;
		alt?: string;
	};
	href: string;
	/** Populated when sourced from the API. */
	title?: string;
	description?: string;
};

export type AboutHeroMedia = {
	poster: string;
	videoSrc: string;
};
