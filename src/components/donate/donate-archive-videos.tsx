"use client";

import {
	ChevronLeftIcon,
	ChevronRightIcon,
	QueueListIcon,
} from "@heroicons/react/24/outline";
import { PlayIcon } from "@heroicons/react/24/solid";
import dynamic from "next/dynamic";
import NextImage from "next/image";
import { useState } from "react";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { cn } from "@/lib/utils";

const VideoPlayer = dynamic(
	() => import("@/components/ui/video-player").then((mod) => mod.VideoPlayer),
	{ ssr: false },
);

export type DonateArchiveVideoItem = {
	mediaKind?: "video" | "image";
	id: number;
	title: string;
	description: string | null;
	/** Uploaded file URL or a YouTube link — the player resolves both. */
	videoUrl: string;
	/** Resolved still: the editor's poster, else the YouTube thumbnail, else none. */
	posterUrl: string | null;
};

type DonateArchiveVideosProps = {
	heading: string;
	imagesHeading: string;
	playLabel: string;
	playlistLabel: string;
	previousLabel: string;
	nextLabel: string;
	items: DonateArchiveVideoItem[];
};

type NavLabels = { previousLabel: string; nextLabel: string };

const pad = (n: number) => String(n).padStart(2, "0");

const keyframes = `
@keyframes donate-fade-up {
	from { opacity: 0; transform: translateY(10px); }
	to { opacity: 1; transform: translateY(0); }
}
@keyframes donate-fade {
	from { opacity: 0; }
	to { opacity: 1; }
}
@keyframes donate-eq {
	0%, 100% { transform: scaleY(0.3); }
	50% { transform: scaleY(1); }
}`;

/**
 * The archive-donors showcase on the donate page. Videos play in a cinema
 * playlist (stage + numbered queue), images in a gallery stage with a
 * filmstrip — each block renders only when it has records.
 */
export function DonateArchiveVideos({
	heading,
	imagesHeading,
	playLabel,
	playlistLabel,
	previousLabel,
	nextLabel,
	items,
}: DonateArchiveVideosProps) {
	const videos = items.filter((item) => item.mediaKind !== "image");
	const images = items.filter((item) => item.mediaKind === "image");

	if (items.length === 0) {
		return null;
	}

	return (
		<div className="mt-10 space-y-14 sm:mt-12">
			<style>{keyframes}</style>
			{videos.length > 0 ? (
				<section>
					<SectionHeading title={heading} count={videos.length} />
					<VideoPlaylist
						items={videos}
						playLabel={playLabel}
						playlistLabel={playlistLabel}
						previousLabel={previousLabel}
						nextLabel={nextLabel}
					/>
				</section>
			) : null}
			{images.length > 0 ? (
				<section>
					<SectionHeading title={imagesHeading} count={images.length} />
					<ImageGallery
						items={images}
						previousLabel={previousLabel}
						nextLabel={nextLabel}
					/>
				</section>
			) : null}
		</div>
	);
}

function SectionHeading({ title, count }: { title: string; count: number }) {
	return (
		<div className="mb-5 flex items-end gap-4">
			<h3 className="font-heading text-h3 font-semibold text-foreground">
				{title}
			</h3>
			<span className="mb-1.5 h-px grow bg-gradient-to-l from-transparent via-border to-border" />
			<span className="mb-1 font-heading text-small font-bold tabular-nums text-accent">
				{pad(count)}
			</span>
		</div>
	);
}

function LogoBadge({ className }: { className?: string }) {
	return (
		<NextImage
			src="/logo.png"
			alt=""
			width={44}
			height={44}
			className={cn(
				"pointer-events-none absolute bottom-3 left-3 z-20 size-11 rounded-[50%] bg-white/90 object-contain p-1 shadow-lg ring-1 ring-black/5",
				className,
			)}
		/>
	);
}

/**
 * First-frame still for an uploaded clip with no poster — the browser fetches
 * only the metadata + one frame. YouTube clips always resolve a thumbnail
 * upstream, so they never land here.
 */
function VideoStill({ src, className }: { src: string; className?: string }) {
	return (
		<video
			src={`${src}#t=0.5`}
			preload="metadata"
			muted
			playsInline
			tabIndex={-1}
			aria-hidden
			className={cn(
				"pointer-events-none absolute inset-0 size-full object-cover",
				className,
			)}
		/>
	);
}

