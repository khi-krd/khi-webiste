import type { ReactNode } from "react";
import { LazyMount } from "@/components/dev/lazy-mount";
import { cn } from "@/lib/utils";

const blockClass = "scroll-mt-28 py-10 sm:py-12";

type PlaygroundShellProps = {
	id: string;
	title: string;
	description?: string;
	children: ReactNode;
	/** Defer mounting showcase content until near the viewport. Default true. */
	lazy?: boolean;
	lazyMinHeight?: string;
	className?: string;
};

function PlaygroundContent({
	children,
	lazy = true,
	lazyMinHeight,
	fullBleed = false,
}: {
	children: ReactNode;
	lazy?: boolean;
	lazyMinHeight?: string;
	fullBleed?: boolean;
}) {
	const content = fullBleed ? (
		<div className="overflow-hidden border border-border">{children}</div>
	) : (
		children
	);

	return (
		<LazyMount disabled={!lazy} minHeight={lazyMinHeight}>
			{content}
		</LazyMount>
	);
}

type PlaygroundBlockProps = PlaygroundShellProps & {
	/** Full-bleed section previews without inner padding on the content wrapper. */
	fullBleed?: boolean;
};

export function PlaygroundBlock({
	id,
	title,
	description,
	children,
	fullBleed = false,
	lazy = true,
	lazyMinHeight,
	className,
}: PlaygroundBlockProps) {
	return (
		<div id={id} className={cn(blockClass, className)}>
			<header className="mb-8 flex flex-col gap-2 text-start">
				<h3 className="text-h3 font-semibold">{title}</h3>
				{description ? (
					<p className="max-w-2xl text-body text-muted">{description}</p>
				) : null}
			</header>
			<PlaygroundContent
				lazy={lazy}
				lazyMinHeight={lazyMinHeight}
				fullBleed={fullBleed}
			>
				{children}
			</PlaygroundContent>
		</div>
	);
}

export function PlaygroundSection({
	id,
	title,
	description,
	children,
	lazy = true,
	lazyMinHeight,
	className,
}: PlaygroundShellProps) {
	return (
		<section id={id} className={cn(blockClass, className)}>
			<header className="mb-8 flex flex-col gap-2 text-start">
				<h3 className="text-h3 font-semibold">{title}</h3>
				{description ? (
					<p className="max-w-2xl text-body text-muted">{description}</p>
				) : null}
			</header>
			<PlaygroundContent lazy={lazy} lazyMinHeight={lazyMinHeight}>
				{children}
			</PlaygroundContent>
		</section>
	);
}

export function GroupHeading({ children }: { children: ReactNode }) {
	return <h2 className="label mt-16 mb-2 first:mt-0">{children}</h2>;
}

export function ShowcaseCard({
	title,
	children,
	className,
}: {
	title: string;
	children: ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("bg-surface p-5 sm:p-6", className)}>
			<p className="mb-4 text-small font-semibold tracking-wide text-muted">
				{title}
			</p>
			{children}
		</div>
	);
}
