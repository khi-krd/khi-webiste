import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/utils";

type ContainerProps<T extends ElementType> = {
	/** Render as a different element (e.g. "main", "section"). Default "div". */
	as?: T;
	/**
	 * "default" = wide page width; "prose" = narrow reading measure for long-form
	 * text (articles, archive entries) so line length stays comfortable.
	 */
	width?: "default" | "prose";
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/**
 * Centered max-width wrapper with symmetric inline padding. Padding uses `px-*`
 * (padding-inline) so it's direction-agnostic and mirrors safely in RTL.
 */
export function Container<T extends ElementType = "div">({
	as,
	width = "default",
	className,
	...props
}: ContainerProps<T>) {
	const Comp = (as ?? "div") as ElementType;
	return (
		<Comp
			className={cn(
				"mx-auto w-full px-6 sm:px-8",
				width === "prose" ? "max-w-2xl" : "max-w-5xl",
				className,
			)}
			{...props}
		/>
	);
}
