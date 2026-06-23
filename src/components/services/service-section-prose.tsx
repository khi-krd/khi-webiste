import { aboutProseClass } from "@/components/about/about-shell";
import { SectionRuleHeading } from "@/components/about/section-rule-heading";
import { RichText } from "@/components/ui/rich-text";
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
			<RichText
				content={body}
				className={cn(aboutProseClass, "mt-5 sm:mt-6", bodyClassName)}
			/>
		</div>
	);
}
