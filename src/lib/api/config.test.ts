import { afterEach, describe, expect, it, vi } from "vitest";

const originalApiBaseUrl = process.env.API_BASE_URL;

afterEach(() => {
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

describe("getApiBaseUrl", () => {
	it("returns the configured base URL", async () => {
		process.env.API_BASE_URL = "https://api.example.com";

		const { getApiBaseUrl } = await loadConfig();
		expect(getApiBaseUrl()).toBe("https://api.example.com");
	});

	it("trims surrounding whitespace", async () => {
		process.env.API_BASE_URL = "  https://api.example.com  ";

		const { getApiBaseUrl } = await loadConfig();
		expect(getApiBaseUrl()).toBe("https://api.example.com");
	});

	// There is no mock catalogue behind this any more: a missing base URL means
	// every CMS read returns null and the pages render their empty states.
	it("returns null when the variable is missing", async () => {
		delete process.env.API_BASE_URL;

		const { getApiBaseUrl } = await loadConfig();
		expect(getApiBaseUrl()).toBeNull();
	});

	it("returns null when the variable is blank", async () => {
		process.env.API_BASE_URL = "   ";

		const { getApiBaseUrl } = await loadConfig();
		expect(getApiBaseUrl()).toBeNull();
	});
});
