import "server-only";
import { z } from "zod";
import type { ZodType } from "zod";
import { getApiBaseUrl } from "@/lib/api/config";

export const DEFAULT_REVALIDATE = 600;
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

export type ParsePageItemsOptions<T> = {
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

type ApiFetchPageOptions<T extends ZodType> = {
	itemSchema: T;
	tags?: string[];
	revalidate?: number;
	searchParams?: Record<string, string | number | undefined>;
	normalizeItem?: (item: unknown) => unknown;
};

export async function apiFetchPage<T extends ZodType>(
	path: string,
	{
		itemSchema,
		tags = [],
		revalidate = DEFAULT_REVALIDATE,
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

		const response = await fetch(endpoint, {
			next: { revalidate, tags },
		});

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
