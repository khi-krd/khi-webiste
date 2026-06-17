import {
	isWritingCategorySlug,
	type WritingCategorySlug,
} from "@/lib/writing/categories";

export type WritingSegment =
	| { kind: "category"; slug: WritingCategorySlug }
	| { kind: "detail"; id: number };

export function parseWritingSegment(segment: string): WritingSegment | null {
	if (isWritingCategorySlug(segment)) {
		return { kind: "category", slug: segment };
	}

	const id = Number.parseInt(segment, 10);
	if (Number.isFinite(id) && id > 0 && String(id) === segment) {
		return { kind: "detail", id };
	}

	return null;
}
