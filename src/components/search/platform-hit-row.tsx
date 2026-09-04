import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { KindIcon } from "@/components/search/kind-icon";
import { SearchNavLink } from "@/components/search/search-transition";
import { Image } from "@/components/ui/image";
import { formatCount, formatYear } from "@/lib/platform/format";
import { platformDetailHref } from "@/lib/platform/search-url";
import { cn } from "@/lib/utils";
import type { PlatformHit } from "@/types/platform";

type TranslateFn = (key: string, values?: Record<string, string>) => string;

export const KIND_LABEL_KEYS = {
	audio: "kindAudio",
	video: "kindVideo",
	image: "kindImage",
	text: "kindText",
} as const;

const MATCHED_LABEL_KEYS: Record<string, string> = {
	title: "matchedTitle",
	code: "matchedCode",
	creator: "matchedCreator",
	person: "matchedPerson",
	project: "matchedProject",
	category: "matchedCategory",
	tags: "matchedTags",
	keywords: "matchedKeywords",
	subject: "matchedSubject",
	genre: "matchedGenre",
	place: "matchedPlace",
	description: "matchedDescription",
};

function creatorRoleLabel(t: TranslateFn, role: string | null | undefined) {
	switch (role) {
		case "singer":
			return t("roleSinger");
		case "speaker":
			return t("roleSpeaker");
		case "director":
			return t("roleDirector");
		case "photographer":
			return t("rolePhotographer");
		case "author":
			return t("roleAuthor");
		default:
			return t("roleCreator");
	}
}

/** The dot-separated quiet meta strip under a result. */
function MetaDivider() {
	return (
		<span aria-hidden className="text-muted/50">
			·
		</span>
	);
}

type PlatformHitRowProps = {
	hit: PlatformHit;
	locale: string;
	/** Whether a keyword ran — controls the "matched in" footnote. */
	hasQuery: boolean;
};

/**
 * One search result, whatever its kind — a single flat card shape is the whole
 * point of `/api/guest/media/search`. The row is ONE link (no nested targets):
 * editorial list layout, hairline divider, thumbnail with a per-kind glyph
 * fallback since sounds and videos often have no still of their own.
 */
