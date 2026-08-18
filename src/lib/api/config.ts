import "server-only";

export function getApiBaseUrl(): string | null {
	const baseUrl = process.env.API_BASE_URL?.trim();
	return baseUrl || null;
}
