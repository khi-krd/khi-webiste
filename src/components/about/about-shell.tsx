import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared horizontal rhythm for About — wider shell, tighter edge inset than default Container. */
export const aboutInsetClass =
	"mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10 xl:max-w-7xl xl:px-12";

/** Comfortable reading measure inside the wide shell. */
export const aboutProseClass = "max-w-3xl text-start";

type AboutShellProps = {
	children: ReactNode;
	className?: string;
	/** Wrap children in a narrow reading column. */
	prose?: boolean;
	proseClassName?: string;
};

export function AboutShell({
	children,
	className,
	prose = false,
	proseClassName,
}: AboutShellProps) {
	if (prose) {
		return (
			<div className={cn(aboutInsetClass, className)}>
				<div className={cn(aboutProseClass, proseClassName)}>{children}</div>
			</div>
		);
	}

	return <div className={cn(aboutInsetClass, className)}>{children}</div>;
}

type AboutSectionProps = ComponentPropsWithoutRef<"section"> & {
	bordered?: boolean;
};

export function AboutSection({
	children,
	className,
	bordered = false,
	...props
}: AboutSectionProps) {
	return (
		<section
			className={cn(
				"w-full bg-background",
				bordered && "border-t border-border",
				"py-10 sm:py-14 lg:py-16",
				className,
			)}
			{...props}
		>
			{children}
		</section>
	);
}
