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
import {
	getAboutFounder as getMockAboutFounder,
	getAboutHeroMedia as getMockAboutHeroMedia,
	getAboutOffices as getMockAboutOffices,
	getAboutPartners as getMockAboutPartners,
	type AboutHeroMedia,
	type FounderPerson,
	type OfficeTeam,
	type PartnerItem,
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

/** Primary about page for the active locale (first active match). */
export async function getPrimaryAboutPage(
	locale: string,
): Promise<About | null> {
	const pages = await getAboutPages();
	if (pages.length === 0) {
		return null;
	}

	const slugMatch = pages.find((page) => resolveAboutSlug(locale, page));
	return slugMatch ?? pages[0] ?? null;
}

export async function getAboutHeroMedia(): Promise<AboutHeroMedia> {
	const page = await getPrimaryAboutPage("ckb");
	if (!page?.heroVideoUrl && !page?.heroPosterUrl) {
		return getMockAboutHeroMedia();
	}

	return {
		poster: page.heroPosterUrl ?? getMockAboutHeroMedia().poster,
		videoSrc: page.heroVideoUrl ?? getMockAboutHeroMedia().videoSrc,
	};
}

export async function getAboutFounder(locale: string): Promise<FounderPerson> {
	const page = await getPrimaryAboutPage(locale);
	const resolved = page ? resolveFounderFromAbout(locale, page) : null;
	if (resolved) {
		return resolved;
	}

	return getMockAboutFounder(locale);
}

export async function getAboutOffices(locale: string): Promise<OfficeTeam[]> {
	const members = await getTeamMembers();
	if (members.length === 0) {
		return getMockAboutOffices(locale);
	}

	const offices = resolveTeamOffices(locale, members);
	return offices.length > 0 ? offices : getMockAboutOffices(locale);
}

export async function getAboutPartners(locale: string): Promise<PartnerItem[]> {
	const partners = await getPartners();
	if (partners.length === 0) {
		return getMockAboutPartners(locale);
	}

	const items = resolvePartnerItems(locale, partners);
	return items.length > 0 ? items : getMockAboutPartners(locale);
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
