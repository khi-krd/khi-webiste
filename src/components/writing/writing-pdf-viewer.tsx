"use client";

import {
	ArrowsPointingInIcon,
	ArrowsPointingOutIcon,
	BookOpenIcon,
	DocumentTextIcon,
	MagnifyingGlassMinusIcon,
	MagnifyingGlassPlusIcon,
	Square2StackIcon,
} from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { useTranslations } from "next-intl";
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { PdfPageScrubber } from "@/components/writing/writing-pdf-page-scrubber";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Spinner } from "@/components/ui/spinner";
import {
	getPdfFileOffers,
	pickDefaultPdfOffer,
} from "@/lib/writing/pdf-offer";
import { spreadStartPage, visibleSpreadPages } from "@/lib/writing/pdf-page-range";
import { resolvePdfViewerUrl } from "@/lib/writing/pdf-url";
import type { WritingFileOffer } from "@/types/writing";
import { cn } from "@/lib/utils";
import "./writing-pdf-viewer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf/pdf.worker.min.mjs";

const MIN_ZOOM = 0.75;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.25;
const FIT_EPSILON = 0.01;
const VIEWPORT_PADDING_Y = 32;
const VIEWPORT_PADDING_X = 48;
const FULLSCREEN_CHROME_HEIGHT = 140;
const SPREAD_PAGE_GAP = 12;

const INLINE_VIEWPORT_CLASS = "h-[24rem] sm:h-[28rem]";
const FULLSCREEN_VIEWPORT_CLASS = "min-h-0 flex-1";

type FitMode = "width" | "height";

const navButtonClass =
	"inline-flex size-9 items-center justify-center border border-border-strong text-foreground transition-colors fine-hover:bg-sunken disabled:pointer-events-none disabled:opacity-40";

type WritingPdfViewerProps = {
	fileOffers: WritingFileOffer[];
	locale: string;
	title: string;
	coverUrl?: string | null;
	className?: string;
};

type PdfReaderLaunchProps = {
	title: string;
	coverUrl?: string | null;
	readLabel: string;
	onStart: () => void;
};

function PdfReaderLaunch({
	title,
	coverUrl,
	readLabel,
	onStart,
}: PdfReaderLaunchProps) {
	return (
		<div className="border border-border bg-background">
			<div
				className={cn(
					"writing-pdf-launch relative overflow-hidden bg-sunken",
					INLINE_VIEWPORT_CLASS,
				)}
			>
				{coverUrl ? (
					<NextImage
						src={coverUrl}
						alt=""
						fill
						sizes="(max-width: 640px) 100vw, 48rem"
						className="object-cover brightness-[0.94] saturate-[0.9]"
					/>
				) : null}
				<div className="writing-pdf-launch__overlay" aria-hidden />
				<div className="writing-pdf-launch__center">
					<button
						type="button"
						onClick={onStart}
						className="writing-pdf-launch__read-btn"
						aria-label={`${readLabel} — ${title}`}
					>
						<span className="writing-pdf-launch__read-ring" aria-hidden />
						<BookOpenIcon className="writing-pdf-launch__read-icon" aria-hidden />
						<span className="writing-pdf-launch__read-label">{readLabel}</span>
					</button>
				</div>
			</div>
		</div>
	);
}

