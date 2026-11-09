"use client";

import { type RefObject, useEffect, useState } from "react";

/** Tracks an element's content-box width so geometry can react to the
 * section's own size instead of the viewport (the donate page nests these
 * playlists in a centered column, not full width). */
export function useContainerWidth(ref: RefObject<HTMLElement | null>) {
	const [width, setWidth] = useState(0);

	useEffect(() => {
		const el = ref.current;
		if (!el) return undefined;
		const observer = new ResizeObserver(([entry]) => {
			if (entry) setWidth(entry.contentRect.width);
		});
		observer.observe(el);
		setWidth(el.getBoundingClientRect().width);
		return () => observer.disconnect();
	}, [ref]);

	return width;
}
