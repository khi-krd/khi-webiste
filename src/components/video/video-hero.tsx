import NextImage from "next/image";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { Link } from "@/components/ui/link";
import { RichText } from "@/components/ui/rich-text";
import { cn } from "@/lib/utils";

export type VideoHeroStill = {
	src: string;
	href: string;
	title: string;
};

type VideoHeroProps = {
	eyebrow: string;
	title: string;
	titleEmphasis?: string;
	description?: string;
	/** Real cover stills from the catalogue — the hero's only visual. */
	stills?: VideoHeroStill[];
	showEmphasisItalic?: boolean;
};

function HeroStill({
	src,
	href,
	title,
	className,
}: VideoHeroStill & { className?: string }) {
	return (
		<Link
			href={href}
			variant="nav"
			aria-label={title}
			className={cn(
				"group/still relative block overflow-hidden border border-border bg-sunken no-underline",
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
	stills = [],
	showEmphasisItalic = false,
}: VideoHeroProps) {
	const [stillA, stillB, stillC, stillD, stillE] = stills;

	return (
		<header
			className="relative overflow-hidden border-b border-border/60 bg-surface"
		>
			{/* faint top light — the only background event */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-25%,var(--color-sunken)_0%,transparent_60%)] opacity-60"
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background to-transparent"
			/>

			<div className="relative z-1 mx-auto max-w-7xl grid items-center gap-6 px-6 py-8 sm:gap-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-10 lg:py-12">
				<ScrollReveal className="max-w-2xl text-start">
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
							<span className="block font-heading text-[clamp(1.75rem,3.6vw,2.75rem)] font-bold leading-[1.12] text-foreground">
								{title}
							</span>
							{titleEmphasis ? (
								<span
									className={cn(
										"mt-1 block font-heading text-[clamp(1.25rem,2.2vw,1.75rem)] font-medium leading-tight text-muted",
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
								className="mt-3 max-w-lg text-body leading-relaxed text-foreground/80"
							/>
						</ScrollRevealItem>
					) : null}
				</ScrollReveal>

				{stillA ? (
					<ScrollRevealBlock className="hidden w-[26rem] shrink-0 flex-col gap-2 lg:flex xl:w-[30rem]">
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
