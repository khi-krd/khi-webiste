"use client";

import {
	ArrowDownTrayIcon,
	ArrowLeftIcon,
	ArrowRightIcon,
	ArrowsPointingInIcon,
	ArrowsPointingOutIcon,
	BookOpenIcon,
	DocumentTextIcon,
	MagnifyingGlassMinusIcon,
	MagnifyingGlassPlusIcon,
	MinusIcon,
	PlusIcon,
} from "@heroicons/react/24/outline";
import NextImage from "next/image";
import { useTranslations } from "next-intl";
import {
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Spinner } from "@/components/ui/spinner";
import { useIsMobile } from "@/lib/use-is-mobile";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { cn } from "@/lib/utils";
import { getPdfFileOffers, pickDefaultPdfOffer } from "@/lib/writing/pdf-offer";
import { visibleSpreadPages } from "@/lib/writing/pdf-page-range";
import { resolvePdfViewerUrl } from "@/lib/writing/pdf-url";
import type { WritingFileOffer } from "@/types/writing";
import "./writing-pdf-viewer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf/pdf.worker.min.mjs";

const MIN_ZOOM = 0.75;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.25;
const WHEEL_ZOOM_FACTOR = 0.0015;
const FIT_EPSILON = 0.01;
const VIEWPORT_PADDING_Y = 40;
const VIEWPORT_PADDING_Y_MOBILE = 24;
const VIEWPORT_PADDING_X = 48;
const VIEWPORT_PADDING_X_MOBILE = 8;
const SWIPE_THRESHOLD_PX = 48;
const DRAG_PAN_THRESHOLD_PX = 4;
const SPREAD_PAGE_GAP = 12;
const THUMB_WIDTH = 92;

function clampZoom(value: number): number {
	return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

function touchDistance(
	a: Pick<Touch, "clientX" | "clientY">,
	b: Pick<Touch, "clientX" | "clientY">,
): number {
	return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

const INLINE_VIEWPORT_CLASS =
	"h-[72dvh] min-h-[28rem] sm:h-[82dvh] sm:min-h-[38rem] sm:max-h-[64rem]";
const FULLSCREEN_VIEWPORT_CLASS = "min-h-0 flex-1";
const READER_VIEWPORT_CLASS = "h-full min-w-0 flex-1";

type FitMode = "width" | "height";

type PdfDocument = Parameters<
	NonNullable<React.ComponentProps<typeof Document>["onLoadSuccess"]>
>[0];

const iconButtonClass =
	"inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-foreground transition-colors fine-hover:bg-sunken disabled:pointer-events-none disabled:opacity-35";

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
		<div className="overflow-hidden rounded-2xl border border-border bg-background">
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
						<BookOpenIcon
							className="writing-pdf-launch__read-icon"
							aria-hidden
						/>
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
	pageNumber: number;
	numPages: number;
	fitMode: FitMode;
	zoom: number;
	isFullscreen?: boolean;
	isMobile?: boolean;
	downloadHref: string | null;
	downloadName: string;
	onPrevious: () => void;
	onNext: () => void;
	onSelectPage: (page: number) => void;
	onZoomOut: () => void;
	onZoomIn: () => void;
	onToggleFit: () => void;
	onToggleFullscreen: () => void;
	labels: {
		zoomIn: string;
		zoomOut: string;
		fitWidth: string;
		fitHeight: string;
		fullSize: string;
		exitFullSize: string;
		previousPage: string;
		nextPage: string;
		pageNumber: string;
		download: string;
	};
};

const toolbarDivider = (
	<span className="mx-1 h-6 w-px shrink-0 bg-border sm:mx-2" aria-hidden />
);

/** Western digits for the page box, whatever numeral set the reader typed. */
function toLatinDigits(value: string): string {
	return value
		.replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
		.replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0));
}

