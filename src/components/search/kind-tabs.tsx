import { getTranslations } from "next-intl/server";
import { KindIcon } from "@/components/search/kind-icon";
import { SearchNavLink } from "@/components/search/search-transition";
import { formatCount } from "@/lib/platform/format";
import {
	buildSearchHref,
	type SearchPageState,
} from "@/lib/platform/search-url";
import { cn } from "@/lib/utils";
import type { PlatformCounts, PlatformMediaKind } from "@/types/platform";

const KIND_TABS: {
	kind: PlatformMediaKind | null;
	labelKey: "kindAll" | "kindAudio" | "kindVideo" | "kindImage" | "kindText";
	countKey: keyof PlatformCounts;
}[] = [
	{ kind: null, labelKey: "kindAll", countKey: "total" },
	{ kind: "audio", labelKey: "kindAudio", countKey: "audio" },
	{ kind: "video", labelKey: "kindVideo", countKey: "video" },
	{ kind: "image", labelKey: "kindImage", countKey: "image" },
	{ kind: "text", labelKey: "kindText", countKey: "text" },
];

const scrollbarHiddenClass =
	"[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

/**
 * The per-kind count bar — one call fills every tab, so the numbers hold
 * steady while the visitor switches. Counts always cover all four kinds
 * (the API guarantees it), which is exactly what lets this render before a
 * tab is ever clicked.
 */
export async function KindTabs({
	state,
	counts,
	locale,
	scrollTargetId,
}: {
	state: SearchPageState;
	counts: PlatformCounts;
	locale: string;
	scrollTargetId: string;
}) {
	const t = await getTranslations("Search");

	return (
		<nav
			aria-label={t("kindTabsLabel")}
			className={cn(
				"overflow-x-auto border-b border-border",
				scrollbarHiddenClass,
			)}
		>
			<ul className="flex items-center gap-5 sm:gap-7">
				{KIND_TABS.map((tab) => {
					const active = state.kind === tab.kind;
					const count = counts[tab.countKey];
					const empty = count === 0 && !active;
					return (
						<li key={tab.labelKey} className="shrink-0">
							<SearchNavLink
								href={buildSearchHref({ ...state, kind: tab.kind, page: 1 })}
								scrollTo={scrollTargetId}
								aria-current={active ? "page" : undefined}
								className={cn(
									"-mb-px inline-flex items-center gap-2 border-b-2 pb-2.5 pt-1 text-small transition-colors",
									active
										? "border-foreground font-semibold text-foreground"
										: cn(
												"border-transparent text-muted fine-hover:border-border-strong",
												"fine-hover:text-foreground",
											),
									empty && "opacity-50",
								)}
							>
								{tab.kind ? (
									<KindIcon kind={tab.kind} className="size-4 shrink-0" />
								) : null}
								{t(tab.labelKey)}
								<span
									className={cn(
										"text-label tabular-nums",
										active ? "text-muted" : "text-muted/70",
									)}
								>
									{formatCount(locale, count)}
								</span>
							</SearchNavLink>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
