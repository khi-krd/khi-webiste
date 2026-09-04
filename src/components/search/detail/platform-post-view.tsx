import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { PlatformAudioPlayer } from "@/components/search/detail/platform-audio-player";
import { PlatformRelatedRail } from "@/components/search/detail/platform-related-rail";
import { PlatformVideoPlayer } from "@/components/search/detail/platform-video-player";
import { KindIcon } from "@/components/search/kind-icon";
import { KIND_LABEL_KEYS } from "@/components/search/platform-hit-row";
import { BackToIndexLink } from "@/components/ui/back-to-index";
import { CoverLightbox } from "@/components/ui/cover-lightbox";
import { viewAllCtaClass } from "@/components/ui/cta-styles";
import { Heading } from "@/components/ui/heading";
import { Image } from "@/components/ui/image";
import { TaxonomyBadgeLink } from "@/components/ui/taxonomy-badge-link";
import { WritingPdfPreview } from "@/components/writing/writing-pdf-preview";
import { Link } from "@/i18n/navigation";
import { homeInsetClass } from "@/lib/layout";
import { formatCount, formatFullDate, formatYear } from "@/lib/platform/format";
import {
	buildSearchHref,
	EMPTY_FILTERS,
	type PlatformFilterState,
} from "@/lib/platform/search-url";
import { displayTitleSizeClass } from "@/lib/title-scale";
import { cn } from "@/lib/utils";
import type {
	PlatformDetailResponse,
	PlatformFullMedia,
	PlatformHit,
} from "@/types/platform";
import type { WritingFileOffer } from "@/types/writing";

type TranslateFn = (key: string, values?: Record<string, string>) => string;

type MetaRow = { label: string; value: ReactNode };

function pushRow(
	rows: MetaRow[],
	label: string,
	value: string | null | undefined,
	options?: { dir?: "ltr" | "auto" },
) {
	const trimmed = value?.trim();
	if (!trimmed) {
		return;
	}
	rows.push({
		label,
		value: options?.dir ? <span dir={options.dir}>{trimmed}</span> : trimmed,
	});
}

function joinList(
	locale: string,
	value: string[] | string | null | undefined,
): string | null {
	if (!value) {
		return null;
	}
	const list = Array.isArray(value) ? value : [value];
	const cleaned = list.map((entry) => entry.trim()).filter(Boolean);
	if (cleaned.length === 0) {
		return null;
	}
	return cleaned.join(locale === "ckb" ? "، " : ", ");
}

/** One quiet label over one confident value — the liner-notes cell. */
function MetaCell({ label, value }: MetaRow) {
	return (
		<div className="min-w-0 text-start">
			<dt className="label font-medium">{label}</dt>
			<dd className="mt-1 text-start text-small font-semibold leading-relaxed text-foreground">
				<bdi>{value}</bdi>
			</dd>
		</div>
	);
}

function MetaSection({ title, rows }: { title: string; rows: MetaRow[] }) {
	if (rows.length === 0) {
		return null;
	}
	return (
		<section>
			<h3 className="mb-4 flex items-center gap-3 font-heading text-body font-semibold text-foreground">
				{title}
				<span aria-hidden className="h-px flex-1 bg-border" />
			</h3>
			<dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
				{rows.map((row) => (
					<MetaCell key={row.label} label={row.label} value={row.value} />
				))}
			</dl>
		</section>
	);
}

/** Chip row linking a taxonomy list back into the platform search. */
function ChipGroup({
	values,
	param,
}: {
	values: string[] | null | undefined;
	param: keyof Pick<
		PlatformFilterState,
		"subject" | "genre" | "tag" | "keyword"
	>;
}) {
	const cleaned = (values ?? []).map((value) => value.trim()).filter(Boolean);
	if (cleaned.length === 0) {
		return null;
	}
	return (
		<>
			{cleaned.map((value) => (
				<TaxonomyBadgeLink
					key={`${param}-${value}`}
					href={buildSearchHref({
						source: "archive",
						filters: { ...EMPTY_FILTERS, [param]: [value] },
					})}
				>
					<span dir="auto">{value}</span>
				</TaxonomyBadgeLink>
			))}
		</>
	);
}

/** Long free text (description, lyrics) with preserved line breaks. */
function LongText({ text }: { text: string }) {
	return (
		<p
			dir="auto"
			className="whitespace-pre-line text-body leading-relaxed text-foreground"
		>
			{text}
		</p>
	);
}