function PdfPageNumberInput({
	pageNumber,
	numPages,
	onSelectPage,
	label,
}: {
	pageNumber: number;
	numPages: number;
	onSelectPage: (page: number) => void;
	label: string;
}) {
	const [draft, setDraft] = useState(String(pageNumber));

	useEffect(() => {
		setDraft(String(pageNumber));
	}, [pageNumber]);

	const commit = () => {
		const parsed = Number.parseInt(toLatinDigits(draft), 10);
		if (!Number.isFinite(parsed) || numPages < 1) {
			setDraft(String(pageNumber));
			return;
		}
		const clamped = Math.min(Math.max(parsed, 1), numPages);
		setDraft(String(clamped));
		onSelectPage(clamped);
	};

	return (
		<div className="flex items-center gap-1.5 tabular-nums">
			<input
				type="text"
				inputMode="numeric"
				value={draft}
				aria-label={label}
				onChange={(event) => setDraft(event.currentTarget.value)}
				onFocus={(event) => event.currentTarget.select()}
				onBlur={commit}
				onKeyDown={(event) => {
					if (event.key === "Enter") {
						event.preventDefault();
						commit();
					}
				}}
				className="writing-pdf-toolbar__page-input"
			/>
			<span className="font-heading text-small font-semibold text-foreground">
				/ {numPages || "–"}
			</span>
		</div>
	);
}

function PdfReaderToolbar({
	pageNumber,
	numPages,
	fitMode,
	zoom,
	isFullscreen = false,
	isMobile = false,
	downloadHref,
	downloadName,
	onPrevious,
	onNext,
	onSelectPage,
	onZoomOut,
	onZoomIn,
	onToggleFit,
	onToggleFullscreen,
	labels,
}: PdfReaderToolbarProps) {
	const isFitWidth = isMobile || fitMode === "width";

	return (
		<div
			dir="ltr"
			className="writing-pdf-toolbar flex items-center gap-0.5 border-b border-border bg-surface px-2 py-2 sm:gap-1 sm:px-4 sm:py-2.5"
		>
			<div className="flex items-center gap-0.5 sm:gap-1">
				{downloadHref ? (
					<a
						href={downloadHref}
						download={downloadName}
						className={iconButtonClass}
						aria-label={labels.download}
						title={labels.download}
					>
						<ArrowDownTrayIcon className="size-5" aria-hidden />
					</a>
				) : null}
				<button
					type="button"
					className={iconButtonClass}
					onClick={onToggleFullscreen}
					aria-label={isFullscreen ? labels.exitFullSize : labels.fullSize}
					title={isFullscreen ? labels.exitFullSize : labels.fullSize}
				>
					{isFullscreen ? (
						<ArrowsPointingInIcon className="size-5" aria-hidden />
					) : (
						<ArrowsPointingOutIcon className="size-5" aria-hidden />
					)}
				</button>
			</div>

			{toolbarDivider}
			<span className="flex-1" aria-hidden />

			<div className="flex items-center gap-1 sm:gap-2">
				<button
					type="button"
					className={iconButtonClass}
					onClick={onPrevious}
					disabled={pageNumber <= 1}
					aria-label={labels.previousPage}
					title={labels.previousPage}
				>
					<ArrowLeftIcon className="size-5" aria-hidden />
				</button>
				<PdfPageNumberInput
					pageNumber={pageNumber}
					numPages={numPages}
					onSelectPage={onSelectPage}
					label={labels.pageNumber}
				/>
				<button
					type="button"
					className={iconButtonClass}
					onClick={onNext}
					disabled={pageNumber >= numPages}
					aria-label={labels.nextPage}
					title={labels.nextPage}
				>
					<ArrowRightIcon className="size-5" aria-hidden />
				</button>
			</div>

			<span className="flex-1" aria-hidden />

			<div className="hidden items-center sm:flex">
				{toolbarDivider}
				<div className="flex items-center gap-1">
					<button
						type="button"
						className={iconButtonClass}
						onClick={onZoomOut}
						disabled={zoom <= MIN_ZOOM}
						aria-label={labels.zoomOut}
						title={labels.zoomOut}
					>
						<MinusIcon className="size-5" aria-hidden />
					</button>
					<span className="min-w-12 text-center font-heading text-small font-semibold tabular-nums text-foreground">
						{Math.round(zoom * 100)}%
					</span>
					<button
						type="button"
						className={iconButtonClass}
						onClick={onZoomIn}
						disabled={zoom >= MAX_ZOOM}
						aria-label={labels.zoomIn}
						title={labels.zoomIn}
					>
						<PlusIcon className="size-5" aria-hidden />
					</button>
				</div>
				{!isMobile ? (
					<>
						{toolbarDivider}
						<button
							type="button"
							className={iconButtonClass}
							onClick={onToggleFit}
							aria-label={isFitWidth ? labels.fitHeight : labels.fitWidth}
							title={isFitWidth ? labels.fitHeight : labels.fitWidth}
						>
							{isFitWidth ? (
								<MagnifyingGlassMinusIcon className="size-5" aria-hidden />
							) : (
								<MagnifyingGlassPlusIcon className="size-5" aria-hidden />
							)}
						</button>
					</>
				) : null}
			</div>
		</div>
	);
}

