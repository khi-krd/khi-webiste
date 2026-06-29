import { ArrowLeftIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { getTranslations } from "next-intl/server";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { RichText } from "@/components/ui/rich-text";
import { VideoPlayerFrame } from "@/components/video/video-player-frame";
import {
	VideoPosterCard,
	type VideoPosterCardProps,
} from "@/components/video/video-poster-card";
import { homeInsetClass } from "@/lib/layout";
import { plainTextFromRichContent } from "@/lib/rich-text";
import { cn } from "@/lib/utils";
import { formatDuration, formatPublishmentDate } from "@/lib/video/format";
import type {
	ResolvedVideoCastMember,
	ResolvedVideoDetail,
	ResolvedVideoHighlight,
} from "@/types/video";

const FULL_DESCRIPTION_MIN = 180;

type ShortFilmDetailViewProps = {
	detail: ResolvedVideoDetail;
	locale: string;
	relatedShortFilms?: VideoPosterCardProps[];
};

function MetaRow({
	label,
	value,
	ltr = false,
}: {
	label: string;
	value: string;
	ltr?: boolean;
}) {
	return (
		<div className="flex items-baseline justify-between gap-4 py-3.5">
			<dt className="shrink-0 text-label text-primary-foreground/55">
				{label}
			</dt>
			<dd
				className={cn(
					"text-end text-small font-medium leading-snug text-primary-foreground",
					ltr && "tabular-nums",
				)}
				dir={ltr ? "ltr" : undefined}
			>
				{value}
			</dd>
		</div>
	);
}

function SectionHeading({ children }: { children: React.ReactNode }) {
	return (
		<h2 className="font-heading text-h3 font-bold text-primary-foreground">
			{children}
		</h2>
	);
}

function CastCard({ member }: { member: ResolvedVideoCastMember }) {
	return (
		<div className="flex w-28 shrink-0 flex-col gap-2 sm:w-32">
			<div className="relative aspect-3/4 overflow-hidden rounded-md border border-primary-foreground/20 bg-primary-foreground/10">
				{member.photoUrl ? (
					<NextImage
						src={member.photoUrl}
						alt=""
						fill
						sizes="8rem"
						className="object-cover"
					/>
				) : (
					<div className="flex h-full items-center justify-center font-heading text-h2 font-bold text-primary-foreground/20">
						{member.name.charAt(0)}
					</div>
				)}
			</div>
			<div>
				<p className="text-small font-medium leading-snug text-primary-foreground">
					{member.name}
				</p>
				{member.role ? (
					<p className="mt-0.5 text-label text-primary-foreground/60">
						{member.role}
					</p>
				) : null}
			</div>
		</div>
	);
}

function HighlightCard({ highlight }: { highlight: ResolvedVideoHighlight }) {
	const content = (
		<>
			<div className="relative aspect-video w-full overflow-hidden rounded-md border border-primary-foreground/20 bg-primary-foreground/10">
				{highlight.thumbnailUrl ? (
					<NextImage
						src={highlight.thumbnailUrl}
						alt=""
						fill
						sizes="20rem"
						className="object-cover transition-transform duration-500 group-fine:scale-105"
					/>
				) : (
					<div className="flex h-full items-center justify-center text-primary-foreground/30">
						<span className="font-heading text-h3">
							{highlight.title.charAt(0)}
						</span>
					</div>
				)}
			</div>
			<p className="mt-2 text-small font-medium text-primary-foreground line-clamp-2">
				{highlight.title}
			</p>
		</>
	);

	if (highlight.url) {
		return (
			<a
				href={highlight.url}
				className="group block w-56 shrink-0 no-underline sm:w-64"
			>
				{content}
			</a>
		);
	}

	return <div className="w-56 shrink-0 sm:w-64">{content}</div>;
}

export async function ShortFilmDetailView({
	detail,
	locale,
	relatedShortFilms = [],
}: ShortFilmDetailViewProps) {
	const t = await getTranslations("Video");

	const durationLabel = formatDuration(detail.durationSeconds);
	const releaseDateLabel = formatPublishmentDate(
		locale,
		detail.publishmentDate,
	);
	const genreLabel = detail.tags[0] ?? detail.topicName ?? "—";
	const directorLabel = detail.director ?? null;
	const producerLabel = detail.producer ?? null;
	const descriptionPlain = detail.description
		? plainTextFromRichContent(detail.description)
		: "";
	const showFullDescription =
		descriptionPlain.length > FULL_DESCRIPTION_MIN;
	const publishYear = detail.publishmentDate?.slice(0, 4) ?? null;

	const metaRows = [
		releaseDateLabel
			? {
					label: t("shortfilms.detail.releaseDate"),
					value: releaseDateLabel,
				}
			: null,
		genreLabel !== "—"
			? { label: t("shortfilms.detail.genre"), value: genreLabel }
			: null,
		directorLabel
			? { label: t("shortfilms.detail.director"), value: directorLabel }
			: null,
		producerLabel
			? { label: t("detail.producer"), value: producerLabel }
			: null,
		detail.location
			? { label: t("detail.location"), value: detail.location }
			: null,
	].filter((row): row is NonNullable<typeof row> => row != null);

	return (
		<article className="min-h-svh bg-foreground text-primary-foreground">
			<header
				className={cn(
					"sticky top-0 z-20 border-b border-primary-foreground/20 bg-foreground/95 backdrop-blur-md",
					homeInsetClass,
				)}
			>
				<div className="relative flex h-14 items-center justify-between sm:h-16">
					<Link
						href="/videos/shortfilms"
						className="group inline-flex items-center gap-2 no-underline"
						aria-label={t("shortfilms.detail.back")}
					>
						<DirectionalIcon
							icon={ArrowLeftIcon}
							className="size-5 text-primary-foreground/70 transition-colors group-fine:text-primary-foreground"
						/>
					</Link>

					<h1 className="pointer-events-none absolute inset-x-0 truncate px-14 text-center font-heading text-small font-semibold sm:text-body">
						{detail.title}
					</h1>

					<button
						type="button"
						className="inline-flex size-9 items-center justify-center text-primary-foreground/50 transition-colors fine-hover:text-primary-foreground"
						aria-label={t("shortfilms.detail.bookmark")}
					>
						<BookmarkIcon className="size-5" />
					</button>
				</div>
			</header>

			<div
				className={cn(
					homeInsetClass,
					"mx-auto max-w-7xl py-8 sm:py-10 lg:py-12",
				)}
			>
				<ScrollReveal className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(17rem,24rem)] lg:gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(19rem,26rem)] xl:gap-10">
					<ScrollRevealItem className="min-w-0">
						<VideoPlayerFrame
							videoType={detail.videoType}
							playerKind={detail.playerKind}
							playableSrc={detail.playableSrc}
							title={detail.title}
							poster={detail.coverUrl}
							clips={detail.clips}
							clipLabels={{
								title: t("detail.clips"),
								play: t("detail.playClip"),
								nowPlaying: t("detail.nowPlaying"),
							}}
							noSourceLabel={t("detail.noSource")}
							variant="cinema"
							hideClipList
							className="overflow-hidden rounded-md ring-1 ring-primary-foreground/15"
						/>
					</ScrollRevealItem>

					<ScrollRevealItem className="flex min-w-0">
						<aside className="flex w-full flex-col justify-between gap-6 rounded-md border border-primary-foreground/15 bg-primary-foreground/3 p-5 sm:p-6 lg:sticky lg:top-24 lg:self-start">
							<div className="flex flex-col gap-4">
								<div className="flex flex-wrap items-center gap-2">
									<span className="label rounded-md border border-primary-foreground/25 bg-primary-foreground/8 px-2 py-0.5 font-medium text-primary-foreground/90">
										{t(`typeBadge.${detail.videoType}`)}
									</span>
									{detail.topicName ? (
										<span className="text-label text-primary-foreground/55">
											{detail.topicName}
										</span>
									) : null}
								</div>

								<h2 className="font-heading text-h2 font-bold leading-[1.12] text-balance text-primary-foreground xl:text-h1">
									{detail.title}
								</h2>

								{detail.description ? (
									<RichText
										content={detail.description}
										compact
										className="text-primary-foreground/75 [&_a]:text-primary-foreground [&_a]:underline [&_strong]:text-primary-foreground"
									/>
								) : null}

								{(durationLabel || publishYear) && (
									<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-label text-primary-foreground/50">
										{durationLabel ? (
											<span dir="ltr" className="tabular-nums">
												{durationLabel}
											</span>
										) : null}
										{durationLabel && publishYear ? (
											<span aria-hidden="true">·</span>
										) : null}
										{publishYear ? (
											<span dir="ltr" className="tabular-nums">
												{publishYear}
											</span>
										) : null}
									</div>
								)}

								{detail.tags.length > 1 ? (
									<div className="flex flex-wrap gap-1.5">
										{detail.tags.slice(1, 5).map((tag) => (
											<span
												key={tag}
												className="rounded-md border border-primary-foreground/15 px-1.5 py-0.5 text-label text-primary-foreground/65"
											>
												{tag}
											</span>
										))}
									</div>
								) : null}
							</div>

							{metaRows.length > 0 ? (
								<dl className="divide-y divide-primary-foreground/12 border-t border-primary-foreground/15">
									{metaRows.map((row) => (
										<MetaRow
											key={row.label}
											label={row.label}
											value={row.value}
										/>
									))}
								</dl>
							) : null}
						</aside>
					</ScrollRevealItem>
				</ScrollReveal>
			</div>

			<div className={cn(homeInsetClass, "mx-auto max-w-7xl pb-10 sm:pb-14")}>
				{showFullDescription ? (
					<ScrollReveal>
						<ScrollRevealItem>
							<section className="border-t border-primary-foreground/20 pt-10 sm:pt-12">
								<SectionHeading>
									{t("shortfilms.detail.description")}
								</SectionHeading>
								<RichText
									content={detail.description}
									className="mt-4 max-w-prose text-body leading-relaxed text-primary-foreground/85"
								/>
							</section>
						</ScrollRevealItem>
					</ScrollReveal>
				) : null}

				{detail.cast.length > 0 ? (
					<ScrollReveal>
						<ScrollRevealItem>
							<section
								className={cn(
									"border-t border-primary-foreground/20 pt-10 sm:pt-12",
									showFullDescription ? "mt-10 sm:mt-12" : "",
								)}
							>
								<SectionHeading>{t("shortfilms.detail.cast")}</SectionHeading>
								<div className="mt-5 flex gap-4 overflow-x-auto pb-2">
									{detail.cast.map((member) => (
										<CastCard key={member.name} member={member} />
									))}
								</div>
							</section>
						</ScrollRevealItem>
					</ScrollReveal>
				) : null}

				{detail.highlights.length > 0 ? (
					<ScrollReveal>
						<ScrollRevealItem>
							<section className="mt-12 border-t border-primary-foreground/20 pt-12 sm:mt-16">
								<SectionHeading>
									{t("shortfilms.detail.selectedClips")}
								</SectionHeading>
								<div className="mt-5 flex gap-4 overflow-x-auto pb-2">
									{detail.highlights.map((highlight) => (
										<HighlightCard
											key={highlight.title}
											highlight={highlight}
										/>
									))}
								</div>
							</section>
						</ScrollRevealItem>
					</ScrollReveal>
				) : null}

				{relatedShortFilms.length > 0 ? (
					<ScrollReveal>
						<ScrollRevealItem>
							<section className="mt-12 border-t border-primary-foreground/20 pt-12 sm:mt-16">
								<SectionHeading>
									{t("shortfilms.detail.related")}
								</SectionHeading>
								<div className="mt-5 flex gap-3 overflow-x-auto pb-2 sm:gap-4">
									{relatedShortFilms.map((card) => (
										<div
											key={card.id}
											className="w-36 shrink-0 sm:w-40 lg:w-44"
										>
											<VideoPosterCard {...card} />
										</div>
									))}
								</div>
							</section>
						</ScrollRevealItem>
					</ScrollReveal>
				) : null}
			</div>
		</article>
	);
}
