import { richTextContentType } from "@/lib/rich-text/content-type";

function stripHtmlText(html: string): string {
	return html
		.replace(/<[^>]*>/g, " ")
		.replace(/&nbsp;/gi, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function stripMarkdownText(md: string): string {
	return md
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/`[^`]*`/g, " ")
		.replace(/!\[[^\]]*]\([^)]*\)/g, " ")
		.replace(/\[[^\]]*]\([^)]*\)/g, " ")
		.replace(/<[^>]*>/g, " ")
		.replace(/[#>*_~-]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

/** Plain text for excerpts, SEO meta, and card previews. */
export function plainTextFromRichContent(
	content: string | null | undefined,
): string {
	const trimmed = (content ?? "").trim();
	if (!trimmed) return "";
	if (richTextContentType(trimmed) === "html") {
		return stripHtmlText(trimmed);
	}
	return stripMarkdownText(trimmed);
}

/** True when rich text (Markdown or HTML) has no visible content. */
export function isRichTextEmpty(content: string | undefined | null): boolean {
	return plainTextFromRichContent(content).length === 0;
}
