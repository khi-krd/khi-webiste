/**
 * Detect whether stored content is HTML or Markdown.
 * Mirrors `tiptapContentType` in the dashboard — keep the two in sync.
 */
const BLOCK_HTML = /<(p|h[1-6]|ul|ol|li|table|blockquote|figure|pre|hr)[\s>/]/i;

export function richTextContentType(
	value: string | null | undefined,
): "html" | "markdown" {
	const trimmed = (value ?? "").trim();
	if (!trimmed) return "markdown";
	if (!trimmed.startsWith("<")) return "markdown";
	// Editor-authored HTML wraps every paragraph, so a document that opens with
	// a media block (figure, gallery, img…) but carries block tags is HTML.
	if (BLOCK_HTML.test(trimmed)) return "html";
	if (/^<(video|audio|img)\b/i.test(trimmed)) return "markdown";
	if (/^<div\s+class="(gallery|video|audio|file)"/i.test(trimmed))
		return "markdown";
	return "html";
}
