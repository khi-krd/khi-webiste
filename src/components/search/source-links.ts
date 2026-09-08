import type { SearchScope } from "@/config/site";

/**
 * The three search sources — ماڵپەر / پلاتفۆڕم / کتێبخانە — and the
 * "Search"-namespace keys that name and describe them. Component-free so the
 * server heading row and the client command bar share one vocabulary.
 */

/** Display order: the platform leads — it is this page's flagship source. */
export const SOURCE_ORDER: SearchScope[] = ["archive", "main", "library"];

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
