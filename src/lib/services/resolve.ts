import type { Service, ServiceContent } from "@/types/service";

function resolveServiceContentForLanguage(
	locale: string,
	service: Service,
): ServiceContent | null {
	const languageCode = locale === "ckb" ? "CKB" : "KMR";
	const preferred = service.contents.find(
		(entry) => entry.languageCode === languageCode,
	);
	const fallback = service.contents.find(
		(entry) => entry.languageCode !== languageCode,
	);
	return preferred ?? fallback ?? service.contents[0] ?? null;
}

export type ResolvedServiceContent = {
	id: number;
	title: string;
	body: string;
	location: string | null;
	serviceType: string | null;
};

export function resolveServiceContent(
	locale: string,
	service: Service,
): ResolvedServiceContent | null {
	const content = resolveServiceContentForLanguage(locale, service);
	const title = content?.title?.trim();
	if (!title) {
		return null;
	}

	return {
		id: service.id,
		title,
		body: content?.description?.trim() ?? "",
		location: service.location?.trim() || null,
		serviceType: service.serviceType?.trim() || null,
	};
}

export function resolveServiceContents(
	locale: string,
	services: Service[],
): ResolvedServiceContent[] {
	return services
		.map((service) => resolveServiceContent(locale, service))
		.filter((item): item is ResolvedServiceContent => item != null);
}

export function resolveServiceBody(
	locale: string,
	service: Service,
): string | null {
	const body = resolveServiceContent(locale, service)?.body;
	return body && body.length > 0 ? body : null;
}
