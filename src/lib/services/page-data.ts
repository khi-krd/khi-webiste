import {
	getMergedServiceSections,
	getServiceHighlights,
	getServicePartnerCards,
	getServiceRecords,
	getServicesHeroMediaFromApi,
	getServiceTypes,
} from "@/lib/api/services";
import { PAGE_HERO_SERVICE_TYPE } from "@/lib/api/services-page";
import type { PartnerItem } from "@/lib/mock/about";
import type { ServiceMedia } from "@/lib/mock/services";
import type {
	MergedServiceSection,
	ServiceHighlight,
} from "@/lib/services/resolve";
import { parseServiceQuery, parseServiceType } from "@/lib/services-url";
import type { Service } from "@/types/service";

export type ServicesPageSearchParams = {
	type?: string;
	q?: string;
};

export type ServicesPageData = {
	mergedSections: MergedServiceSection[];
	heroMediaFallback: ServiceMedia;
	partnerCards: PartnerItem[];
	serviceRecords: Service[];
	highlights: ServiceHighlight[];
	types: string[];
	activeType: string | null;
	activeQuery: string | null;
};

/** Same shape `getServiceTypes` publishes, recovered from the records. */
function typesFromRecords(records: Service[]): string[] {
	const seen = new Set<string>();
	const types: string[] = [];
	for (const record of records) {
		const type = record.serviceType?.trim();
		if (!type || type === PAGE_HERO_SERVICE_TYPE) {
			continue;
		}
		const key = type.toLocaleLowerCase();
		if (seen.has(key)) {
			continue;
		}
		seen.add(key);
		types.push(type);
	}
	return types;
}

/**
 * Everything `/services` renders, with the filter applied to the sections only.
 *
 * The hero, the highlight carousel and the partner cards deliberately read the
 * unfiltered catalogue: narrowing them would blank the top and bottom of the
 * page the moment a reader picked a type.
 */
export async function loadServicesPageData(
	locale: string,
	searchParams: ServicesPageSearchParams = {},
): Promise<ServicesPageData> {
	const [heroMediaFallback, partnerCards, serviceRecords, highlights, types] =
		await Promise.all([
			getServicesHeroMediaFromApi(locale),
			getServicePartnerCards(locale),
			getServiceRecords(),
			getServiceHighlights(locale),
			getServiceTypes(),
		]);

	// `?type=` is only ever validated against this list, so when
	// `GET /services/types` fails the facet would silently stop working — and
	// with it the whole filter bar. The loaded records carry the same values.
	const typeOptions =
		types.length > 0 ? types : typesFromRecords(serviceRecords);

	// The type has to be resolved against the published list before it can be
	// sent upstream, so the sections wait on `getServiceTypes`.
	const activeType = parseServiceType(searchParams.type, typeOptions);
	const activeQuery = parseServiceQuery(searchParams.q);
	const mergedSections = await getMergedServiceSections(
		locale,
		activeType || activeQuery
			? { type: activeType, q: activeQuery }
			: undefined,
	);

	return {
		mergedSections,
		heroMediaFallback,
		partnerCards,
		serviceRecords,
		highlights,
		types: typeOptions,
		activeType,
		activeQuery,
	};
}
