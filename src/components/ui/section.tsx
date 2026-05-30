import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Heading = "h1" | "h2" | "h3";

type SectionProps = {
	/** Optional heading rendered above the content. */
	title?: ReactNode;
	/** Heading level for correct document outline. Default "h2". */
	titleAs?: Heading;
	/** Optional supporting text under the title. */
	description?: ReactNode;
	children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<"section">, "title">;

const headingClass: Record<Heading, string> = {
	h1: "text-h1 font-bold",
	h2: "text-h2 font-semibold",
	h3: "text-h3 font-semibold",
};

/**
 * Vertical-rhythm block. Compose pages from Sections so block spacing stays
 * uniform. `text-start` keeps the header aligned to the reading direction.
 * No letter-spacing here — tracking is unsafe for Arabic (ckb); any Latin-only
 * heading tracking belongs in a :lang(ku)-scoped rule in globals.css.
 */
export function Section({
	title,
	titleAs = "h2",
	description,
	children,
	className,
	...props
}: SectionProps) {
	const Heading = titleAs;
	return (
		<section className={cn("py-12 sm:py-16", className)} {...props}>
			{(title || description) && (
				<header className="mb-8 flex flex-col gap-2 text-start">
					{title && (
						<Heading className={headingClass[titleAs]}>{title}</Heading>
					)}
					{description && (
						<p className="max-w-2xl text-body text-muted">{description}</p>
					)}
				</header>
			)}
			{children}
		</section>
	);
}
