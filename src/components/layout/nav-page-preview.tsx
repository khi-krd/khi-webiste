"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { getPathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type NavPagePreviewProps = {
	/** Locale-relative route, same shape as NavItem.href (e.g. "/news"). */
	href: string;
	/** Used as the iframe's accessible title only — the card itself is aria-hidden. */
	label: string;
	/** Section's existing menu photo — shown until the live preview finishes loading. */
	fallbackSrc: string;
};

// Rendered at a fixed desktop width, then shrunk with a CSS transform to fit
// the card — a real render of the page, not a pre-baked screenshot. Keep the
// ratio in sync with the `aspect-[8/5]` class below.
const PREVIEW_VIEWPORT_WIDTH = 1600;
const PREVIEW_VIEWPORT_HEIGHT = 1000;

function usePreviewScale() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState(0);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		const update = () => setScale(el.offsetWidth / PREVIEW_VIEWPORT_WIDTH);
		update();

		const observer = new ResizeObserver(update);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return [containerRef, scale] as const;
}

/**
 * Live thumbnail of the destination page: a same-origin iframe rendered at
 * full desktop width and shrunk to fit, framed like a tiny browser window so
 * it reads as a page preview rather than a stray screenshot. Crossfades in
 * over the section's own menu photo (`fallbackSrc`), so there is never a
 * blank gap while the real page loads.
 *
 * `allow-scripts` stays on: without it the target page's own entrance
 * animations (initial opacity 0 → animate) never resolve and the preview
 * renders blank. `allow-same-origin` (no top-navigation/forms/popups) keeps
 * the frame from doing anything besides painting itself. This only works
 * because the site's own CSP allows same-origin framing.
 */
export function NavPagePreview({
	href,
	label,
	fallbackSrc,
}: NavPagePreviewProps) {
	const locale = useLocale();
	const reduceMotion = useReducedMotion();
	const [containerRef, scale] = usePreviewScale();
	const [loaded, setLoaded] = useState(false);
	const previewHref = getPathname({ locale, href });

	return (
		<div
			aria-hidden="true"
			className="relative isolate mb-5 overflow-hidden rounded-xl border border-primary-foreground/15 bg-foreground/60 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.65)]"
		>
			<div
				dir="ltr"
				className="relative z-10 flex items-center gap-1.5 border-b border-primary-foreground/10 bg-foreground/70 px-3 py-2"
			>
				<span className="size-2 rounded-full bg-primary-foreground/25" />
				<span className="size-2 rounded-full bg-primary-foreground/25" />
				<span className="size-2 rounded-full bg-primary-foreground/25" />
				<span className="ms-1.5 min-w-0 truncate rounded-full bg-primary-foreground/10 px-2.5 py-0.5 text-[0.65rem] leading-relaxed text-primary-foreground/55">
					{previewHref}
				</span>
			</div>

			<div
				ref={containerRef}
				className="relative aspect-[8/5] w-full overflow-hidden bg-foreground/40"
			>
				<motion.div
					className="absolute inset-0"
					animate={{ opacity: loaded ? 0 : 1 }}
					transition={{ duration: reduceMotion ? 0 : 0.4 }}
				>
					<Image
						src={fallbackSrc}
						alt=""
						fill
						sizes="(min-width: 1024px) 32rem, 100vw"
						className="object-cover"
					/>
				</motion.div>

				{scale > 0 && (
					<iframe
						key={previewHref}
						src={previewHref}
						title={label}
						tabIndex={-1}
						inert
						sandbox="allow-scripts allow-same-origin"
						allow="autoplay 'none'"
						onLoad={() => setLoaded(true)}
						style={{
							width: PREVIEW_VIEWPORT_WIDTH,
							height: PREVIEW_VIEWPORT_HEIGHT,
							transform: `scale(${scale})`,
							transformOrigin: "top left",
						}}
						className={cn(
							"pointer-events-none absolute left-0 top-0 border-0 transition-opacity duration-500",
							loaded ? "opacity-100" : "opacity-0",
						)}
					/>
				)}
			</div>
		</div>
	);
}
