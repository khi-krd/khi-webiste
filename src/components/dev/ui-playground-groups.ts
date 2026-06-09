export const UI_PLAYGROUND_INTRODUCTION_ID = "introduction";

/** Showcase organization: each group lists the section ids it contains. */
export const UI_PLAYGROUND_GROUPS = [
	{ key: "foundations", sections: ["typography", "headings", "colors"] },
	{
		key: "primitives",
		sections: ["button", "drawnBorder", "link", "directionalIcon"],
	},
	{ key: "forms", sections: ["input", "field"] },
	{ key: "content", sections: ["prose", "image", "videoPlayer", "container"] },
	{
		key: "states",
		sections: ["spinner", "emptyState", "errorState", "skeleton"],
	},
	{
		key: "utilities",
		sections: [
			"visuallyHidden",
			"divider",
			"badge",
			"breadcrumb",
			"pagination",
		],
	},
	{
		key: "homepage",
		sections: [
			"featuredSlide",
			"featuredCarousel",
			"newsCard",
			"projectCard",
			"writingRow",
			"videoCard",
			"featuredHero",
			"latestUpdates",
			"projectsSection",
			"soundSection",
			"writingsSection",
			"videoSection",
			"imageCollectionSection",
		],
	},
	{
		key: "about",
		sections: [
			"sectionRuleHeading",
			"aboutTeamPhoto",
			"partnerCard",
			"aboutHero",
			"aboutMission",
			"aboutFounder",
			"aboutTeamShowcase",
			"aboutPartners",
		],
	},
] as const;

export const UI_PLAYGROUND_SECTION_IDS = UI_PLAYGROUND_GROUPS.flatMap(
	(group) => group.sections,
);

export type UiPlaygroundSectionId = (typeof UI_PLAYGROUND_SECTION_IDS)[number];

const SECTION_ID_SET = new Set<string>([
	UI_PLAYGROUND_INTRODUCTION_ID,
	...UI_PLAYGROUND_SECTION_IDS,
]);

export function resolveUiPlaygroundSectionId(
	section: string | undefined,
): string {
	if (section && SECTION_ID_SET.has(section)) {
		return section;
	}
	return UI_PLAYGROUND_INTRODUCTION_ID;
}
