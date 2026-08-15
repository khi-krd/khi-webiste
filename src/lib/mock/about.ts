export type TeamMember = {
	id: string;
	image: {
		url: string;
		alt?: string;
	};
	/** Populated when sourced from the API. */
	name?: string;
	role?: string;
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

const MENU = (n: number) => `/menu/${n}.jpg`;

const ABOUT_IMAGES = {
	hero: "/about/475203467_1007002848126180_7383496220452921499_n.jpg",
	founder: "/about/artworks-000171267883-evk1m7-t500x500.jpg",
	services: "/about/services-bg.jpg",
	// The shared /about/475203467_….jpg asset no longer exists (404) — the
	// donate promo card rendered as a bare gradient. hero/founder above are
	// also 404 but pages receive those from the CMS at runtime.
	donate: "/menu/5.jpg",
} as const;

const SULAYMANIYAH_MEMBER_IDS = [
	"ahmed-ali",
	"sara-osman",
	"karwan-hama",
	"niaz-jamal",
	"halkawt-zahir",
	"dilnia-rezazi",
	"laila-fariqi",
	"adnan-karim",
] as const;

const DUHOK_MEMBER_IDS = [
	"azad-barwari",
	"berivan-tahir",
	"heval-zebari",
	"salman-kocher",
	"sherzad-sini",
	"newroz-doski",
	"wlat-mazuri",
	"kazhin-farhad",
] as const;

function buildMembers(
	ids: readonly string[],
	startImage: number,
): TeamMember[] {
	return ids.map((id, i) => {
		const menuIndex = ((startImage + i - 1) % 7) + 1;
		return {
			id,
			image: { url: MENU(menuIndex) },
		};
	});
}

export function getAboutHeroMedia(): AboutHeroMedia {
	return {
		poster: ABOUT_IMAGES.hero,
		videoSrc: "/video/wave.mp4",
	};
}

export function getAboutFounder(_locale: string): FounderPerson {
	return {
		image: {
			url: ABOUT_IMAGES.founder,
		},
	};
}

export function getAboutOffices(_locale: string): OfficeTeam[] {
	return [
		{
			id: "sulaymaniyah",
			members: buildMembers(SULAYMANIYAH_MEMBER_IDS, 1),
		},
		{
			id: "duhok",
			members: buildMembers(DUHOK_MEMBER_IDS, 1),
		},
	];
}

const PARTNERS: PartnerItem[] = [
	{
		id: "services",
		slug: "services",
		image: {
			url: ABOUT_IMAGES.services,
			alt: "Institute library and research facilities",
		},
		href: "/services",
	},
	{
		id: "donate",
		slug: "donate",
		image: {
			url: ABOUT_IMAGES.donate,
			alt: "Outdoor heritage photography exhibition",
		},
		href: "/donate",
	},
];

export function getAboutPartners(_locale: string): PartnerItem[] {
	return PARTNERS;
}
