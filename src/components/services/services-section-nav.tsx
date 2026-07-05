"use client";

import {
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { LayoutGroup } from "motion/react";
import type { MouseEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useScrollToSection } from "@/components/providers/lenis-context";
import { ServicesNavIndicator } from "@/components/services/services-motion";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { cn } from "@/lib/utils";

type NavItem = {
	id: string;
	title: string;
};

type ServicesSectionNavProps = {
	items: NavItem[];
	navLabel: string;
	className?: string;
};

type ServicesNavDotsProps = {
	items: NavItem[];
	activeId: string;
	onSelect: (event: MouseEvent<HTMLAnchorElement>, id: string) => void;
	className?: string;
};

function ServicesNavDots({
	items,
	activeId,
	onSelect,
	className,
}: ServicesNavDotsProps) {
	return (
		<div className={cn("grid grid-cols-8 gap-1", className)} role="tablist">
			{items.map((item) => {
				const isActive = activeId === item.id;

				return (
					<a
						key={`dot-${item.id}`}
						href={`#${item.id}`}
						role="tab"
						aria-selected={isActive}
						aria-label={item.title}
						onClick={(event) => onSelect(event, item.id)}
						className={cn(
							"flex h-6 items-center justify-center transition-colors duration-300",
							"focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
						)}
					>
						<span
							aria-hidden
							className={cn(
								"h-0.5 w-full max-w-8 transition-[background-color,transform] duration-300 ease-out",
								isActive
									? "scale-x-110 bg-foreground"
									: "bg-border fine-hover:bg-border-strong",
							)}
						/>
						<span className="sr-only">{item.title}</span>
					</a>
				);
			})}
		</div>
	);
}

const navControlClass =
	"inline-flex size-11 shrink-0 items-center justify-center border border-border bg-surface text-foreground transition-colors duration-200 fine-hover:border-border-strong fine-hover:bg-sunken disabled:pointer-events-none disabled:opacity-35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

type ServicesMobileNavProps = {
	items: NavItem[];
	activeId: string;
	navLabel: string;
	onNavigate: (id: string) => void;
	className?: string;
};

function ServicesMobileNav({
	items,
	activeId,
	navLabel,
	onNavigate,
	className,
}: ServicesMobileNavProps) {
	const [expanded, setExpanded] = useState(false);

	const activeIndex = useMemo(
		() =>
			Math.max(
				0,
				items.findIndex((item) => item.id === activeId),
			),
		[items, activeId],
	);

	const activeItem = items[activeIndex] ?? items[0];
	const hasPrev = activeIndex > 0;
	const hasNext = activeIndex < items.length - 1;

	const goPrev = useCallback(() => {
		const prev = items[activeIndex - 1];
		if (prev) onNavigate(prev.id);
	}, [activeIndex, items, onNavigate]);

	const goNext = useCallback(() => {
		const next = items[activeIndex + 1];
		if (next) onNavigate(next.id);
	}, [activeIndex, items, onNavigate]);

	useEffect(() => {
		if (!expanded) return;

		const collapse = () => setExpanded(false);
		window.addEventListener("scroll", collapse, { passive: true });
		return () => window.removeEventListener("scroll", collapse);
	}, [expanded]);

	return (
		<nav
			className={cn(
				"sticky top-26 z-20 border-b border-border bg-background/98 backdrop-blur-[3px] lg:hidden",
				className,
			)}
			aria-label={navLabel}
		>
			<div className="flex items-center gap-2 px-4 py-3 sm:px-6">
				<button
					type="button"
					onClick={goPrev}
					disabled={!hasPrev}
					aria-label={items[activeIndex - 1]?.title}
					className={navControlClass}
				>
					<DirectionalIcon icon={ChevronLeftIcon} className="size-5" />
				</button>

				<button
					type="button"
					onClick={() => setExpanded((open) => !open)}
					aria-expanded={expanded}
					aria-controls="services-mobile-nav-list"
					className={cn(
						"min-w-0 flex-1 px-1 py-0.5 text-center",
						"focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
					)}
				>
					<span className="block text-label font-medium tracking-wide text-muted">
						{activeIndex + 1} / {items.length}
					</span>
					<span className="mt-1 flex items-center justify-center gap-1.5">
						<span className="font-heading text-body font-semibold leading-snug text-balance sm:text-lead">
							{activeItem?.title}
						</span>
						<ChevronDownIcon
							className={cn(
								"size-4 shrink-0 text-muted transition-transform duration-300",
								expanded && "rotate-180",
							)}
							aria-hidden
						/>
					</span>
				</button>

				<button
					type="button"
					onClick={goNext}
					disabled={!hasNext}
					aria-label={items[activeIndex + 1]?.title}
					className={navControlClass}
				>
					<DirectionalIcon icon={ChevronRightIcon} className="size-5" />
				</button>
			</div>

			<div
				className="flex gap-1 px-4 pb-3 sm:px-6"
				role="tablist"
				aria-label={navLabel}
			>
				{items.map((item, index) => {
					const isActive = item.id === activeId;
					const isPassed = index < activeIndex;

					return (
						<button
							key={`progress-${item.id}`}
							type="button"
							role="tab"
							aria-selected={isActive}
							aria-label={item.title}
							onClick={() => onNavigate(item.id)}
							className={cn(
								"flex h-8 flex-1 items-center justify-center",
								"focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
							)}
						>
							<span
								aria-hidden
								className={cn(
									"h-1 w-full transition-colors duration-300",
									isActive
										? "bg-foreground"
										: isPassed
											? "bg-foreground/30"
											: "bg-border",
								)}
							/>
						</button>
					);
				})}
			</div>

			{expanded && (
				<div
					id="services-mobile-nav-list"
					className="max-h-[min(24rem,50dvh)] overflow-y-auto border-t border-border bg-surface"
				>
					<LayoutGroup id="services-mobile-nav">
						<ul className="divide-y divide-border">
							{items.map((item) => {
								const isActive = item.id === activeId;

								return (
									<li key={item.id}>
										<button
											type="button"
											onClick={() => {
												onNavigate(item.id);
												setExpanded(false);
											}}
											aria-current={isActive ? "true" : undefined}
											className={cn(
												"group flex w-full items-center gap-4 px-4 py-3.5 text-start sm:px-6",
												isActive ? "bg-background" : "fine-hover:bg-sunken/60",
												"focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foreground",
											)}
										>
											<ServicesNavIndicator active={isActive} />
											<span
												className={cn(
													"font-heading text-body leading-snug text-balance sm:text-lead",
													isActive
														? "font-semibold text-foreground"
														: "font-medium text-muted",
												)}
											>
												{item.title}
											</span>
										</button>
									</li>
								);
							})}
						</ul>
					</LayoutGroup>
				</div>
			)}
		</nav>
	);
}

export function ServicesSectionNav({
	items,
	navLabel,
	className,
}: ServicesSectionNavProps) {
	const [activeId, setActiveId] = useState(items[0]?.id ?? "");
	const scrollToSection = useScrollToSection();

	useEffect(() => {
		const sections = items
			.map((item) => document.getElementById(item.id))
			.filter((element): element is HTMLElement => element !== null);

		if (sections.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => b.intersectionRatio - a.intersectionRatio);

				if (visible[0]?.target.id) {
					setActiveId(visible[0].target.id);
				}
			},
			{
				rootMargin: "-28% 0px -52% 0px",
				threshold: [0, 0.1, 0.25, 0.5],
			},
		);

		for (const section of sections) {
			observer.observe(section);
		}

		return () => observer.disconnect();
	}, [items]);

	const navigateTo = useCallback(
		(id: string) => {
			setActiveId(id);
			scrollToSection(id);
		},
		[scrollToSection],
	);

	const handleNavClick = useCallback(
		(event: MouseEvent<HTMLAnchorElement>, id: string) => {
			event.preventDefault();
			navigateTo(id);
		},
		[navigateTo],
	);

	return (
		<>
			<ServicesMobileNav
				items={items}
				activeId={activeId}
				navLabel={navLabel}
				onNavigate={navigateTo}
				className={className}
			/>

			<nav className="hidden w-full lg:block" aria-label={navLabel}>
				<LayoutGroup id="services-nav">
					<ul className="flex flex-col gap-2">
						{items.map((item) => {
							const isActive = activeId === item.id;

							return (
								<li key={item.id}>
									<a
										href={`#${item.id}`}
										onClick={(event) => handleNavClick(event, item.id)}
										aria-current={isActive ? "true" : undefined}
										className={cn(
											"group flex items-center gap-5 py-3 text-start",
											"focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
										)}
									>
										<ServicesNavIndicator active={isActive} />
										<span
											className={cn(
												"font-heading text-lead leading-snug text-balance transition-colors duration-300 xl:text-h3",
												isActive
													? "font-semibold text-foreground"
													: "font-medium text-muted group-fine:group-hover:text-foreground",
											)}
										>
											{item.title}
										</span>
									</a>
								</li>
							);
						})}
					</ul>
				</LayoutGroup>

				<div className="mt-10">
					<ServicesNavDots
						items={items}
						activeId={activeId}
						onSelect={handleNavClick}
					/>
				</div>
			</nav>
		</>
	);
}