function useElementSize(
	elementRef: React.RefObject<HTMLDivElement | null>,
	enabled = true,
) {
	const [size, setSize] = useState({ width: 0, height: 0 });
	const frameRef = useRef<number | null>(null);

	useEffect(() => {
		if (!enabled) {
			setSize({ width: 0, height: 0 });
			return;
		}

		let observer: ResizeObserver | null = null;
		let attachFrame: number | null = null;
		let cancelled = false;

		const commitSize = (node: HTMLDivElement) => {
			frameRef.current = null;
			const next = {
				width: node.clientWidth,
				height: node.clientHeight,
			};
			setSize((current) =>
				current.width === next.width && current.height === next.height
					? current
					: next,
			);
		};

		const scheduleSizeUpdate = (node: HTMLDivElement) => {
			if (frameRef.current !== null) {
				return;
			}
			frameRef.current = requestAnimationFrame(() => commitSize(node));
		};

		const attach = () => {
			if (cancelled) {
				return;
			}

			const node = elementRef.current;
			if (!node) {
				attachFrame = requestAnimationFrame(attach);
				return;
			}

			commitSize(node);
			observer = new ResizeObserver(() => scheduleSizeUpdate(node));
			observer.observe(node);
		};

		attach();

		return () => {
			cancelled = true;
			observer?.disconnect();
			if (attachFrame !== null) {
				cancelAnimationFrame(attachFrame);
			}
			if (frameRef.current !== null) {
				cancelAnimationFrame(frameRef.current);
			}
		};
	}, [elementRef, enabled]);

	return size;
}

type PageRenderSize = {
	width?: number;
	height?: number;
};

function resolvePageRenderSize({
	fitMode,
	zoom,
	containerWidth,
	viewportHeight,
	spreadColumns,
	chromeHeight,
}: {
	fitMode: FitMode;
	zoom: number;
	containerWidth: number;
	viewportHeight: number;
	spreadColumns: number;
	chromeHeight?: number;
}): PageRenderSize {
	const columns = Math.max(spreadColumns, 1);
	const gapTotal = columns > 1 ? SPREAD_PAGE_GAP * (columns - 1) : 0;
	const availableWidth = Math.max(containerWidth - gapTotal, 0);

	if (fitMode === "width") {
		const width = Math.max(Math.floor((availableWidth / columns) * zoom), 0);
		return width > 0 ? { width } : {};
	}

	const chrome = chromeHeight ?? VIEWPORT_PADDING_Y;
	const height = Math.max(Math.floor((viewportHeight - chrome) * zoom), 0);
	return height > 0 ? { height } : {};
}

type PdfReaderToolbarProps = {
	fitMode: FitMode;
	zoom: number;
	twoPageSpread: boolean;
	isFullscreen?: boolean;
	onZoomOut: () => void;
	onZoomIn: () => void;
	onFitWidth: () => void;
	onFitHeight: () => void;
	onToggleSpread: () => void;
	onToggleFullscreen: () => void;
	labels: {
		zoomIn: string;
		zoomOut: string;
		fitWidth: string;
		fitHeight: string;
		twoPageSpread: string;
		singlePage: string;
		fullSize: string;
		exitFullSize: string;
	};
};

const fitButtonClass =
	"h-9 min-w-9 border border-border-strong px-2.5 font-heading text-small font-medium transition-colors fine-hover:bg-sunken disabled:pointer-events-none disabled:opacity-40";

