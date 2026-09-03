import { homeIntroPlainClass } from "@/components/contact/contact-shell";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { cn } from "@/lib/utils";

type ContactHeroProps = {
	title: string;
	className?: string;
};

/**
 * One word, set large. The eyebrow and the tagline that used to sandwich it
 * repeated the page title in three scripts and said nothing the heading did not.
 */
export function ContactHero({ title, className }: ContactHeroProps) {
	return (
		<section
			className={cn(homeIntroPlainClass, className)}
			aria-labelledby="contact-hero-heading"
		>
			<ScrollReveal className="mx-auto max-w-5xl text-center">
				<ScrollRevealItem>
					{/* Fluid rather than a fixed step: one short word centered on an
					    empty band wants to be far larger than the --text-display
					    ramp, but must still fit a 320px screen. */}
					<h2
						id="contact-hero-heading"
						className="font-heading text-[clamp(3.25rem,11vw,7.5rem)] font-bold leading-[1.0] text-balance text-foreground"
					>
						{title}
					</h2>
				</ScrollRevealItem>
			</ScrollReveal>
		</section>
	);
}