function buildCreditRows(
	t: TranslateFn,
	locale: string,
	full: PlatformFullMedia,
): MetaRow[] {
	const rows: MetaRow[] = [];
	pushRow(rows, t("metaSinger"), full.singer);
	pushRow(rows, t("metaSpeaker"), full.speaker);
	pushRow(rows, t("metaDirector"), full.creatorArtistDirector);
	pushRow(rows, t("metaPhotographer"), full.creatorArtistPhotographer);
	pushRow(rows, t("metaAuthor"), full.author);
	pushRow(rows, t("metaComposer"), full.composer);
	pushRow(rows, t("metaPoet"), full.poet);
	pushRow(rows, t("metaProducer"), full.producer);
	pushRow(
		rows,
		t("metaPersonShown"),
		full.personShownInVideo ?? full.personShownInImage,
	);
	const contributorList = [
		...(Array.isArray(full.contributors)
			? full.contributors
			: full.contributors
				? [full.contributors]
				: []),
		...(full.contributor ? [full.contributor] : []),
	];
	pushRow(rows, t("metaContributors"), joinList(locale, contributorList));
	return rows;
}

function buildDetailRows(
	t: TranslateFn,
	locale: string,
	hit: PlatformHit,
	full: PlatformFullMedia,
): MetaRow[] {
	const rows: MetaRow[] = [];

	pushRow(rows, t("metaProject"), full.projectName ?? hit.projectName);
	pushRow(
		rows,
		t("metaCategories"),
		joinList(
			locale,
			(full.categories ?? hit.categories ?? [])
				.map((category) => category.name?.trim() ?? "")
				.filter(Boolean),
		),
	);
	pushRow(rows, t("metaLanguage"), full.language ?? hit.language);
	pushRow(rows, t("metaDialect"), full.dialect ?? hit.dialect);
	pushRow(rows, t("metaRegion"), full.region ?? hit.region);
	pushRow(rows, t("metaCity"), full.city);
	pushRow(rows, t("metaVenue"), full.recordingVenue);
	pushRow(rows, t("metaEvent"), full.event);
	pushRow(rows, t("metaLocation"), full.location);
	pushRow(rows, t("metaAudience"), full.audience);

	pushRow(rows, t("metaForm"), full.form);
	pushRow(rows, t("metaMaqam"), full.typeOfMaqam);
	pushRow(rows, t("metaBasta"), full.typeOfBasta);
	pushRow(rows, t("metaComposition"), full.typeOfComposition);
	pushRow(rows, t("metaPerformance"), full.typeOfPerformance);

	pushRow(
		rows,
		t("metaColor"),
		joinList(locale, full.colorOfVideo ?? full.colorOfImage),
	);
	const camera = [full.manufacturer?.trim(), full.model?.trim()]
		.filter(Boolean)
		.join(" ");
	pushRow(rows, t("metaCamera"), camera);
	pushRow(rows, t("metaLens"), full.lens);
	pushRow(rows, t("metaSubtitle"), full.subtitle);
	pushRow(rows, t("metaPhotostory"), full.photostory);

	pushRow(rows, t("metaDocumentType"), full.documentType ?? hit.documentType);
	pushRow(rows, t("metaScript"), full.script);
	pushRow(rows, t("metaIsbn"), full.isbn, { dir: "ltr" });
	pushRow(rows, t("metaEdition"), full.edition);
	pushRow(rows, t("metaVolume"), full.volume);
	pushRow(rows, t("metaSeries"), full.series);
	pushRow(rows, t("metaPrintingHouse"), full.printingHouse);

	const pageCount = full.pageCount ?? hit.pageCount;
	if (pageCount) {
		rows.push({
			label: t("metaPages"),
			value: formatCount(locale, pageCount),
		});
	}
	pushRow(rows, t("metaDuration"), full.duration ?? hit.duration, {
		dir: "ltr",
	});
	pushRow(
		rows,
		t("metaWhereUsed"),
		joinList(locale, full.whereThisVideoUsed ?? full.whereThisImageUsed),
	);

	pushRow(
		rows,
		t("metaDateCreated"),
		formatFullDate(locale, full.dateCreated ?? hit.dateCreated),
	);
	pushRow(
		rows,
		t("metaDatePublished"),
		formatFullDate(locale, full.datePublished ?? hit.datePublished),
	);
	pushRow(rows, t("metaPrintDate"), formatFullDate(locale, full.printDate));

	return rows;
}

