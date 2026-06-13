import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { PlayIcon } from "@heroicons/react/24/solid";
import NextImage from "next/image";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";
import { shortFilmDetailHref } from "@/lib/video/resolve";

type VideoCinemaHeroProps = {
	id: number;
	eyebrow: string;
	title: string;
	description: string;
	coverUrl: string | null;
	hoverCoverUrl?: string | null;
	watchNowLabel: string;
	detailsLabel: string;
	href?: string;
};

const watchNowClass =
	"group/cta inline-flex h-12 items-center gap-2 border border-primary-foreground bg-primary-foreground px-7 font-heading text-small font-semibold text-foreground no-underline transition-[gap,box-shadow] duration-300 ease-out fine-hover:gap-2.5 fine-hover:shadow-[0_12px_32px_-14px_rgba(0,0,0,0.35)]";

const detailsClass =
	"inline-flex h-12 items-center gap-2 border border-primary-foreground/40 bg-primary-foreground/10 px-7 font-heading text-small font-semibold text-primary-foreground no-underline backdrop-blur-[2px] transition-colors duration-300 fine-hover:border-primary-foreground/70 fine-hover:bg-primary-foreground/20";

/**
 * Image-led cinematic hero — the one place the Videos area goes dark. The
 * featured still carries the colour behind a direction-agnostic bottom scrim
 * (so it mirrors cleanly in RTL); the page body below stays warm paper.
 */
export function VideoCinemaHero({
	id,
	eyebrow,
	title,
	description,
	coverUrl,
	hoverCoverUrl,
	watchNowLabel,
	detailsLabel,
	href,
}: VideoCinemaHeroProps) {
	const detailHref = href ?? shortFilmDetailHref(id);

	return (
		<section className="group relative min-h-[clamp(32rem,65svh,44rem)] w-full overflow-hidden bg-foreground">
			{coverUrl ? (
				<NextImage
					src={coverUrl}
					alt=""
					fill
					priority
					sizes="100vw"
					className={cn(
						"object-cover object-center",
						hoverCoverUrl &&
							hoverCoverUrl !== coverUrl &&
							"transition-opacity duration-700 group-fine:opacity-0 motion-reduce:transition-none",
					)}
				/>
			) : null}
			{hoverCoverUrl && hoverCoverUrl !== coverUrl ? (
				<NextImage
					src={hoverCoverUrl}
					alt=""
					fill
					priority
					sizes="100vw"
					className="object-cover object-center opacity-0 transition-opacity duration-700 group-fine:opacity-100 motion-reduce:opacity-100"
				/>
			) : null}

			{/* scrims — bottom + overall darken, both direction-agnostic */}
			<div aria-hidden className="absolute inset-0 bg-foreground/30" />
			<div
				aria-hidden
				className="absolute inset-0 bg-linear-to-t from-foreground/92 from-0% via-foreground/45 via-40% to-transparent to-70%"
			/>

			<div className="relative z-10 flex min-h-[inherit] flex-col justify-end p-6 sm:p-10 lg:p-14">
				<div className="max-w-2xl text-start">
					<p className="text-label font-medium text-primary-foreground/70">
						<span aria-hidden="true" className="me-2">
							{"//"}
						</span>
						{eyebrow}
					</p>

					<h1 className="mt-3 font-heading text-display font-bold leading-[1.05] text-balance text-primary-foreground">
						{title}
					</h1>

					{description ? (
						<p className="mt-4 max-w-xl text-body leading-relaxed text-primary-foreground/85 line-clamp-3">
							{description}
						</p>
					) : null}

					<div className="mt-7 flex flex-wrap items-center gap-3">
						<Link href={detailHref} variant="nav" className={watchNowClass}>
							<span>{watchNowLabel}</span>
							<PlayIcon className="size-4" aria-hidden />
						</Link>
						<Link href={detailHref} variant="nav" className={detailsClass}>
							<span>{detailsLabel}</span>
							<DirectionalIcon icon={ChevronRightIcon} className="size-4" />
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
