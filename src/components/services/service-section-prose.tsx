import { aboutProseClass } from "@/components/about/about-shell";
import { SectionRuleHeading } from "@/components/about/section-rule-heading";
import { cn } from "@/lib/utils";

type ServiceSectionProseProps = {
	id: string;
	title: string;
	body: string;
	className?: string;
	bodyClassName?: string;
};

export function ServiceSectionProse({
	id,
	title,
	body,
	className,
	bodyClassName,
}: ServiceSectionProseProps) {
	return (
		<div className={className}>
			<SectionRuleHeading id={`${id}-heading`} title={title} />
			<div className={cn(aboutProseClass, "mt-5 sm:mt-6", bodyClassName)}>
				<p className="text-body leading-relaxed text-foreground">{body}</p>
			</div>
		</div>
	);
}
