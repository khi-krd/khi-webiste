import "server-only";
import { apiFetch, DEFAULT_REVALIDATE } from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import {
	getSocialPlatforms,
	type SocialPlatform,
	type SocialPlatformId,
} from "@/lib/mock/contact";
import { type SocialLink, SocialLinkListSchema } from "@/types/social";

const SOCIAL_ENDPOINT = "/api/v1/settings/social";
const SOCIAL_TAG = "social";

const PLATFORM_ALIASES: Record<string, SocialPlatformId> = {
	FACEBOOK: "facebook",
	INSTAGRAM: "instagram",
	YOUTUBE: "youtube",
	WHATSAPP: "whatsapp",
};

function mapSocialLink(link: SocialLink): SocialPlatform | null {
	const id = PLATFORM_ALIASES[link.platform];
	// A platform the site has no icon for (TIKTOK, TELEGRAM…) is stored and
	// returned by the API, but there is nothing to draw for it yet. `active`
	// is only ever false when it is explicitly sent as such — the public
	// endpoint already filters inactive rows out.
	if (!id || link.active === false) {
		return null;
	}

	return {
		id,
		href: link.url,
	};
}

export async function getSocialLinks(): Promise<SocialLink[]> {
	if (!getApiBaseUrl()) {
		return [];
	}

	const links = await apiFetch(SOCIAL_ENDPOINT, {
		schema: SocialLinkListSchema,
		tags: [SOCIAL_TAG],
		revalidate: DEFAULT_REVALIDATE,
	});

	return links ?? [];
}

/**
 * The site's social profiles, in the order the CMS lists them — read by the
 * contact page and the footer, and edited in the dashboard (`social_links`).
 *
 * The built-in defaults stand in ONLY while the CMS table is empty, which is
 * how a fresh environment avoids rendering a social section with nothing in
 * it. The first row saved in the dashboard replaces the fallback entirely, so
 * a URL changed there is the URL the site shows.
 */
export async function getSocialPlatformsFromApi(): Promise<SocialPlatform[]> {
	const links = await getSocialLinks();
	const apiItems = [...links]
		.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
		.map((link) => mapSocialLink(link))
		.filter((item): item is SocialPlatform => item != null);

	return apiItems.length > 0 ? apiItems : getSocialPlatforms();
}
