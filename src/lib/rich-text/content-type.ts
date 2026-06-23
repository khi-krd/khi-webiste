/** Detect whether stored content is HTML or Markdown. */
export function richTextContentType(
	value: string | null | undefined,
): "html" | "markdown" {
	const trimmed = (value ?? "").trim();
	if (!trimmed) return "markdown";
	if (!trimmed.startsWith("<")) return "markdown";
	if (/^<(video|audio|img)\b/i.test(trimmed)) return "markdown";
	if (/^<div\s+class="(gallery|video|audio|file)"/i.test(trimmed))
		return "markdown";
	return "html";
}
