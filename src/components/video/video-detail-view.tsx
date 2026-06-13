import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { DirectionalIcon } from "@/components/ui/directional-icon";
import { Link } from "@/components/ui/link";
import { VideoPlayerFrame } from "@/components/video/video-player-frame";
import { homeInsetClass } from "@/lib/layout";
import { cn } from "@/lib/utils";
import {
	formatDuration,
	formatFileSizeMb,
	formatPublishmentDate,
} from "@/lib/video/format";
import type { ResolvedVideoDetail } from "@/types/video";

type VideoDetailViewProps = {
	detail: ResolvedVideoDetail;
	locale: string;
};

function MetaCell({
	label,
	children,
	ltr = false,
}: {
	label: string;
	children: React.ReactNode;
	ltr?: boolean;
}) {
	return (
		<div className="flex flex-col gap-2 py-5 sm:py-6">
			<dt className="label font-medium">{label}</dt>
			<dd className="text-small text-foreground" dir={ltr ? "ltr" : undefined}>
				{children}
			</dd>
		</div>
	);
}

function formatDate(locale: string, iso: string): string {
	try {
		return new Intl.DateTimeFormat(locale, {
			year: "numeric",
			month: "long",
			day: "numeric",
		}).format(new Date(iso));
	} catch {
		return iso;
	}
}

export async function VideoDetailView({
	detail,
	locale,
}: VideoDetailViewProps) {
	const t = await getTranslations("Video");

	const credits = [detail.director, detail.producer]
		.filter(Boolean)
		.join(" · ");
	const durationLabel = formatDuration(detail.durationSeconds);
	const fileSizeLabel = formatFileSizeMb(detail.fileSizeMb);
	const publishedDateLabel = formatPublishmentDate(
		locale,
		detail.publishmentDate,
	);
	const languageLabels = detail.contentLanguages.map((language) =>
		t(`detail.languages.${language}`),
	);

	const hasMeta = Boolean(
		detail.director ||
			detail.producer ||
			detail.location ||
			detail.topicName ||
			durationLabel ||
			detail.resolution ||
			detail.fileFormat ||
			publishedDateLabel ||
			fileSizeLabel ||
			languageLabels.length > 0,
	);

	return (
		<article>
			<div className={cn("pt-30 pb-10 sm:pt-34 lg:pb-12", homeInsetClass)}>
				<div className="mx-auto max-w-5xl">
					<Link
						href="/videos"
						className="group inline-flex w-fit items-center gap-2 no-underline"
					>
						<DirectionalIcon
							icon={ArrowLeftIcon}
							className="size-4 text-muted transition-colors group-fine:text-foreground"
						/>
						<span className="label font-medium transition-colors group-fine:text-foreground">
							{t("detail.back")}
						</span>
					</Link>

					<VideoPlayerFrame
						className="mt-8"
						videoType={detail.videoType}
						playerKind={detail.playerKind}
						playableSrc={detail.playableSrc}
						title={detail.title}
						poster={detail.coverUrl}
						clips={detail.clips}
						clipLabels={{
							title: t("detail.clips"),
							play: t("detail.playClip"),
							nowPlaying: t("detail.nowPlaying"),
						}}
						noSourceLabel={t("detail.noSource")}
					/>

					<div className="mt-8 flex flex-wrap items-center gap-2">
						<Badge variant="outline" size="sm">
							{t(`typeBadge.${detail.videoType}`)}
						</Badge>
						{detail.topicName ? (
							<Badge variant="subtle" size="sm">
								{detail.topicName}
							</Badge>
						) : null}
						{detail.albumOfMemories ? (
							<Badge variant="outline" size="sm">
								{t("card.memoriesBadge")}
							</Badge>
						) : null}
					</div>

					<h1 className="mt-5 font-heading text-h1 font-bold leading-tight text-balance">
						{detail.title}
					</h1>

					{credits ? (
						<p className="mt-3 text-lead text-foreground/80">{credits}</p>
					) : null}

					{detail.description ? (
						<p className="mt-5 max-w-prose text-body leading-relaxed text-foreground/90">
							{detail.description}
						</p>
					) : null}

					{hasMeta ? (
						<dl className="mt-10 grid grid-cols-1 gap-x-8 border-t border-border sm:grid-cols-2 [&>*]:border-b [&>*]:border-border">
							{detail.director ? (
								<MetaCell label={t("detail.director")}>
									{detail.director}
								</MetaCell>
							) : null}
							{detail.producer ? (
								<MetaCell label={t("detail.producer")}>
									{detail.producer}
								</MetaCell>
							) : null}
							{detail.location ? (
								<MetaCell label={t("detail.location")}>
									{detail.location}
								</MetaCell>
							) : null}
							{detail.topicName ? (
								<MetaCell label={t("detail.topic")}>
									{detail.topicName}
								</MetaCell>
							) : null}
							{durationLabel ? (
								<MetaCell label={t("detail.duration")} ltr>
									{durationLabel}
								</MetaCell>
							) : null}
							{detail.resolution ? (
								<MetaCell label={t("detail.resolution")} ltr>
									{detail.resolution}
								</MetaCell>
							) : null}
							{detail.fileFormat ? (
								<MetaCell label={t("detail.fileFormat")} ltr>
									{detail.fileFormat.toUpperCase()}
								</MetaCell>
							) : null}
							{publishedDateLabel ? (
								<MetaCell label={t("detail.publishmentDate")}>
									{publishedDateLabel}
								</MetaCell>
							) : null}
							{fileSizeLabel ? (
								<MetaCell label={t("detail.fileSize")} ltr>
									{fileSizeLabel}
								</MetaCell>
							) : null}
							{languageLabels.length > 0 ? (
								<MetaCell label={t("detail.languagesLabel")}>
									{languageLabels.join(" · ")}
								</MetaCell>
							) : null}
						</dl>
					) : null}

					{detail.tags.length > 0 || detail.keywords.length > 0 ? (
						<div className="mt-12 space-y-6 border-t border-border pt-8">
							{detail.tags.length > 0 ? (
								<div>
									<p className="label font-medium">{t("detail.tags")}</p>
									<div className="mt-3 flex flex-wrap gap-2">
										{detail.tags.map((tag) => (
											<Badge key={tag} variant="outline" size="sm">
												{tag}
											</Badge>
										))}
									</div>
								</div>
							) : null}
							{detail.keywords.length > 0 ? (
								<div>
									<p className="label font-medium">{t("detail.keywords")}</p>
									<div className="mt-3 flex flex-wrap gap-2">
										{detail.keywords.map((keyword) => (
											<Badge key={keyword} variant="subtle" size="sm">
												{keyword}
											</Badge>
										))}
									</div>
								</div>
							) : null}
						</div>
					) : null}

					<footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
						<p className="text-label text-muted">
							{t("detail.published")}: {formatDate(locale, detail.createdAt)}
							{detail.updatedAt !== detail.createdAt ? (
								<>
									{" · "}
									{t("detail.updated")}: {formatDate(locale, detail.updatedAt)}
								</>
							) : null}
						</p>
						<Link href="/videos" className="label font-medium no-underline">
							{t("detail.back")}
						</Link>
					</footer>
				</div>
			</div>
		</article>
	);
}
