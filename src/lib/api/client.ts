import "server-only";
import type { z } from "zod";
import { getApiBaseUrl } from "@/lib/api/config";

export const DEFAULT_REVALIDATE = 600;
export const DEFAULT_PAGE_SIZE = 20;
export const BULK_FETCH_SIZE = 200;

/** Unwrap `{ success, data }` envelopes; pass through raw Spring pages and DTOs. */
export function unwrapApiPayload(payload: unknown): unknown | null {
	if (!payload || typeof payload !== "object") {
		return payload;
	}

	const record = payload as Record<string, unknown>;
	if ("success" in record && "data" in record) {
		return record.success === true ? record.data : null;
	}

	return payload;
}

type ApiFetchOptions<T extends z.ZodType> = {
	schema: T;
	tags?: string[];
	revalidate?: number;
	searchParams?: Record<string, string | number | undefined>;
	/** Bypass the Next.js data cache (required for large news list payloads). */
	noStore?: boolean;
};

export async function apiFetch<T extends z.ZodType>(
	path: string,
	{
		schema,
		tags = [],
		revalidate = DEFAULT_REVALIDATE,
		searchParams,
		noStore = false,
	}: ApiFetchOptions<T>,
): Promise<z.infer<T> | null> {
	const apiBaseUrl = getApiBaseUrl();
	if (!apiBaseUrl) {
		return null;
	}

	try {
		const endpoint = new URL(path, apiBaseUrl);
		if (searchParams) {
			for (const [key, value] of Object.entries(searchParams)) {
				if (value != null) {
					endpoint.searchParams.set(key, String(value));
				}
			}
		}

		const response = await fetch(
			endpoint,
			noStore
				? { cache: "no-store" }
				: {
						next: { revalidate, tags },
					},
		);

		if (!response.ok) {
			return null;
		}

		const payload: unknown = await response.json();
		const data = unwrapApiPayload(payload);
		if (data == null) {
			return null;
		}

		const parsed = schema.safeParse(data);
		if (!parsed.success) {
			return null;
		}

		return parsed.data;
	} catch {
		return null;
	}
}

type ApiFetchRawOptions = {
	tags?: string[];
	revalidate?: number;
	searchParams?: Record<string, string | number | undefined>;
};

type ApiMutationOptions<T extends z.ZodType> = {
	schema: T;
	tags?: string[];
	revalidate?: number;
	/** Bypass the Next.js data cache (default true for mutations). */
	noStore?: boolean;
};

async function apiMutate<T extends z.ZodType>(
	path: string,
	method: "POST" | "PATCH",
	body: unknown,
	{
		schema,
		tags = [],
		revalidate = DEFAULT_REVALIDATE,
		noStore = true,
	}: ApiMutationOptions<T>,
): Promise<z.infer<T> | null> {
	const apiBaseUrl = getApiBaseUrl();
	if (!apiBaseUrl) {
		return null;
	}

	try {
		const endpoint = new URL(path, apiBaseUrl);
		const response = await fetch(
			endpoint,
			noStore
				? {
						method,
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(body),
						cache: "no-store",
					}
				: {
						method,
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(body),
						next: { revalidate, tags },
					},
		);

		if (!response.ok) {
			return null;
		}

		const payload: unknown = await response.json();
		const data = unwrapApiPayload(payload);
		if (data == null) {
			return null;
		}

		const parsed = schema.safeParse(data);
		if (!parsed.success) {
			return null;
		}

		return parsed.data;
	} catch {
		return null;
	}
}

export async function apiPost<T extends z.ZodType>(
	path: string,
	body: unknown,
	options: ApiMutationOptions<T>,
): Promise<z.infer<T> | null> {
	return apiMutate(path, "POST", body, options);
}

export async function apiPatch<T extends z.ZodType>(
	path: string,
	body: unknown,
	options: ApiMutationOptions<T>,
): Promise<z.infer<T> | null> {
	return apiMutate(path, "PATCH", body, options);
}

export async function apiFetchRaw(
	path: string,
	{
		tags = [],
		revalidate = DEFAULT_REVALIDATE,
		searchParams,
	}: ApiFetchRawOptions = {},
): Promise<unknown | null> {
	const apiBaseUrl = getApiBaseUrl();
	if (!apiBaseUrl) {
		return null;
	}

	try {
		const endpoint = new URL(path, apiBaseUrl);
		if (searchParams) {
			for (const [key, value] of Object.entries(searchParams)) {
				if (value != null) {
					endpoint.searchParams.set(key, String(value));
				}
			}
		}

		const response = await fetch(endpoint, {
			next: { revalidate, tags },
		});

		if (!response.ok) {
			return null;
		}

		return response.json();
	} catch {
		return null;
	}
}