function PdfThumbnail({
	pdf,
	page,
	active,
	label,
	onSelect,
}: {
	pdf: PdfDocument;
	page: number;
	active: boolean;
	label: string;
	onSelect: (page: number) => void;
}) {
	const buttonRef = useRef<HTMLButtonElement>(null);
	const [inView, setInView] = useState(false);

	// Thumbnails render lazily: a full-length book must not rasterise every
	// page up front just to fill a rail the reader may never scroll.
	useEffect(() => {
		if (inView) {
			return;
		}
		const node = buttonRef.current;
		if (!node) {
			return;
		}
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					setInView(true);
					observer.disconnect();
				}
			},
			{ root: node.parentElement, rootMargin: "240px 0px" },
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, [inView]);

	return (
		<button
			ref={buttonRef}
			type="button"
			data-page={page}
			onClick={() => onSelect(page)}
			aria-label={label}
			aria-current={active ? "page" : undefined}
			className={cn("writing-pdf-thumb", active && "writing-pdf-thumb--active")}
		>
			<span
				className="writing-pdf-thumb__page"
				style={{ width: THUMB_WIDTH, minHeight: inView ? undefined : 124 }}
			>
				{inView ? (
					<Page
						pdf={pdf}
						pageNumber={page}
						width={THUMB_WIDTH}
						renderTextLayer={false}
						renderAnnotationLayer={false}
						loading={null}
						error={null}
					/>
				) : null}
			</span>
			<span className="writing-pdf-thumb__number">{page}</span>
		</button>
	);
}

function PdfThumbnailRail({
	pdf,
	numPages,
	pageNumber,
	onSelectPage,
	labels,
}: {
	pdf: PdfDocument;
	numPages: number;
	pageNumber: number;
	onSelectPage: (page: number) => void;
	labels: { navLabel: string; goToPage: (page: number) => string };
}) {
	const railRef = useRef<HTMLElement>(null);

	useEffect(() => {
		railRef.current
			?.querySelector(`[data-page="${pageNumber}"]`)
			?.scrollIntoView({ block: "nearest" });
	}, [pageNumber]);

	return (
		<nav
			ref={railRef}
			aria-label={labels.navLabel}
			className="writing-pdf-rail hidden md:flex"
		>
			{Array.from({ length: numPages }, (_, index) => index + 1).map((page) => (
				<PdfThumbnail
					key={page}
					pdf={pdf}
					page={page}
					active={page === pageNumber}
					label={labels.goToPage(page)}
					onSelect={onSelectPage}
				/>
			))}
		</nav>
	);
}

type PdfReaderFrameProps = {
	toolbar: ReactNode;
	rail: ReactNode;
	viewport: ReactNode;
	bodyClassName: string;
	className?: string;
};

