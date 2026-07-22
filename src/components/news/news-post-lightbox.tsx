"use client";

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";
import { NewsMediaModal } from "@/components/news/news-media-modal";
import { buildNewsMediaModalItems } from "@/lib/news/media-modal-items";
import type { MediaItem } from "@/types/media";

type NewsPostLightboxContextValue = {
	openCover: () => void;
	openGalleryItem: (index: number) => void;
};

const NewsPostLightboxContext =
	createContext<NewsPostLightboxContextValue | null>(null);

export function useNewsPostLightbox(): NewsPostLightboxContextValue {
	const context = useContext(NewsPostLightboxContext);
	if (!context) {
		throw new Error("useNewsPostLightbox must be used within NewsPostLightboxProvider");
	}
	return context;
}

type NewsPostLightboxProviderProps = {
	coverItem: MediaItem;
	galleryItems: MediaItem[];
	articleTitle: string;
	closeLabel: string;
	previousLabel: string;
	nextLabel: string;
	children: React.ReactNode;
};

export function NewsPostLightboxProvider({
	coverItem,
	galleryItems,
	articleTitle,
	closeLabel,
	previousLabel,
	nextLabel,
	children,
}: NewsPostLightboxProviderProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const { items, coverIndex, galleryIndexOffset } = useMemo(
		() => buildNewsMediaModalItems(coverItem, galleryItems),
		[coverItem, galleryItems],
	);

	const openAt = useCallback((index: number) => {
		setActiveIndex(index);
		dialogRef.current?.showModal();
	}, []);

	const openCover = useCallback(() => {
		openAt(coverIndex);
	}, [coverIndex, openAt]);

	const openGalleryItem = useCallback(
		(index: number) => {
			openAt(index + galleryIndexOffset);
		},
		[galleryIndexOffset, openAt],
	);

	const value = useMemo(
		() => ({ openCover, openGalleryItem }),
		[openCover, openGalleryItem],
	);

	return (
		<NewsPostLightboxContext.Provider value={value}>
			{children}
			<NewsMediaModal
				items={items}
				activeIndex={activeIndex}
				onActiveIndexChange={setActiveIndex}
				dialogRef={dialogRef}
				articleTitle={articleTitle}
				closeLabel={closeLabel}
				previousLabel={previousLabel}
				nextLabel={nextLabel}
			/>
		</NewsPostLightboxContext.Provider>
	);
}
