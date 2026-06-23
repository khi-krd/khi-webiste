import type { About, AboutContent } from "@/types/about";

function firstNonBlank(
	...values: (string | null | undefined)[]
): string | null {
	for (const value of values) {
		if (value && value.trim().length > 0) {
			return value;
		}
	}
	return null;
}

export function resolveAboutContent(
	locale: string,
	page: About,
): AboutContent | null {
	if (locale === "ckb") {
		return page.ckbContent ?? page.kmrContent ?? null;
	}
	return page.kmrContent ?? page.ckbContent ?? null;
}

export function resolveAboutSlug(locale: string, page: About): string | null {
	if (locale === "ckb") {
		return firstNonBlank(page.slugCkb, page.slugKmr);
	}
	return firstNonBlank(page.slugKmr, page.slugCkb);
}

export function resolveAboutStatLabel(
	locale: string,
	stat: { labelCkb?: string | null; labelKmr?: string | null },
): string | null {
	if (locale === "ckb") {
		return firstNonBlank(stat.labelCkb, stat.labelKmr);
	}
	return firstNonBlank(stat.labelKmr, stat.labelCkb);
}