function PdfReaderFrame({
	toolbar,
	rail,
	viewport,
	bodyClassName,
	className,
}: PdfReaderFrameProps) {
	return (
		<div
			className={cn(
				"writing-pdf-reader flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface",
				className,
			)}
		>
			{toolbar}
			<div dir="ltr" className={cn("flex min-h-0", bodyClassName)}>
				{rail}
				{viewport}
			</div>
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
	zoom: number;
	onZoomChange: (zoom: number) => void;
	onSwipeNavigate?: (direction: 1 | -1) => void;
	enableSwipe?: boolean;
	isMobile?: boolean;
	onLoadSuccess: (pdf: PdfDocument) => void;
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
	}, []);

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
	zoom,
	onZoomChange,
	onSwipeNavigate,
	enableSwipe = false,
	isMobile = false,
	onLoadSuccess,
	onLoadError,
	onInitialDisplayReady,
	initialDisplayComplete = false,
	labels,
}: PdfReaderViewportProps) {
	const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
	const pinchRef = useRef<{ startDistance: number; startZoom: number } | null>(
		null,
	);
	const pointerDragRef = useRef<{
		pointerId: number;
		startX: number;
		startY: number;
		originScrollLeft: number;
		originScrollTop: number;
		active: boolean;
	} | null>(null);
	const lastWheelNavAtRef = useRef(0);
	const zoomRef = useRef(zoom);
	zoomRef.current = zoom;

	const hasPageSize =
		(pageRenderSize.width ?? 0) > 0 || (pageRenderSize.height ?? 0) > 0;
	const canRenderPages = documentReady && isViewportReady && hasPageSize;
	const [renderedPages, setRenderedPages] = useState<Set<number>>(
		() => new Set(),
	);
	const [hasDisplayedOnce, setHasDisplayedOnce] = useState(
		initialDisplayComplete,
	);
	const [isPinching, setIsPinching] = useState(false);
	const [isDragPanning, setIsDragPanning] = useState(false);
	/** Whether the document currently overflows the viewport — the only state
	 *  a drag-pan (and its `grab` cursor) can act on. Measured off the live
	 *  box rather than derived from fit mode: a fitted page fills the box to
	 *  the pixel, and whether it spills is a layout fact, not a prop. */
	const [canPan, setCanPan] = useState(false);

	// Re-measure where layout has already settled: the viewport resizing
	// (fit buttons, fullscreen, window) and the scroll content growing or
	// shrinking (page render, zoom, spread toggle) both land there.
	useEffect(() => {
		const node = viewportRef.current;
		if (!node) {
			return;
		}

		const measure = () => {
			setCanPan(
				node.scrollWidth > node.clientWidth + 1 ||
					node.scrollHeight > node.clientHeight + 1,
			);
		};

		const resize = new ResizeObserver(measure);
		const observeAll = () => {
			resize.disconnect();
			resize.observe(node);
			for (const child of Array.from(node.children)) {
				resize.observe(child);
			}
		};
		const mutations = new MutationObserver(observeAll);

		measure();
		observeAll();
		mutations.observe(node, { childList: true });
		return () => {
			resize.disconnect();
			mutations.disconnect();
		};
	}, [viewportRef]);

	useEffect(() => {
		setRenderedPages(new Set());
		setHasDisplayedOnce(initialDisplayComplete);
	}, [initialDisplayComplete]);

	useEffect(() => {
		setRenderedPages(new Set());
	}, []);

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

	const navigateFromSwipe = useCallback(
		(deltaX: number, deltaY: number) => {
			if (!enableSwipe || !onSwipeNavigate) {
				return;
			}
			if (
				Math.abs(deltaX) < SWIPE_THRESHOLD_PX ||
				Math.abs(deltaX) <= Math.abs(deltaY)
			) {
				return;
			}
			// The reader is laid out left-to-right (← previous, → next), so a
			// leftward swipe always turns forward.
			onSwipeNavigate(deltaX < 0 ? 1 : -1);
		},
		[enableSwipe, onSwipeNavigate],
	);

	const handleWheel = useCallback(
		(event: WheelEvent) => {
			if (event.ctrlKey || event.metaKey) {
				event.preventDefault();
				const next = clampZoom(
					zoomRef.current - event.deltaY * WHEEL_ZOOM_FACTOR,
				);
				if (Math.abs(next - zoomRef.current) > FIT_EPSILON / 2) {
					onZoomChange(next);
				}
				return;
			}

			if (
				enableSwipe &&
				onSwipeNavigate &&
				Math.abs(event.deltaX) > Math.abs(event.deltaY) &&
				Math.abs(event.deltaX) > 12
			) {
				const now = Date.now();
				if (now - lastWheelNavAtRef.current < 450) {
					return;
				}
				lastWheelNavAtRef.current = now;
				event.preventDefault();
				onSwipeNavigate(event.deltaX > 0 ? 1 : -1);
			}
		},
		[enableSwipe, onSwipeNavigate, onZoomChange],
	);

	const handleTouchStart = useCallback(
		(event: React.TouchEvent<HTMLDivElement>) => {
			if (event.touches.length === 2) {
				const [a, b] = [event.touches[0], event.touches[1]];
				pinchRef.current = {
					startDistance: Math.max(touchDistance(a, b), 1),
					startZoom: zoomRef.current,
				};
				swipeStartRef.current = null;
				setIsPinching(true);
				return;
			}

			pinchRef.current = null;
			setIsPinching(false);

			if (event.touches.length === 1) {
				const touch = event.touches[0];
				swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
			} else {
				swipeStartRef.current = null;
			}
		},
		[],
	);

	const handleTouchMove = useCallback(
		(event: React.TouchEvent<HTMLDivElement>) => {
			if (event.touches.length === 2 && pinchRef.current) {
				const [a, b] = [event.touches[0], event.touches[1]];
				const distance = Math.max(touchDistance(a, b), 1);
				const scale = distance / pinchRef.current.startDistance;
				onZoomChange(clampZoom(pinchRef.current.startZoom * scale));
			}
		},
		[onZoomChange],
	);

	const handleTouchEnd = useCallback(
		(event: React.TouchEvent<HTMLDivElement>) => {
			if (event.touches.length < 2) {
				pinchRef.current = null;
				setIsPinching(false);
			}

			if (event.touches.length !== 0 || !swipeStartRef.current) {
				if (event.touches.length === 0) {
					swipeStartRef.current = null;
				}
				return;
			}

			const touch = event.changedTouches[0];
			const deltaX = touch.clientX - swipeStartRef.current.x;
			const deltaY = touch.clientY - swipeStartRef.current.y;
			swipeStartRef.current = null;
			navigateFromSwipe(deltaX, deltaY);
		},
		[navigateFromSwipe],
	);

	const endPointerDrag = useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			const drag = pointerDragRef.current;
			if (!drag || drag.pointerId !== event.pointerId) {
				return;
			}
			pointerDragRef.current = null;
			setIsDragPanning(false);

			const node = viewportRef.current;
			if (node?.hasPointerCapture(event.pointerId)) {
				node.releasePointerCapture(event.pointerId);
			}
		},
		[viewportRef],
	);

	const handlePointerDown = useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			if (event.pointerType !== "mouse" || event.button !== 0) {
				return;
			}
			const target = event.target;
			if (
				target instanceof Element &&
				target.closest("a, button, input, textarea, select, [role='button']")
			) {
				return;
			}
			const node = viewportRef.current;
			if (!node) {
				return;
			}
			pointerDragRef.current = {
				pointerId: event.pointerId,
				startX: event.clientX,
				startY: event.clientY,
				originScrollLeft: node.scrollLeft,
				originScrollTop: node.scrollTop,
				active: false,
			};
		},
		[viewportRef],
	);

	const handlePointerMove = useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			const drag = pointerDragRef.current;
			const node = viewportRef.current;
			if (!drag || drag.pointerId !== event.pointerId || !node) {
				return;
			}

			const deltaX = event.clientX - drag.startX;
			const deltaY = event.clientY - drag.startY;

			if (!drag.active) {
				if (Math.hypot(deltaX, deltaY) < DRAG_PAN_THRESHOLD_PX) {
					return;
				}
				drag.active = true;
				setIsDragPanning(true);
				node.setPointerCapture(event.pointerId);
			}

			event.preventDefault();
			node.scrollLeft = drag.originScrollLeft - deltaX;
			node.scrollTop = drag.originScrollTop - deltaY;
		},
		[viewportRef],
	);

	// Non-passive listeners so pinch/Ctrl+wheel zoom can preventDefault.
	useEffect(() => {
		const node = viewportRef.current;
		if (!node) {
			return;
		}

		const onTouchMove = (event: TouchEvent) => {
			if (event.touches.length === 2 && pinchRef.current) {
				event.preventDefault();
			}
		};

		node.addEventListener("wheel", handleWheel, { passive: false });
		node.addEventListener("touchmove", onTouchMove, { passive: false });
		return () => {
			node.removeEventListener("wheel", handleWheel);
			node.removeEventListener("touchmove", onTouchMove);
		};
	}, [handleWheel, viewportRef]);

	return (
		<div
			ref={viewportRef}
			className={cn(
				"writing-pdf-viewer__viewport relative overflow-auto bg-sunken",
				canPan && "writing-pdf-viewer__viewport--pannable",
				isPinching && "writing-pdf-viewer__viewport--pinching",
				isDragPanning && "writing-pdf-viewer__viewport--panning",
				enableSwipe && "writing-pdf-viewer__viewport--swipeable",
				viewportClassName,
			)}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
			onTouchCancel={() => {
				swipeStartRef.current = null;
				pinchRef.current = null;
				setIsPinching(false);
			}}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={endPointerDrag}
			onPointerCancel={endPointerDrag}
			// biome-ignore lint/a11y/noNoninteractiveTabindex: the viewport is pannable and scrollable; tabIndex={0} on a labelled region is the standard way to let keyboard users reach and scroll it.
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
				<div
					className={cn(
						"flex h-full justify-center py-3 sm:py-5",
						isMobile ? "px-1.5" : "px-4 sm:px-6",
					)}
				>
					<div className={cn("relative w-full", pageContainerClassName)}>
						{showSpinner ? (
							<div className="absolute inset-0 z-1 flex items-center justify-center">
								<Spinner size="lg" label={labels.loading} />
							</div>
						) : null}
						<Document
							key={pdfSrc}
							file={pdfSrc}
							onLoadSuccess={onLoadSuccess}
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
												twoPageSpread ? `spread-slot-${index}` : "single-slot"
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

function downloadFileName(title: string): string {
	const safe = title.replace(/[\\/:*?"<>|]+/g, " ").trim();
	return `${safe || "document"}.pdf`;
}

export function WritingPdfViewer({
	fileOffers,
	locale,
	title,
	coverUrl,
	className,
}: WritingPdfViewerProps) {
	const t = useTranslations("Writings.post.reader");
	const isMobile = useIsMobile();
	const pdfOffers = useMemo(() => getPdfFileOffers(fileOffers), [fileOffers]);
	const defaultOffer = useMemo(
		() => pickDefaultPdfOffer(fileOffers, locale),
		[fileOffers, locale],
	);

	const [pageNumber, setPageNumber] = useState(1);
	const [numPages, setNumPages] = useState(0);
	const [pdfDoc, setPdfDoc] = useState<PdfDocument | null>(null);
	const [fitMode, setFitMode] = useState<FitMode>("height");
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
			defaultOffer?.fileUrl ? resolvePdfViewerUrl(defaultOffer.fileUrl) : null,
		[defaultOffer?.fileUrl],
	);

	const toolbarLabels = useMemo(
		() => ({
			zoomIn: t("zoomIn"),
			zoomOut: t("zoomOut"),
			fitWidth: t("fitWidth"),
			fitHeight: t("fitHeight"),
			fullSize: t("fullSize"),
			exitFullSize: t("exitFullSize"),
			previousPage: t("previousPage"),
			nextPage: t("nextPage"),
			pageNumber: t("pageNumber"),
			download: t("download"),
		}),
		[t],
	);

	const railLabels = useMemo(
		() => ({
			navLabel: t("pageNavLabel"),
			goToPage: (page: number) => t("goToPage", { page }),
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

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset the reader state whenever the previewed document changes.
	useEffect(() => {
		setPageNumber(1);
		setNumPages(0);
		setPdfDoc(null);
		setLoadError(false);
		setDocumentReady(false);
		setIsDisplayReady(false);
		setIsReaderActive(false);
		setFitMode("height");
		setZoom(1);
		stablePageRenderSizeRef.current = {};
	}, [defaultOffer]);

	useScrollLock(isFullscreen);

	const effectiveFitMode: FitMode = isMobile ? "width" : fitMode;
	const canSwipeNavigate = Math.abs(zoom - 1) < FIT_EPSILON;

	const goToPage = useCallback(
		(delta: number) => {
			setPageNumber((current) =>
				Math.min(Math.max(current + delta, 1), Math.max(numPages, 1)),
			);
		},
		[numPages],
	);

	const goToPageNumber = useCallback(
		(page: number) => {
			setPageNumber(Math.min(Math.max(page, 1), Math.max(numPages, 1)));
		},
		[numPages],
	);

	useEffect(() => {
		if (!isReaderActive || loadError || numPages <= 1) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			const target = event.target;
			if (
				target instanceof HTMLElement &&
				target.closest(
					'input:not([type="range"]), textarea, select, [contenteditable="true"]',
				)
			) {
				return;
			}

			// Matches the toolbar arrows: → next, ← previous.
			if (event.key === "ArrowRight") {
				event.preventDefault();
				goToPage(1);
			}
			if (event.key === "ArrowLeft") {
				event.preventDefault();
				goToPage(-1);
			}
			if (event.key === "Escape" && isFullscreen) {
				dialogRef.current?.close();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isReaderActive, loadError, numPages, goToPage, isFullscreen]);

	// Switching frames remounts the <Document>, which destroys the old proxy;
	// drop it so the rail never renders against a dead document.
	const openFullscreen = useCallback(() => {
		setPdfDoc(null);
		setIsFullscreen(true);
		queueMicrotask(() => dialogRef.current?.showModal());
	}, []);

	const closeFullscreen = useCallback(() => {
		setPdfDoc(null);
		dialogRef.current?.close();
		setIsFullscreen(false);
	}, []);

	const handleDocumentLoadSuccess = useCallback((pdf: PdfDocument) => {
		setNumPages(pdf.numPages);
		setPdfDoc(pdf);
		setLoadError(false);
		setDocumentReady(true);
	}, []);

	const handleDocumentLoadError = useCallback(() => {
		setPdfDoc(null);
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
	const pagesToShow = visibleSpreadPages(pageNumber, numPages, false);
	const viewportPaddingX = isMobile
		? VIEWPORT_PADDING_X_MOBILE
		: VIEWPORT_PADDING_X;
	const viewportPaddingY = isMobile
		? VIEWPORT_PADDING_Y_MOBILE
		: VIEWPORT_PADDING_Y;
	const pageRenderSize = useMemo(() => {
		if (!isViewportReady) {
			return stablePageRenderSizeRef.current;
		}

		const availableWidth = Math.max(
			activeViewportSize.width - viewportPaddingX,
			0,
		);
		const viewportHeight = activeViewportSize.height;
		const next = resolvePageRenderSize({
			fitMode: effectiveFitMode,
			zoom,
			containerWidth: availableWidth,
			viewportHeight,
			spreadColumns: 1,
			chromeHeight: viewportPaddingY,
		});

		const hasSize = (next.width ?? 0) > 0 || (next.height ?? 0) > 0;
		if (!hasSize) {
			return stablePageRenderSizeRef.current;
		}

		const previous = stablePageRenderSizeRef.current;
		if (previous.width === next.width && previous.height === next.height) {
			return previous;
		}

		stablePageRenderSizeRef.current = next;
		return next;
	}, [
		activeViewportSize.width,
		activeViewportSize.height,
		effectiveFitMode,
		isViewportReady,
		zoom,
		viewportPaddingX,
		viewportPaddingY,
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

	if (!isReaderActive) {
		return (
			<div className={cn("writing-pdf-viewer", className)}>
				<PdfReaderLaunch
					title={title}
					coverUrl={coverUrl}
					readLabel={t("readButton")}
					onStart={() => {
						setFitMode("height");
						setZoom(1);
						setIsReaderActive(true);
					}}
				/>
			</div>
		);
	}

	const toolbarProps = {
		pageNumber,
		numPages,
		fitMode,
		zoom,
		isMobile,
		downloadHref: pdfSrc,
		downloadName: downloadFileName(title),
		onPrevious: () => goToPage(-1),
		onNext: () => goToPage(1),
		onSelectPage: goToPageNumber,
		onZoomOut: () => setZoom((current) => clampZoom(current - ZOOM_STEP)),
		onZoomIn: () => setZoom((current) => clampZoom(current + ZOOM_STEP)),
		onToggleFit: () => {
			setFitMode((current) => (current === "height" ? "width" : "height"));
			setZoom(1);
		},
		labels: toolbarLabels,
	};

	const rail =
		pdfDoc && !loadError && numPages > 0 ? (
			<PdfThumbnailRail
				pdf={pdfDoc}
				numPages={numPages}
				pageNumber={pageNumber}
				onSelectPage={goToPageNumber}
				labels={railLabels}
			/>
		) : null;

	const viewportProps = pdfSrc
		? {
				title,
				pdfSrc,
				visiblePages: pagesToShow,
				twoPageSpread: false,
				pageRenderSize,
				documentReady,
				isViewportReady,
				loadError,
				zoom,
				onZoomChange: (value: number) => setZoom(clampZoom(value)),
				onSwipeNavigate: goToPage,
				enableSwipe: canSwipeNavigate && numPages > 1,
				isMobile,
				onLoadSuccess: handleDocumentLoadSuccess,
				onLoadError: handleDocumentLoadError,
				onInitialDisplayReady: handleInitialDisplayReady,
				initialDisplayComplete: isDisplayReady,
				labels: viewportLabels,
				viewportClassName: READER_VIEWPORT_CLASS,
				pageContainerClassName: "max-w-none",
			}
		: null;

	return (
		<div className={cn("writing-pdf-viewer", className)}>
			{!isFullscreen ? (
				<PdfReaderFrame
					bodyClassName={INLINE_VIEWPORT_CLASS}
					toolbar={
						<PdfReaderToolbar
							{...toolbarProps}
							onToggleFullscreen={openFullscreen}
						/>
					}
					rail={rail}
					viewport={
						viewportProps ? (
							<PdfReaderViewport
								{...viewportProps}
								viewportRef={inlineViewportRef}
							/>
						) : null
					}
				/>
			) : null}

			<dialog
				ref={dialogRef}
				onClose={() => {
					setPdfDoc(null);
					setIsFullscreen(false);
				}}
				aria-label={title}
				className="m-0 h-svh max-h-svh w-svw max-w-none border-0 bg-background p-0 text-foreground backdrop:bg-foreground/85 open:flex open:flex-col"
			>
				{isFullscreen ? (
					<PdfReaderFrame
						className="h-full min-h-0 flex-1 rounded-none border-0"
						bodyClassName={FULLSCREEN_VIEWPORT_CLASS}
						toolbar={
							<PdfReaderToolbar
								{...toolbarProps}
								isFullscreen
								onToggleFullscreen={closeFullscreen}
							/>
						}
						rail={rail}
						viewport={
							viewportProps ? (
								<PdfReaderViewport
									{...viewportProps}
									viewportRef={fullscreenViewportRef}
								/>
							) : null
						}
					/>
				) : null}
			</dialog>
		</div>
	);
}
