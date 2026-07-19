import { homeIntroClass } from "@/components/contact/contact-shell";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { cn } from "@/lib/utils";

type ContactHeroProps = {
	label: string;
	title: string;
	tagline: string;
	className?: string;
};

export function ContactHero({
	label,
	title,
	tagline,
	className,
}: ContactHeroProps) {
	return (
		<section
			className={cn(homeIntroClass, className)}
			aria-labelledby="contact-hero-heading"
		>
			<ScrollReveal className="max-w-3xl text-start">
				<ScrollRevealItem>
					<p className="label font-medium">{label}</p>
				</ScrollRevealItem>

				<ScrollRevealItem>
					<h2
						id="contact-hero-heading"
						className="mt-4 font-heading text-display font-bold leading-[1.02] text-balance text-foreground sm:mt-5"
					>
						{title}
					</h2>
				</ScrollRevealItem>

				<ScrollRevealItem>
					<p className="label mt-6 font-medium text-muted sm:mt-8">{tagline}</p>
				</ScrollRevealItem>
			</ScrollReveal>
		</section>
	);
}