function buildRightsRows(
	t: TranslateFn,
	locale: string,
	full: PlatformFullMedia,
): MetaRow[] {
	const rows: MetaRow[] = [];
	pushRow(rows, t("metaCopyright"), full.copyright);
	pushRow(rows, t("metaRightOwner"), full.rightOwner);
	pushRow(
		rows,
		t("metaDateCopyrighted"),
		formatYear(locale, full.dateCopyrighted),
	);
	pushRow(rows, t("metaLicense"), full.licenseType);
	pushRow(rows, t("metaUsageRights"), full.usageRights);
	pushRow(rows, t("metaPublisher"), full.publisher);
	pushRow(rows, t("metaOwner"), full.owner);
	pushRow(rows, t("metaAvailability"), full.availability);
	return rows;
}

/**
 * One platform item, whatever its kind: title block, the right playback or
 * reading surface for the medium, the complete public record as liner notes,
 * and the collection rail. Everything the API omits simply doesn't render.
 */
export async function PlatformPostView({
	detail,
}: {
	detail: PlatformDetailResponse;
}) {
	const locale = await getLocale();
	const [t, tSearch] = await Promise.all([
		getTranslations("Archive"),
		getTranslations("Search"),
	]);

	const hit = detail.item;
	const full =
		detail.audio ?? detail.video ?? detail.image ?? detail.text ?? {};

	const title = hit.title?.trim() || hit.code;
	const subtitle =
		hit.subtitle?.trim() && hit.subtitle.trim() !== title
			? hit.subtitle.trim()
			: null;
	const romanized =
		hit.romanizedTitle?.trim() &&
		hit.romanizedTitle.trim() !== title &&
		hit.romanizedTitle.trim() !== subtitle
			? hit.romanizedTitle.trim()
			: null;

	const kindLabel = tSearch(KIND_LABEL_KEYS[detail.type]);
	const year = formatYear(locale, hit.dateCreated ?? hit.datePublished);

	const credits = buildCreditRows(t, locale, full);
	const details = buildDetailRows(t, locale, hit, full);
	const rights = buildRightsRows(t, locale, full);

	const description = (full.description ?? hit.description)?.trim();
	const abstractText = full.abstractText?.trim();
	const lyrics = full.lyrics?.trim();
	const transcription = full.transcription?.trim();

	const person = full.person ?? hit.person;
	const personName =
		person?.fullName?.trim() || person?.romanizedName?.trim() || null;
	const projectName = (full.projectName ?? hit.projectName)?.trim() || null;
	const projectCode = (full.projectCode ?? hit.projectCode)?.trim() || null;

	const mediaUrl =
		full.audioFileUrl ??
		full.videoFileUrl ??
		full.imageFileUrl ??
		full.textFileUrl ??
		hit.mediaUrl;

	const textOffers: WritingFileOffer[] =
		detail.type === "text" && mediaUrl
			? [
					{
						language: locale === "ku" ? "KMR" : "CKB",
						languageLabel: full.language?.trim() || kindLabel,
						title,
						fileUrl: mediaUrl,
						// The platform's /read proxy serves the stored file; treat it as
						// PDF so the reader tries it — a non-PDF falls back to openFile.
						fileFormat: "PDF",
						pageCount: full.pageCount ?? hit.pageCount ?? null,
						fileSizeLabel: null,
					},
				]
			: [];

	return (
		<article>
			<div className={cn(homeInsetClass, "pt-6 sm:pt-8")}>
				<BackToIndexLink
					href={buildSearchHref({})}
					label={t("backToSearch")}
					ariaLabel={t("backAria")}
				/>

				{/* ---- Title block ------------------------------------------------ */}
				<header className="mt-8 max-w-4xl sm:mt-10">
					<p className="label flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
						<span className="inline-flex items-center gap-1.5 text-foreground/75">
							<KindIcon kind={detail.type} className="size-4" />
							{kindLabel}
						</span>
						{projectName ? (
							<>
								<span aria-hidden className="text-muted/50">
									·
								</span>
								<span dir="auto">{projectName}</span>
							</>
						) : null}
						{year ? (
							<>
								<span aria-hidden className="text-muted/50">
									·
								</span>
								<span className="tabular-nums">{year}</span>
							</>
						) : null}
						{hit.trending ? (
							<span className="ms-1 inline-flex items-center bg-primary px-1.5 py-0.5 text-label leading-none text-primary-foreground">
								{tSearch("cardTrending")}
							</span>
						) : null}
					</p>

					<Heading
						level={1}
						size="display"
						className={cn(
							"mt-3 text-start leading-tight text-foreground [overflow-wrap:anywhere]",
							displayTitleSizeClass(title),
						)}
					>
						<bdi>{title}</bdi>
					</Heading>

					{subtitle ? (
						<p className="mt-2 text-start text-h3 font-normal text-muted">
							<bdi>{subtitle}</bdi>
						</p>
					) : null}
					{romanized ? (
						<p className="mt-1 text-start text-body text-muted">
							<bdi dir="ltr">{romanized}</bdi>
						</p>
					) : null}

					{hit.creator?.trim() ? (
						<p className="mt-4 text-body text-foreground">
							<span className="text-muted">
								{(() => {
									switch (hit.creatorRole) {
										case "singer":
											return tSearch("roleSinger");
										case "speaker":
											return tSearch("roleSpeaker");
										case "director":
											return tSearch("roleDirector");
										case "photographer":
											return tSearch("rolePhotographer");
										case "author":
											return tSearch("roleAuthor");
										default:
											return tSearch("roleCreator");
									}
								})()}
								{": "}
							</span>
							<span dir="auto" className="font-semibold">
								{hit.creator.trim()}
							</span>
						</p>
					) : null}
				</header>

				{/* ---- The medium's own surface ---------------------------------- */}
				<div className="mt-8 sm:mt-10">
					{detail.type === "audio" && mediaUrl ? (
						<div className="grid items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
							{hit.thumbnailUrl ? (
								<Image
									src={hit.thumbnailUrl}
									alt={personName ? t("portraitAlt", { name: personName }) : ""}
									aspectRatio="square"
									framed
									sizes="(max-width: 1024px) 60vw, 288px"
									className="w-full max-w-72"
								/>
							) : null}
							<PlatformAudioPlayer
								src={mediaUrl}
								playLabel={t("play")}
								pauseLabel={t("pause")}
								seekLabel={t("seekLabel")}
								playerLabel={t("audioPlayerLabel")}
								unsupportedText={t("audioUnsupported")}
								className="lg:self-center"
							/>
						</div>
					) : null}

					{detail.type === "video" && mediaUrl ? (
						<PlatformVideoPlayer
							src={mediaUrl}
							title={title}
							poster={hit.thumbnailUrl ?? undefined}
							className="w-full"
						/>
					) : null}

					{detail.type === "image" && mediaUrl ? (
						<CoverLightbox
							src={mediaUrl}
							alt={title}
							caption={title}
							closeLabel={t("closeLightbox")}
							triggerLabel={t("enlargeImage")}
							className="block w-full"
						>
							<div className="relative aspect-3/2 w-full overflow-hidden border border-border bg-sunken">
								<Image
									src={mediaUrl}
									alt={title}
									aspectRatio="3/2"
									objectFit="contain"
									sizes="(max-width: 1536px) 100vw, 1536px"
									className="absolute inset-0 size-full"
								/>
							</div>
						</CoverLightbox>
					) : null}

					{detail.type === "text" ? (
						<div className="flex flex-col gap-6">
							{textOffers.length > 0 ? (
								<WritingPdfPreview
									fileOffers={textOffers}
									locale={locale}
									title={title}
									coverUrl={full.coverImageUrl ?? hit.thumbnailUrl}
								/>
							) : null}
							{mediaUrl ? (
								<a
									href={mediaUrl}
									target="_blank"
									rel="noopener noreferrer"
									className={viewAllCtaClass}
								>
									<span className="relative z-1 flex items-center gap-2.5">
										{t("openFile")}
										<ArrowTopRightOnSquareIcon
											className="size-4 shrink-0"
											aria-hidden
										/>
									</span>
								</a>
							) : null}
						</div>
					) : null}
				</div>

				{/* ---- Taxonomy chips -------------------------------------------- */}
				{[
					...(full.subject ?? hit.subject ?? []),
					...(full.genre ?? hit.genre ?? []),
					...(full.tags ?? hit.tags ?? []),
					...(full.keywords ?? hit.keywords ?? []),
				].some((value) => value.trim()) ? (
					<div className="mt-8 flex flex-wrap gap-2">
						<ChipGroup values={full.subject ?? hit.subject} param="subject" />
						<ChipGroup values={full.genre ?? hit.genre} param="genre" />
						<ChipGroup values={full.tags ?? hit.tags} param="tag" />
						<ChipGroup values={full.keywords ?? hit.keywords} param="keyword" />
					</div>
				) : null}

				{/* ---- About ------------------------------------------------------ */}
				{description || abstractText ? (
					<section className="mt-10 max-w-3xl sm:mt-12">
						<h2 className="mb-4 flex items-center gap-3 font-heading text-body font-semibold text-foreground">
							{t("aboutTitle")}
							<span aria-hidden className="h-px flex-1 bg-border" />
						</h2>
						{abstractText && abstractText !== description ? (
							<p
								dir="auto"
								className="mb-4 text-lead font-medium leading-relaxed text-foreground"
							>
								{abstractText}
							</p>
						) : null}
						{description ? <LongText text={description} /> : null}
					</section>
				) : null}

				{/* ---- Lyrics / transcription ------------------------------------ */}
				{lyrics ? (
					<section className="mt-10 max-w-3xl">
						<h2 className="mb-4 flex items-center gap-3 font-heading text-body font-semibold text-foreground">
							{t("lyricsTitle")}
							<span aria-hidden className="h-px flex-1 bg-border" />
						</h2>
						<div className="border-s-2 border-border ps-5">
							<LongText text={lyrics} />
						</div>
					</section>
				) : null}
				{transcription ? (
					<section className="mt-10 max-w-3xl">
						<h2 className="mb-4 flex items-center gap-3 font-heading text-body font-semibold text-foreground">
							{t("transcriptionTitle")}
							<span aria-hidden className="h-px flex-1 bg-border" />
						</h2>
						<div className="border-s-2 border-border ps-5">
							<LongText text={transcription} />
						</div>
					</section>
				) : null}

				{/* ---- The record ------------------------------------------------- */}
				{credits.length > 0 || details.length > 0 || rights.length > 0 ? (
					<div className="mt-12 flex flex-col gap-10 border-t border-border pt-10 sm:mt-14">
						<MetaSection title={t("creditsTitle")} rows={credits} />
						<MetaSection title={t("metaTitle")} rows={details} />
						<MetaSection title={t("rightsTitle")} rows={rights} />
					</div>
				) : null}

				{/* ---- Person + collection CTAs ---------------------------------- */}
				{personName || (projectCode && projectName) ? (
					<div className="mt-12 flex flex-col gap-6 border-t border-border pt-10 sm:flex-row sm:items-center sm:justify-between">
						{personName && person ? (
							<div className="flex items-center gap-4">
								{person.mediaPortrait ? (
									<Image
										src={person.mediaPortrait}
										alt={t("portraitAlt", { name: personName })}
										aspectRatio="square"
										framed
										sizes="80px"
										className="size-20 shrink-0"
									/>
								) : null}
								<div>
									<p className="text-start font-heading text-h3 font-semibold text-foreground">
										<bdi>{personName}</bdi>
									</p>
									{person.nickname?.trim() &&
									person.nickname.trim() !== personName ? (
										<p className="text-start text-small text-muted">
											<bdi>{person.nickname.trim()}</bdi>
										</p>
									) : null}
									{person.personCode ? (
										<Link
											href={buildSearchHref({
												source: "archive",
												filters: {
													...EMPTY_FILTERS,
													personCode: person.personCode,
												},
											})}
											className="mt-1 inline-flex text-small text-muted underline decoration-border underline-offset-4 transition-colors fine-hover:text-foreground fine-hover:decoration-current"
										>
											{t("personCta", { name: personName })}
										</Link>
									) : null}
								</div>
							</div>
						) : null}

						{projectCode && projectName ? (
							<Link
								href={buildSearchHref({
									source: "archive",
									filters: { ...EMPTY_FILTERS, projectCode },
								})}
								className={viewAllCtaClass}
							>
								<span className="relative z-1">{t("projectCta")}</span>
							</Link>
						) : null}
					</div>
				) : null}
			</div>

			{/* ---- More from this collection ----------------------------------- */}
			{detail.related && detail.related.length > 0 ? (
				<div
					className={cn(
						homeInsetClass,
						"mt-14 border-t border-border pt-10 sm:mt-16 sm:pt-12",
					)}
				>
					<PlatformRelatedRail items={detail.related} />
				</div>
			) : null}
		</article>
	);
}
