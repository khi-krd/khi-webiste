import { AboutSection, AboutShell } from "@/components/about/about-shell";
import { AboutTeamPhoto } from "@/components/about/about-team-photo";
import { SectionRuleHeading } from "@/components/about/section-rule-heading";
import {
	ScrollReveal,
	ScrollRevealBlock,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import type { OfficeTeam } from "@/lib/mock/about";

import type { ResolvedManager } from "@/lib/about/resolve";

export type TeamMemberWithCopy = OfficeTeam["members"][number] & {
	name: string;
	role: string;
	bio?: string;
	officeLabel?: string;
};

type ManagerWithCopy = ResolvedManager & {
	name: string;
	role: string;
	bio?: string;
	officeLabel?: string;
};

type OfficeTeamWithCopy = Omit<OfficeTeam, "members"> & {
	members: TeamMemberWithCopy[];
};

type AboutTeamShowcaseProps = {
	offices: OfficeTeamWithCopy[];
	officeLabels: Record<OfficeTeam["id"], string>;
	managers?: ManagerWithCopy[];
	managersLabel?: string;
	className?: string;
};

function TeamGrid({ members }: { members: TeamMemberWithCopy[] }) {
	return (
		<ScrollReveal className="mt-6 grid grid-cols-2 gap-x-2.5 gap-y-7 sm:mt-8 sm:grid-cols-3 sm:gap-x-3 sm:gap-y-8 lg:grid-cols-4 lg:gap-x-3.5 lg:gap-y-9">
			{members.map((member) => (
				<ScrollRevealItem key={member.id}>
					<AboutTeamPhoto
						member={member}
						name={member.name}
						role={member.role}
						bio={member.bio}
						officeLabel={member.officeLabel}
					/>
				</ScrollRevealItem>
			))}
		</ScrollReveal>
	);
}

export function AboutTeamShowcase({
	offices,
	officeLabels,
	managers = [],
	managersLabel,
	className,
}: AboutTeamShowcaseProps) {
	return (
		<AboutSection bordered className={className}>
			<AboutShell>
				<ScrollRevealBlock className="flex flex-col gap-12 sm:gap-14 lg:gap-16">
					{managers.length > 0 ? (
						<section aria-labelledby="team-managers-heading">
							<SectionRuleHeading
								id="team-managers-heading"
								title={managersLabel ?? ""}
							/>
							<TeamGrid members={managers} />
						</section>
					) : null}
					{offices.map((office) => (
						<section
							key={office.id}
							aria-labelledby={`team-${office.id}-heading`}
						>
							<SectionRuleHeading
								id={`team-${office.id}-heading`}
								title={officeLabels[office.id]}
							/>
							<TeamGrid members={office.members} />
						</section>
					))}
				</ScrollRevealBlock>
			</AboutShell>
		</AboutSection>
	);
}
