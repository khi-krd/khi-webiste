import { ArrowRightIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";

type VideoHeroProps = {
	eyebrow: string;
	title: string;
	titleEmphasis?: string;
	description?: string;
	cta: string;
	/** Anchor or route the CTA points at. Defaults to the grid anchor. */
	ctaHref?: string;
	/** Real cover stills from the catalogue — the hero's only visual. */
	covers?: (string | null)[];
	showEmphasisItalic?: boolean;
};

const primaryCtaClass =
	"group/cta relative mt-7 inline-flex h-11 items-center gap-2.5 overflow-hidden bg-primary px-7 font-heading text-small font-semibold text-primary-foreground no-underline transition-[gap,box-shadow] duration-300 ease-out fine-hover:gap-3.5 fine-hover:shadow-[0_12px_32px_-14px_rgba(26,24,19,0.5)]";

function HeroStill({ src, className }: { src: string; className?: string }) {
	return (
		<div
			className={cn(
				"relative overflow-hidden border border-border bg-sunken",
				className,
			)}
		>
			<NextImage
				src={src}
				alt=""
				fill
				priority
				sizes="22rem"
				className="object-cover brightness-[0.95] saturate-[0.9]"
			/>
		</div>
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
	cta,
	ctaHref = "#videos-content",
	covers = [],
	showEmphasisItalic = false,
}: VideoHeroProps) {
	const [stillA, stillB, stillC, stillD, stillE] = covers.filter(
		(cover): cover is string => Boolean(cover),
	);

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

			<div className="relative z-1 mx-auto max-w-7xl grid items-center gap-10 px-6 py-12 sm:px-8 sm:py-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16 lg:py-16">
				<div className="max-w-2xl text-start">
					<p className="label font-medium text-muted">
						<span aria-hidden="true" className="me-2">
							{"//"}
						</span>
						{eyebrow}
					</p>

					<h1 id="video-hero-heading" className="mt-4 text-balance">
						<span className="block font-heading text-[clamp(1.75rem,3.6vw,2.75rem)] font-bold leading-[1.12] text-foreground">
							{title}
						</span>
						{titleEmphasis ? (
							<span
								className={cn(
									"mt-1.5 block font-heading text-[clamp(1.25rem,2.2vw,1.75rem)] font-medium leading-[1.25] text-muted",
									showEmphasisItalic && "italic",
								)}
							>
								{titleEmphasis}
							</span>
						) : null}
					</h1>

					{description ? (
						<p className="mt-5 max-w-lg text-body leading-relaxed text-foreground/80">
							{description}
						</p>
					) : null}

					<Link href={ctaHref} variant="nav" className={primaryCtaClass}>
						<span className="relative z-1">{cta}</span>
						<DirectionalIcon
							icon={ArrowRightIcon}
							className="relative z-1 size-4"
						/>
					</Link>
				</div>

				{/* still shelf — staggered 16:9 frames, hairline mats, no effects */}
				{stillA ? (
					<div
						aria-hidden
						className="hidden w-[26rem] shrink-0 flex-col gap-3 lg:flex xl:w-[30rem]"
					>
						<div className="flex gap-3">
							<HeroStill src={stillA} className="aspect-video flex-[1.6]" />
							{stillB ? (
								<HeroStill src={stillB} className="aspect-square flex-1" />
							) : null}
						</div>
						<div className="flex gap-3">
							{stillC ? (
								<HeroStill
									src={stillC}
									className="aspect-[2.4/1] flex-[1.4]"
								/>
							) : null}
							{stillD ? (
								<HeroStill src={stillD} className="aspect-square flex-1" />
							) : null}
						</div>
						{stillE ? (
							<HeroStill
								src={stillE}
								className="aspect-[2.4/1] w-2/3 self-end"
							/>
						) : null}
					</div>
				) : null}
			</div>

			{/* mobile film strip — catalogue stills scroll horizontally */}
			{stillA ? (
				<div
					aria-hidden
					className="relative z-1 flex gap-2 overflow-x-auto border-t border-border/60 px-6 py-4 sm:px-8 lg:hidden"
				>
					{[stillA, stillB, stillC, stillD, stillE]
						.filter((still): still is string => Boolean(still))
						.map((still) => (
							<HeroStill
								key={still}
								src={still}
								className="aspect-video w-44 shrink-0 sm:w-52"
							/>
						))}
				</div>
			) : null}
		</header>
	);
}