function StepButtons({
	index,
	total,
	onStep,
	previousLabel,
	nextLabel,
	tone,
}: NavLabels & {
	index: number;
	total: number;
	onStep: (delta: number) => void;
	tone: "dark" | "light";
}) {
	const btn = cn(
		"grid size-9 place-items-center rounded-[50%] border transition-colors duration-200 disabled:opacity-30",
		tone === "dark"
			? "border-white/15 text-white hover:border-accent hover:bg-accent"
			: "border-border bg-background text-foreground hover:border-accent hover:bg-accent hover:text-white",
	);
	return (
		<div className="flex items-center gap-2">
			<button
				type="button"
				className={btn}
				onClick={() => onStep(-1)}
				disabled={index === 0}
				aria-label={previousLabel}
			>
				<DirectionalIcon icon={ChevronLeftIcon} className="size-4" />
			</button>
			<span
				className={cn(
					"min-w-14 text-center font-heading text-small font-bold tabular-nums",
					tone === "dark" ? "text-white" : "text-foreground",
				)}
			>
				{pad(index + 1)}
				<span className="opacity-40"> / {pad(total)}</span>
			</span>
			<button
				type="button"
				className={btn}
				onClick={() => onStep(1)}
				disabled={index === total - 1}
				aria-label={nextLabel}
			>
				<DirectionalIcon icon={ChevronRightIcon} className="size-4" />
			</button>
		</div>
	);
}

/* ─────────────────────────── Video: cinema playlist ─────────────────────────── */

