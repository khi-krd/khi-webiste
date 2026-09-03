import { describe, expect, it } from "vitest";
import {
	resolveContactOffice,
	resolveContactOffices,
} from "@/lib/contact/resolve";
import type { ContactPage } from "@/types/contact-page";

// The exact shape the CMS answers with, so a contract change breaks a test
// rather than silently blanking the offices section again.
function page(overrides: Partial<ContactPage> = {}): ContactPage {
	return {
		id: 5,
		slugCkb: "peywendi-slemani",
		slugKmr: "tekili-silemani",
		ckbContent: {
			title: "نووسینگەی سەرەکی — سلێمانی",
			subtitle: "پەیمانگای کەلەپووری کوردی — بارەگای سەرەکی",
			address: "سلێمانی، گەڕەکی سالم",
			workingHours: "شەممە – پێنجشەممە",
			description: "<p>بارەگای سەرەکی لە سلێمانی.</p>",
		},
		kmrContent: {
			title: "Nivîsgeha Serekî — Silêmanî",
			subtitle: "Enstîtuya Mîrateya Kurdî — Navenda serekî",
			address: "Silêmanî, Taxa Salim",
			workingHours: "Şemî – Pêncşem",
			description: "<p>Navenda serekî li Silêmaniyê.</p>",
		},
		phone: "+964 770 111 2233",
		email: "sulaymaniyah@khi.example.org",
		officeType: "HQ",
		latitude: 35.5647,
		longitude: 45.4164,
		active: true,
		...overrides,
	} as ContactPage;
}

describe("office photo (heroImageUrl)", () => {
	it("uses the uploaded photo when the CMS has one", () => {
		const url =
			"https://s3-khiwebsite.s3.us-east-1.amazonaws.com/khi-web-folders/images/office-slemani.jpg";
		const office = resolveContactOffice("ckb", page({ heroImageUrl: url }), 0);

		expect(office?.image.url).toBe(url);
	});

	// An editor clearing the picker can leave "" or " " behind. Either must fall
	// back, not render a broken image.
	it.each([
		undefined,
		null,
		"",
		"   ",
	])("falls back when heroImageUrl is %p", (heroImageUrl) => {
		const office = resolveContactOffice(
			"ckb",
			page({ heroImageUrl } as Partial<ContactPage>),
			0,
		);

		expect(office?.image.url).toBe(
			"/about/475203467_1007002848126180_7383496220452921499_n.jpg",
		);
	});

	// Two identical placeholders side by side read as a rendering bug.
	it("gives each office a different fallback", () => {
		const offices = resolveContactOffices("ckb", [
			page(),
			page({ id: 6, slugCkb: "peywendi-dhok", officeType: "REGIONAL" }),
		]);

		expect(offices).toHaveLength(2);
		expect(offices[0].image.url).not.toBe(offices[1].image.url);
	});

	it("describes the photo with the office name", () => {
		const office = resolveContactOffice("ckb", page(), 0);

		expect(office?.image.alt).toBe("نووسینگەی سەرەکی — سلێمانی");
	});
});

describe("officeType", () => {
	// The live CMS answers "HQ"; the old code compared against "HEADQUARTERS"
	// and an enum schema rejected the record outright, blanking the section.
	it.each([
		"HQ",
		"hq",
		" HQ ",
		"HEADQUARTERS",
		"Headquarters",
	])("treats %p as the headquarters badge", (officeType) => {
		expect(resolveContactOffice("ckb", page({ officeType }), 0)?.badge).toBe(
			"hq",
		);
	});

	it.each([
		"REGIONAL",
		"BRANCH",
		"",
		undefined,
	])("treats %p as a regional badge", (officeType) => {
		expect(
			resolveContactOffice(
				"ckb",
				page({ officeType } as Partial<ContactPage>),
				0,
			)?.badge,
		).toBe("regional");
	});
});

describe("card copy", () => {
	// `description` is Tiptap HTML and the subtitle slot renders as plain text.
	it("takes the subtitle from subtitle, never from the HTML description", () => {
		const office = resolveContactOffice("ckb", page(), 0);

		expect(office?.localizedCopy?.subtitle).toBe(
			"پەیمانگای کەلەپووری کوردی — بارەگای سەرەکی",
		);
		expect(office?.localizedCopy?.subtitle).not.toContain("<");
	});

	it("falls back to the other language when one block is missing", () => {
		const office = resolveContactOffice("kmr", page({ kmrContent: null }), 0);

		expect(office?.localizedCopy?.name).toBe("نووسینگەی سەرەکی — سلێمانی");
	});

	it("drops an office with no title in either language", () => {
		expect(
			resolveContactOffice(
				"ckb",
				page({ ckbContent: null, kmrContent: null }),
				0,
			),
		).toBeNull();
	});
});
