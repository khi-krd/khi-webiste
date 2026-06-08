import { cn } from "@/lib/utils";

type SectionRuleHeadingProps = {
	title: string;
	id?: string;
	className?: string;
};

export function SectionRuleHeading({
	title,
	id,
	className,
}: SectionRuleHeadingProps) {
	return (
		<div
			className={cn("flex items-center gap-3 text-start sm:gap-4", className)}
		>
			<span
				className="h-px w-8 shrink-0 bg-border sm:w-12 lg:w-16"
				aria-hidden
			/>
			<h2
				id={id}
				className="font-heading text-h2 font-bold leading-[1.12] text-balance sm:text-[1.875rem]"
			>
				{title}
			</h2>
		</div>
	);
}
