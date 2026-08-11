"use client";

import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useRef } from "react";
import { ImageCollectionCard } from "@/components/home/image-collection-card";
import {
	ScrollReveal,
	ScrollRevealBlock,
	useInViewReveal,
} from "@/components/motion/scroll-reveal";
import { viewAllCtaClass } from "@/components/ui/cta-styles";
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
	HOME_IMAGE_BENTO_TILE_RADIUS_CLASS,
	HOME_IMAGE_BENTO_TRAY_CLASS,
} from "@/lib/home/image-bento";
import type { ImageCollectionItem } from "@/lib/mock/image-collection";

export type ImageCollectionShowcaseCopy = {
	title: string;
	viewAll: string;
};

type ImageCollectionShowcaseProps = {
	items: ImageCollectionItem[];
	copy: ImageCollectionShowcaseCopy;
};

function BentoRevealItem({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);
	useInViewReveal(ref, {
		y: 0,
		scale: 0.985,
		duration: 0.7,
		margin: "-5% 0px -2% 0px",
	});

	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
}

function ImageCollectionBento({ items }: { items: ImageCollectionItem[] }) {
	const tiles = items.slice(0, HOME_IMAGE_BENTO_COUNT);

	return (
		<div className={HOME_IMAGE_BENTO_TRAY_CLASS}>
			<div className={HOME_IMAGE_BENTO_GRID_WRAPPER_CLASS}>
				<ScrollReveal className={HOME_IMAGE_BENTO_GRID_CLASS} stagger={0.02}>
					{tiles.map((item, index) => (
						<BentoRevealItem
							key={item.id}
							className={HOME_IMAGE_BENTO_CELL_CLASS}
						>
							<ImageCollectionCard
								item={item}
								priority={index < 5}
								className={HOME_IMAGE_BENTO_TILE_RADIUS_CLASS}
							/>
						</BentoRevealItem>
					))}
				</ScrollReveal>
			</div>
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
					{/* Title only — the same bare heading the other home sections use. */}
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
						<h2
							id="image-collection-heading"
							className="max-w-2xl font-heading text-h1 font-bold leading-[1.08] text-balance text-start"
						>
							{copy.title}
						</h2>

						<Link href="/gallery" variant="nav" className={viewAllCtaClass}>
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
