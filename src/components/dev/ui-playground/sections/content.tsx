import { getTranslations } from "next-intl/server";
import {
	PlaygroundSection,
	ShowcaseCard,
} from "@/components/dev/playground-block";
import {
	LANDSCAPE,
	PORTRAIT,
	showcaseGridClass,
} from "@/components/dev/ui-playground/shared";
import { VideoPlayerShowcase } from "@/components/dev/video-player-showcase";
import { Image } from "@/components/ui/image";
import { Prose } from "@/components/ui/prose";

export async function ProseSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundSection
			id="prose"
			title={t("sections.prose.title")}
			description={t("sections.prose.description")}
			lazy={false}
		>
			<ShowcaseCard title={t("sections.prose.title")}>
				<Prose>
					<p>{t("prose.intro")}</p>
					<h2>{t("prose.h2")}</h2>
					<p>{t("prose.body")}</p>
					<blockquote>{t("prose.quote")}</blockquote>
					<p>
						{t("prose.linkBody")}
						<a href="#prose">{t("prose.linkText")}</a>
					</p>
				</Prose>
			</ShowcaseCard>
		</PlaygroundSection>
	);
}

export async function ImageSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundSection
			id="image"
			title={t("sections.image.title")}
			description={t("sections.image.description")}
			lazy={false}
		>
			<div className={showcaseGridClass}>
				<ShowcaseCard title={t("image.landscape")}>
					<Image
						src={LANDSCAPE}
						alt={t("image.caption")}
						aspectRatio="16/9"
						framed
						sizes="(max-width: 768px) 100vw, 50vw"
					/>
				</ShowcaseCard>
				<ShowcaseCard title={t("image.portrait")}>
					<Image
						src={PORTRAIT}
						alt={t("image.caption")}
						aspectRatio="3/4"
						framed
						sizes="(max-width: 768px) 100vw, 50vw"
					/>
				</ShowcaseCard>
			</div>
		</PlaygroundSection>
	);
}

export async function VideoPlayerSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundSection
			id="videoPlayer"
			title={t("sections.videoPlayer.title")}
			description={t("sections.videoPlayer.description")}
			lazy={false}
		>
			<VideoPlayerShowcase />
		</PlaygroundSection>
	);
}

export async function ContainerSection() {
	const t = await getTranslations("Ui");

	return (
		<PlaygroundSection
			id="container"
			title={t("sections.container.title")}
			description={t("sections.container.description")}
			lazy={false}
		>
			<div className={showcaseGridClass}>
				<ShowcaseCard title={t("container.default")}>
					<p className="text-small text-muted">
						{t("container.defaultDescription")}
					</p>
				</ShowcaseCard>
				<ShowcaseCard title={t("container.prose")}>
					<p className="max-w-2xl text-small text-muted">
						{t("container.proseDescription")}
					</p>
				</ShowcaseCard>
			</div>
		</PlaygroundSection>
	);
}
