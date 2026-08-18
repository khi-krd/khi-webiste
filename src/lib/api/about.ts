import "server-only";
import {
	resolveAboutContent,
	resolveAboutSlug,
	resolveFounderFromAbout,
	resolvePartnerItems,
	resolveTeamOffices,
} from "@/lib/about/resolve";
import {
	apiFetch,
	BULK_FETCH_SIZE,
	DEFAULT_REVALIDATE,
} from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import type {
	AboutHeroMedia,
	FounderPerson,
	OfficeTeam,
	PartnerItem,
} from "@/lib/mock/about";
import { type About, AboutPageSchema, AboutSchema } from "@/types/about";
import { PartnerListSchema } from "@/types/partner";
import { TeamMemberListSchema } from "@/types/team";

const ABOUT_ENDPOINT = "/api/v1/about";
const ABOUT_TEAM_ENDPOINT = "/api/v1/about/team";
const ABOUT_PARTNERS_ENDPOINT = "/api/v1/about/partners";
const ABOUT_TAG = "about";

export async function getAboutPages(): Promise<About[]> {
	if (!getApiBaseUrl()) {
		return [];
	}

	const page = await apiFetch(ABOUT_ENDPOINT, {
		schema: AboutPageSchema,
		tags: [ABOUT_TAG],
		revalidate: DEFAULT_REVALIDATE,
		searchParams: { page: 0, size: BULK_FETCH_SIZE },
	});

	return page?.content ?? [];
}

export async function getAboutPageBySlug(slug: string): Promise<About | null> {
	if (!getApiBaseUrl()) {
		return null;
	}

	return apiFetch(`${ABOUT_ENDPOINT}/${encodeURIComponent(slug)}`, {
		schema: AboutSchema,
		tags: [ABOUT_TAG, `about-${slug}`],
		revalidate: DEFAULT_REVALIDATE,
	});
}

/**
 * Order featured About records the way the CMS does: `featuredOrder` ascending
 * with nulls last, ties broken by newest id first.
 */
export function sortFeaturedAboutPages(pages: About[]): About[] {
	return pages
		.filter((page) => page.featured === true)
		.sort((a, b) => {
			const ao = a.featuredOrder ?? Number.POSITIVE_INFINITY;
			const bo = b.featuredOrder ?? Number.POSITIVE_INFINITY;
			return ao !== bo ? ao - bo : b.id - a.id;
		});
}

/**
 * The record that leads `/about`.
 *
 * A featured record wins — that is what `featured` means on an About page now,
 * and it is the only way an editor can choose which of the several records the
 * page opens with. Without one, fall back to the old "first with a slug" rule
 * so the page never goes blank.
 */
export function selectLeadAboutPage(
	locale: string,
	pages: About[],
): About | null {
	const [featured] = sortFeaturedAboutPages(pages);
	if (featured) {
		return featured;
	}

	const slugMatch = pages.find((page) => resolveAboutSlug(locale, page));
	return slugMatch ?? pages[0] ?? null;
}

/** Primary about page for the active locale. */
export async function getPrimaryAboutPage(
	locale: string,
): Promise<About | null> {
	return selectLeadAboutPage(locale, await getAboutPages());
}

// Every reader below returns CMS data only. Where the CMS holds nothing the
// result is empty and the About page drops that section, rather than dressing
// the page with demo people, logos or artwork. There is no mock catalogue to
// fall back on any more.

export async function getAboutHeroMedia(
	locale = "ckb",
): Promise<AboutHeroMedia> {
	const page = await getPrimaryAboutPage(locale);

	// Featuring an About record IS the act of choosing the hero picture, so
	// `featureImageUrl` outranks the record's own poster — but only WHILE it is
	// featured. The backend keeps the picture on unfeature, so an ungated check
	// would make one editor's choice permanent and strand `heroPosterUrl`.
	const featureImage = page?.featured
		? page.featureImageUrl?.trim()
		: undefined;

	return {
		// Without either source the hero has no image at all and renders on a
		// plain ground.
		poster: featureImage || page?.heroPosterUrl?.trim() || "",
		videoSrc: page?.heroVideoUrl ?? "",
	};
}

export async function getAboutFounder(
	locale: string,
): Promise<FounderPerson | null> {
	const page = await getPrimaryAboutPage(locale);
	return page ? resolveFounderFromAbout(locale, page) : null;
}

export async function getAboutOffices(locale: string): Promise<OfficeTeam[]> {
	const members = await getTeamMembers();
	return members.length > 0 ? resolveTeamOffices(locale, members) : [];
}

export async function getAboutPartners(locale: string): Promise<PartnerItem[]> {
	const partners = await getPartners();
	return partners.length > 0 ? resolvePartnerItems(locale, partners) : [];
}

export async function getTeamMembers() {
	if (!getApiBaseUrl()) {
		return [];
	}

	const members = await apiFetch(ABOUT_TEAM_ENDPOINT, {
		schema: TeamMemberListSchema,
		tags: [ABOUT_TAG, "about-team"],
		revalidate: DEFAULT_REVALIDATE,
	});

	return (members ?? []).filter((member) => member.active !== false);
}

export async function getPartners() {
	if (!getApiBaseUrl()) {
		return [];
	}

	const partners = await apiFetch(ABOUT_PARTNERS_ENDPOINT, {
		schema: PartnerListSchema,
		tags: [ABOUT_TAG, "about-partners"],
		revalidate: DEFAULT_REVALIDATE,
	});

	return (partners ?? []).filter((partner) => partner.active !== false);
}

export { resolveAboutContent, resolveAboutSlug };
