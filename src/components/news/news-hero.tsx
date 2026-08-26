import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { homeInsetClass } from "@/lib/layout";
import { cn } from "@/lib/utils";

type NewsHeroProps = {
	title: string;
	className?: string;
};

export function NewsHero({ title, className }: NewsHeroProps) {
	return (
		<section
			aria-labelledby="news-hero-heading"
			className={cn(
				"relative w-full overflow-hidden bg-background",
				className,
			)}
		>
			<ScrollRevealBlock
				className={cn(
					homeInsetClass,
					"pt-12 pb-10 sm:pt-16 sm:pb-12 lg:pt-20 lg:pb-14",
				)}
			>
				<header>
					<ScrollReveal className="max-w-3xl text-start">
						<ScrollRevealItem>
							<h1
								id="news-hero-heading"
								className="font-heading text-h1 font-bold leading-[1.1] text-balance sm:text-display sm:leading-[1.08]"
							>
								{title}
							</h1>
						</ScrollRevealItem>
					</ScrollReveal>
				</header>
			</ScrollRevealBlock>
		</section>
	);
}