function VideoPlaylist({
	items,
	playLabel,
	playlistLabel,
	previousLabel,
	nextLabel,
}: NavLabels & {
	items: DonateArchiveVideoItem[];
	playLabel: string;
	playlistLabel: string;
}) {
	const [index, setIndex] = useState(0);
	const [playing, setPlaying] = useState(false);
	const active = items[index];

	const select = (next: number, autoplay: boolean) => {
		setIndex(Math.max(0, Math.min(items.length - 1, next)));
		setPlaying(autoplay);
	};

	return (
		<div className="relative overflow-hidden rounded-3xl bg-[#0f1411] p-3 shadow-2xl sm:p-4 lg:p-5">
			{/* Ambient glow — the active poster bleeds softly behind the stage. */}
			{active.posterUrl ? (
				<NextImage
					key={`glow-${active.id}`}
					src={active.posterUrl}
					alt=""
					fill
					sizes="100vw"
					className="scale-125 object-cover opacity-25 blur-3xl"
					style={{ animation: "donate-fade 0.8s ease-out" }}
				/>
			) : null}
			<span
				aria-hidden
				className="pointer-events-none absolute -top-24 left-1/3 size-72 rounded-[50%] bg-accent/30 blur-3xl"
			/>

			<div className="relative grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-5">
				{/* Stage */}
				<div className="min-w-0">
					<div className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-xl ring-1 ring-white/10">
						{playing ? (
							<div
								key={`player-${active.id}`}
								className="absolute inset-0"
								style={{ animation: "donate-fade 0.4s ease-out" }}
							>
								<VideoPlayer
									src={active.videoUrl}
									title={active.title}
									poster={active.posterUrl ?? undefined}
									autoPlay
									className="size-full"
								/>
							</div>
						) : (
							<button
								key={`poster-${active.id}`}
								type="button"
								onClick={() => setPlaying(true)}
								aria-label={`${playLabel}: ${active.title}`}
								className="group absolute inset-0 block cursor-pointer"
								style={{ animation: "donate-fade 0.5s ease-out" }}
							>
								{active.posterUrl ? (
									<NextImage
										src={active.posterUrl}
										alt=""
										fill
										sizes="(min-width: 1024px) 60vw, 100vw"
										className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
									/>
								) : (
									<VideoStill
										src={active.videoUrl}
										className="transition-transform duration-700 group-hover:scale-[1.03]"
									/>
								)}
								<span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
								<span className="absolute inset-0 grid place-items-center">
									<span className="relative grid size-20 place-items-center">
										<span className="absolute inset-0 animate-ping rounded-[50%] bg-accent/40 [animation-duration:2.2s]" />
										<span className="relative grid size-20 place-items-center rounded-[50%] bg-accent text-white shadow-2xl ring-4 ring-white/20 transition-transform duration-300 group-hover:scale-110">
											<PlayIcon className="size-8 translate-x-0.5" />
										</span>
									</span>
								</span>
							</button>
						)}
						{!playing ? <LogoBadge /> : null}
					</div>

					{/* Now-playing caption */}
					<div
						key={`caption-${active.id}`}
						className="mt-4 flex flex-col gap-3 px-1 sm:flex-row sm:items-start sm:justify-between"
						style={{ animation: "donate-fade-up 0.5s ease-out" }}
					>
						<div className="min-w-0">
							<p className="font-heading text-h4 font-bold leading-snug text-white">
								{active.title}
							</p>
							{active.description ? (
								<p className="mt-2 max-w-3xl text-small leading-relaxed text-white/65">
									{active.description}
								</p>
							) : null}
						</div>
						{items.length > 1 ? (
							<div className="shrink-0">
								<StepButtons
									index={index}
									total={items.length}
									onStep={(d) => select(index + d, playing)}
									previousLabel={previousLabel}
									nextLabel={nextLabel}
									tone="dark"
								/>
							</div>
						) : null}
					</div>
				</div>

				{/* Queue */}
				{items.length > 1 ? (
					<aside className="flex min-h-0 min-w-0 flex-col rounded-2xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-sm lg:max-h-[32rem] lg:self-start">
						<div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-white/80">
							<QueueListIcon className="size-5 text-accent" />
							<span className="font-heading text-small font-bold">
								{playlistLabel}
							</span>
							<span className="ms-auto text-caption tabular-nums text-white/40">
								{pad(items.length)}
							</span>
						</div>
						<ol className="flex gap-2 overflow-x-auto p-2 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden [scrollbar-width:thin]">
							{items.map((item, i) => {
								const isActive = i === index;
								return (
									<li key={item.id} className="shrink-0 lg:shrink">
										<button
											type="button"
											onClick={() => select(i, true)}
											aria-current={isActive ? "true" : undefined}
											className={cn(
												"group relative flex w-64 items-center gap-3 rounded-xl p-2 text-start transition-all duration-300 lg:w-full",
												isActive
													? "bg-white/10 ring-1 ring-accent/60"
													: "hover:bg-white/[0.06]",
											)}
										>
											{isActive ? (
												<span className="absolute inset-y-2 start-0 w-1 rounded-[999px] bg-accent" />
											) : null}
											<span className="grid w-7 shrink-0 place-items-center">
												{isActive && playing ? (
													<span className="flex h-4 items-end gap-0.5">
														{[0, 0.2, 0.4].map((delay) => (
															<span
																key={delay}
																className="h-full w-1 origin-bottom rounded-[999px] bg-accent"
																style={{
																	animation: `donate-eq 0.9s ease-in-out ${delay}s infinite`,
																}}
															/>
														))}
													</span>
												) : (
													<span
														className={cn(
															"font-heading text-small font-bold tabular-nums",
															isActive ? "text-accent" : "text-white/35",
														)}
													>
														{pad(i + 1)}
													</span>
												)}
											</span>
											<span className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg bg-black ring-1 ring-white/10">
												{item.posterUrl ? (
													<NextImage
														src={item.posterUrl}
														alt=""
														fill
														sizes="96px"
														className={cn(
															"object-cover transition-all duration-500",
															isActive
																? "opacity-100"
																: "opacity-70 group-hover:opacity-100",
														)}
													/>
												) : (
													<VideoStill
														src={item.videoUrl}
														className={
															isActive
																? "opacity-100"
																: "opacity-70 group-hover:opacity-100"
														}
													/>
												)}
												<span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
													<span className="grid size-7 place-items-center rounded-[50%] bg-accent/90 text-white">
														<PlayIcon className="size-3.5 translate-x-px" />
													</span>
												</span>
											</span>
											<span
												className={cn(
													"line-clamp-2 min-w-0 text-small font-semibold leading-snug transition-colors",
													isActive
														? "text-white"
														: "text-white/70 group-hover:text-white",
												)}
											>
												{item.title}
											</span>
										</button>
									</li>
								);
							})}
						</ol>
					</aside>
				) : null}
			</div>
		</div>
	);
}

