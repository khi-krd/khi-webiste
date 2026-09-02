import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { getTranslations } from "next-intl/server";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { BackToIndexLink } from "@/components/ui/back-to-index";
import { CoverLightbox } from "@/components/ui/cover-lightbox";
import { Link } from "@/components/ui/link";
import { RichText } from "@/components/ui/rich-text";
import { VideoPlayerFrame } from "@/components/video/video-player-frame";
import type { VideoPosterCardProps } from "@/components/video/video-poster-card";
import { VideoRelatedGrid } from "@/components/video/video-related-grid";
import { homeInsetClass } from "@/lib/layout";
import { videoTagHref, videoTopicHref } from "@/lib/search/taxonomy-href";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/video/format";
import type {
	ResolvedVideoCastMember,
	ResolvedVideoDetail,
	ResolvedVideoHighlight,
} from "@/types/video";

type ShortFilmDetailViewProps = {
	detail: ResolvedVideoDetail;
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

/** Program-style section header: heading + two-digit entry count marker. */
function SectionHeading({
	children,
	count,
}: {
	children: React.ReactNode;
	count?: number;
}) {
	return (
		<div className="flex items-baseline justify-between gap-4">
			<h2 className="font-heading text-h3 font-bold text-primary-foreground">
				{children}
			</h2>
			{count != null ? (
				<span
					aria-hidden="true"
					dir="ltr"
					className="text-label tabular-nums text-primary-foreground/40"
				>
					{String(count).padStart(2, "0")}
				</span>
			) : null}
		</div>
	);
}

function CastCard({ member }: { member: ResolvedVideoCastMember }) {
	return (
		<div className="flex w-28 shrink-0 flex-col gap-2 sm:w-32">
			<div className="relative aspect-3/4 overflow-hidden border border-primary-foreground/20 bg-primary-foreground/10">
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
			{/* Credits order: role eyebrow first, then the name. */}
			<div>
				{member.role ? (
					<p className="label font-medium text-primary-foreground/50">
						{member.role}
					</p>
				) : null}
				<p
					className={cn(
						"text-small font-medium leading-snug text-primary-foreground",
						member.role && "mt-0.5",
					)}
				>
					{member.name}
				</p>
			</div>
		</div>
	);
}

function HighlightCard({ highlight }: { highlight: ResolvedVideoHighlight }) {
	const content = (
		<>
			<div className="relative aspect-video w-full overflow-hidden border border-primary-foreground/20 bg-primary-foreground/10">
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
	relatedShortFilms = [],
}: ShortFilmDetailViewProps) {
	const t = await getTranslations("Video");

	const durationLabel = formatDuration(detail.durationSeconds);
	const genreLabel = detail.tags[0] ?? detail.topicName ?? "—";
	const directorLabel = detail.director ?? null;
	const producerLabel = detail.producer ?? null;

	const metaRows = [
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
				<div className="relative flex h-14 items-center justify-between gap-4 sm:h-16">
					<BackToIndexLink
						href="/videos/shortfilms"
						label={t("shortfilms.promo.title")}
						ariaLabel={t("shortfilms.detail.back")}
						tone="dark"
					/>

					{/* Centred over the bar from sm up, where the button leaves room
					    on both sides; on phones it simply takes the space the button
					    does not and truncates. */}
					<h1 className="min-w-0 truncate text-end font-heading text-small font-semibold sm:pointer-events-none sm:absolute sm:inset-x-0 sm:px-44 sm:text-center sm:text-body">
						{detail.title}
					</h1>
				</div>
			</header>

			<div
				className={cn(
					homeInsetClass,
					// pb matches the shared section seam: pb + hairline + pt below.
					// 2xl: homeInsetClass's canvas padding lives on this same element,
					// so a max-w here would squeeze the content box — release it and
					// let the padding define the centered 96rem canvas.
					"mx-auto max-w-7xl pt-8 pb-5 sm:pt-10 sm:pb-6 lg:pt-12 2xl:max-w-none",
				)}
			>
				<ScrollReveal className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(17rem,24rem)] lg:gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(19rem,26rem)] xl:gap-10 2xl:grid-cols-[minmax(0,1.1fr)_minmax(19rem,30rem)] 2xl:gap-14">
					<ScrollRevealItem className="min-w-0">
						<VideoPlayerFrame
							playerKind={detail.playerKind}
							playableSrc={detail.playableSrc}
							title={detail.title}
							poster={detail.coverUrl}
							noSourceLabel={t("detail.noSource")}
							variant="cinema"
							surfaceOverlay={
								detail.coverUrl ? (
									<CoverLightbox
										src={detail.coverUrl}
										alt={detail.title}
										caption={detail.title}
										closeLabel={t("detail.lightboxClose")}
										triggerLabel={t("detail.lightboxOpen")}
										// max-w-fit: the trigger's base w-full outranks a w-auto
										// override in the compiled sheet (plain cn, no tw-merge) —
										// cap the width instead.
										className="absolute end-3 top-3 z-10 max-w-fit"
									>
										<span className="inline-flex size-9 items-center justify-center border border-primary-foreground/25 bg-primary text-primary-foreground transition-opacity fine-hover:opacity-90">
											<ArrowsPointingOutIcon
												aria-hidden="true"
												className="size-4"
											/>
										</span>
									</CoverLightbox>
								) : null
							}
							clips={detail.clips}
							activeClipNumber={detail.activeClipNumber}
							sceneLabels={{
								title: t("shortfilms.detail.scenes"),
								play: t("shortfilms.detail.playScene"),
								nowPlaying: t("shortfilms.detail.nowScreening"),
								scene: t("shortfilms.detail.scene"),
							}}
						/>
					</ScrollRevealItem>

					<ScrollRevealItem className="flex min-w-0">
						<aside className="flex w-full flex-col justify-between gap-6 border border-primary-foreground/15 bg-primary-foreground/3 p-5 sm:p-6 lg:sticky lg:top-24 lg:self-start">
							<div className="flex flex-col gap-4">
								{detail.topicName ? (
									detail.topicId != null ? (
										<Link
											href={videoTopicHref(
												detail.topicId,
												"/videos/shortfilms",
											)}
											className="w-fit text-label text-primary-foreground/55 underline decoration-primary-foreground/25 underline-offset-2 transition-colors fine-hover:text-primary-foreground/80 fine-hover:decoration-primary-foreground/50"
										>
											{detail.topicName}
										</Link>
									) : (
										<span className="text-label text-primary-foreground/55">
											{detail.topicName}
										</span>
									)
								) : null}

								<h2 className="font-heading text-h2 font-bold leading-[1.12] text-balance text-primary-foreground xl:text-h1">
									{detail.title}
								</h2>

								{durationLabel && (
									<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-label text-primary-foreground/50">
										{durationLabel ? (
											<span dir="ltr" className="tabular-nums">
												{durationLabel}
											</span>
										) : null}
									</div>
								)}

								{detail.tags.length > 1 ? (
									<div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
										{detail.tags.slice(1, 5).map((tag) => (
											<Link
												key={tag}
												href={videoTagHref(tag, "/videos/shortfilms")}
												className="text-body font-bold text-primary-foreground/80 no-underline transition-opacity fine-hover:opacity-75"
											>
												#{tag}
											</Link>
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

			{/* One shared seam between program sections: space-y + hairline + pt. */}
			<div
				className={cn(
					homeInsetClass,
					// 2xl: release the max-w — see the hero wrapper note above.
					"mx-auto max-w-7xl space-y-5 pb-10 sm:space-y-6 sm:pb-14 2xl:max-w-none",
				)}
			>
				{detail.description ? (
					<ScrollReveal>
						<ScrollRevealItem>
							<section className="border-t border-primary-foreground/20 pt-5 sm:pt-6">
								<RichText
									content={detail.description}
									className="max-w-prose text-body leading-relaxed text-primary-foreground/85 2xl:max-w-[70ch] 2xl:text-[1.0625rem]"
								/>
							</section>
						</ScrollRevealItem>
					</ScrollReveal>
				) : null}

				{detail.cast.length > 0 ? (
					<ScrollReveal>
						<ScrollRevealItem>
							<section className="border-t border-primary-foreground/20 pt-5 sm:pt-6">
								<SectionHeading count={detail.cast.length}>
									{t("shortfilms.detail.cast")}
								</SectionHeading>
								<div className="mt-4 flex gap-4 overflow-x-auto pb-2 sm:mt-5">
									{detail.cast.map((member) => (
										<CastCard key={member.name} member={member} />
									))}
								</div>
							</section>
						</ScrollRevealItem>
					</ScrollReveal>
				) : null}

				{detail.highlights.length > 0 && detail.clips.length <= 1 ? (
					<ScrollReveal>
						<ScrollRevealItem>
							<section className="border-t border-primary-foreground/20 pt-5 sm:pt-6">
								<SectionHeading count={detail.highlights.length}>
									{t("shortfilms.detail.selectedClips")}
								</SectionHeading>
								<div className="mt-4 flex gap-4 overflow-x-auto pb-2 sm:mt-5">
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
							<VideoRelatedGrid
								title={t("shortfilms.detail.related")}
								cards={relatedShortFilms}
								dark
								seamClassName="pt-5 sm:pt-6"
							/>
						</ScrollRevealItem>
					</ScrollReveal>
				) : null}
			</div>
		</article>
	);
}
