import { ArrowDownIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { WRITINGS_STILL } from "@/lib/mock/public-stills";
import { cn } from "@/lib/utils";

type WritingHeroProps = {
	eyebrow: string;
	title: string;
	titleEmphasis?: string;
	cta: string;
	learnMore: string;
	/** Optional soft texture — one image only, heavily diffused. */
	textureUrl?: string | null;
	showEmphasisItalic?: boolean;
};

const primaryCtaClass =
	"group/cta relative mt-6 inline-flex h-11 items-center gap-2.5 overflow-hidden bg-primary px-7 font-heading text-small font-semibold text-primary-foreground no-underline transition-[gap,box-shadow] duration-300 ease-out fine-hover:gap-3.5 fine-hover:shadow-[0_12px_32px_-14px_rgba(26,24,19,0.5)]";

const learnMoreClass =
	"mt-3 inline-flex items-center gap-1.5 text-small text-muted no-underline transition-colors duration-200 fine-hover:text-foreground";

function WritingHeroBackground({ textureUrl }: { textureUrl?: string | null }) {
	return (
		<div
			aria-hidden
			className="pointer-events-none absolute inset-0 isolate overflow-hidden"
		>
			{/* Base paper wash */}
			<div className="absolute inset-0 bg-linear-to-b from-sunken/45 via-surface via-45% to-surface" />

			{/* Single diffused texture — no rotated collage */}
			{textureUrl ? (
				<div className="absolute inset-0 flex items-center justify-center opacity-100">
					<div className="relative h-[140%] w-[140%] max-w-none">
						<NextImage
							src={textureUrl}
							alt=""
							fill
							priority
							sizes="100vw"
							className="scale-105 object-cover opacity-[0.14] blur-3xl saturate-[0.45] brightness-[1.08]"
						/>
					</div>
				</div>
			) : null}

			{/* Soft top light */}
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_-20%,var(--color-sunken)_0%,transparent_58%)] opacity-70" />

			{/* Gentle vignette — keeps focus on centre copy */}
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_72%_at_50%_42%,transparent_0%,var(--color-surface)_78%)]" />

			{/* Bottom edge depth */}
			<div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-border/25 to-transparent" />
		</div>
	);
}

export function WritingHero({
	eyebrow,
	title,
	titleEmphasis,
	cta,
	learnMore,
	textureUrl = WRITINGS_STILL,
	showEmphasisItalic = false,
}: WritingHeroProps) {
	return (
		<header
			aria-labelledby="writings-hero-heading"
			data-snap-section
			className="relative overflow-hidden border-b border-border"
		>
			<WritingHeroBackground textureUrl={textureUrl} />

			<div className="relative z-1 px-6 pt-5 pb-8 text-center sm:px-10 sm:pt-6 sm:pb-9 lg:px-14 lg:pt-7 lg:pb-10">
				<ScrollReveal className="mx-auto max-w-4xl">
					<ScrollRevealItem>
						<p className="label font-medium text-muted">
							<span aria-hidden="true" className="me-2">
								{"//"}
							</span>
							{eyebrow}
						</p>
					</ScrollRevealItem>

					<ScrollRevealItem>
						<h1
							id="writings-hero-heading"
							className="mx-auto mt-3 max-w-4xl text-balance"
						>
							<span className="block font-heading text-[clamp(1.5rem,3.2vw,2.25rem)] font-medium leading-[1.2] text-foreground/80">
								{title}
							</span>
							{titleEmphasis ? (
								<span
									className={cn(
										"mt-2 block font-heading text-[clamp(1.875rem,4.8vw,3.25rem)] font-bold leading-[1.08] tracking-[-0.02em] text-foreground",
										showEmphasisItalic && "font-semibold italic",
									)}
								>
									{titleEmphasis}
								</span>
							) : null}
						</h1>
					</ScrollRevealItem>

					<ScrollRevealItem>
						<div className="mt-2 flex flex-col items-center">
							<Link
								href="#writings-content"
								variant="nav"
								className={primaryCtaClass}
							>
								<span className="relative z-1">{cta}</span>
								<DirectionalIcon
									icon={ArrowRightIcon}
									className="relative z-1 size-4"
								/>
							</Link>
							<Link
								href="#writings-content"
								variant="nav"
								className={learnMoreClass}
							>
								{learnMore}
								<ArrowDownIcon className="size-3.5" aria-hidden />
							</Link>
						</div>
					</ScrollRevealItem>
				</ScrollReveal>
			</div>
		</header>
	);
}