function PdfReaderToolbar({
	fitMode,
	zoom,
	twoPageSpread,
	isFullscreen = false,
	onZoomOut,
	onZoomIn,
	onFitWidth,
	onFitHeight,
	onToggleSpread,
	onToggleFullscreen,
	labels,
}: PdfReaderToolbarProps) {
	const isBaseZoom = Math.abs(zoom - 1) < FIT_EPSILON;
	const showZoomLabel = !isBaseZoom;

	return (
		<div className="flex flex-wrap items-center justify-end gap-2 border-b border-border px-4 py-3 sm:px-5">
				<button
					type="button"
					className={navButtonClass}
					onClick={onZoomOut}
					disabled={zoom <= MIN_ZOOM}
					aria-label={labels.zoomOut}
				>
					<MagnifyingGlassMinusIcon className="size-4" aria-hidden />
				</button>
				{showZoomLabel ? (
					<span className="label min-w-9 text-center font-medium tabular-nums">
						{Math.round(zoom * 100)}%
					</span>
				) : null}
				<button
					type="button"
					className={navButtonClass}
					onClick={onZoomIn}
					disabled={zoom >= MAX_ZOOM}
					aria-label={labels.zoomIn}
				>
					<MagnifyingGlassPlusIcon className="size-4" aria-hidden />
				</button>
				<button
					type="button"
					onClick={onFitWidth}
					aria-label={labels.fitWidth}
					aria-pressed={fitMode === "width" && isBaseZoom}
					className={cn(
						fitButtonClass,
						fitMode === "width" && isBaseZoom && "bg-sunken",
					)}
				>
					{labels.fitWidth}
				</button>
				<button
					type="button"
					onClick={onFitHeight}
					aria-label={labels.fitHeight}
					aria-pressed={fitMode === "height" && isBaseZoom}
					className={cn(
						fitButtonClass,
						fitMode === "height" && isBaseZoom && "bg-sunken",
					)}
				>
					{labels.fitHeight}
				</button>
				<button
						type="button"
						onClick={onToggleSpread}
						aria-label={
							twoPageSpread ? labels.singlePage : labels.twoPageSpread
						}
						aria-pressed={twoPageSpread}
						className={cn(
							fitButtonClass,
							twoPageSpread && "bg-sunken",
						)}
					>
						<Square2StackIcon className="size-4" aria-hidden />
					</button>
					<button
						type="button"
						className={navButtonClass}
						onClick={onToggleFullscreen}
						aria-label={isFullscreen ? labels.exitFullSize : labels.fullSize}
					>
						{isFullscreen ? (
							<ArrowsPointingInIcon className="size-4" aria-hidden />
						) : (
							<ArrowsPointingOutIcon className="size-4" aria-hidden />
						)}
					</button>
		</div>
	);
}

type PdfReaderFrameProps = {
	toolbar: ReactNode;
	viewport: ReactNode;
	scrubber: ReactNode;
	className?: string;
};

function PdfReaderFrame({
	toolbar,
	viewport,
	scrubber,
	className,
}: PdfReaderFrameProps) {
	return (
		<div
			className={cn(
				"flex min-h-0 flex-col border border-border bg-background",
				className,
			)}
		>
			{toolbar}
			{viewport}
			{scrubber}
		</div>
	);
}

type PdfReaderViewportProps = {
	title: string;
	pdfSrc: string;
	visiblePages: number[];
	twoPageSpread: boolean;
	pageRenderSize: PageRenderSize;
	documentReady: boolean;
	isViewportReady: boolean;
	loadError: boolean;
	viewportClassName: string;
	pageContainerClassName: string;
	viewportRef: React.RefObject<HTMLDivElement | null>;
	onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
	onLoadSuccess: (total: number) => void;
	onLoadError: () => void;
	onInitialDisplayReady: () => void;
	initialDisplayComplete?: boolean;
	labels: {
		loading: string;
		errorTitle: string;
		errorDescription: string;
	};
};

function PdfPageSlot({
	page,
	pageRenderSize,
	isSinglePage,
	onRenderSuccess,
}: {
	page: number;
	pageRenderSize: PageRenderSize;
	isSinglePage: boolean;
	onRenderSuccess: (page: number) => void;
}) {
	const [isRendered, setIsRendered] = useState(false);

	useEffect(() => {
		setIsRendered(false);
	}, [page, pageRenderSize.height, pageRenderSize.width]);

	return (
		<div
			className="writing-pdf-viewer__page-slot"
			style={{
				minHeight: pageRenderSize.height,
				minWidth:
					pageRenderSize.width && isSinglePage
						? pageRenderSize.width
						: undefined,
			}}
		>
			<Page
				pageNumber={page}
				width={pageRenderSize.width}
				height={pageRenderSize.height}
				renderTextLayer
				renderAnnotationLayer
				loading={null}
				onRenderSuccess={() => {
					setIsRendered(true);
					onRenderSuccess(page);
				}}
				className={cn(
					"writing-pdf-viewer__page",
					!isRendered && "writing-pdf-viewer__page--pending",
				)}
			/>
		</div>
	);
}

