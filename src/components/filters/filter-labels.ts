import type { UnifiedSearchBarLabels } from "@/components/filters/UnifiedSearchBar";

/**
 * Locale overrides for the filter components. The components ship Sorani
 * defaults (the site's primary language); Kurmanji gets a full translation.
 */
export function unifiedLabels(
	locale: string,
): Partial<UnifiedSearchBarLabels> | undefined {
	if (locale !== "ku") return undefined;
	return {
		searchLabel: "Lêgerîn di nivîsan de",
		searchPlaceholder: "Lêgerîn bi nav, nivîskar an peyvê…",
		search: "Lêgerîn",
		type: "Cure",
		allTypes: "Hemû cure",
		typesCount: (n) => `${n} cure`,
		noTypesSelected: "Tu cure nehatiye hilbijartin",
		typesSelected: (n) => `${n} cure hatin hilbijartin`,
		noTypeMatch: "Tu cure nehat dîtin",
		otherTypes: "Cureyên din",
		author: "Nivîskar",
		allAuthors: "Hemû nivîskar",
		noAuthorMatch: "Tu nivîskar nehat dîtin",
		sort: "Rêzkirin",
		showResults: (n) => `${n} encam nîşan bide`,
		results: "encam",
		remove: (label) => `Jêbirin ${label}`,
		clear: "Paqij bike",
		clearAll: "Hemûyan paqij bike",
		close: "Girtin",
	};
}
