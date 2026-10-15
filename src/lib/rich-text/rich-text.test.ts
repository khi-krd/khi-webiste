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

	it("treats editor HTML that opens with a figure as html", () => {
		expect(
			richTextContentType(
				'<figure class="rt-figure" data-align="left"><img src="a.jpg"><figcaption>c</figcaption></figure><p>Body</p>',
			),
		).toBe("html");
		expect(
			richTextContentType(
				'<div class="gallery"><img src="a.jpg"></div><p>x</p>',
			),
		).toBe("html");
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

	it("keeps editor typography, direction and layout attributes", () => {
		const html = renderRichText(
			'<p dir="ltr" style="text-align: center"><span style="font-family: &quot;Rabar&quot;; font-size: 24px; color: #8c1515">Hi</span> <mark style="background-color: #fde68a">hl</mark> H<sub>2</sub>O</p>' +
				'<figure class="rt-figure" data-align="right" data-width="50"><img src="https://x/a.jpg" alt="a"><figcaption>cap</figcaption></figure>' +
				'<div class="rt-columns" data-cols="3"><div class="rt-column"><p>a</p></div></div>' +
				'<figure class="rt-table"><table data-style="striped"><colgroup><col style="width: 120px"></colgroup><tbody><tr><th colspan="2" style="background-color: rgb(254, 243, 199)">h</th></tr></tbody></table><figcaption>t</figcaption></figure>',
		);
		expect(html).toContain('dir="ltr"');
		expect(html).toContain("text-align:center");
		expect(html).toContain("font-family:");
		expect(html).toContain("Rabar");
		expect(html).toContain("font-size:24px");
		expect(html).toContain("color:#8c1515");
		expect(html).toContain("<mark");
		expect(html).toContain("<sub>2</sub>");
		expect(html).toContain('data-align="right"');
		expect(html).toContain('data-width="50"');
		expect(html).toContain('data-cols="3"');
		expect(html).toContain('data-style="striped"');
		expect(html).toContain('colspan="2"');
		expect(html).toContain("background-color:rgb(254, 243, 199)");
		expect(html).toContain("<col");
		expect(html).toContain("width:120px");
		expect(html).toContain("<figcaption>t</figcaption>");
	});

	it("drops dangerous styles and attributes", () => {
		const html = renderRichText(
			'<p style="position: fixed; background: url(x); font-size: 20px" onclick="x()"><span style="font-family: a; expression(1)">y</span></p>',
		);
		expect(html).not.toContain("position");
		expect(html).not.toContain("url(");
		expect(html).not.toContain("onclick");
		expect(html).not.toContain("expression");
		expect(html).toContain("font-size:20px");
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
