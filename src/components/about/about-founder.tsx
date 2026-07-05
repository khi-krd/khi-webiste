import { AboutSection, AboutShell } from "@/components/about/about-shell";
import { ScrollRevealBlock } from "@/components/motion/scroll-reveal";
import { Image } from "@/components/ui/image";
import type { FounderPerson } from "@/lib/mock/about";

type AboutFounderProps = {
	person: FounderPerson;
	name: string;
	role1: string;
	role2: string;
	className?: string;
};

export function AboutFounder({
	person,
	name,
	role1,
	role2,
	className,
}: AboutFounderProps) {
	return (
		<AboutSection bordered data-snap-section className={className}>
			<AboutShell className="lg:grid lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:items-start lg:gap-12 xl:gap-16">
				<ScrollRevealBlock>
					<Image
						src={person.image.url}
						alt={person.image.alt ?? name}
						aspectRatio="square"
						framed
						sizes="(max-width: 1024px) 88vw, 42vw"
						imageClassName="brightness-[0.85] contrast-[1.1] saturate-[0.72]"
						className="w-full max-w-xs sm:max-w-sm lg:max-w-none"
					/>
				</ScrollRevealBlock>

				<ScrollRevealBlock
					className="mt-8 text-start sm:mt-10 lg:mt-0 lg:pt-1"
					delay={0.1}
				>
					<h2 className="font-heading text-h1 font-bold leading-[1.1] text-balance sm:text-[2.5rem] sm:leading-[1.08]">
						{name}
					</h2>
					<div className="mt-5 h-px w-12 bg-border" aria-hidden />
					<p className="mt-5 text-body font-medium leading-relaxed">{role1}</p>
					<p className="mt-3 max-w-xl text-body leading-relaxed text-muted">
						{role2}
					</p>
				</ScrollRevealBlock>
			</AboutShell>
		</AboutSection>
	);
}
