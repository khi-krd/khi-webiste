"use client";

import { useEffect, useState } from "react";
import {
	APP_SCROLL_EVENT,
	type AppScrollDetail,
} from "@/lib/scroll-events";
import { cn } from "@/lib/utils";

/** Always show the bar when within this distance of the document top. */
const AT_TOP_THRESHOLD = 32;

/** Do not hide until the user has scrolled past the hero/header band. */
const HIDE_AFTER_THRESHOLD = 96;

type Props = {
	children: React.ReactNode;
};

/**
 * Fixed header that hides while scrolling down and reappears when the user
 * scrolls up from anywhere on the page (not only at the document top).
 */
export function HeaderShell({ children }: Props) {
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		const onScroll = (event: Event) => {
			const { scroll, direction } = (event as CustomEvent<AppScrollDetail>)
				.detail;

			if (scroll <= AT_TOP_THRESHOLD) {
				setVisible(true);
				return;
			}

			if (direction === -1) {
				setVisible(true);
				return;
			}

			if (direction === 1 && scroll > HIDE_AFTER_THRESHOLD) {
				setVisible(false);
			}
		};

		window.addEventListener(APP_SCROLL_EVENT, onScroll);
		return () => window.removeEventListener(APP_SCROLL_EVENT, onScroll);
	}, []);

	return (
		<header
			className={cn(
				"fixed inset-x-0 top-0 z-50 p-5 transition-transform duration-300 ease-out motion-reduce:transition-none",
				visible
					? "translate-y-0"
					: "pointer-events-none -translate-y-full",
			)}
		>
			{children}
		</header>
	);
}
