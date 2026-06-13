import { PlayIcon } from "@heroicons/react/24/solid";
import NextImage from "next/image";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";
import { videoDetailHref } from "@/lib/video/resolve";

export type VideoPosterCardProps = {
	id: number;
	title: string;
	subtitle?: string | null;
	coverUrl: string | null;
	durationLabel?: string | null;
	/** 0–1 watched fraction → renders a Continue-Watching progress bar. */
	progress?: number | null;
	showPlay?: boolean;
	href?: string;
	dark?: boolean;
	className?: string;
};

export function VideoPosterCard({
	id,
	title,
	subtitle,
	coverUrl,
	durationLabel,
	progress,
	showPlay = false,
	href,
	dark = false,
	className,
}: VideoPosterCardProps) {
	const progressPct =
		progress != null
			? Math.max(0, Math.min(100, Math.round(progress * 100)))
			: null;
	const detailHref = href ?? videoDetailHref(id);

	return (
		<Link
			href={detailHref}
			variant="nav"
			aria-label={title}
			className={cn(
				"group relative block w-full overflow-hidden no-underline",
				dark ? "border border-primary-foreground/20" : "border border-border bg-sunken",
				className,
			)}
		>
			<div className="relative aspect-[2/3] w-full overflow-hidden">
				{coverUrl ? (
					<NextImage
						src={coverUrl}
						alt=""
						fill
						sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 13rem"
						className="object-cover brightness-[0.92] transition-[filter,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-fine:scale-[1.05] group-fine:brightness-100 motion-reduce:transition-none motion-reduce:duration-0 motion-reduce:group-fine:scale-100"
					/>
				) : (
					<div
						aria-hidden
						className="flex h-full w-full items-center justify-center bg-sunken"
					>
						<span className="font-heading text-h1 font-bold text-foreground/10">
							{title.charAt(0)}
						</span>
					</div>
				)}

				<div
					aria-hidden
					className="pointer-events-none absolute inset-0 bg-linear-to-t from-foreground/85 from-0% via-foreground/15 via-42% to-transparent to-68%"
				/>

				{durationLabel ? (
					<span
						dir="ltr"
						className={cn(
							"label absolute top-0 end-0 z-2 border-b border-s px-2 py-1 font-medium tabular-nums backdrop-blur-[1px]",
							dark
								? "border-primary-foreground/20 bg-foreground/70 text-primary-foreground"
								: "border-border bg-surface/90 text-foreground",
						)}
					>
						{durationLabel}
					</span>
				) : null}

				{showPlay ? (
					<span
						aria-hidden
						className="pointer-events-none absolute inset-0 z-2 flex items-center justify-center"
					>
						<span className="inline-flex size-12 items-center justify-center rounded-full bg-primary-foreground/90 text-foreground ring-1 ring-foreground/10 backdrop-blur-[2px] transition-transform duration-300 group-fine:scale-110 motion-reduce:transition-none motion-reduce:group-fine:scale-100">
							<PlayIcon className="size-5 translate-x-0.5" />
						</span>
					</span>
				) : null}

				<div className="absolute inset-x-0 bottom-0 z-1 p-3">
					<h3 className="font-heading text-small font-semibold leading-snug text-balance text-primary-foreground line-clamp-2">
						{title}
					</h3>
					{subtitle ? (
						<p className="mt-0.5 line-clamp-1 text-label text-primary-foreground/70">
							{subtitle}
						</p>
					) : null}
				</div>

				{progressPct != null ? (
					<div className="absolute inset-x-0 bottom-0 z-3 h-[3px] bg-primary-foreground/25">
						<div
							className="h-full bg-accent"
							style={{ width: `${progressPct}%` }}
						/>
					</div>
				) : null}
			</div>
		</Link>
	);
}
