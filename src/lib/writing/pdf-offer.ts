import type { WritingFileOffer } from "@/types/writing";

function isPdfOffer(offer: WritingFileOffer): boolean {
	if (!offer.fileUrl) {
		return false;
	}
	if (offer.fileFormat === "PDF") {
		return true;
	}
	return offer.fileUrl.toLowerCase().includes(".pdf");
}

export function getPdfFileOffers(
	offers: WritingFileOffer[],
): WritingFileOffer[] {
	return offers.filter(isPdfOffer);
}

export function pickDefaultPdfOffer(
	offers: WritingFileOffer[],
	locale: string,
): WritingFileOffer | null {
	const pdfs = getPdfFileOffers(offers);
	if (pdfs.length === 0) {
		return null;
	}
	if (locale === "ku") {
		return pdfs.find((offer) => offer.language === "KMR") ?? pdfs[0];
	}
	if (locale === "ckb") {
		return pdfs.find((offer) => offer.language === "CKB") ?? pdfs[0];
	}
	return pdfs[0];
}
