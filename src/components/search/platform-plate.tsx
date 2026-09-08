import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import { getTranslations } from "next-intl/server";
import type { CSSProperties } from "react";
import { KindIcon } from "@/components/search/kind-icon";
import { PlateMedia } from "@/components/search/plate-media";
import { SearchNavLink } from "@/components/search/search-transition";
import { Badge } from "@/components/ui/badge";
import {
	humanizePlatformName,
	platformDisplaySubtitle,
	platformDisplayTitle,
	visibleMatchedIn,
} from "@/lib/platform/display";
import { formatCount, formatYear } from "@/lib/platform/format";
import {
	creatorRoleLabel,
	KIND_LABEL_KEYS,
	MATCHED_LABEL_KEYS,
} from "@/lib/platform/kind-labels";
import { platformDetailHref } from "@/lib/platform/search-url";
import type { PlatformHit } from "@/types/platform";

/** How many "found in" badges the footer shows before folding into "+n". */
const VISIBLE_FOUND_IN = 2;

type PlatformPlateProps = {
	hit: PlatformHit;
	/** Position in the result list — drives the mount stagger and eager loading. */
	index: number;
	locale: string;
	/** Whether a keyword ran — the "found in" badges only mean something then. */
	hasQuery: boolean;
};

/**
 * One search result as a media plate: a 4:3 box that reads as its kind at a
 * glance (still, film ground, waveform or ruled sheet), a body with the
 * eyebrow / title / creator, and a provenance footer. The card has exactly
 * one target — the stretched title link — so nested controls never fight,
 * and the article itself is never clipped, so the focus ring can breathe.
 *
 * Item codes never reach the page: the title, subtitle and project name all
 * go through the display helpers, and the DOM id is positional.
 */
