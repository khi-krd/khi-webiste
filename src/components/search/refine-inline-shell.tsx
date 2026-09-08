"use client";

import type { ReactNode } from "react";
import { useSearchTransition } from "@/components/search/search-transition";
import { cn } from "@/lib/utils";

/**
 * The collapsible wrapper around the inline (below `lg`) refine panel. The
 * 0fr↔1fr grid-row tween animates height without measuring; `inert` parks
 * the folded controls out of the tab order and the accessibility tree.
 *
 * `overflow-clip` on the inner box (not `overflow-hidden`) is deliberate: a
 * clip does not create a scroll container, so the panel's `sticky bottom-0`
 * footer sticks to the viewport instead of to the panel.
 */
export function RefineInlineShell({ children }: { children: ReactNode }) {
	const transition = useSearchTransition();
	const open = transition?.refineOpen ?? false;

	return (
		<div
			id="search-refine"
			inert={!open}
			className={cn(
				"grid transition-[grid-template-rows,opacity,visibility] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden [&[inert]]:invisible",
				open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
			)}
		>
			<div className="min-h-0 overflow-clip">{children}</div>
		</div>
	);
}
