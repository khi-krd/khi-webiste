import { AboutSection, AboutShell } from "@/components/about/about-shell";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { RichText } from "@/components/ui/rich-text";
import { cn } from "@/lib/utils";

type AboutMissionProps = {
	paragraphs?: string[];
	body?: string;
	className?: string;
};

export function AboutMission({
	paragraphs,
	body,
	className,
}: AboutMissionProps) {
	return (
		<AboutSection
			className={cn("pt-10 pb-8 sm:pt-12 sm:pb-10 lg:pt-14", className)}
		>
			<AboutShell prose>
				{body ? (
					<ScrollReveal>
						<ScrollRevealItem>
							<RichText content={body} />
						</ScrollRevealItem>
					</ScrollReveal>
				) : (
					<ScrollReveal className="flex flex-col gap-5 sm:gap-6">
						{(paragraphs ?? []).map((text, index) => (
							<ScrollRevealItem key={text.slice(0, 40)}>
								<p
									className={cn(
										"leading-relaxed",
										index === 0
											? "text-lead text-foreground"
											: "text-body text-foreground/90",
									)}
								>
									{text}
								</p>
							</ScrollRevealItem>
						))}
					</ScrollReveal>
				)}
			</AboutShell>
		</AboutSection>
	);
}
