"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const DEFAULT_ROOT_MARGIN = "300px 0px";

type LazyMountProps = {
	children: ReactNode;
	/** Skip lazy mounting and render children immediately. */
	disabled?: boolean;
	fallback?: ReactNode;
	minHeight?: string;
	className?: string;
};

function DefaultFallback({ minHeight }: { minHeight?: string }) {
	return (
		<Skeleton
			className={cn("w-full", minHeight ? undefined : "min-h-48")}
			style={minHeight ? { minHeight } : undefined}
		/>
	);
}

export function LazyMount({
	children,
	disabled = false,
	fallback,
	minHeight,
	className,
}: LazyMountProps) {
	const [mounted, setMounted] = useState(disabled);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (disabled || mounted) return;

		const element = ref.current;
		if (!element) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					setMounted(true);
					observer.disconnect();
				}
			},
			{ rootMargin: DEFAULT_ROOT_MARGIN },
		);

		observer.observe(element);

		return () => observer.disconnect();
	}, [disabled, mounted]);

	if (disabled || mounted) {
		return <>{children}</>;
	}

	return (
		<div ref={ref} className={className}>
			{fallback ?? <DefaultFallback minHeight={minHeight} />}
		</div>
	);
}
