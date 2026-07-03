import { afterEach, describe, expect, it, vi } from "vitest";
import { padUniqueById } from "@/lib/api/mock-policy";

const originalUseMockData = process.env.USE_MOCK_DATA;
const originalApiBaseUrl = process.env.API_BASE_URL;

afterEach(() => {
	if (originalUseMockData === undefined) {
		delete process.env.USE_MOCK_DATA;
	} else {
		process.env.USE_MOCK_DATA = originalUseMockData;
	}

	if (originalApiBaseUrl === undefined) {
		delete process.env.API_BASE_URL;
	} else {
		process.env.API_BASE_URL = originalApiBaseUrl;
	}

	vi.resetModules();
});

async function loadMockPolicy() {
	vi.resetModules();
	return import("@/lib/api/mock-policy");
}

describe("padUniqueById", () => {
	it("keeps API items and pads with non-duplicate mock ids", () => {
		const apiItems = [
			{ id: "a", label: "api-a" },
			{ id: "b", label: "api-b" },
		];
		const mockItems = [
			{ id: "b", label: "mock-b" },
			{ id: "c", label: "mock-c" },
			{ id: "d", label: "mock-d" },
		];

		expect(padUniqueById(apiItems, mockItems, 4)).toEqual([
			{ id: "a", label: "api-a" },
			{ id: "b", label: "api-b" },
			{ id: "c", label: "mock-c" },
			{ id: "d", label: "mock-d" },
		]);
	});
});

describe("applyMockPolicy", () => {
	const apiItems = [{ id: "api-1" }, { id: "api-2" }];
	const mockItems = [{ id: "mock-1" }, { id: "mock-2" }, { id: "mock-3" }];
	const getMockItems = () => mockItems;

	it("off mode never returns mock", async () => {
		process.env.USE_MOCK_DATA = "off";
		process.env.API_BASE_URL = "https://api.example.com";

		const { applyMockPolicy } = await loadMockPolicy();
		expect(
			applyMockPolicy({
				context: "home",
				apiItems: [],
				getMockItems,
				targetCount: 3,
			}),
		).toEqual([]);
	});

	it("full mode returns mock", async () => {
		process.env.USE_MOCK_DATA = "full";
		process.env.API_BASE_URL = "https://api.example.com";

		const { applyMockPolicy } = await loadMockPolicy();
		expect(
			applyMockPolicy({
				context: "global",
				apiItems,
				getMockItems,
				targetCount: 2,
			}),
		).toEqual(mockItems.slice(0, 2));
	});

	it("auto + global returns API items only", async () => {
		process.env.USE_MOCK_DATA = "auto";
		process.env.API_BASE_URL = "https://api.example.com";

		const { applyMockPolicy } = await loadMockPolicy();
		expect(
			applyMockPolicy({
				context: "global",
				apiItems: [],
				getMockItems,
				targetCount: 3,
			}),
		).toEqual([]);
	});

	it("auto + home pads without replacing API ids", async () => {
		process.env.USE_MOCK_DATA = "auto";
		process.env.API_BASE_URL = "https://api.example.com";

		const { applyMockPolicy } = await loadMockPolicy();
		expect(
			applyMockPolicy({
				context: "home",
				apiItems,
				getMockItems,
				targetCount: 4,
			}),
		).toEqual([
			{ id: "api-1" },
			{ id: "api-2" },
			{ id: "mock-1" },
			{ id: "mock-2" },
		]);
	});
});

describe("applyMockPolicyNullable", () => {
	it("returns mock only in full mode", async () => {
		process.env.USE_MOCK_DATA = "full";
		process.env.API_BASE_URL = "https://api.example.com";

		const { applyMockPolicyNullable } = await loadMockPolicy();
		expect(
			applyMockPolicyNullable({
				apiValue: null,
				getMockValue: () => ({ id: "mock" }),
			}),
		).toEqual({ id: "mock" });
	});

	it("returns null in off mode when API value is null", async () => {
		process.env.USE_MOCK_DATA = "off";
		process.env.API_BASE_URL = "https://api.example.com";

		const { applyMockPolicyNullable } = await loadMockPolicy();
		expect(
			applyMockPolicyNullable({
				apiValue: null,
				getMockValue: () => ({ id: "mock" }),
			}),
		).toBeNull();
	});
});
