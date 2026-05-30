import "server-only";
import { z } from "zod";
import { env } from "@/lib/env";

export class ApiError extends Error {
	constructor(
		message: string,
		readonly status: number,
		readonly path: string,
	) {
		super(message);
		this.name = "ApiError";
	}
}

type ApiFetchOptions = {
	/** Query params appended to the URL. Undefined values are dropped. */
	query?: Record<string, string | number | boolean | undefined>;
	/** ISR window in seconds. Defaults to API_REVALIDATE_SECONDS. */
	revalidate?: number | false;
	/** Cache tags for on-demand revalidation. */
	tags?: string[];
};

function buildUrl(path: string, query?: ApiFetchOptions["query"]): string {
	const url = new URL(path.replace(/^\//, ""), `${env.API_BASE_URL}/`);
	if (query) {
		for (const [key, value] of Object.entries(query)) {
			if (value !== undefined) url.searchParams.set(key, String(value));
		}
	}
	return url.toString();
}

/**
 * Typed GET against the backend REST API. Every response is validated with
 * the provided zod schema — this is the contract the rest of the site relies
 * on, so malformed data surfaces here rather than deep inside a component.
 */
export async function apiGet<TSchema extends z.ZodType>(
	path: string,
	schema: TSchema,
	options: ApiFetchOptions = {},
): Promise<z.infer<TSchema>> {
	const { query, revalidate = env.API_REVALIDATE_SECONDS, tags } = options;
	const url = buildUrl(path, query);

	const res = await fetch(url, {
		headers: { Accept: "application/json" },
		next: { revalidate: revalidate === false ? undefined : revalidate, tags },
		cache: revalidate === false ? "no-store" : undefined,
	});

	if (!res.ok) {
		throw new ApiError(
			`Request failed with status ${res.status}`,
			res.status,
			path,
		);
	}

	const json = await res.json();
	const result = schema.safeParse(json);

	if (!result.success) {
		throw new ApiError(
			`Response validation failed: ${z.prettifyError(result.error)}`,
			res.status,
			path,
		);
	}

	return result.data;
}
