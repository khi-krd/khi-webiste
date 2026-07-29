import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared with home sections — full bleed horizontal padding, no max-width cap. */
export const pageXClass = "px-6 sm:px-8";

export const homeIntroClass = cn(
	pageXClass,
	"border-b border-border bg-background pt-24 pb-14 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20",
);

export const homeSectionClass = "w-full border-t border-border bg-background";

export const homeSectionHeaderClass = cn(
	pageXClass,
	"shrink-0 pt-12 pb-8 sm:pt-16 sm:pb-10 lg:pt-20",
);

export const homeSectionContentClass = cn(
	pageXClass,
	"pb-12 sm:pb-16 lg:pb-20",
);

export type HomeSectionProps = ComponentPropsWithoutRef<"section"> & {
	children: ReactNode;
};

export function HomeSection({
	children,
	className,
	...props
}: HomeSectionProps) {
	return (
		<section className={cn(homeSectionClass, className)} {...props}>
			{children}
		</section>
	);
}
