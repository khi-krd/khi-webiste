import { AboutSection, AboutShell } from "@/components/about/about-shell";
import { cn } from "@/lib/utils";

type AboutMissionProps = {
	paragraphs: string[];
	className?: string;
};

export function AboutMission({ paragraphs, className }: AboutMissionProps) {
	return (
		<AboutSection
			className={cn("pt-10 pb-8 sm:pt-12 sm:pb-10 lg:pt-14", className)}
		>
			<AboutShell prose>
				<div className="space-y-5 sm:space-y-6">
					{paragraphs.map((text, index) => (
						<p
							key={text.slice(0, 40)}
							className={cn(
								"leading-relaxed",
								index === 0
									? "text-lead text-foreground"
									: "text-body text-foreground/90",
							)}
						>
							{text}
						</p>
					))}
				</div>
			</AboutShell>
		</AboutSection>
	);
}
