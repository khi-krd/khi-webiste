"use client";

import { useTranslations } from "next-intl";
import { ShowcaseCard } from "@/components/dev/playground-block";
import { VideoPlayer } from "@/components/ui/video-player";

const DEMO_SRC = "/video/wave.mp4";
/** Same frame used on the About hero for this clip. */
const DEMO_POSTER =
	"/about/475203467_1007002848126180_7383496220452921499_n.jpg";
/** Public-domain sample used in Vidstack docs. */
const DEMO_YOUTUBE = "https://www.youtube.com/watch?v=_cMxraX_5RE";

const showcaseGridClass = "grid gap-6 lg:gap-7 xl:grid-cols-2";

export function VideoPlayerShowcase() {
	const t = useTranslations("Ui.videoPlayer");

	return (
		<div className="grid gap-6 lg:gap-7">
			<div className={showcaseGridClass}>
				<ShowcaseCard title={t("minimal")}>
					<VideoPlayer
						src={DEMO_SRC}
						title={t("sampleTitle")}
						poster={DEMO_POSTER}
						posterAlt={t("posterAlt")}
					/>
				</ShowcaseCard>
				<ShowcaseCard title={t("withPoster")}>
					<VideoPlayer
						src={DEMO_SRC}
						title={t("sampleTitle")}
						poster={DEMO_POSTER}
						posterAlt={t("posterAlt")}
					/>
				</ShowcaseCard>
			</div>
			<ShowcaseCard title={t("youtube")}>
				<VideoPlayer
					variant="full"
					src={DEMO_YOUTUBE}
					title={t("youtubeTitle")}
					posterAlt={t("youtubePosterAlt")}
				/>
			</ShowcaseCard>
			<ShowcaseCard title={t("full")}>
				<VideoPlayer
					variant="full"
					src={DEMO_SRC}
					title={t("sampleTitle")}
					poster={DEMO_POSTER}
					posterAlt={t("posterAlt")}
				/>
			</ShowcaseCard>
		</div>
	);
}
