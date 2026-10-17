import { marked } from "marked";
import { richTextContentType } from "@/lib/rich-text/content-type";
import { sanitizeRichTextHtml } from "@/lib/rich-text/sanitize";

function markdownToHtml(md: string): string {
	// `breaks: true` — legacy/plain-text records were typed in textareas where
	// a single Enter IS a line break; GFM without it collapses them into one
	// wrapped line and loses the editor's spacing.
	const html = marked.parse(md, {
		async: false,
		gfm: true,
		breaks: true,
	}) as string;
	return sanitizeRichTextHtml(html);
}

/**
 * Render stored rich text as safe HTML.
 * Accepts Markdown (preferred) or legacy HTML from the API.
 */
export function renderRichText(content: string): string {
	const trimmed = content.trim();
	if (!trimmed) return "";
	if (richTextContentType(trimmed) === "markdown") {
		return markdownToHtml(trimmed);
	}
	return sanitizeRichTextHtml(trimmed);
}
