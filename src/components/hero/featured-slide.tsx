import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/types/content";

type FeaturedSlideProps = {
	slide: HeroSlide;
	isPriority?: boolean;
	className?: string;
};

export function FeaturedSlide({
	slide,
	isPriority = false,
	className,
}: FeaturedSlideProps) {
	const imageAlt = slide.image.alt ?? slide.title;

	return (
		<Link
			href={slide.href}
			aria-label={`${slide.actionLabel}: ${slide.title}`}
			className={cn(
				"group relative block h-svh w-full overflow-hidden",
				className,
			)}
		>
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

			<div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/85 via-black/45 to-black/10" />
			<div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-linear-to-b from-black/70 to-transparent" />

			<div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-12 sm:px-10 sm:pb-16">
				<div className="max-w-3xl border border-white/20 bg-black/35 p-5 text-start text-white backdrop-blur-sm sm:p-6">
					<p className="label text-white/85">{slide.typeLabel}</p>

					<h2 className="mt-3 text-display font-semibold">{slide.title}</h2>

					<p className="mt-4 max-w-2xl text-body text-white/90 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden">
						{slide.description}
					</p>

					<p className="mt-6 inline-flex items-center gap-2 border-b border-white/40 pb-1 text-body font-semibold text-white">
						<span>{slide.actionLabel}</span>
						<DirectionalIcon
							icon={ChevronRightIcon}
							className="size-5 shrink-0"
						/>
					</p>
				</div>
			</div>
		</Link>
	);
}
