import { AboutSection, AboutShell } from "@/components/about/about-shell";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { RichText } from "@/components/ui/rich-text";
import { cn } from "@/lib/utils";

const missionTextClass = cn(
	// No width cap: the block fills the AboutShell container so its start
	// edge sits on the same line as the founder section below (the image's
	// edge in RTL), instead of floating in a narrower centered column.
	"text-start text-pretty",
	"text-body text-foreground",
	"[&>p:first-child]:text-lead",
	"[&>p+p]:mt-6 sm:[&>p+p]:mt-7",
	// The i18n-fallback branch renders bare <p>s outside `.prose`, so the
	// global justification rule cannot reach them.
	"[&>p]:text-justify",
);

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
			<AboutShell>
				<ScrollReveal>
					<ScrollRevealItem>
						{body ? (
							<RichText content={body} className={missionTextClass} />
						) : (
							<div className={missionTextClass}>
								{(paragraphs ?? []).map((text, index) => (
									<p
										key={text.slice(0, 40)}
										className={cn(
											index > 0 && "mt-6 sm:mt-7",
											index === 0 ? "text-lead" : "text-body",
										)}
									>
										{text}
									</p>
								))}
							</div>
						)}
					</ScrollRevealItem>
				</ScrollReveal>
			</AboutShell>
		</AboutSection>
	);
}
