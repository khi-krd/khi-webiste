import { PlayIcon } from "@heroicons/react/24/solid";
import NextImage from "next/image";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";

export type FilmCardItem = {
	id: number;
	href: string;
	title: string;
	subtitle: string | null;
	topicLabel: string | null;
	durationLabel: string | null;
	coverUrl: string | null;
};

const imageEase = "ease-[cubic-bezier(0.22,1,0.36,1)]";

type FilmCinemaHeroProps = {
	item: FilmCardItem;
};

export function FilmCinemaHero({ item }: FilmCinemaHeroProps) {
	return (
		<Link
			href={item.href}
			variant="nav"
			className="group relative block aspect-[2.39/1] max-h-[min(42svh,22rem)] w-full overflow-hidden no-underline sm:max-h-[min(44svh,24rem)]"
			aria-label={item.title}
		>
			<div className="absolute inset-0">
				{item.coverUrl ? (
					<NextImage
						src={item.coverUrl}
						alt=""
						fill
						priority
						sizes="100vw"
						className={cn(
							"object-cover brightness-[0.55] contrast-[1.1] saturate-[0.75]",
							"transition-transform duration-[1.6s]",
							imageEase,
							"group-fine:scale-[1.03] motion-reduce:transition-none motion-reduce:group-fine:scale-100",
						)}
					/>
				) : (
					<div
						aria-hidden
						className="flex h-full w-full items-center justify-center bg-primary-foreground/5"
					>
						<span className="font-heading text-display font-bold text-primary-foreground/10">
							{item.title.charAt(0)}
						</span>
					</div>
				)}
			</div>

			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 bg-linear-to-t from-foreground from-0% via-foreground/70 via-38% to-foreground/20 to-100%"
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 bg-linear-to-r from-foreground/60 from-0% via-foreground/25 via-40% to-transparent to-85% rtl:bg-linear-to-l"
			/>

			<div className="relative flex h-full flex-col justify-end p-4 sm:p-5 lg:p-6">
				{item.topicLabel ? (
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-label text-primary-foreground/55">
							{item.topicLabel}
						</span>
					</div>
				) : null}

				<h3 className="mt-2 max-w-2xl font-heading text-h2 font-bold leading-[1.12] text-balance text-primary-foreground sm:text-h1">
					{item.title}
				</h3>

				{item.subtitle ? (
					<p className="mt-1.5 max-w-lg line-clamp-1 text-small text-primary-foreground/70">
						{item.subtitle}
					</p>
				) : null}

				<div className="mt-3 flex flex-wrap items-center gap-3">
					<span
						className={cn(
							"inline-flex size-9 items-center justify-center rounded-pill bg-primary text-primary-foreground ring-1 ring-primary-foreground/30",
							"transition-[transform,opacity] duration-300",
							"group-fine:scale-110 group-fine:opacity-90",
							"motion-reduce:transition-none motion-reduce:group-fine:scale-100",
						)}
					>
						<PlayIcon className="size-4 translate-x-0.5" />
					</span>

					<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-label text-primary-foreground/55">
						{item.durationLabel ? (
							<span dir="ltr" className="tabular-nums">
								{item.durationLabel}
							</span>
						) : null}
					</div>
				</div>
			</div>
		</Link>
	);
}

type FilmGridCardProps = {
	item: FilmCardItem;
};

export function FilmGridCard({ item }: FilmGridCardProps) {
	return (
		<Link
			href={item.href}
			variant="nav"
			className="group relative block w-full overflow-hidden border border-primary-foreground/15 bg-primary-foreground/3 no-underline transition-[border-color,box-shadow] duration-300 fine-hover:border-primary-foreground/30 fine-hover:shadow-[0_20px_48px_-24px_rgba(0,0,0,0.7)]"
			aria-label={item.title}
		>
			<div className="relative aspect-video w-full overflow-hidden">
				{item.coverUrl ? (
					<NextImage
						src={item.coverUrl}
						alt=""
						fill
						sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
						className="object-cover brightness-[0.78] saturate-[0.8] transition-[filter,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-fine:scale-[1.04] group-fine:brightness-90 group-fine:saturate-95 motion-reduce:transition-none motion-reduce:group-fine:scale-100"
					/>
				) : (
					<div
						aria-hidden
						className="flex h-full w-full items-center justify-center bg-primary-foreground/5"
					>
						<span className="font-heading text-h1 font-bold text-primary-foreground/10">
							{item.title.charAt(0)}
						</span>
					</div>
				)}

				<div
					aria-hidden
					className="pointer-events-none absolute inset-0 bg-linear-to-t from-foreground/95 from-0% via-foreground/35 via-50% to-transparent to-100%"
				/>

				<div
					aria-hidden
					className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-fine:opacity-100 motion-reduce:opacity-0"
				>
					<span className="inline-flex size-9 items-center justify-center rounded-pill bg-primary text-primary-foreground ring-1 ring-primary-foreground/25">
						<PlayIcon className="size-4 translate-x-0.5" />
					</span>
				</div>

				{item.durationLabel ? (
					<span
						dir="ltr"
						className="label absolute top-0 inset-e-0 z-2 border-b border-s border-primary-foreground/20 bg-foreground/75 px-1.5 py-0.5 font-medium tabular-nums text-primary-foreground backdrop-blur-[1px]"
					>
						{item.durationLabel}
					</span>
				) : null}

				<div className="absolute inset-x-0 bottom-0 z-2 p-3">
					{item.topicLabel ? (
						<p className="text-label text-primary-foreground/55">
							{item.topicLabel}
						</p>
					) : null}
					<h3 className="mt-0.5 font-heading text-small font-semibold leading-snug text-balance text-primary-foreground line-clamp-2 transition-[text-decoration-color] duration-300 group-fine:underline group-fine:decoration-primary-foreground/30 group-fine:underline-offset-[0.2em] motion-reduce:group-fine:no-underline">
						{item.title}
					</h3>
					{item.subtitle ? (
						<p className="mt-0.5 line-clamp-1 text-label text-primary-foreground/60">
							{item.subtitle}
						</p>
					) : null}
				</div>
			</div>
		</Link>
	);
}
