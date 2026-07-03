import "server-only";

export type MockDataMode = "off" | "full" | "auto";

const FULL_ALIASES = new Set(["true", "1", "full", "yes", "on"]);
const AUTO_ALIASES = new Set(["auto", "sparse", "fallback"]);

export function getMockDataMode(): MockDataMode {
	const raw = process.env.USE_MOCK_DATA?.trim().toLowerCase() ?? "off";
	if (FULL_ALIASES.has(raw)) {
		return "full";
	}
	if (AUTO_ALIASES.has(raw)) {
		return "auto";
	}
	return "off";
}

export function shouldUseMockData(): boolean {
	return getMockDataMode() === "full";
}

export function getApiBaseUrl(): string | null {
	if (shouldUseMockData()) {
		return null;
	}

	const baseUrl = process.env.API_BASE_URL?.trim();
	return baseUrl || null;
}
