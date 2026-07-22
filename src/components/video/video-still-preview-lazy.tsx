"use client";

import dynamic from "next/dynamic";

/** Client-only — `<video>` preview frames must not render during SSR. */
export const VideoStillPreview = dynamic(
	() =>
		import("@/components/video/video-still-preview").then(
			(mod) => mod.VideoStillPreview,
		),
	{ ssr: false },
);
