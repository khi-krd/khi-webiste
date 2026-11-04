import { describe, expect, it } from "vitest";
import { personStripEntries, pluralizeRoleLabel } from "@/lib/writing/resolve";
import type { ResolvedWritingPerson } from "@/types/writing";

function person(
	role: string | null,
	name: string,
	nickname: string | null = null,
): ResolvedWritingPerson {
	return { role, name, nickname };
}

describe("pluralizeRoleLabel", () => {
	it("appends ان to a consonant-final Sorani role", () => {
		expect(pluralizeRoleLabel("ckb", "نووسەر")).toBe("نووسەران");
	});

	it("appends ‌یان to a vowel-final Sorani role", () => {
		expect(pluralizeRoleLabel("ckb", "کۆکەرەوە")).toBe("کۆکەرەوە‌یان");
	});

	it("leaves Kurmanji roles unchanged", () => {
		expect(pluralizeRoleLabel("kmr", "Nivîskar")).toBe("Nivîskar");
	});
});

describe("personStripEntries", () => {
	it("keeps a single writer on its own row", () => {
		const entries = personStripEntries("ckb", [
			person("نووسەر", "ئیبراهیم باجەڵان"),
		]);
		expect(entries).toEqual([
			{
				label: "نووسەر",
				value: "ئیبراهیم باجەڵان",
				members: [{ display: "ئیبراهیم باجەڵان", name: "ئیبراهیم باجەڵان" }],
			},
		]);
	});

	it("joins two writers under one نووسەران label with و", () => {
		const entries = personStripEntries("ckb", [
			person("نووسەر", "ئیبراهیم باجەڵان"),
			person("نووسەر", "هەردەوێڵ کاکەیی"),
		]);
		expect(entries).toEqual([
			{
				label: "نووسەران",
				value: "ئیبراهیم باجەڵان و هەردەوێڵ کاکەیی",
				members: [
					{ display: "ئیبراهیم باجەڵان", name: "ئیبراهیم باجەڵان" },
					{ display: "هەردەوێڵ کاکەیی", name: "هەردەوێڵ کاکەیی" },
				],
			},
		]);
	});

	it("joins Kurmanji writers with û under the unchanged role", () => {
		const entries = personStripEntries("kmr", [
			person("Nivîskar", "Eyþan"),
			person("Nivîskar", "Ala"),
		]);
		expect(entries).toEqual([
			{
				label: "Nivîskar",
				value: "Eyþan û Ala",
				members: [
					{ display: "Eyþan", name: "Eyþan" },
					{ display: "Ala", name: "Ala" },
				],
			},
		]);
	});

	it("groups case-insensitively and keeps first-seen order", () => {
		const entries = personStripEntries("ckb", [
			person("نووسەر", "ئا"),
			person("کۆکەرەوە", "با"),
			person("  نووسەر  ", "جا"),
		]);
		expect(entries).toEqual([
			{
				label: "نووسەران",
				value: "ئا و جا",
				members: [
					{ display: "ئا", name: "ئا" },
					{ display: "جا", name: "جا" },
				],
			},
			{
				label: "کۆکەرەوە",
				value: "با",
				members: [{ display: "با", name: "با" }],
			},
		]);
	});

	it("keeps role-less people on separate null-label rows", () => {
		const entries = personStripEntries("ckb", [
			person(null, "ئا"),
			person(null, "با"),
		]);
		expect(entries).toEqual([
			{
				label: null,
				value: "ئا",
				members: [{ display: "ئا", name: "ئا" }],
			},
			{
				label: null,
				value: "با",
				members: [{ display: "با", name: "با" }],
			},
		]);
	});

	it("appends nicknames inside each joined name", () => {
		const entries = personStripEntries("ckb", [
			person("نووسەر", "ئیبراهیم", "مام ئیبرا"),
			person("نووسەر", "هەردەوێڵ"),
		]);
		expect(entries).toEqual([
			{
				label: "نووسەران",
				value: "ئیبراهیم (مام ئیبرا) و هەردەوێڵ",
				members: [
					{ display: "ئیبراهیم (مام ئیبرا)", name: "ئیبراهیم" },
					{ display: "هەردەوێڵ", name: "هەردەوێڵ" },
				],
			},
		]);
	});
});
