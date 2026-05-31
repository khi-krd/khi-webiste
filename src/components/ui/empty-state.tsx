import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Heading } from "./heading";

type Level = 1 | 2 | 3 | 4;

type EmptyStateProps = {
	/** Optional icon slot (rendered muted, centered). */
	icon?: ReactNode;
	title: ReactNode;
	/** Heading level for the title (outline); visual size stays restrained. */
	titleLevel?: Level;
	description?: ReactNode;
	/** Optional action slot (e.g. a "clear filters" <Button>). */
	children?: ReactNode;
	className?: string;
};

/**
 * Quiet "no results / empty collection" block. Server component. Centered with
 * generous whitespace; `text-center` + centered column mirror cleanly in RTL.
 * Filter logic is never hardcoded — pass any action as children.
 */
export function EmptyState({
	icon,
	title,
	titleLevel = 2,
	description,
	children,
	className,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-16 text-center",
				className,
			)}
		>
			{icon && (
				<div className="text-muted [&_svg]:size-10" aria-hidden>
					{icon}
				</div>
			)}
			<Heading level={titleLevel} size="h3">
				{title}
			</Heading>
			{description && <p className="text-body text-muted">{description}</p>}
			{children && <div className="mt-2">{children}</div>}
		</div>
	);
}