/* ─────────────────────────── Image: gallery stage ─────────────────────────── */

function ImageGallery({
	items,
	previousLabel,
	nextLabel,
}: NavLabels & { items: DonateArchiveVideoItem[] }) {
	const [index, setIndex] = useState(0);
	const active = items[index];
	const step = (delta: number) =>
		setIndex((i) => Math.max(0, Math.min(items.length - 1, i + delta)));

	return (
		<div className="rounded-3xl border border-border/60 bg-surface p-3 shadow-xl sm:p-4 lg:p-5">
			<div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-6">
				{/* Stage — full photo on its own blurred bleed, never cropped. */}
				<div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-foreground sm:aspect-[16/10]">
					{active.posterUrl ? (
						<div
							key={`stage-${active.id}`}
							className="absolute inset-0"
							style={{ animation: "donate-fade 0.6s ease-out" }}
						>
							<NextImage
								src={active.posterUrl}
								alt=""
								fill
								sizes="100vw"
								className="scale-110 object-cover opacity-50 blur-2xl"
							/>
							<NextImage
								src={active.posterUrl}
								alt={active.title}
								fill
								sizes="(min-width: 1024px) 60vw, 100vw"
								className="object-contain p-3 drop-shadow-2xl sm:p-5"
							/>
						</div>
					) : null}
					<LogoBadge />
					{items.length > 1 ? (
						<>
							<button
								type="button"
								onClick={() => step(-1)}
								disabled={index === 0}
								aria-label={previousLabel}
								className="absolute start-3 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-[50%] bg-white/85 text-foreground shadow-lg backdrop-blur transition hover:bg-accent hover:text-white disabled:opacity-0"
							>
								<DirectionalIcon icon={ChevronLeftIcon} className="size-5" />
							</button>
							<button
								type="button"
								onClick={() => step(1)}
								disabled={index === items.length - 1}
								aria-label={nextLabel}
								className="absolute end-3 top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-[50%] bg-white/85 text-foreground shadow-lg backdrop-blur transition hover:bg-accent hover:text-white disabled:opacity-0"
							>
								<DirectionalIcon icon={ChevronRightIcon} className="size-5" />
							</button>
						</>
					) : null}
				</div>

				{/* Caption column */}
				<div className="flex min-w-0 flex-col">
					<div
						key={`caption-${active.id}`}
						className="grow"
						style={{ animation: "donate-fade-up 0.5s ease-out" }}
					>
						<span className="font-heading text-[3.5rem] font-black leading-none tabular-nums text-accent/15">
							{pad(index + 1)}
						</span>
						<p className="-mt-3 font-heading text-h4 font-bold leading-snug text-foreground">
							{active.title}
						</p>
						<span className="mt-3 block h-1 w-12 rounded-[999px] bg-accent" />
						{active.description ? (
							<p className="mt-4 text-small leading-relaxed text-muted">
								{active.description}
							</p>
						) : null}
					</div>
					{items.length > 1 ? (
						<div className="mt-5">
							<StepButtons
								index={index}
								total={items.length}
								onStep={step}
								previousLabel={previousLabel}
								nextLabel={nextLabel}
								tone="light"
							/>
						</div>
					) : null}
				</div>
			</div>

			{/* Filmstrip */}
			{items.length > 1 ? (
				<ol className="mt-4 flex gap-3 overflow-x-auto px-1 pb-2 pt-1 [scrollbar-width:thin]">
					{items.map((item, i) => {
						const isActive = i === index;
						return (
							<li key={item.id} className="shrink-0">
								<button
									type="button"
									onClick={() => setIndex(i)}
									aria-label={item.title}
									aria-current={isActive ? "true" : undefined}
									className={cn(
										"relative block aspect-[4/3] w-28 overflow-hidden rounded-xl bg-foreground transition-all duration-300 sm:w-32",
										isActive
											? "-translate-y-1 shadow-lg ring-2 ring-accent ring-offset-2 ring-offset-surface"
											: "opacity-60 hover:opacity-100",
									)}
								>
									{item.posterUrl ? (
										<NextImage
											src={item.posterUrl}
											alt=""
											fill
											sizes="128px"
											className="object-cover"
										/>
									) : null}
								</button>
							</li>
						);
					})}
				</ol>
			) : null}
		</div>
	);
}
