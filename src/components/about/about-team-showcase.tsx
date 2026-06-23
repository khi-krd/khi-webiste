/* biome-ignore-all lint/a11y/useSemanticElements: carousel slide semantics require role="group". */
"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { AboutSection, AboutShell } from "@/components/about/about-shell";
import { AboutTeamPhoto } from "@/components/about/about-team-photo";
import { SectionRuleHeading } from "@/components/about/section-rule-heading";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import type { OfficeTeam } from "@/lib/mock/about";
import { cn } from "@/lib/utils";

export type TeamMemberWithCopy = OfficeTeam["members"][number] & {
	name: string;
	role: string;
};

type OfficeTeamWithCopy = Omit<OfficeTeam, "members"> & {
	members: TeamMemberWithCopy[];
};

type AboutTeamShowcaseProps = {
	offices: OfficeTeamWithCopy[];
	officeLabels: Record<OfficeTeam["id"], string>;
	sectionLabel: string;
	direction: "ltr" | "rtl";
	className?: string;
};

function TeamGrid({ members }: { members: OfficeTeamWithCopy["members"] }) {
	return (
		<ScrollReveal className="mt-6 grid grid-cols-2 gap-x-2.5 gap-y-7 sm:mt-8 sm:grid-cols-3 sm:gap-x-3 sm:gap-y-8 lg:grid-cols-4 lg:gap-x-3.5 lg:gap-y-9">
			{members.map((member) => (
				<ScrollRevealItem key={member.id}>
					<AboutTeamPhoto
						member={member}
						name={member.name}
						role={member.role}
					/>
				</ScrollRevealItem>
			))}
		</ScrollReveal>
	);
}

export function AboutTeamShowcase({
	offices,
	officeLabels,
	sectionLabel,
	direction,
	className,
}: AboutTeamShowcaseProps) {
	const [emblaRef, emblaApi] = useEmblaCarousel({
		align: "start",
		containScroll: "trimSnaps",
		direction,
		dragFree: false,
		slidesToScroll: 1,
		duration: 25,
	});

	const [selectedIndex, setSelectedIndex] = useState(0);

	const onSelect = useCallback(() => {
		if (!emblaApi) return;
		setSelectedIndex(emblaApi.selectedScrollSnap());
	}, [emblaApi]);

	useEffect(() => {
		if (!emblaApi) return;
		onSelect();
		emblaApi.on("select", onSelect);
		emblaApi.on("reInit", onSelect);
		return () => {
			emblaApi.off("select", onSelect);
			emblaApi.off("reInit", onSelect);
		};
	}, [emblaApi, onSelect]);

	const scrollTo = useCallback(
		(index: number) => {
			emblaApi?.scrollTo(index);
		},
		[emblaApi],
	);

	return (
		<AboutSection bordered className={className} aria-label={sectionLabel}>
			<AboutShell>
				<ScrollRevealBlock>
					<div
						className="touch-pan-y overflow-hidden"
						ref={emblaRef}
						data-lenis-prevent-horizontal
						data-lenis-prevent-touch
					>
						<ul className="flex touch-pan-y">
							{offices.map((office) => (
								<li
									key={office.id}
									role="group"
									aria-roledescription="slide"
									className="min-w-0 shrink-0 grow-0 basis-full"
								>
									<SectionRuleHeading
										id={`team-${office.id}-heading`}
										title={officeLabels[office.id]}
									/>
									<TeamGrid members={office.members} />
								</li>
							))}
						</ul>
					</div>
				</ScrollRevealBlock>

				<div
					className="mt-8 flex justify-center gap-2 sm:mt-9"
					role="tablist"
					aria-label={sectionLabel}
				>
					{offices.map((office, index) => (
						<button
							key={office.id}
							type="button"
							role="tab"
							aria-selected={selectedIndex === index}
							aria-controls={`team-${office.id}-heading`}
							aria-label={officeLabels[office.id]}
							onClick={() => scrollTo(index)}
							className={cn(
								"h-0.5 w-8 shrink-0 transition-colors duration-200 sm:w-10",
								selectedIndex === index ? "bg-foreground" : "bg-border",
								"focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
							)}
						/>
					))}
				</div>
			</AboutShell>
		</AboutSection>
	);
}
