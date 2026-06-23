import Image from "next/image";
import { FeaturedSlideContent } from "@/components/hero/featured-slide-content";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/types/content";

type FeaturedSlideHeight = "viewport" | "playground";

const heightClass: Record<FeaturedSlideHeight, string> = {
	viewport: "h-svh",
	playground: "h-112 sm:h-144",
};

type FeaturedSlideProps = {
	slide: HeroSlide;
	isPriority?: boolean;
	height?: FeaturedSlideHeight;
	className?: string;
};

export function FeaturedSlide({
	slide,
	isPriority = false,
	height = "viewport",
	className,
}: FeaturedSlideProps) {
	const imageAlt = slide.image.alt ?? slide.title;

	return (
		<Link
			href={slide.href}
			aria-label={`${slide.actionLabel}: ${slide.title}`}
			className={cn(
				"group relative block w-full overflow-hidden",
				heightClass[height],
				className,
			)}
		>
			<div className="absolute inset-0 isolate">
				<div className="absolute inset-0 [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_img]:brightness-[0.72] [&_img]:contrast-[1.15] [&_img]:saturate-[0.55]">
					<Image
						src={slide.image.url}
						alt={imageAlt}
						fill
						sizes="100vw"
						priority={isPriority}
						placeholder={slide.image.blurDataURL ? "blur" : "empty"}
						blurDataURL={slide.image.blurDataURL}
						className="object-cover"
					/>
				</div>

				{/* Ink wash + legibility scrims (stacked; strongest at bottom + text side). */}
				<div
					className="pointer-events-none absolute inset-0 z-1 bg-black/25"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute inset-0 z-1 bg-linear-to-t from-black/75 from-0% via-black/45 via-32% to-transparent to-72%"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute inset-x-0 top-0 z-1 h-44 bg-linear-to-b from-black/50 via-black/20 to-transparent sm:h-52"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute inset-0 z-1 bg-linear-to-r from-black/45 from-0% via-black/20 via-42% to-transparent to-80% rtl:bg-linear-to-l"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute inset-0 z-1 bg-[radial-gradient(ellipse_130%_90%_at_50%_115%,#000_0%,transparent_62%)] opacity-40"
					aria-hidden
				/>
			</div>

			<div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-14 sm:px-10 sm:pb-16 lg:px-14 lg:pb-20">
				<FeaturedSlideContent
					typeLabel={slide.typeLabel}
					title={slide.title}
					description={slide.description}
					actionLabel={slide.actionLabel}
				/>
			</div>
		</Link>
	);
}
