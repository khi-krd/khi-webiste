import NextImage from "next/image";
import type { TeamMember } from "@/lib/mock/about";
import { cn } from "@/lib/utils";

type AboutTeamPhotoProps = {
	member: TeamMember;
	name: string;
	role: string;
	className?: string;
};

const imageFilter =
	"object-cover brightness-[0.82] contrast-[1.08] saturate-[0.7]";

export function AboutTeamPhoto({
	member,
	name,
	role,
	className,
}: AboutTeamPhotoProps) {
	const imageAlt = member.image.alt ?? name;

	return (
		<figure className={cn("text-start", className)}>
			<div className="relative aspect-square overflow-hidden border border-border bg-surface">
				<NextImage
					src={member.image.url}
					alt={imageAlt}
					fill
					sizes="(max-width: 640px) 44vw, (max-width: 1024px) 28vw, 20vw"
					className={imageFilter}
				/>
			</div>
			<figcaption className="mt-2 sm:mt-2.5">
				<p className="font-heading text-small font-semibold leading-snug text-foreground sm:text-body">
					{name}
				</p>
				<p className="mt-0.5 text-label leading-normal text-muted">{role}</p>
			</figcaption>
		</figure>
	);
}
