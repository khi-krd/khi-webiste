import "server-only";
import type { z } from "zod";
import { getApiBaseUrl } from "@/lib/api/config";
import { ApiResponseSchema } from "@/types/writing";

export const DEFAULT_REVALIDATE = 600;
export const DEFAULT_PAGE_SIZE = 20;
export const BULK_FETCH_SIZE = 200;

type ApiFetchOptions<T extends z.ZodType> = {
	schema: T;
	tags?: string[];
	revalidate?: number;
	searchParams?: Record<string, string | number | undefined>;
};

export async function apiFetch<T extends z.ZodType>(
	path: string,
	{
		schema,
		tags = [],
		revalidate = DEFAULT_REVALIDATE,
		searchParams,
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

		const response = await fetch(endpoint, {
			next: { revalidate, tags },
		});

		if (!response.ok) {
			return null;
		}

		const payload: unknown = await response.json();
		const envelopeSchema = ApiResponseSchema(schema);
		const parsed = envelopeSchema.safeParse(payload);

		if (!parsed.success) {
			return null;
		}

		const envelope = parsed.data as {
			success: boolean;
			message: string;
			data: z.infer<T>;
		};
		return envelope.data;
	} catch {
		return null;
	}
}

type ApiFetchRawOptions = {
	tags?: string[];
	revalidate?: number;
	searchParams?: Record<string, string | number | undefined>;
};

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
