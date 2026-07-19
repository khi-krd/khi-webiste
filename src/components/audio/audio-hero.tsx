import NextImage from "next/image";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { Link } from "@/components/ui/link";
import { RichText } from "@/components/ui/rich-text";
import { audioDetailHref } from "@/lib/audio/resolve";
import { cn } from "@/lib/utils";

export type AudioHeroCover = {
	id: number;
	coverUrl: string;
	title: string;
};

type AudioHeroProps = {
	eyebrow: string;
	title: string;
	titleEmphasis?: string;
	description?: string;
	/** Real cover art from the catalogue — the hero's only visual. */
	covers?: AudioHeroCover[];
	showEmphasisItalic?: boolean;
};

function HeroCover({
	cover,
	sizeClass,
}: {
	cover: AudioHeroCover;
	sizeClass: string;
}) {
	return (
		<Link
			href={audioDetailHref(cover.id)}
			variant="nav"
			aria-label={cover.title}
			className={cn(
				"group/cover relative shrink-0 overflow-hidden border border-border bg-sunken no-underline transition-[border-color,box-shadow] duration-300 fine-hover:border-foreground/30 fine-hover:shadow-[0_12px_28px_-16px_rgba(26,24,19,0.45)]",
				sizeClass,
			)}
		>
			<NextImage
				src={cover.coverUrl}
				alt=""
				fill
				priority
				sizes="14rem"
				className="object-cover brightness-[0.96] saturate-[0.92] transition-[filter,transform] duration-500 ease-out group-fine/cover:scale-[1.04] group-fine/cover:brightness-100 group-fine/cover:saturate-100"
			/>
		</Link>
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
	covers = [],
	showEmphasisItalic = false,
}: AudioHeroProps) {
	const [coverA, coverB, coverC] = covers;

	return (
		<header
			className="relative overflow-hidden border-b border-border bg-surface"
		>
			{/* faint top light — the only background event */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-25%,var(--color-sunken)_0%,transparent_60%)] opacity-60"
			/>

			<div className="relative z-1 grid items-center gap-10 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16 lg:px-14 lg:py-14">
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
					</ScrollRevealItem>

					{description ? (
						<ScrollRevealItem>
							<RichText
								content={description}
								className="mt-5 max-w-lg text-body leading-relaxed text-foreground/80"
							/>
						</ScrollRevealItem>
					) : null}
				</ScrollReveal>

				{coverA ? (
					<ScrollRevealBlock className="hidden items-end gap-3 lg:flex lg:gap-4">
						{coverB ? (
							<HeroCover cover={coverB} sizeClass="size-28 xl:size-32" />
						) : null}
						<HeroCover cover={coverA} sizeClass="size-44 xl:size-52" />
						{coverC ? (
							<HeroCover cover={coverC} sizeClass="size-24 xl:size-28" />
						) : null}
					</ScrollRevealBlock>
				) : null}
			</div>
		</header>
	);
}
