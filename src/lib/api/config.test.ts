import { afterEach, describe, expect, it, vi } from "vitest";
import { getApiBaseUrl, getMockDataMode } from "@/lib/api/config";

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

async function loadConfig() {
	vi.resetModules();
	return import("@/lib/api/config");
}

describe("getMockDataMode", () => {
	it.each([
		[undefined, "off"],
		["false", "off"],
		["0", "off"],
		["off", "off"],
		["true", "full"],
		["1", "full"],
		["full", "full"],
		["yes", "full"],
		["on", "full"],
		["auto", "auto"],
		["sparse", "auto"],
		["fallback", "auto"],
	])("maps USE_MOCK_DATA=%s to %s", async (value, expected) => {
		if (value === undefined) {
			delete process.env.USE_MOCK_DATA;
		} else {
			process.env.USE_MOCK_DATA = value;
		}

		const { getMockDataMode } = await loadConfig();
		expect(getMockDataMode()).toBe(expected);
	});
});

describe("getApiBaseUrl", () => {
	it("returns null in full mode", async () => {
		process.env.USE_MOCK_DATA = "full";
		process.env.API_BASE_URL = "https://api.example.com";

		const { getApiBaseUrl } = await loadConfig();
		expect(getApiBaseUrl()).toBeNull();
	});

	it("returns API_BASE_URL in off mode", async () => {
		process.env.USE_MOCK_DATA = "off";
		process.env.API_BASE_URL = "https://api.example.com";

		const { getApiBaseUrl } = await loadConfig();
		expect(getApiBaseUrl()).toBe("https://api.example.com");
	});
});
