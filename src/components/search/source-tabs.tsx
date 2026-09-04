import { getTranslations } from "next-intl/server";
import { SearchNavLink } from "@/components/search/search-transition";
import type { SearchScope } from "@/config/site";
import { SEARCH_SCOPES } from "@/config/site";
import {
	buildSearchHref,
	EMPTY_FILTERS,
	type SearchPageState,
} from "@/lib/platform/search-url";
import { cn } from "@/lib/utils";

const SOURCE_LABEL_KEYS: Record<
	SearchScope,
	"sourceMain" | "sourceArchive" | "sourceLibrary"
> = {
	main: "sourceMain",
	archive: "sourceArchive",
	library: "sourceLibrary",
};

const SOURCE_DESCRIPTION_KEYS: Record<
	SearchScope,
	| "sourceMainDescription"
	| "sourceArchiveDescription"
	| "sourceLibraryDescription"
> = {
	main: "sourceMainDescription",
	archive: "sourceArchiveDescription",
	library: "sourceLibraryDescription",
};

/** Display order: the platform leads — it is this page's flagship source. */
const SOURCE_ORDER: SearchScope[] = ["archive", "main", "library"];

/**
 * Which archive is being searched — ماڵپەر / پلاتفۆڕم / کتێبخانە. Switching
 * keeps the query and drops everything that described the previous source's
 * result set (kind, sort, refinements, page).
 */
export async function SourceTabs({ state }: { state: SearchPageState }) {
	const t = await getTranslations("Search");

	return (
		<div>
			<nav aria-label={t("sourceLabel")} className="border-b border-border">
				<ul className="flex items-center gap-6 sm:gap-8">
					{SOURCE_ORDER.filter((source) => SEARCH_SCOPES.includes(source)).map(
						(source) => {
							const active = state.source === source;
							return (
								<li key={source}>
									<SearchNavLink
										href={buildSearchHref({
											source,
											q: state.q,
											filters: EMPTY_FILTERS,
										})}
										aria-current={active ? "page" : undefined}
										className={cn(
											"-mb-px inline-flex items-center border-b-2 pb-3 pt-1 font-heading text-body font-semibold transition-colors",
											active
												? "border-brand text-foreground"
												: "border-transparent text-muted fine-hover:text-foreground",
										)}
									>
										{t(SOURCE_LABEL_KEYS[source])}
									</SearchNavLink>
								</li>
							);
						},
					)}
				</ul>
			</nav>
			<p className="mt-3 text-small text-muted">
				{t(SOURCE_DESCRIPTION_KEYS[state.source])}
			</p>
		</div>
	);
}
