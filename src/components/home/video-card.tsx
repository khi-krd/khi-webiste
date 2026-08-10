import { PlayIcon } from "@heroicons/react/24/solid";
import NextImage from "next/image";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";

const imageEase = "ease-[cubic-bezier(0.25,0.46,0.45,0.94)]";

/** Minimal shape the home video stage needs — fed from a `ResolvedVideoCard`. */
export type HomeVideoCardItem = {
	id: number;
	title: string;
	subtitle: string | null;
	durationLabel: string | null;
	coverUrl: string | null;
	coverAlt?: string | null;
};

type VideoCardProps = {
	item: HomeVideoCardItem;
	categoryLabel: string;
	className?: string;
};

/**
 * The stage's hero cell — absolute-fills its (`relative`, sized) parent so the
 * cover keeps 16:9 on the grid and crops gently when the row height rules.
 */
export function VideoCard({ item, categoryLabel, className }: VideoCardProps) {
	return (
		<Link
			href={`/videos/${item.id}`}
			variant="nav"
			className={cn(
				"group absolute inset-0 block h-full w-full overflow-hidden bg-surface no-underline",
				className,
			)}
			aria-label={item.title}
		>
			<div className="absolute inset-0 isolate overflow-hidden">
				<div
					className={cn(
						"absolute inset-[-5%] origin-center",
						"transition-transform duration-[1.35s]",
						imageEase,
						"group-fine:scale-[1.06] motion-reduce:transition-none motion-reduce:duration-0 motion-reduce:group-fine:scale-100",
					)}
				>
					{item.coverUrl ? (
						<NextImage
							src={item.coverUrl}
							alt={item.coverAlt ?? item.title}
							fill
							sizes="(max-width: 1024px) 100vw, 62vw"
							className="object-cover brightness-[0.78] contrast-[1.1] saturate-[0.65]"
							priority={false}
						/>
					) : (
						<div
							aria-hidden
							className="flex h-full w-full items-center justify-center bg-foreground"
						>
							<span className="font-heading text-display font-bold text-primary-foreground/15">
								{item.title.charAt(0)}
							</span>
						</div>
					)}
				</div>

				<div
					className="pointer-events-none absolute inset-0 z-1 bg-foreground/25 transition-opacity duration-500 ease-out group-fine:bg-foreground/40 motion-reduce:transition-none"
					aria-hidden
				/>
				<div
					className="pointer-events-none absolute inset-0 z-1 bg-linear-to-t from-foreground from-0% via-foreground/70 via-38% to-transparent to-72% transition-opacity duration-500 ease-out group-fine:via-foreground/80 motion-reduce:transition-none"
					aria-hidden
				/>
			</div>

			<div className="absolute inset-x-0 top-0 z-10 p-4 sm:p-5">
				<Badge
					variant="subtle"
					size="sm"
					className="w-fit border border-white/20 bg-white/10 text-white/90 transition-[background-color,border-color] duration-300 group-fine:border-white/35 group-fine:bg-white/20 motion-reduce:transition-none"
				>
					{categoryLabel}
				</Badge>
			</div>

			<div
				className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
				aria-hidden
			>
				<span
					className={cn(
						"inline-flex size-14 items-center justify-center rounded-pill bg-foreground/70 text-white backdrop-blur-[2px] lg:size-18",
						"transition-[transform,background-color,opacity] duration-300",
						"opacity-80 group-fine:scale-110 group-fine:bg-foreground/85 group-fine:opacity-100",
						"motion-reduce:transition-none motion-reduce:group-fine:scale-100",
					)}
				>
					<PlayIcon className="size-6 translate-x-0.5 lg:size-8" />
				</span>
			</div>

			<div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-4 sm:p-5 lg:p-6">
				<div className="min-w-0 flex-1 text-start text-white">
					<h3
						className={cn(
							"font-heading text-h2 font-semibold leading-snug text-balance lg:text-h1",
							"transition-[text-decoration-color] duration-300",
							"group-fine:underline group-fine:decoration-white/40 group-fine:underline-offset-4",
							"motion-reduce:group-fine:no-underline",
						)}
					>
						{item.title}
					</h3>
					{item.subtitle ? (
						<p className="mt-1.5 line-clamp-2 text-small text-white/85 transition-opacity duration-300 group-fine:text-white/95 motion-reduce:transition-none">
							{item.subtitle}
						</p>
					) : null}
				</div>

				{item.durationLabel ? (
					<span className="shrink-0 text-label font-medium text-white/80">
						{item.durationLabel}
					</span>
				) : null}
			</div>
		</Link>
	);
}

