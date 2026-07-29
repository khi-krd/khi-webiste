import { describe, expect, it } from "vitest";
import { richTextContentType } from "@/lib/rich-text/content-type";
import {
	isRichTextEmpty,
	plainTextFromRichContent,
} from "@/lib/rich-text/plain-text";
import { renderRichText } from "@/lib/rich-text/render";

describe("richTextContentType", () => {
	it("treats markdown headings as markdown", () => {
		expect(richTextContentType("## Heading")).toBe("markdown");
	});

	it("treats legacy HTML paragraphs as html", () => {
		expect(richTextContentType("<p>Hello</p>")).toBe("html");
	});

	it("treats leading media blocks as markdown", () => {
		expect(richTextContentType('<video src="x.mp4"></video>')).toBe("markdown");
		expect(
			richTextContentType('<div class="gallery">...</div>\n\nCaption'),
		).toBe("markdown");
	});
});

describe("renderRichText", () => {
	it("renders markdown to sanitized HTML", () => {
		const html = renderRichText("## Title\n\nParagraph with **bold**.");
		expect(html).toContain("<h2");
		expect(html).toContain("<strong>bold</strong>");
	});

	it("sanitizes legacy HTML", () => {
		const html = renderRichText("<p>Safe</p><script>alert(1)</script>");
		expect(html).toContain("<p>Safe</p>");
		expect(html).not.toContain("script");
	});
});

describe("isRichTextEmpty", () => {
	it("treats mock project HTML as non-empty", () => {
		const html =
			"<p>بەرنامەیەکی درێژخایەن بۆ تۆمارکردنی دەنگی پیر و پیران لە سەرانسەری کوردستان</p>";
		expect(isRichTextEmpty(html)).toBe(false);
		expect(renderRichText(html)).toContain("بەرنامەیەکی");
	});

	it("treats API markdown with emoji headings as non-empty", () => {
		const md =
			"“چالاکی مۆسیقا” واتە هەر جۆرە کار\n\n---\n\n# 🎵 چالاکی مۆسیقا\n\n## 🎤 1) کۆنسێرت";
		expect(isRichTextEmpty(md)).toBe(false);
		const html = renderRichText(md);
		expect(html).toContain("چالاکی");
		expect(html).toContain("<h1");
	});
});

describe("plainTextFromRichContent", () => {
	it("strips markdown syntax", () => {
		expect(plainTextFromRichContent("## Title\n\nHello **world**.")).toBe(
			"Title Hello world .",
		);
	});

	it("strips HTML tags", () => {
		expect(
			plainTextFromRichContent("<p>Hello <strong>world</strong></p>"),
		).toBe("Hello world");
	});
});
