import NextImage from "next/image";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { WRITINGS_STILL } from "@/lib/mock/public-stills";
import { cn } from "@/lib/utils";

type WritingHeroProps = {
	eyebrow: string;
	title: string;
	titleEmphasis?: string;
	/** Optional soft texture — one image only, heavily diffused. */
	textureUrl?: string | null;
	showEmphasisItalic?: boolean;
};

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
	textureUrl = WRITINGS_STILL,
	showEmphasisItalic = false,
}: WritingHeroProps) {
	return (
		<header
			aria-labelledby="writings-hero-heading"
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
				</ScrollReveal>
			</div>
		</header>
	);
}
