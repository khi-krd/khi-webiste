import { Prose } from "@/components/ui/prose";
import { renderRichText } from "@/lib/rich-text";
import { cn } from "@/lib/utils";

type RichTextProps = {
	content: string;
	className?: string;
	/** Tighter typography for list cards and previews. */
	compact?: boolean;
};

/**
 * Renders API rich text (Markdown or legacy HTML) inside `.prose` styles.
 * Server component — sanitizes content before injection.
 */
export function RichText({
	content,
	className,
	compact = false,
}: RichTextProps) {
	const html = renderRichText(content);
	if (!html) {
		return null;
	}

	return (
		<Prose
			className={cn(
				compact && "text-small leading-relaxed [&>p+p]:mt-2",
				className,
			)}
			// biome-ignore lint/security/noDangerouslySetInnerHtml: renderRichText() routes every path through sanitizeRichTextHtml() (lib/rich-text/render.ts), which runs sanitize-html against a fixed tag/attribute allowlist. Rendering CMS rich text requires injecting HTML.
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}
