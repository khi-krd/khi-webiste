"use client";

import NextImage from "next/image";
import type { GalleryAlbumMetadataLabels } from "@/components/gallery/gallery-album-item";
import {
	GalleryLightbox,
	type GalleryLightboxItem,
	useGalleryLightbox,
} from "@/components/gallery/gallery-lightbox";
import type { ResolvedBrochureItem } from "@/types/audio";

type AudioBrochuresProps = {
	title: string;
	items: ResolvedBrochureItem[];
	openLabel: string;
	closeLabel: string;
	previousLabel: string;
	nextLabel: string;
	zoomInLabel: string;
	zoomOutLabel: string;
	metadataLabels: GalleryAlbumMetadataLabels;
};

/** Non-image brochure tile — a document card that opens the file in a new tab. */
function BrochureDocumentTile({
	item,
	title,
	openLabel,
}: {
	item: ResolvedBrochureItem;
	title: string;
	openLabel: string;
}) {
	return (
		<a
			href={item.fileUrl}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={`${openLabel} — ${item.caption ?? title}`}
			className="group block w-full text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
		>
			<span className="flex aspect-square w-full flex-col items-center justify-center gap-2 overflow-hidden border border-border bg-sunken transition-colors group-hover:bg-muted">
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					className="size-8 text-muted"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
					/>
				</svg>
				<span className="text-label text-muted uppercase">
					{item.kind === "pdf" ? "PDF" : "File"}
				</span>
			</span>
			{item.caption ? (
				<span className="mt-2 block truncate text-label text-muted">
					{item.caption}
				</span>
			) : null}
		</a>
	);
}

type AudioBrochureDocumentsProps = {
	title: string;
	items: ResolvedBrochureItem[];
	openLabel: string;
	/** Render the section heading — off when the flipbook already carried it. */
	showTitle?: boolean;
};

/**
 * Non-image brochures (PDFs, docs) as plain download tiles — used on
 * album-of-memories details where the flipbook handles the images but
 * documents still need a way to open.
 */
export function AudioBrochureDocuments({
	title,
	items,
	openLabel,
	showTitle = true,
}: AudioBrochureDocumentsProps) {
	if (items.length === 0) {
		return null;
	}

	return (
		<section aria-label={title} className={showTitle ? undefined : "mt-6"}>
			{showTitle ? (
				<h2 className="font-heading text-h3 font-bold">{title}</h2>
			) : null}

			<ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5 sm:gap-4">
				{items.map((item) => (
					<li key={item.id}>
						<BrochureDocumentTile
							item={item}
							title={title}
							openLabel={openLabel}
						/>
					</li>
				))}
			</ul>
		</section>
	);
}

/**
 * Ordered brochure scans (covers, booklet pages) as a thumbnail strip; clicks
 * open the shared gallery lightbox. Non-image items open in a new tab.
 */
export function AudioBrochures({
	title,
	items,
	openLabel,
	closeLabel,
	previousLabel,
	nextLabel,
	zoomInLabel,
	zoomOutLabel,
	metadataLabels,
}: AudioBrochuresProps) {
	const { dialogRef, activeIndex, setActiveIndex, open } = useGalleryLightbox();

	if (items.length === 0) {
		return null;
	}

	// Only image brochures feed the flipbook lightbox; PDFs and other
	// documents render as tiles that open the file in a new tab.
	const imageItems = items.filter((item) => item.kind === "image");
	const lightboxItems: GalleryLightboxItem[] = imageItems.map((item) => ({
		id: item.id,
		imageUrl: item.fileUrl,
		caption: item.caption ?? undefined,
	}));
	const lightboxIndexOf = (item: ResolvedBrochureItem) =>
		imageItems.indexOf(item);

	return (
		<section aria-label={title}>
			<h2 className="font-heading text-h3 font-bold">{title}</h2>

			<ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5 sm:gap-4">
				{items.map((item) =>
					item.kind === "image" ? (
						<li key={item.id}>
							<button
								type="button"
								onClick={() => open(lightboxIndexOf(item))}
								aria-label={`${openLabel} — ${item.caption ?? title}`}
								className="group block w-full text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
							>
								<span className="relative block aspect-square w-full overflow-hidden border border-border bg-sunken">
									<NextImage
										src={item.fileUrl}
										alt={item.caption ?? ""}
										fill
										sizes="(max-width: 640px) 33vw, 20vw"
										className="object-cover brightness-[0.94] saturate-[0.88] transition-[filter] duration-500 group-fine:brightness-100 group-fine:saturate-100"
									/>
								</span>
								{item.caption ? (
									<span className="mt-2 block truncate text-label text-muted">
										{item.caption}
									</span>
								) : null}
							</button>
						</li>
					) : (
						<li key={item.id}>
							<BrochureDocumentTile
								item={item}
								title={title}
								openLabel={openLabel}
							/>
						</li>
					),
				)}
			</ul>

			<GalleryLightbox
				items={lightboxItems}
				activeIndex={activeIndex}
				onActiveIndexChange={setActiveIndex}
				dialogRef={dialogRef}
				closeLabel={closeLabel}
				previousLabel={previousLabel}
				nextLabel={nextLabel}
				zoomInLabel={zoomInLabel}
				zoomOutLabel={zoomOutLabel}
				metadataLabels={metadataLabels}
				fallbackTitle={title}
			/>
		</section>
	);
}
