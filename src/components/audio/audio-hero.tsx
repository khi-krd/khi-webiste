import { ArrowRightIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";

type AudioHeroProps = {
	eyebrow: string;
	title: string;
	titleEmphasis?: string;
	description?: string;
	cta: string;
	/** Real cover art from the catalogue — the hero's only visual. */
	covers?: (string | null)[];
	showEmphasisItalic?: boolean;
};

const primaryCtaClass =
	"group/cta relative mt-7 inline-flex h-11 items-center gap-2.5 overflow-hidden bg-primary px-7 font-heading text-small font-semibold text-primary-foreground no-underline transition-[gap,box-shadow] duration-300 ease-out fine-hover:gap-3.5 fine-hover:shadow-[0_12px_32px_-14px_rgba(26,24,19,0.5)]";

function HeroCover({ src, sizeClass }: { src: string; sizeClass: string }) {
	return (
		<div
			className={cn(
				"relative shrink-0 overflow-hidden border border-border bg-sunken",
				sizeClass,
			)}
		>
			<NextImage
				src={src}
				alt=""
				fill
				priority
				sizes="14rem"
				className="object-cover brightness-[0.96] saturate-[0.92]"
			/>
		</div>
	);
}

/**
 * Quiet, cover-forward hero: editorial text at the inline start, a small
 * shelf of real record covers at the end. The covers carry all the color —
 * the shell stays paper.
 */
export function AudioHero({
	eyebrow,
	title,
	titleEmphasis,
	description,
	cta,
	covers = [],
	showEmphasisItalic = false,
}: AudioHeroProps) {
	const [coverA, coverB, coverC] = covers.filter((cover): cover is string =>
		Boolean(cover),
	);

	return (
		<header className="relative overflow-hidden border-b border-border bg-surface">
			{/* faint top light — the only background event */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-25%,var(--color-sunken)_0%,transparent_60%)] opacity-60"
			/>

			<div className="relative z-1 grid items-center gap-10 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16 lg:px-14 lg:py-14">
				<div className="max-w-2xl text-start">
					<p className="label font-medium text-muted">
						<span aria-hidden="true" className="me-2">
							{"//"}
						</span>
						{eyebrow}
					</p>

					<h1 id="audio-hero-heading" className="mt-4 text-balance">
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

					<Link href="#audio-content" variant="nav" className={primaryCtaClass}>
						<span className="relative z-1">{cta}</span>
						<DirectionalIcon
							icon={ArrowRightIcon}
							className="relative z-1 size-4"
						/>
					</Link>
				</div>

				{/* record shelf — staggered heights, hairline frames, no effects */}
				{coverA ? (
					<div aria-hidden className="hidden items-end gap-3 lg:flex lg:gap-4">
						{coverB ? (
							<HeroCover src={coverB} sizeClass="size-28 xl:size-32" />
						) : null}
						<HeroCover src={coverA} sizeClass="size-44 xl:size-52" />
						{coverC ? (
							<HeroCover src={coverC} sizeClass="size-24 xl:size-28" />
						) : null}
					</div>
				) : null}
			</div>
		</header>
	);
}