/**
 * One line of the playlist column beside the hero. Rows are `flex-1` at `lg`
 * so the queue divides the hero's height evenly instead of leaving a gap under
 * the last item; `min-h` keeps them readable if the queue ever outgrows the
 * column (it then scrolls).
 */
export function VideoPlaylistRow({
	item,
	categoryLabel,
	className,
}: {
	item: HomeVideoCardItem;
	categoryLabel: string;
	className?: string;
}) {
	return (
		<Link
			href={`/videos/${item.id}`}
			variant="nav"
			className={cn(
				"group relative flex min-w-0 items-center gap-3 border border-border/70 bg-surface/60 p-2 text-start no-underline sm:gap-4 sm:p-2.5",
				"transition-[background-color,border-color,box-shadow] duration-300 ease-out",
				"fine-hover:border-foreground/25 fine-hover:bg-surface fine-hover:shadow-[0_10px_28px_-18px_rgba(26,24,19,0.5)]",
				"lg:min-h-0 lg:flex-1 lg:gap-4 lg:p-3",
				className,
			)}
			aria-label={item.title}
		>
			{/* The still always keeps 16:9 — a playlist reads as a stack of small
			    screens. Beside the hero it takes its HEIGHT from the row (which the
			    column divides evenly) and derives its width from that, so the queue
			    can never outgrow the column and clip its last line. */}
			<div className="relative aspect-video w-28 shrink-0 self-center overflow-hidden bg-surface sm:w-36 lg:h-full lg:w-auto">
				{item.coverUrl ? (
					<NextImage
						src={item.coverUrl}
						alt=""
						fill
						sizes="(max-width: 640px) 30vw, (max-width: 1024px) 20vw, 260px"
						className={cn(
							"object-cover transition-[filter,scale] duration-[620ms]",
							imageEase,
							"brightness-[0.94] group-fine:scale-[1.05] group-fine:brightness-100",
							"motion-reduce:transition-none motion-reduce:group-fine:scale-100",
						)}
					/>
				) : (
					<div
						aria-hidden
						className="flex h-full w-full items-center justify-center bg-foreground"
					>
						<span className="font-heading text-h3 font-bold text-primary-foreground/20">
							{item.title.charAt(0)}
						</span>
					</div>
				)}

				<span
					aria-hidden
					className={cn(
						"pointer-events-none absolute inset-0 flex items-center justify-center bg-foreground/35 opacity-0",
						"transition-opacity duration-300 ease-out group-fine:opacity-100 motion-reduce:transition-none",
					)}
				>
					<span className="inline-flex size-8 items-center justify-center rounded-pill bg-foreground/75 text-white">
						<PlayIcon className="size-3.5 translate-x-px" />
					</span>
				</span>

				{item.durationLabel ? (
					<span className="absolute bottom-1 end-1 bg-foreground/80 px-1.5 py-px text-label font-medium text-white/90 tabular-nums">
						{item.durationLabel}
					</span>
				) : null}
			</div>

			<div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
				<p className="truncate text-label font-medium text-muted">
					{categoryLabel}
				</p>
				<h3
					className={cn(
						"line-clamp-2 font-heading text-small font-semibold leading-snug text-foreground sm:text-body",
						"transition-[text-decoration-color] duration-300",
						"group-fine:underline group-fine:decoration-foreground/30 group-fine:underline-offset-4",
						"motion-reduce:group-fine:no-underline",
					)}
				>
					{item.title}
				</h3>
				{item.subtitle ? (
					<p className="line-clamp-1 text-label text-muted">{item.subtitle}</p>
				) : null}
			</div>
		</Link>
	);
}
