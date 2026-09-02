"use client";

import { PlayIcon } from "@heroicons/react/24/solid";
import dynamic from "next/dynamic";
import NextImage from "next/image";
import { useState } from "react";
import type { ServiceVideo } from "@/lib/mock/services";
import { cn } from "@/lib/utils";

const VideoPlayer = dynamic(
	() => import("@/components/ui/video-player").then((mod) => mod.VideoPlayer),
	{ ssr: false },
);

type ServiceSectionVideoProps = {
	video: ServiceVideo;
	title: string;
	aspectRatio?: string;
	compact?: boolean;
	className?: string;
};

export function ServiceSectionVideo({
	video,
	title,
	aspectRatio = "16 / 9",
	compact = false,
	className,
}: ServiceSectionVideoProps) {
	const [active, setActive] = useState(false);
	const poster = video.poster ?? "";

	if (active) {
		return (
			<VideoPlayer
				src={video.src}
				title={title}
				poster={poster}
				posterAlt={video.posterAlt ?? title}
				variant={video.variant ?? "minimal"}
				className={className}
			/>
		);
	}

	return (
		<button
			type="button"
			onClick={() => setActive(true)}
			aria-label={title}
			className={cn(
				"group relative block w-full overflow-hidden border border-border bg-foreground text-start",
				"focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
				className,
			)}
		>
			<span
				className="relative block w-full"
				style={{ aspectRatio }}
				aria-hidden
			>
				{poster ? (
					<NextImage
						src={poster}
						alt=""
						fill
						sizes="100vw"
						className="object-cover brightness-[0.85] contrast-[1.1] saturate-[0.72] transition-[filter,transform] duration-500 group-fine:scale-[1.02] group-fine:brightness-[0.92] motion-reduce:transition-none motion-reduce:group-fine:scale-100"
					/>
				) : null}
				<span
					className="pointer-events-none absolute inset-0 bg-linear-to-t from-foreground/55 via-foreground/15 to-transparent"
					aria-hidden
				/>
				<span className="pointer-events-none absolute inset-0 flex items-center justify-center">
					<span
						className={cn(
							"inline-flex scale-90 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_32px_-10px_rgb(0_0_0/0.55)] ring-1 ring-primary-foreground/30 transition-[transform] duration-300 ease-out group-fine:scale-100 motion-reduce:scale-100 motion-reduce:transition-none",
							compact ? "size-11 sm:size-12" : "size-14 sm:size-16",
						)}
					>
						<PlayIcon
							className={cn(
								"translate-x-0.5",
								compact ? "size-4 sm:size-5" : "size-6 sm:size-7",
							)}
							aria-hidden
						/>
					</span>
				</span>
			</span>
		</button>
	);
}
