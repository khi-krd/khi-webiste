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
	"sub",
	"sup",
	"mark",
	"span",
	"img",
	"video",
	"audio",
	"figure",
	"figcaption",
	"hr",
	"table",
	"colgroup",
	"col",
	"thead",
	"tbody",
	"tr",
	"th",
	"td",
	"br",
	"div",
	"iframe",
] as const;

/**
 * Attributes every allowed tag may carry. `style` is further restricted to
 * the declarations in ALLOWED_STYLES below; `data-*` carries the editor's
 * layout presets (`data-align`, `data-width`, `data-cols`, `data-style`,
 * `data-colwidth`), which the `.prose` stylesheet turns into layout.
 */
const GLOBAL_ATTR = ["class", "dir", "style", "title", "data-*"] as const;

const TAG_ATTR: Partial<Record<(typeof ALLOWED_TAGS)[number], string[]>> = {
	a: ["href", "target", "rel", "download"],
	img: ["src", "alt", "width", "height", "loading"],
	video: ["src", "controls", "preload", "poster"],
	audio: ["src", "controls", "preload"],
	iframe: [
		"src",
		"allow",
		"allowfullscreen",
		"loading",
		"title",
		"width",
		"height",
		"frameborder",
	],
	td: ["colspan", "rowspan", "colwidth"],
	th: ["colspan", "rowspan", "colwidth"],
	col: ["span"],
};

/** Inline CSS the editor emits: typography, colors, alignment and widths. */
const COLOR = [
	/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i,
	/^rgba?\(\s*[\d.]+%?\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?\s*(?:,\s*[\d.]+%?\s*)?\)$/i,
	/^rgba?\(\s*[\d.]+%?\s+[\d.]+%?\s+[\d.]+%?\s*(?:\/\s*[\d.]+%?\s*)?\)$/i,
	/^hsla?\([\d\s.,%/deg]+\)$/i,
	/^[a-z]{3,20}$/i,
];
const LENGTH = [/^\d+(?:\.\d+)?(?:px|rem|em|pt|%)$/];

const ALLOWED_STYLES: Record<string, RegExp[]> = {
	"text-align": [/^(?:left|right|center|justify|start|end)$/],
	// Family names: anything but the characters that could close the
	// declaration or smuggle a function/URL in.
	"font-family": [/^[^;{}()<>\\]+$/],
	"font-size": LENGTH,
	color: COLOR,
	"background-color": COLOR,
	width: LENGTH,
	"min-width": LENGTH,
	// Free-floating images (`.rt-float`) keep their dragged position.
	left: LENGTH,
	top: LENGTH,
};

export function sanitizeRichTextHtml(html: string): string {
	return sanitizeHtmlLib(html, {
		allowedTags: [...ALLOWED_TAGS],
		allowedAttributes: Object.fromEntries(
			ALLOWED_TAGS.map((tag) => [
				tag,
				[...GLOBAL_ATTR, ...(TAG_ATTR[tag] ?? [])],
			]),
		),
		allowedStyles: { "*": ALLOWED_STYLES },
		allowedSchemes: ["http", "https", "mailto", "tel"],
		allowedSchemesByTag: {
			img: ["http", "https", "data"],
			// Embeds are always remote players — https only.
			iframe: ["https"],
		},
		// Only media-provider player hosts may be iframed — matches the embed
		// URLs the dashboard normalizes (YouTube, Vimeo, SoundCloud, Spotify,
		// Dailymotion, Mixcloud, Audiomack).
		allowedIframeHostnames: [
			"www.youtube.com",
			"youtube.com",
			"www.youtube-nocookie.com",
			"youtube-nocookie.com",
			"player.vimeo.com",
			"w.soundcloud.com",
			"open.spotify.com",
			"www.dailymotion.com",
			"dailymotion.com",
			"geo.dailymotion.com",
			"www.mixcloud.com",
			"mixcloud.com",
			"audiomack.com",
			"www.audiomack.com",
		],
		// Links the editor opens in a new tab must not hand the opener over.
		transformTags: {
			a: (tagName, attribs) =>
				attribs.target === "_blank"
					? { tagName, attribs: { ...attribs, rel: "noopener noreferrer" } }
					: { tagName, attribs },
		},
	});
}
