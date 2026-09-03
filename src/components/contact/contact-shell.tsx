import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared with home sections — full-bleed horizontal padding. At 2xl the padding
 * grows so content sits in a centered 96rem canvas while backgrounds/borders on
 * the same element stay full-bleed (calc equals 2rem exactly at 1536px).
 */
export const pageXClass =
	"px-6 sm:px-8 2xl:px-[calc((100vw-var(--canvas))/2+2rem)]";

/** Intro band without its closing rule — see `HomeSection`'s `divider` prop. */
export const homeIntroPlainClass = cn(
	pageXClass,
	"bg-background pt-24 pb-14 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20",
);

export const homeIntroClass = cn(homeIntroPlainClass, "border-b border-border");

export const homeSectionPlainClass = "w-full bg-background";

export const homeSectionClass = cn(
	homeSectionPlainClass,
	"border-t border-border",
);

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
	/**
	 * Hairline rule separating this section from the one above. Contact turns it
	 * off — the sections there are already spaced far enough apart to read as
	 * separate, and the rules cut the page into stripes. Donate keeps them.
	 */
	divider?: boolean;
};

export function HomeSection({
	children,
	className,
	divider = true,
	...props
}: HomeSectionProps) {
	return (
		<section
			className={cn(
				divider ? homeSectionClass : homeSectionPlainClass,
				className,
			)}
			{...props}
		>
			{children}
		</section>
	);
}