function PdfReaderViewport({
	title,
	pdfSrc,
	visiblePages,
	twoPageSpread,
	pageRenderSize,
	documentReady,
	isViewportReady,
	loadError,
	viewportClassName,
	pageContainerClassName,
	viewportRef,
	onKeyDown,
	onLoadSuccess,
	onLoadError,
	onInitialDisplayReady,
	initialDisplayComplete = false,
	labels,
}: PdfReaderViewportProps) {
	const hasPageSize =
		(pageRenderSize.width ?? 0) > 0 || (pageRenderSize.height ?? 0) > 0;
	const canRenderPages = documentReady && isViewportReady && hasPageSize;
	const [renderedPages, setRenderedPages] = useState<Set<number>>(() => new Set());
	const [hasDisplayedOnce, setHasDisplayedOnce] = useState(
		initialDisplayComplete,
	);

	useEffect(() => {
		setRenderedPages(new Set());
		setHasDisplayedOnce(initialDisplayComplete);
	}, [pdfSrc, initialDisplayComplete]);

	useEffect(() => {
		setRenderedPages(new Set());
	}, [visiblePages, pageRenderSize.height, pageRenderSize.width]);

	const handlePageRenderSuccess = useCallback((page: number) => {
		setRenderedPages((current) => {
			if (current.has(page)) {
				return current;
			}
			const next = new Set(current);
			next.add(page);
			return next;
		});
	}, []);

	const allPagesRendered =
		canRenderPages &&
		visiblePages.length > 0 &&
		visiblePages.every((page) => renderedPages.has(page));

	useEffect(() => {
		if (allPagesRendered && !hasDisplayedOnce) {
			setHasDisplayedOnce(true);
			onInitialDisplayReady();
		}
	}, [allPagesRendered, hasDisplayedOnce, onInitialDisplayReady]);

	const showSpinner =
		!loadError && !hasDisplayedOnce && (!canRenderPages || !allPagesRendered);

	return (
		<div
			ref={viewportRef}
			className={cn("relative overflow-auto bg-sunken", viewportClassName)}
			onKeyDown={onKeyDown}
			tabIndex={0}
			role="region"
			aria-label={title}
		>
			{loadError ? (
				<div className="flex min-h-48 items-center justify-center p-6 sm:p-8">
					<ErrorState
						title={labels.errorTitle}
						description={labels.errorDescription}
						framed
						className="py-12"
					/>
				</div>
			) : (
				<div className="flex h-full justify-center px-4 py-4 sm:px-6 sm:py-5">
					<div className={cn("relative w-full", pageContainerClassName)}>
						{showSpinner ? (
							<div className="absolute inset-0 z-1 flex items-center justify-center">
								<Spinner size="lg" label={labels.loading} />
							</div>
						) : null}
						<Document
							key={pdfSrc}
							file={pdfSrc}
							onLoadSuccess={({ numPages: total }) => onLoadSuccess(total)}
							onLoadError={onLoadError}
							loading={null}
							error={null}
							className={cn(
								"writing-pdf-viewer__document",
								showSpinner && "invisible",
							)}
						>
							{canRenderPages ? (
								<div
									className={cn(
										"writing-pdf-viewer__spread",
										twoPageSpread &&
											visiblePages.length > 1 &&
											"writing-pdf-viewer__spread--double",
									)}
									style={{
										minHeight: pageRenderSize.height,
									}}
								>
									{visiblePages.map((page, index) => (
										<PdfPageSlot
											key={
												twoPageSpread
													? `spread-slot-${index}`
													: "single-slot"
											}
											page={page}
											pageRenderSize={pageRenderSize}
											isSinglePage={visiblePages.length === 1}
											onRenderSuccess={handlePageRenderSuccess}
										/>
									))}
								</div>
							) : null}
						</Document>
					</div>
				</div>
			)}
		</div>
	);
}

