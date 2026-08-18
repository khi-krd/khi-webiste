import "server-only";
import { apiFetch, DEFAULT_REVALIDATE } from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";
import type { SocialPlatform, SocialPlatformId } from "@/lib/mock/contact";
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
	if (!id || !link.active) {
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

/** Map API social links to the mock `SocialPlatform` shape used by contact UI. */
export async function getSocialPlatformsFromApi(): Promise<SocialPlatform[]> {
	const links = await getSocialLinks();
	const apiItems =
		links.length > 0
			? links
					.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
					.map((link) => mapSocialLink(link))
					.filter((item): item is SocialPlatform => item != null)
			: [];

	return apiItems;
}
