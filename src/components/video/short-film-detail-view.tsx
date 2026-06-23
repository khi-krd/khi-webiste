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
import { cn } from "@/lib/utils";
import { formatDuration, formatPublishmentDate } from "@/lib/video/format";
import type {
	ResolvedVideoCastMember,
	ResolvedVideoDetail,
	ResolvedVideoHighlight,
} from "@/types/video";

type ShortFilmDetailViewProps = {
	detail: ResolvedVideoDetail;
	locale: string;
	relatedShortFilms?: VideoPosterCardProps[];
};

function MetaStat({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex flex-col gap-1">
			<dt className="text-label text-primary-foreground/60">{label}</dt>
			<dd className="text-small font-medium text-primary-foreground">
				{value}
			</dd>
		</div>
	);
}

function CastCard({ member }: { member: ResolvedVideoCastMember }) {
	return (
		<div className="flex w-28 shrink-0 flex-col gap-2 sm:w-32">
			<div className="relative aspect-[3/4] overflow-hidden border border-primary-foreground/20 bg-primary-foreground/10">
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
	const directorLabel = detail.director ?? "—";

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
			/>

			<div className={cn(homeInsetClass, "py-10 sm:py-14")}>
				<ScrollReveal className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16">
					<ScrollRevealItem>
						<div>
							<h2 className="font-heading text-h3 font-bold">
								{t("shortfilms.detail.description")}
							</h2>
							{detail.description ? (
								<RichText
									content={detail.description}
									className="mt-4 text-body leading-relaxed text-primary-foreground/85"
								/>
							) : null}

							<dl className="mt-8 grid grid-cols-2 gap-6 border-t border-primary-foreground/20 pt-8 sm:grid-cols-4">
								{durationLabel ? (
									<MetaStat
										label={t("shortfilms.detail.duration")}
										value={durationLabel}
									/>
								) : null}
								{releaseDateLabel ? (
									<MetaStat
										label={t("shortfilms.detail.releaseDate")}
										value={releaseDateLabel}
									/>
								) : null}
								<MetaStat
									label={t("shortfilms.detail.genre")}
									value={genreLabel}
								/>
								<MetaStat
									label={t("shortfilms.detail.director")}
									value={directorLabel}
								/>
							</dl>
						</div>
					</ScrollRevealItem>

					{detail.cast.length > 0 ? (
						<ScrollRevealItem>
							<div>
								<h2 className="font-heading text-h3 font-bold">
									{t("shortfilms.detail.cast")}
								</h2>
								<div className="mt-5 flex gap-4 overflow-x-auto pb-2">
									{detail.cast.map((member) => (
										<CastCard key={member.name} member={member} />
									))}
								</div>
							</div>
						</ScrollRevealItem>
					) : null}
				</ScrollReveal>

				{detail.highlights.length > 0 ? (
					<ScrollReveal>
						<ScrollRevealItem>
							<section className="mt-12 border-t border-primary-foreground/20 pt-12 sm:mt-16">
								<h2 className="font-heading text-h3 font-bold">
									{t("shortfilms.detail.selectedClips")}
								</h2>
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
								<h2 className="font-heading text-h3 font-bold">
									{t("shortfilms.detail.related")}
								</h2>
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
