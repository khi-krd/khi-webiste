"use client";

import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { ImageCollectionCard } from "@/components/home/image-collection-card";
import {
	PAGE_TRANSITION_DELAY,
	ScrollRevealBlock,
} from "@/components/motion/scroll-reveal";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import {
	HOME_IMAGE_BENTO_BODY_CLASS,
	HOME_IMAGE_BENTO_CELL_CLASS,
	HOME_IMAGE_BENTO_COUNT,
	HOME_IMAGE_BENTO_GRID_CLASS,
	HOME_IMAGE_BENTO_GRID_WRAPPER_CLASS,
	HOME_IMAGE_BENTO_HEADER_CLASS,
	HOME_IMAGE_BENTO_SECTION_CLASS,
	HOME_IMAGE_BENTO_TRAY_CLASS,
} from "@/lib/home/image-bento";
import type { ImageCollectionItem } from "@/lib/mock/image-collection";

const revealEase = [0.22, 1, 0.36, 1] as const;
const viewport = { once: true, margin: "-5% 0px -2% 0px" } as const;

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

type BentoRevealItemProps = {
	children: ReactNode;
	className?: string;
	index: number;
};

function BentoRevealItem({ children, className, index }: BentoRevealItemProps) {
	const reduceMotion = useReducedMotion();

	if (reduceMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			className={className}
			variants={{
				hidden: { opacity: 0, scale: 0.97 },
				visible: {
					opacity: 1,
					scale: 1,
					transition: {
						duration: 0.45,
						ease: revealEase,
						delay: index * 0.02,
					},
				},
			}}
		>
			{children}
		</motion.div>
	);
}

function ImageCollectionBento({ items }: { items: ImageCollectionItem[] }) {
	const reduceMotion = useReducedMotion();
	const tiles = items.slice(0, HOME_IMAGE_BENTO_COUNT);

	const grid = (
		<>
			{tiles.map((item, index) => (
				<BentoRevealItem
					key={item.id}
					index={index}
					className={HOME_IMAGE_BENTO_CELL_CLASS}
				>
					<ImageCollectionCard item={item} priority={index < 4} />
				</BentoRevealItem>
			))}
		</>
	);

	const gridInner = reduceMotion ? (
		<div className={HOME_IMAGE_BENTO_GRID_CLASS}>{grid}</div>
	) : (
		<motion.div
			className={HOME_IMAGE_BENTO_GRID_CLASS}
			initial="hidden"
			whileInView="visible"
			viewport={viewport}
			variants={{
				hidden: {},
				visible: {
					transition: {
						staggerChildren: 0.02,
						delayChildren: PAGE_TRANSITION_DELAY,
					},
				},
			}}
		>
			{grid}
		</motion.div>
	);

	return (
		<div className={HOME_IMAGE_BENTO_TRAY_CLASS}>
			<div className={HOME_IMAGE_BENTO_GRID_WRAPPER_CLASS}>{gridInner}</div>
		</div>
	);
}

export function ImageCollectionShowcase({
	items,
	copy,
}: ImageCollectionShowcaseProps) {
	if (items.length === 0) {
		return null;
	}

	return (
		<div className={HOME_IMAGE_BENTO_SECTION_CLASS}>
			<ScrollRevealBlock className={HOME_IMAGE_BENTO_HEADER_CLASS}>
				<header>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
						<div className="max-w-2xl text-start">
							<p className="label font-medium">{copy.eyebrow}</p>
							<h2
								id="image-collection-heading"
								className="mt-1.5 font-heading text-h1 font-bold leading-[1.08] text-balance sm:mt-2"
							>
								{copy.title}
							</h2>
							<p className="mt-2 line-clamp-2 text-body text-muted lg:line-clamp-1">
								{copy.description}
							</p>
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
			</ScrollRevealBlock>

			<div className={HOME_IMAGE_BENTO_BODY_CLASS}>
				<ImageCollectionBento items={items} />
			</div>
		</div>
	);
}
