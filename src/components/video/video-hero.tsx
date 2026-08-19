import { ArrowRightIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { viewAllCtaClass } from "@/components/ui/cta-styles";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { RichText } from "@/components/ui/rich-text";
import { VideoHoverPreview } from "@/components/video/video-hover-preview";
import { cn } from "@/lib/utils";

export type VideoHeroStill = {
	src: string;
	href: string;
	title: string;
	/** Hover-to-play preview — only ever set on the lead still. */
	previewSrc?: string | null;
	/** Timecode chip — only ever set on the lead still. */
	durationLabel?: string | null;
};

type VideoHeroProps = {
	eyebrow: string;
	title: string;
	titleEmphasis?: string;
	description?: string;
	/** Browse CTA into the catalogue (`#videos-content`). */
	ctaLabel?: string;
	/** Real cover stills from the catalogue — the hero's only visual. */
	stills?: VideoHeroStill[];
	showEmphasisItalic?: boolean;
};

function HeroStill({
	src,
	href,
	title,
	previewSrc = null,
	durationLabel = null,
	className,
}: VideoHeroStill & { className?: string }) {
	return (
		<Link
			href={href}
			variant="nav"
			aria-label={title}
			data-preview-host
			className={cn(
				"group group/still relative block overflow-hidden border border-border bg-sunken no-underline",
				className,
			)}
		>
			<NextImage
				src={src}
				alt=""
				fill
				priority
				sizes="22rem"
				className="object-cover brightness-[0.95] saturate-[0.9] transition-[filter,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-fine/still:scale-[1.03] group-fine/still:brightness-100 motion-reduce:transition-none motion-reduce:group-fine/still:scale-100"
			/>
			{/* The lead still literally demonstrates "moving image" on first
			    pointer contact — zero rest cost, coarse pointers never arm it. */}
			{previewSrc ? <VideoHoverPreview src={previewSrc} /> : null}
			{durationLabel ? (
				<span
					dir="ltr"
					className="label absolute bottom-0 end-0 z-2 inline-flex items-center border-s border-t border-border bg-surface/95 px-2 py-1 font-medium text-foreground tabular-nums backdrop-blur-[1px] transition-colors duration-300 group-fine:border-foreground group-fine:bg-foreground group-fine:text-primary-foreground group-focus-visible:border-foreground group-focus-visible:bg-foreground group-focus-visible:text-primary-foreground"
				>
					{durationLabel}
				</span>
			) : null}
		</Link>
	);
}

/**
 * Landscape, still-forward hero: editorial text at the inline start, a staggered
 * shelf of 16:9 film stills at the end. The stills carry the color; the shell
 * stays paper. Distinct from the Audio hero's square record covers.
 */
export function VideoHero({
	eyebrow,
	title,
	titleEmphasis,
	description,
	ctaLabel,
	stills = [],
	showEmphasisItalic = false,
}: VideoHeroProps) {
	const [stillA, stillB, stillC, stillD, stillE] = stills;

	return (
		<header className="relative overflow-hidden border-b border-border/60 bg-surface">
			{/* faint top light — the only background event */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-25%,var(--color-sunken)_0%,transparent_60%)] opacity-60"
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background to-transparent"
			/>

			{/* 96rem at 2xl matches the homeInsetClass canvas, so the hero's
			    content edges line up with the sections below at ultra-wide. */}
			<div className="relative z-1 mx-auto max-w-7xl grid items-center gap-6 px-6 py-8 sm:gap-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-10 lg:py-12 2xl:max-w-[96rem]">
				<ScrollReveal className="max-w-2xl text-start 2xl:max-w-3xl">
					<ScrollRevealItem>
						<p className="label font-medium text-muted">
							<span aria-hidden="true" className="me-2">
								{"//"}
							</span>
							{eyebrow}
						</p>
					</ScrollRevealItem>

					<ScrollRevealItem>
						<h1 id="video-hero-heading" className="mt-3 text-balance">
							<span className="block font-heading text-[clamp(1.75rem,3.6vw,2.75rem)] font-bold leading-[1.12] text-foreground 2xl:text-[3.25rem]">
								{title}
							</span>
							{titleEmphasis ? (
								<span
									className={cn(
										"mt-1 block font-heading text-[clamp(1.25rem,2.2vw,1.75rem)] font-medium leading-tight text-muted 2xl:text-[2rem]",
										showEmphasisItalic && "italic",
									)}
								>
									{titleEmphasis}
								</span>
							) : null}
						</h1>
					</ScrollRevealItem>

					{description ? (
						<ScrollRevealItem>
							<RichText
								content={description}
								className="prose-ragged mt-3 max-w-lg text-body leading-relaxed text-foreground/80"
							/>
						</ScrollRevealItem>
					) : null}

					{ctaLabel ? (
						<ScrollRevealItem>
							<div className="mt-6">
								<a href="#videos-content" className={viewAllCtaClass}>
									<span className="relative z-1">{ctaLabel}</span>
									<DirectionalIcon
										icon={ArrowRightIcon}
										className="relative z-1 size-4 shrink-0"
									/>
								</a>
							</div>
						</ScrollRevealItem>
					) : null}
				</ScrollReveal>

				{stillA ? (
					<ScrollRevealBlock className="hidden w-[26rem] shrink-0 flex-col gap-2 lg:flex xl:w-[30rem] 2xl:w-[34rem]">
						<div className="flex gap-2">
							<HeroStill {...stillA} className="aspect-video flex-[1.6]" />
							{stillB ? (
								<HeroStill {...stillB} className="aspect-square flex-1" />
							) : null}
						</div>
						<div className="flex gap-2">
							{stillC ? (
								<HeroStill {...stillC} className="aspect-[2.4/1] flex-[1.4]" />
							) : null}
							{stillD ? (
								<HeroStill {...stillD} className="aspect-square flex-1" />
							) : null}
						</div>
						{stillE ? (
							<HeroStill
								{...stillE}
								className="aspect-[2.4/1] w-2/3 self-end"
							/>
						) : null}
					</ScrollRevealBlock>
				) : null}
			</div>

			{/* mobile film strip — catalogue stills scroll horizontally */}
			{stillA ? (
				<div className="relative z-1 flex gap-2 overflow-x-auto border-t border-border/60 px-6 py-3 sm:px-8 lg:hidden">
					{[stillA, stillB, stillC, stillD, stillE]
						.filter((still): still is VideoHeroStill => Boolean(still))
						.map((still) => (
							<HeroStill
								key={`${still.href}-${still.src}`}
								{...still}
								className="aspect-video w-40 shrink-0 sm:w-48"
							/>
						))}
				</div>
			) : null}
		</header>
	);
}
