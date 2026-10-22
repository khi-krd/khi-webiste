import NextImage from "next/image";
import {
	galleryPhotoSurfaceClass,
	galleryStripTrayClass,
} from "@/components/gallery/gallery-album-item";
import {
	ScrollReveal,
	ScrollRevealItem,
} from "@/components/motion/scroll-reveal";
import { Link } from "@/components/ui/link";
import { audioDetailHref } from "@/lib/audio/resolve";
import { cn } from "@/lib/utils";

export type AudioStripCover = {
	id: number;
	coverUrl: string;
	title: string;
};

type AudioCoverStripProps = {
	covers: AudioStripCover[];
	className?: string;
};

/** Same slice easing the gallery strips use — long, decelerating. */
const sliceEase = "ease-[cubic-bezier(0.22,1,0.36,1)]";

/**
 * Deterministic shuffle. Rendered on the server, so `Math.random()` would
 * hydrate-mismatch: order comes from a stable hash of each record's id
 * instead, which reshuffles when the catalogue changes but never between
 * a render and its hydration.
 */
function shuffleByIdHash<T extends { id: number }>(items: T[]): T[] {
	return [...items]
		.map((item) => {
			// xorshift-ish mix — enough dispersion for sequential ids.
			let hash = (item.id ^ 0x9e3779b9) >>> 0;
			hash ^= hash << 13;
			hash >>>= 0;
			hash ^= hash >> 17;
			hash ^= hash << 5;
			hash >>>= 0;
			return { item, hash };
		})
		.sort((a, b) => a.hash - b.hash)
		.map((entry) => entry.item);
}

/**
 * Slices past a breakpoint's budget are hidden, never squeezed to a sliver.
 * The budgets stay low on purpose: a record sleeve is square art with a title
 * on it, so a slat narrower than roughly half its height crops the name away
 * before the hover ever opens it.
 */
function visibilityClass(index: number): string {
	if (index < 3) return "block";
	if (index < 4) return "hidden sm:block";
	if (index < 5) return "hidden lg:block";
	return "hidden xl:block";
}

/**
 * Wordless header for the archive: real cover art laid out on one horizontal
 * axis, shuffled, each slice stretching open on hover exactly like the
 * gallery collection strips.
 */
export function AudioCoverStrip({ covers, className }: AudioCoverStripProps) {
	const slices = shuffleByIdHash(covers).slice(0, 6);

	if (slices.length === 0) {
		return null;
	}

	return (
		<ScrollReveal
			className={cn(
				galleryStripTrayClass,
				"flex h-60 gap-1 overflow-hidden sm:h-72 lg:h-[24rem]",
				className,
			)}
		>
			{slices.map((cover, index) => (
				<ScrollRevealItem
					key={cover.id}
					className={cn(
						"relative grow basis-0 overflow-hidden transition-[flex-grow] duration-600 fine-hover:grow-[2.6]",
						galleryPhotoSurfaceClass,
						sliceEase,
						visibilityClass(index),
					)}
				>
					<Link
						href={audioDetailHref(cover.id)}
						variant="nav"
						aria-label={cover.title}
						className="group/slice absolute inset-0 block no-underline"
					>
						<NextImage
							src={cover.coverUrl}
							alt=""
							fill
							priority={index < 3}
							sizes="(max-width: 640px) 34vw, (max-width: 1024px) 25vw, 20vw"
							className={cn(
								"object-cover brightness-[0.96] saturate-[0.88] transition-[filter,scale] duration-700 group-fine/slice:scale-105 group-fine/slice:brightness-100 group-fine/slice:saturate-100",
								sliceEase,
							)}
						/>
					</Link>
				</ScrollRevealItem>
			))}
		</ScrollReveal>
	);
}