export function WritingPdfViewer({
	fileOffers,
	locale,
	title,
	coverUrl,
	className,
}: WritingPdfViewerProps) {
	const t = useTranslations("Writings.post.reader");
	const pdfOffers = useMemo(() => getPdfFileOffers(fileOffers), [fileOffers]);
	const defaultOffer = useMemo(
		() => pickDefaultPdfOffer(fileOffers, locale),
		[fileOffers, locale],
	);

	const [activeOffer, setActiveOffer] = useState<WritingFileOffer | null>(
		defaultOffer,
	);
	const [pageNumber, setPageNumber] = useState(1);
	const [numPages, setNumPages] = useState(0);
	const [fitMode, setFitMode] = useState<FitMode>("height");
	const [twoPageSpread, setTwoPageSpread] = useState(true);
	const [zoom, setZoom] = useState(1);
	const [loadError, setLoadError] = useState(false);
	const [documentReady, setDocumentReady] = useState(false);
	const [isDisplayReady, setIsDisplayReady] = useState(false);
	const [isReaderActive, setIsReaderActive] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const stablePageRenderSizeRef = useRef<PageRenderSize>({});

	const inlineViewportRef = useRef<HTMLDivElement>(null);
	const fullscreenViewportRef = useRef<HTMLDivElement>(null);
	const dialogRef = useRef<HTMLDialogElement>(null);

	const inlineViewportSize = useElementSize(
		inlineViewportRef,
		isReaderActive && !isFullscreen,
	);
	const fullscreenViewportSize = useElementSize(
		fullscreenViewportRef,
		isReaderActive && isFullscreen,
	);

	const pdfSrc = useMemo(
		() =>
			activeOffer?.fileUrl ? resolvePdfViewerUrl(activeOffer.fileUrl) : null,
		[activeOffer?.fileUrl],
	);

	const toolbarLabels = useMemo(
		() => ({
			zoomIn: t("zoomIn"),
			zoomOut: t("zoomOut"),
			fitWidth: t("fitWidth"),
			fitHeight: t("fitHeight"),
			twoPageSpread: t("twoPageSpread"),
			singlePage: t("singlePage"),
			fullSize: t("fullSize"),
			exitFullSize: t("exitFullSize"),
		}),
		[t],
	);

	const scrubberLabels = useMemo(
		() => ({
			navLabel: t("pageNavLabel"),
			pageOf: (page: number, total: number) =>
				t("pageOf", { page, total }),
			pagesRemaining: (count: number) =>
				t("pagesRemaining", { count }),
		}),
		[t],
	);

	const viewportLabels = useMemo(
		() => ({
			loading: t("loading"),
			errorTitle: t("errorTitle"),
			errorDescription: t("errorDescription"),
		}),
		[t],
	);

	useEffect(() => {
		setActiveOffer(defaultOffer);
		setPageNumber(1);
		setNumPages(0);
		setLoadError(false);
		setDocumentReady(false);
		setIsDisplayReady(false);
		setIsReaderActive(false);
		setFitMode("height");
		setZoom(1);
		stablePageRenderSizeRef.current = {};
	}, [defaultOffer]);

	useEffect(() => {
		if (!isFullscreen) {
			return;
		}
		const previous = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previous;
		};
	}, [isFullscreen]);

	const selectOffer = useCallback((offer: WritingFileOffer) => {
		setActiveOffer(offer);
		setPageNumber(1);
		setNumPages(0);
		setLoadError(false);
		setDocumentReady(false);
		setIsDisplayReady(false);
		setFitMode("height");
		setZoom(1);
		stablePageRenderSizeRef.current = {};
	}, []);

	const navigateStep = twoPageSpread ? 2 : 1;

	const goToPage = useCallback(
		(delta: number) => {
			setPageNumber((current) => {
				const next = Math.min(
					Math.max(current + delta * navigateStep, 1),
					Math.max(numPages, 1),
				);
				return next;
			});
		},
		[numPages, navigateStep],
	);

	const goToPageNumber = useCallback(
		(page: number) => {
			const clamped = Math.min(Math.max(page, 1), Math.max(numPages, 1));
			setPageNumber(spreadStartPage(clamped, twoPageSpread));
		},
		[numPages, twoPageSpread],
	);

	const toggleSpread = useCallback(() => {
		setTwoPageSpread((current) => {
			const next = !current;
			if (next) {
				setPageNumber((page) => spreadStartPage(page, true));
			}
			return next;
		});
	}, []);

	const onKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLDivElement>) => {
			const rtl = document.documentElement.dir === "rtl";
			if (event.key === (rtl ? "ArrowLeft" : "ArrowRight")) {
				event.preventDefault();
				goToPage(1);
			}
			if (event.key === (rtl ? "ArrowRight" : "ArrowLeft")) {
				event.preventDefault();
				goToPage(-1);
			}
			if (event.key === "Escape" && isFullscreen) {
				dialogRef.current?.close();
			}
		},
		[goToPage, isFullscreen],
	);

	const openFullscreen = useCallback(() => {
		setIsFullscreen(true);
		queueMicrotask(() => dialogRef.current?.showModal());
	}, []);

	const closeFullscreen = useCallback(() => {
		dialogRef.current?.close();
		setIsFullscreen(false);
	}, []);

	const handleDocumentLoadSuccess = useCallback((total: number) => {
		setNumPages(total);
		setLoadError(false);
		setDocumentReady(true);
	}, []);

	const handleDocumentLoadError = useCallback(() => {
		setLoadError(true);
		setDocumentReady(false);
	}, []);

	const handleInitialDisplayReady = useCallback(() => {
		setIsDisplayReady(true);
	}, []);

	const activeViewportSize = isFullscreen
		? fullscreenViewportSize
		: inlineViewportSize;
	const isViewportReady =
		activeViewportSize.width > 0 && activeViewportSize.height > 0;
	const pagesToShow = visibleSpreadPages(pageNumber, numPages, twoPageSpread);
	const spreadColumns = twoPageSpread && pagesToShow.length > 1 ? 2 : 1;
	const pageRenderSize = useMemo(() => {
		if (!isViewportReady) {
			return stablePageRenderSizeRef.current;
		}

		const availableWidth = Math.max(
			activeViewportSize.width - VIEWPORT_PADDING_X,
			0,
		);
		const viewportHeight = activeViewportSize.height;
		const next = resolvePageRenderSize({
			fitMode,
			zoom,
			containerWidth: availableWidth,
			viewportHeight,
			spreadColumns,
			chromeHeight: isFullscreen
				? FULLSCREEN_CHROME_HEIGHT
				: VIEWPORT_PADDING_Y,
		});

		const hasSize = (next.width ?? 0) > 0 || (next.height ?? 0) > 0;
		if (!hasSize) {
			return stablePageRenderSizeRef.current;
		}

		const previous = stablePageRenderSizeRef.current;
		if (
			previous.width === next.width &&
			previous.height === next.height
		) {
			return previous;
		}

		stablePageRenderSizeRef.current = next;
		return next;
	}, [
		activeViewportSize.width,
		activeViewportSize.height,
		fitMode,
		isViewportReady,
		zoom,
		spreadColumns,
		isFullscreen,
	]);

	if (pdfOffers.length === 0) {
		return (
			<EmptyState
				icon={<DocumentTextIcon />}
				title={t("unavailableTitle")}
				description={t("unavailableDescription")}
				className="border border-dashed border-border bg-background py-14"
			/>
		);
	}

	const languageNav =
		pdfOffers.length > 1 ? (
			<nav
				aria-label={title}
				className="mb-6 flex flex-wrap gap-x-6 gap-y-2 border-b border-border pb-4"
			>
				{pdfOffers.map((offer) => {
					const isActive = offer.language === activeOffer?.language;
					return (
						<button
							key={offer.language}
							type="button"
							onClick={() => selectOffer(offer)}
							className={cn(
								"font-heading text-body font-medium transition-colors",
								isActive
									? "text-foreground underline decoration-foreground underline-offset-4"
									: "text-muted fine-hover:text-foreground fine-hover:underline fine-hover:decoration-border fine-hover:underline-offset-4",
							)}
						>
							{offer.languageLabel}
						</button>
					);
				})}
			</nav>
		) : null;

	if (!isReaderActive) {
		return (
			<div className={cn("writing-pdf-viewer", className)}>
				{languageNav}
				<PdfReaderLaunch
					title={title}
					coverUrl={coverUrl}
					readLabel={t("readButton")}
					onStart={() => setIsReaderActive(true)}
				/>
			</div>
		);
	}

	const toolbarProps = {
		fitMode,
		zoom,
		twoPageSpread,
		onToggleSpread: toggleSpread,
		onZoomOut: () =>
			setZoom((current) => Math.max(MIN_ZOOM, current - ZOOM_STEP)),
		onFitWidth: () => {
			setFitMode("width");
			setZoom(1);
		},
		onFitHeight: () => {
			setFitMode("height");
			setZoom(1);
		},
		onZoomIn: () =>
			setZoom((current) => Math.min(MAX_ZOOM, current + ZOOM_STEP)),
		labels: toolbarLabels,
	};

	const scrubber = !loadError && numPages > 1 ? (
		<PdfPageScrubber
			pageNumber={pageNumber}
			numPages={numPages}
			twoPageSpread={twoPageSpread}
			onSelectPage={goToPageNumber}
			labels={scrubberLabels}
		/>
	) : null;

	const viewportProps = pdfSrc
		? {
				title,
				pdfSrc,
				visiblePages: pagesToShow,
				twoPageSpread,
				pageRenderSize,
				documentReady,
				isViewportReady,
				loadError,
				onKeyDown,
				onLoadSuccess: handleDocumentLoadSuccess,
				onLoadError: handleDocumentLoadError,
				onInitialDisplayReady: handleInitialDisplayReady,
				initialDisplayComplete: isDisplayReady,
				labels: viewportLabels,
			}
		: null;

	return (
		<div className={cn("writing-pdf-viewer", className)}>
			{languageNav}

			{!isFullscreen ? (
				<PdfReaderFrame
					toolbar={
						<PdfReaderToolbar
							{...toolbarProps}
							onToggleFullscreen={openFullscreen}
						/>
					}
					viewport={
						viewportProps ? (
							<PdfReaderViewport
								{...viewportProps}
								viewportClassName={INLINE_VIEWPORT_CLASS}
								pageContainerClassName={
									twoPageSpread
										? "max-w-3xl sm:max-w-4xl"
										: "max-w-xl sm:max-w-2xl"
								}
								viewportRef={inlineViewportRef}
							/>
						) : null
					}
					scrubber={scrubber}
				/>
			) : null}

			<dialog
				ref={dialogRef}
				onClose={() => setIsFullscreen(false)}
				aria-label={title}
				className="m-0 h-svh max-h-svh w-svw max-w-none border-0 bg-background p-0 text-foreground backdrop:bg-foreground/85 open:flex open:flex-col"
			>
				{isFullscreen ? (
					<PdfReaderFrame
						className="h-full min-h-0 flex-1 border-0"
						toolbar={
							<PdfReaderToolbar
								{...toolbarProps}
								isFullscreen
								onToggleFullscreen={closeFullscreen}
							/>
						}
						viewport={
							viewportProps ? (
								<PdfReaderViewport
									{...viewportProps}
									viewportClassName={FULLSCREEN_VIEWPORT_CLASS}
									pageContainerClassName={
										twoPageSpread
											? "max-w-6xl xl:max-w-7xl"
											: "max-w-5xl xl:max-w-6xl"
									}
									viewportRef={fullscreenViewportRef}
								/>
							) : null
						}
						scrubber={scrubber}
					/>
				) : null}
			</dialog>
		</div>
	);
}
