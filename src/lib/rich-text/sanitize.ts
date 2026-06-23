import sanitizeHtmlLib from "sanitize-html";

const ALLOWED_TAGS = [
	"p",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"ul",
	"ol",
	"li",
	"blockquote",
	"code",
	"pre",
	"a",
	"strong",
	"em",
	"u",
	"s",
	"img",
	"video",
	"audio",
	"hr",
	"table",
	"thead",
	"tbody",
	"tr",
	"th",
	"td",
	"br",
	"div",
] as const;

const ALLOWED_ATTR = [
	"href",
	"target",
	"rel",
	"src",
	"alt",
	"title",
	"class",
	"controls",
	"download",
] as const;

export function sanitizeRichTextHtml(html: string): string {
	return sanitizeHtmlLib(html, {
		allowedTags: [...ALLOWED_TAGS],
		allowedAttributes: Object.fromEntries(
			ALLOWED_TAGS.map((tag) => [tag, [...ALLOWED_ATTR]]),
		),
	});
}