export async function PlatformPlate({
	hit,
	index,
	locale,
	hasQuery,
}: PlatformPlateProps) {
	const t = await getTranslations("Search");

	const kindLabel = t(KIND_LABEL_KEYS[hit.type]);
	const display = platformDisplayTitle(hit, { locale, kindLabel });
	const subtitle = platformDisplaySubtitle(hit, display);
	const projectName = humanizePlatformName(hit.projectName);
	const year = formatYear(locale, hit.dateCreated ?? hit.datePublished);
	const creator = hit.creator?.trim() || null;
	const roleLabel = creator ? creatorRoleLabel(t, hit.creatorRole) : null;
	const documentType = hit.documentType?.trim() || null;
	const language = hit.language?.trim() || null;
	const region = hit.region?.trim() || null;

	// A title match is self-evident from the card; anything else is worth a
	// quiet badge. Never the code, never the raw field name.
	const matchedIn = hit.matchedIn ?? [];
	const foundIn =
		hasQuery && !matchedIn.includes("title")
			? visibleMatchedIn(matchedIn)
					.map((field) => MATCHED_LABEL_KEYS[field])
					.filter((key): key is string => key != null)
					.map((key) => t(key))
			: [];
	const hiddenFoundIn = foundIn.length - VISIBLE_FOUND_IN;

	const id = `search-plate-${index}`;
	const titleId = `${id}-title`;
	const metaId = `${id}-meta`;
	const hasFooter = language != null || region != null || foundIn.length > 0;

	return (
		<li className="search-rise" style={{ "--i": index } as CSSProperties}>
			<article
				aria-labelledby={titleId}
				className="group relative flex h-full flex-col border border-border bg-surface transition-[border-color,translate,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] fine-hover:border-foreground/30 fine-hover:-translate-y-0.5 fine-hover:shadow-[0_14px_32px_-18px_color-mix(in_oklch,var(--color-foreground)_30%,transparent)] motion-reduce:fine-hover:translate-y-0 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-ring has-[a:focus-visible]:outline-offset-2"
			>
				{/* Media box — the only clipped element on the card. */}
				<div className="relative aspect-4/3 overflow-hidden border-b border-border bg-sunken">
					<PlateMedia hit={hit} title={display.title} index={index} />

					<span className="label pointer-events-none absolute top-0 start-0 z-2 inline-flex items-center gap-1 border-b border-e border-border bg-surface/95 px-2 py-1 font-medium text-muted backdrop-blur-[1px]">
						<KindIcon kind={hit.type} className="size-3" />
						{kindLabel}
						{documentType ? (
							<>
								<span aria-hidden>·</span>
								<span dir="auto" className="normal-case tracking-normal">
									{documentType}
								</span>
							</>
						) : null}
					</span>

					{hit.trending ? (
						<span className="label pointer-events-none absolute top-0 end-0 z-2 inline-flex items-center gap-1 bg-primary px-2 py-1 font-medium text-primary-foreground">
							<ArrowTrendingUpIcon className="size-3" aria-hidden />
							{t("cardTrending")}
						</span>
					) : null}
				</div>

				{/* Body */}
				<div className="flex flex-1 flex-col gap-1 p-3 sm:p-4 2xl:px-5">
					{projectName || year ? (
						<p className="label flex min-w-0 items-center gap-x-2 font-medium">
							{projectName ? (
								<span
									dir="auto"
									className="min-w-0 line-clamp-1 normal-case tracking-normal [overflow-wrap:anywhere]"
								>
									{projectName}
								</span>
							) : null}
							{projectName && year ? <span aria-hidden>·</span> : null}
							{year ? (
								<span className="shrink-0 tabular-nums">{year}</span>
							) : null}
						</p>
					) : null}

					<h3
						id={titleId}
						className="text-start font-heading text-body font-semibold leading-snug text-foreground line-clamp-2 [overflow-wrap:anywhere] transition-colors duration-200 group-fine:text-brand sm:text-lead"
					>
						<SearchNavLink
							href={platformDetailHref(hit.type, hit.code)}
							aria-describedby={creator ? metaId : undefined}
							className="text-inherit no-underline focus-visible:outline-none after:absolute after:inset-0 after:z-1 after:content-['']"
						>
							<bdi>{display.title}</bdi>
						</SearchNavLink>
					</h3>

					{subtitle ? (
						<p className="line-clamp-1 text-start text-small text-muted [overflow-wrap:anywhere]">
							<bdi>{subtitle}</bdi>
						</p>
					) : null}

					{creator && roleLabel ? (
						<p
							id={metaId}
							className="mt-auto line-clamp-1 pt-1 text-start text-small text-foreground [overflow-wrap:anywhere]"
						>
							<span className="text-muted">{roleLabel}: </span>
							<bdi dir="auto" className="font-medium">
								{creator}
							</bdi>
						</p>
					) : null}
				</div>

				{/* Provenance footer — only when it has something to say. */}
				{hasFooter ? (
					<footer className="label flex items-center gap-2 border-t border-border bg-sunken px-3 py-2 sm:px-4 2xl:px-5">
						<span className="min-w-0 line-clamp-1 [overflow-wrap:anywhere]">
							{language ? (
								<bdi dir="auto" className="normal-case tracking-normal">
									{language}
								</bdi>
							) : null}
							{language && region ? <span aria-hidden> · </span> : null}
							{region ? (
								<bdi dir="auto" className="normal-case tracking-normal">
									{region}
								</bdi>
							) : null}
						</span>
						{foundIn.length > 0 ? (
							<span className="ms-auto inline-flex shrink-0 items-center gap-1">
								<span className="visually-hidden">{t("matchedInLabel")}: </span>
								{foundIn.slice(0, VISIBLE_FOUND_IN).map((label) => (
									<Badge
										key={label}
										variant="subtle"
										size="sm"
										className="bg-background!"
									>
										{label}
									</Badge>
								))}
								{hiddenFoundIn > 0 ? (
									<span className="tabular-nums text-muted">
										+{formatCount(locale, hiddenFoundIn)}
									</span>
								) : null}
							</span>
						) : null}
					</footer>
				) : null}
			</article>
		</li>
	);
}
