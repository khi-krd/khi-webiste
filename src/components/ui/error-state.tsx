import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Heading } from "./heading";

type Level = 1 | 2 | 3 | 4;

type ErrorStateProps = {
	/** Icon slot. Defaults to a warning glyph; pass `null` to omit. */
	icon?: ReactNode;
	title: ReactNode;
	titleLevel?: Level;
	description?: ReactNode;
	/** Optional action slot, e.g. a "retry" <Button> wired by the caller. */
	action?: ReactNode;
	/** Wrap in a border-strong hairline frame (a calm, non-color error cue). */
	framed?: boolean;
	className?: string;
};

/**
 * Friendly error block for error.tsx and failed sections. Server-renderable
 * (no "use client") so it can be used in both server and client trees — e.g.
 * inside the client error boundary.
 *
 * MONOCHROME: there is no red/destructive token, so "error" is signalled by
 * copy, the icon, and an optional border-strong frame — never color. Calm, not
 * alarming. `text-center` + centered column mirror correctly in RTL.
 */
export function ErrorState({
	icon,
	title,
	titleLevel = 2,
	description,
	action,
	framed = false,
	className,
}: ErrorStateProps) {
	const resolvedIcon = icon === undefined ? <ExclamationTriangleIcon /> : icon;

	return (
		<div
			className={cn(
				"mx-auto flex max-w-md flex-col items-center gap-4 text-center",
				framed ? "border border-border-strong p-8 sm:p-10" : "px-6 py-12",
				className,
			)}
		>
			{resolvedIcon && (
				<div className="text-foreground [&_svg]:size-10" aria-hidden>
					{resolvedIcon}
				</div>
			)}
			<Heading level={titleLevel} size="h3">
				{title}
			</Heading>
			{description && <p className="text-body text-muted">{description}</p>}
			{action && <div className="mt-2">{action}</div>}
		</div>
	);
}
