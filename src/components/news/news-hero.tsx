import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { homeInsetClass } from "@/lib/layout";
import { cn } from "@/lib/utils";

type NewsHeroProps = {
	eyebrow: string;
	title: string;
	description: string;
	className?: string;
};

export function NewsHero({
	eyebrow,
	title,
	description,
	className,
}: NewsHeroProps) {
	return (
		<section
			aria-labelledby="news-hero-heading"
			className={cn(
				"relative w-full overflow-hidden border-b border-border bg-background",
				className,
			)}
		>
			<ScrollRevealBlock
				className={cn(
					homeInsetClass,
					"pt-12 pb-12 sm:pt-16 sm:pb-14 lg:pt-20 lg:pb-16",
				)}
			>
				<header>
					<ScrollReveal className="max-w-3xl text-start">
						<ScrollRevealItem>
							<p className="label font-medium">{eyebrow}</p>
						</ScrollRevealItem>
						<ScrollRevealItem>
							<h1
								id="news-hero-heading"
								className="mt-2 font-heading text-h1 font-bold leading-[1.1] text-balance sm:text-display sm:leading-[1.08]"
							>
								{title}
							</h1>
						</ScrollRevealItem>
						<ScrollRevealItem>
							<p className="mt-3 max-w-2xl text-body text-muted sm:mt-4 sm:text-lead sm:leading-relaxed">
								{description}
							</p>
						</ScrollRevealItem>
					</ScrollReveal>
				</header>
			</ScrollRevealBlock>
		</section>
	);
}