export async function PlatformHitRow({
	hit,
	locale,
	hasQuery,
}: PlatformHitRowProps) {
	const t = await getTranslations("Search");

	const kindLabel = t(KIND_LABEL_KEYS[hit.type]);
	const year = formatYear(locale, hit.dateCreated ?? hit.datePublished);
	const title = hit.title?.trim() || hit.code;
	const subtitle =
		hit.subtitle?.trim() && hit.subtitle.trim() !== title.trim()
			? hit.subtitle.trim()
			: null;

	const matched = hasQuery
		? (hit.matchedIn ?? [])
				.map((entry) => {
					const key = MATCHED_LABEL_KEYS[entry];
					return key ? t(key) : null;
				})
				.filter((label): label is string => label != null)
				.slice(0, 3)
		: [];
	const matchedSeparator = locale === "ckb" ? "، " : ", ";

	const metaBits: ReactNode[] = [];
	if (hit.language?.trim()) {
		metaBits.push(<span key="language">{hit.language.trim()}</span>);
	}
	if (hit.region?.trim()) {
		metaBits.push(
			<span key="region" dir="auto">
				{hit.region.trim()}
			</span>,
		);
	}
	if (hit.duration?.trim()) {
		metaBits.push(
			<span key="duration" dir="ltr" className="tabular-nums">
				{hit.duration.trim()}
			</span>,
		);
	}
	if (hit.type === "text" && hit.pageCount) {
		metaBits.push(
			<span key="pages">
				{t("cardPages", { count: formatCount(locale, hit.pageCount) })}
			</span>,
		);
	}

	return (
		<li className="border-b border-border last:border-b-0">
			<SearchNavLink
				href={platformDetailHref(hit.type, hit.code)}
				aria-label={t("cardOpen", { title })}
				className="group flex w-full items-start gap-4 py-5 sm:gap-6 sm:py-6"
			>
				{/* Thumbnail — or the kind's glyph on the sunken ground. */}
				<div
					className={cn(
						"relative size-22 shrink-0 overflow-hidden border border-border bg-sunken",
						"sm:size-28",
					)}
				>
					{hit.thumbnailUrl ? (
						<Image
							src={hit.thumbnailUrl}
							alt=""
							aspectRatio="square"
							sizes="(max-width: 640px) 88px, 112px"
							className="absolute inset-0 size-full"
							imageClassName="transition-transform duration-500 ease-out group-fine-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-fine-hover:scale-100"
						/>
					) : (
						<span className="absolute inset-0 flex items-center justify-center">
							<KindIcon kind={hit.type} className="size-8 text-muted/60" />
						</span>
					)}
					{hit.duration?.trim() ? (
						<span
							dir="ltr"
							className="absolute bottom-1 end-1 bg-foreground/80 px-1 py-0.5 text-label tabular-nums leading-none text-primary-foreground"
						>
							{hit.duration.trim()}
						</span>
					) : null}
				</div>

				<div className="min-w-0 flex-1">
					{/* Quiet context line: kind · project · year (+ trending). */}
					<p className="label flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
						<span className="inline-flex items-center gap-1 text-foreground/75">
							<KindIcon kind={hit.type} className="size-3.5" />
							{kindLabel}
						</span>
						{hit.projectName?.trim() ? (
							<>
								<MetaDivider />
								<span dir="auto" className="min-w-0 truncate">
									{hit.projectName.trim()}
								</span>
							</>
						) : null}
						{year ? (
							<>
								<MetaDivider />
								<span className="tabular-nums">{year}</span>
							</>
						) : null}
						{hit.trending ? (
							<span className="ms-1 inline-flex items-center bg-primary px-1.5 py-0.5 text-label leading-none text-primary-foreground">
								{t("cardTrending")}
							</span>
						) : null}
					</p>

					<h3
						className={cn(
							"mt-1.5 text-start font-heading text-lead font-semibold leading-snug text-foreground",
							"[overflow-wrap:anywhere] transition-colors group-fine-hover:text-brand sm:text-h3",
						)}
					>
						<bdi>{title}</bdi>
					</h3>

					{subtitle ? (
						<p className="mt-0.5 line-clamp-1 text-start text-small text-muted [overflow-wrap:anywhere]">
							<bdi>{subtitle}</bdi>
						</p>
					) : null}

					{hit.creator?.trim() ? (
						<p className="mt-1.5 text-small text-foreground">
							<span className="text-muted">
								{creatorRoleLabel(t, hit.creatorRole)}:{" "}
							</span>
							<span dir="auto" className="font-medium">
								{hit.creator.trim()}
							</span>
						</p>
					) : null}

					{hit.description?.trim() ? (
						<p className="mt-2 hidden text-start text-small leading-relaxed text-muted sm:line-clamp-2">
							<bdi>{hit.description.trim()}</bdi>
						</p>
					) : null}

					{metaBits.length > 0 || matched.length > 0 ? (
						<p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-label text-muted">
							{metaBits.flatMap((bit, index) =>
								index === 0
									? [bit]
									: [
											// biome-ignore lint/suspicious/noArrayIndexKey: decorative separators between stable-keyed bits
											<MetaDivider key={`div-${index}`} />,
											bit,
										],
							)}
							{matched.length > 0 ? (
								<span
									className={cn(
										"text-muted/70",
										metaBits.length > 0 && "ms-auto ps-3",
									)}
								>
									{t("matchedInLabel")}: {matched.join(matchedSeparator)}
								</span>
							) : null}
						</p>
					) : null}
				</div>
			</SearchNavLink>
		</li>
	);
}
