"use client";

import { ArrowRightIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline";
import NextImage from "next/image";
import {
	type FocusEvent,
	type PointerEvent,
	useCallback,
	useEffect,
	useState,
} from "react";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import type { ImageCollectionItem } from "@/lib/mock/image-collection";
import { cn } from "@/lib/utils";

const AUTO_ADVANCE_MS = 5000;

const panelEase = "ease-[cubic-bezier(0.22,1,0.36,1)]";

const viewAllClass =
	"group/viewall relative inline-flex h-10 w-fit shrink-0 items-center gap-2.5 overflow-hidden border border-foreground px-5 font-heading text-small font-semibold text-foreground no-underline transition-[color,gap,box-shadow] duration-300 ease-out before:absolute before:inset-0 before:z-0 before:origin-bottom before:scale-y-0 before:bg-foreground before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)] fine-hover:gap-3.5 fine-hover:text-primary-foreground fine-hover:shadow-[0_8px_24px_-12px_rgba(26,24,19,0.35)] fine-hover:before:scale-y-100 motion-reduce:before:transition-none motion-reduce:fine-hover:before:scale-y-100 motion-reduce:fine-hover:gap-2.5";

export type ImageCollectionShowcaseCopy = {
	eyebrow: string;
	title: string;
	description: string;
	viewAll: string;
};

type ImageCollectionShowcaseProps = {
	items: ImageCollectionItem[];
	copy: ImageCollectionShowcaseCopy;
};

type ImageCollectionPanelProps = {
	item: ImageCollectionItem;
	displayNumber: number;
	isFocused: boolean;
	isAutoActive: boolean;
	onHover: () => void;
	onLeavePanel: (event: PointerEvent<HTMLAnchorElement> | FocusEvent) => void;
};

function ImageCollectionPanel({
	item,
	displayNumber,
	isFocused,
	isAutoActive,
	onHover,
	onLeavePanel,
}: ImageCollectionPanelProps) {
	const href = `/gallery/${item.slug}`;

	return (
		<Link
			href={href}
			variant="nav"
			role="group"
			aria-roledescription="slide"
			aria-current={isAutoActive ? "true" : undefined}
			onMouseEnter={onHover}
			onPointerLeave={onLeavePanel}
			onFocus={onHover}
			onBlur={onLeavePanel}
			className={cn(
				"group relative h-full min-h-0 min-w-0 overflow-hidden bg-background no-underline",
				"transition-[flex-grow,flex-basis] duration-700 motion-reduce:transition-none",
				panelEase,
				isFocused ? "flex-[2]" : "flex-1",
				"max-lg:flex-none max-lg:min-h-32",
				isFocused && "max-lg:min-h-80 sm:max-lg:min-h-[26rem]",
			)}
		>
			<div className="absolute inset-0">
				<NextImage
					src={item.image.url}
					alt={item.image.alt ?? item.title}
					fill
					sizes="(max-width: 1024px) 100vw, 55vw"
					className={cn(
						"object-cover object-center transition-opacity duration-700 motion-reduce:transition-none",
						panelEase,
						isFocused ? "opacity-100" : "opacity-0",
					)}
					priority={isFocused}
				/>
			</div>

			<div
				className={cn(
					"pointer-events-none absolute inset-x-0 bottom-0 z-1 h-28 bg-linear-to-t from-foreground/65 from-0% via-foreground/25 via-55% to-transparent sm:h-32",
					"transition-opacity duration-700 motion-reduce:transition-none",
					panelEase,
					isFocused ? "opacity-100" : "opacity-0",
				)}
				aria-hidden
			/>

			<span
				className={cn(
					"pointer-events-none absolute inset-0 z-2 flex items-center justify-center select-none font-heading font-extralight leading-none tabular-nums text-foreground/90",
					"text-[clamp(4rem,14vw,11rem)] transition-opacity duration-700 motion-reduce:transition-none",
					panelEase,
					isFocused ? "opacity-0" : "opacity-100",
				)}
				aria-hidden
			>
				{displayNumber}
			</span>

			<div
				className={cn(
					"absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-5 sm:p-6",
					"transition-colors duration-500 motion-reduce:transition-none",
					isFocused ? "text-white" : "text-foreground",
				)}
			>
				<div className="min-w-0 text-start">
					<h3
						className={cn(
							"font-heading text-h3 font-bold leading-snug text-balance",
							"transition-[text-decoration-color] duration-300",
							"group-fine:underline group-fine:decoration-white/35 group-fine:underline-offset-4",
							!isFocused &&
								"group-fine:decoration-foreground/35 motion-reduce:group-fine:no-underline",
						)}
					>
						{item.title}
					</h3>
					<p
						className={cn(
							"mt-1 text-small transition-colors duration-500 motion-reduce:transition-none",
							isFocused ? "text-white/80" : "text-muted",
							!isFocused && "group-fine:text-foreground/80",
						)}
					>
						{item.subtitle}
					</p>
				</div>

				<ArrowUpRightIcon
					className={cn(
						"size-5 shrink-0 stroke-[1.25] transition-colors duration-500 motion-reduce:transition-none",
						isFocused ? "text-white" : "text-foreground",
					)}
					aria-hidden
				/>
			</div>
		</Link>
	);
}

export function ImageCollectionShowcase({
	items,
	copy,
}: ImageCollectionShowcaseProps) {
	const [activeIndex, setActiveIndex] = useState(0);
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	const focusedIndex = hoveredIndex ?? activeIndex;

	const handlePanelLeave = useCallback(
		(event: PointerEvent<HTMLAnchorElement> | FocusEvent) => {
			const related = event.relatedTarget;
			const parent = event.currentTarget.parentElement;
			if (
				!related ||
				!(related instanceof Node) ||
				!parent?.contains(related)
			) {
				setHoveredIndex(null);
			}
		},
		[],
	);

	const advance = useCallback(() => {
		setActiveIndex((index) => (index + 1) % items.length);
	}, [items.length]);

	useEffect(() => {
		if (hoveredIndex !== null || items.length <= 1) return;

		const media = window.matchMedia("(prefers-reduced-motion: reduce)");
		if (media.matches) return;

		const id = window.setInterval(advance, AUTO_ADVANCE_MS);
		return () => window.clearInterval(id);
	}, [advance, hoveredIndex, items.length]);

	return (
		<div>
			<header className="shrink-0 px-6 pt-12 pb-8 sm:px-8 sm:pt-16 sm:pb-10 lg:pt-20">
				<div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
					<div className="max-w-2xl text-start">
						<p className="label font-medium">{copy.eyebrow}</p>
						<h2
							id="image-collection-heading"
							className="mt-2 font-heading text-h1 font-bold leading-[1.1] text-balance"
						>
							{copy.title}
						</h2>
						<p className="mt-3 text-body text-muted">{copy.description}</p>
					</div>

					<Link href="/gallery" variant="nav" className={viewAllClass}>
						<span className="relative z-1">{copy.viewAll}</span>
						<DirectionalIcon
							icon={ArrowRightIcon}
							className="relative z-1 size-4"
						/>
					</Link>
				</div>
			</header>

			<div className="px-6 sm:px-8">
				<div
					className="flex flex-col items-stretch gap-4 sm:gap-5 lg:h-[min(82vh,52rem)] lg:flex-row lg:gap-px lg:bg-border"
					aria-live="polite"
				>
					{items.map((item, index) => (
						<ImageCollectionPanel
							key={item.id}
							item={item}
							displayNumber={index + 1}
							isFocused={index === focusedIndex}
							isAutoActive={index === activeIndex}
							onHover={() => setHoveredIndex(index)}
							onLeavePanel={handlePanelLeave}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
