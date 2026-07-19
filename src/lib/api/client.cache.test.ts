import { afterEach, describe, expect, it, vi } from "vitest";

describe("buildFetchCacheOptions", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
		vi.resetModules();
	});

	it("uses no-store when API_REVALIDATE_SECONDS is 0", async () => {
		vi.stubEnv("API_REVALIDATE_SECONDS", "0");
		vi.stubEnv("REVALIDATE_SECONDS", "");
		const { buildFetchCacheOptions, DEFAULT_REVALIDATE } = await import(
			"./client"
		);
		expect(DEFAULT_REVALIDATE).toBe(0);
		expect(buildFetchCacheOptions({ tags: ["news"] })).toEqual({
			cache: "no-store",
		});
	});

	it("reads API_REVALIDATE_SECONDS for ISR TTL", async () => {
		vi.stubEnv("API_REVALIDATE_SECONDS", "60");
		vi.stubEnv("REVALIDATE_SECONDS", "");
		const { buildFetchCacheOptions, DEFAULT_REVALIDATE } = await import(
			"./client"
		);
		expect(DEFAULT_REVALIDATE).toBe(60);
		expect(buildFetchCacheOptions({ tags: ["news"], revalidate: 60 })).toEqual({
			next: { revalidate: 60, tags: ["news"] },
		});
	});

	it("forces no-store when noStore option is set under ISR", async () => {
		vi.stubEnv("API_REVALIDATE_SECONDS", "120");
		const { buildFetchCacheOptions } = await import("./client");
		expect(buildFetchCacheOptions({ noStore: true, tags: ["news"] })).toEqual({
			cache: "no-store",
		});
	});
});
