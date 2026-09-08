import type { SearchScope } from "@/config/site";

/**
 * The three search sources — ماڵپەر / پلاتفۆڕم / کتێبخانە — and the
 * "Search"-namespace keys that name and describe them. Component-free so the
 * server heading row and the client command bar share one vocabulary.
 */

import { SEARCH_SOURCE_ORDER } from "@/lib/platform/search-url";

/** Display order: the platform leads — it is this page's flagship source. */
export const SOURCE_ORDER: readonly SearchScope[] = SEARCH_SOURCE_ORDER;

/**
 * "پلاتفۆڕم، ماڵپەر و کتێبخانە" / "Platform, Malper û Pirtûkxane" — the
 * checked sources as one phrase, with the locale's own list punctuation.
 */
export function joinSourceLabels(locale: string, labels: string[]): string {
	if (labels.length <= 1) {
		return labels[0] ?? "";
	}
	const comma = locale === "ckb" ? "، " : ", ";
	const and = locale === "ckb" ? " و " : " û ";
	return `${labels.slice(0, -1).join(comma)}${and}${labels[labels.length - 1]}`;
}

export const SOURCE_LABEL_KEYS: Record<
	SearchScope,
	"sourceMain" | "sourceArchive" | "sourceLibrary"
> = {
	main: "sourceMain",
	archive: "sourceArchive",
	library: "sourceLibrary",
};

export const SOURCE_DESCRIPTION_KEYS: Record<
	SearchScope,
	| "sourceMainDescription"
	| "sourceArchiveDescription"
	| "sourceLibraryDescription"
> = {
	main: "sourceMainDescription",
	archive: "sourceArchiveDescription",
	library: "sourceLibraryDescription",
};
