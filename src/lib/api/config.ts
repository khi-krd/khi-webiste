import "server-only";

export function shouldUseMockData(): boolean {
	return process.env.USE_MOCK_DATA === "true";
}

export function getApiBaseUrl(): string | null {
	if (shouldUseMockData()) {
		return null;
	}

	const baseUrl = process.env.API_BASE_URL?.trim();
	return baseUrl || null;
}
