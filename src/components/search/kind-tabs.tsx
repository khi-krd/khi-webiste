import { getTranslations } from "next-intl/server";
import { kindChipClass } from "@/components/search/chip-styles";
import { KindChipsScroller } from "@/components/search/kind-chips-scroller";
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

/**
 * Row C — one chip per kind, each carrying its count. The counts come from a
 * single call and hold steady while the visitor switches, so a zero really
 * means zero for this query and these filters: that chip is held in place
 * (the row never reflows) but is not a link to an empty page.
 *
 * Below `sm` the strip scrolls sideways under a symmetric edge mask; from
 * `sm` up it wraps.
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
		<KindChipsScroller
			label={t("kindTabsLabel")}
			className="relative -mx-6 sm:mx-0"
		>
			<ul
				className={cn(
					"flex items-center gap-2 overflow-x-auto px-6 pb-1 snap-x snap-proximity [scroll-padding-inline:1.5rem]",
					"[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
					"[mask-image:linear-gradient(to_right,transparent,black_1.5rem,black_calc(100%_-_1.5rem),transparent)]",
					"sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 sm:[mask-image:none]",
				)}
			>
				{KIND_TABS.map((tab) => {
					const active = state.kind === tab.kind;
					const count = counts[tab.countKey];
					const label = t(tab.labelKey);
					const countLabel = t("kindCountLabel", {
						label,
						count: formatCount(locale, count),
					});

					return (
						<li key={tab.labelKey} className="shrink-0 snap-start">
							{count > 0 || active ? (
								<SearchNavLink
									href={buildSearchHref({ ...state, kind: tab.kind, page: 1 })}
									scrollTo={scrollTargetId}
									data-focus-key={`kind:${tab.kind ?? "all"}`}
									aria-current={active ? "page" : undefined}
									aria-label={countLabel}
									className={kindChipClass(active)}
								>
									{tab.kind ? (
										<KindIcon kind={tab.kind} className="size-4 shrink-0" />
									) : null}
									<span>{label}</span>
									<span
										className={cn(
											"text-label tabular-nums",
											active ? "text-primary-foreground/80" : "text-muted",
										)}
									>
										{formatCount(locale, count)}
									</span>
								</SearchNavLink>
							) : (
								<span
									aria-disabled="true"
									title={t("kindEmptyHint", { kind: label })}
									className={kindChipClass(false, true)}
								>
									{tab.kind ? (
										<KindIcon kind={tab.kind} className="size-4 shrink-0" />
									) : null}
									<span>{label}</span>
									<span className="text-label tabular-nums text-muted">
										{formatCount(locale, 0)}
									</span>
									<span className="visually-hidden">{countLabel}</span>
								</span>
							)}
						</li>
					);
				})}
			</ul>
		</KindChipsScroller>
	);
}
