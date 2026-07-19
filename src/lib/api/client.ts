import "server-only";
import type { ZodType } from "zod";
import { z } from "zod";
import { getApiBaseUrl } from "@/lib/api/config";

/**
 * Cache policy for upstream CMS fetches.
 *
 * - `API_REVALIDATE_SECONDS=0` or `no-store` (or unset) → `cache: "no-store"`
 * - positive integer → ISR with that TTL (seconds) + cache tags
 *
 * Also accepts legacy `REVALIDATE_SECONDS` as a fallback alias.
 */
type CachePolicy =
	| { mode: "no-store" }
	| { mode: "revalidate"; seconds: number };

function parseCachePolicy(): CachePolicy {
	const raw =
		process.env.API_REVALIDATE_SECONDS?.trim() ??
		process.env.REVALIDATE_SECONDS?.trim();

	// Fresh by default: CMS writes must appear without waiting for an ISR window
	// or a browser cache clear. Opt into ISR with a positive TTL.
	if (!raw || raw === "0" || /^no-?store$/i.test(raw)) {
		return { mode: "no-store" };
	}

	const parsed = Number.parseInt(raw, 10);
	if (!Number.isFinite(parsed) || parsed <= 0) {
		return { mode: "no-store" };
	}

	return { mode: "revalidate", seconds: parsed };
}

const CACHE_POLICY = parseCachePolicy();

/** Seconds used when ISR is enabled; `0` means no-store (default). */
export const DEFAULT_REVALIDATE =
	CACHE_POLICY.mode === "revalidate" ? CACHE_POLICY.seconds : 0;

export const DEFAULT_PAGE_SIZE = 20;
export const BULK_FETCH_SIZE = 200;

const isDevelopment = process.env.NODE_ENV === "development";

function logApiParseFailure(path: string, error: z.ZodError): void {
	if (!isDevelopment) {
		return;
	}

	const [firstIssue] = error.issues;
	console.warn(
		`[api] Zod parse failed for ${path}:`,
		firstIssue
			? `${firstIssue.path.join(".") || "(root)"}: ${firstIssue.message}`
			: error.message,
	);
}

export type ParsePageItemsOptions<_T = unknown> = {
	normalizeItem?: (item: unknown) => unknown;
	onItemError?: (item: unknown, error: z.ZodError) => void;
};

/** Parse list items individually so one bad record does not void the whole page. */
export function parsePageItems<S extends ZodType>(
	content: unknown,
	itemSchema: S,
	options: ParsePageItemsOptions<z.infer<S>> = {},
): z.infer<S>[] {
	if (!Array.isArray(content)) {
		return [];
	}

	const items: z.infer<S>[] = [];
	for (const rawItem of content) {
		const candidate = options.normalizeItem
			? options.normalizeItem(rawItem)
			: rawItem;
		const parsed = itemSchema.safeParse(candidate);
		if (parsed.success) {
			items.push(parsed.data);
			continue;
		}

		if (isDevelopment) {
			options.onItemError?.(rawItem, parsed.error);
		}
	}

	return items;
}

const PageShellSchema = z.object({
	content: z.array(z.unknown()),
	totalElements: z.number().optional(),
	totalPages: z.number().optional(),
	number: z.number().optional(),
	size: z.number().optional(),
	empty: z.boolean().optional(),
	last: z.boolean().optional(),
	first: z.boolean().optional(),
	numberOfElements: z.number().optional(),
});

export type ParsedApiPage<T> = {
	content: T[];
	totalElements: number;
	totalPages: number;
	number: number;
	size: number;
	empty: boolean;
};

type FetchCacheInput = {
	tags?: string[];
	revalidate?: number;
	/** Force bypass even when ISR env TTL is set. */
	noStore?: boolean;
};

/** Build Next.js fetch cache options from env policy + per-call overrides. */
export function buildFetchCacheOptions({
	tags = [],
	revalidate = DEFAULT_REVALIDATE,
	noStore = false,
}: FetchCacheInput = {}): RequestInit {
	if (noStore || CACHE_POLICY.mode === "no-store" || revalidate <= 0) {
		return { cache: "no-store" };
	}

	return {
		next: { revalidate, tags },
	};
}

type ApiFetchPageOptions<T extends ZodType> = {
	itemSchema: T;
	tags?: string[];
	revalidate?: number;
	noStore?: boolean;
	searchParams?: Record<string, string | number | undefined>;
	normalizeItem?: (item: unknown) => unknown;
};

export async function apiFetchPage<T extends ZodType>(
	path: string,
	{
		itemSchema,
		tags = [],
		revalidate = DEFAULT_REVALIDATE,
		noStore = false,
		searchParams,
		normalizeItem,
	}: ApiFetchPageOptions<T>,
): Promise<ParsedApiPage<z.infer<T>> | null> {
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
			buildFetchCacheOptions({ tags, revalidate, noStore }),
		);

		if (!response.ok) {
			if (isDevelopment) {
				console.warn(`[api] HTTP ${response.status} for ${path}`);
			}
			return null;
		}

		const payload: unknown = await response.json();
		const data = unwrapApiPayload(payload);
		if (data == null) {
			return null;
		}

		const shell = PageShellSchema.safeParse(data);
		if (!shell.success) {
			logApiParseFailure(path, shell.error);
			return null;
		}

		const content = parsePageItems(shell.data.content, itemSchema, {
			normalizeItem,
			onItemError: (item, error) => {
				const id =
					item && typeof item === "object" && "id" in item
						? String((item as { id: unknown }).id)
						: "?";
				logApiParseFailure(`${path}#item-${id}`, error);
			},
		});

		return {
			content,
			totalElements: shell.data.totalElements ?? content.length,
			totalPages: shell.data.totalPages ?? (content.length > 0 ? 1 : 0),
			number: shell.data.number ?? 0,
			size: shell.data.size ?? content.length,
			empty: shell.data.empty ?? content.length === 0,
		};
	} catch {
		return null;
	}
}

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
			buildFetchCacheOptions({ tags, revalidate, noStore }),
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
			logApiParseFailure(path, parsed.error);
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
	noStore?: boolean;
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
		const cacheOptions = buildFetchCacheOptions({ tags, revalidate, noStore });
		const response = await fetch(endpoint, {
			method,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
			...cacheOptions,
		});

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
			logApiParseFailure(path, parsed.error);
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
		noStore = false,
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

		const response = await fetch(
			endpoint,
			buildFetchCacheOptions({ tags, revalidate, noStore }),
		);

		if (!response.ok) {
			return null;
		}

		return response.json();
	} catch {
		return null;
	}
}
