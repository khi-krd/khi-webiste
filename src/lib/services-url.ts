type ServicesSearchParams = {
	type?: string | null;
	q?: string | null;
};

export function servicesHref({ type, q }: ServicesSearchParams = {}): string {
	const params = new URLSearchParams();

	if (type?.trim()) params.set("type", type.trim());
	if (q?.trim()) params.set("q", q.trim());

	const query = params.toString();
	return query ? `/services?${query}` : "/services";
}

/**
 * Resolve `?type=` against the types the CMS published.
 *
 * Anything else — a stale link, a hand-typed value — resolves to `null` and the
 * filter is treated as absent, so raw user text never reaches the upstream
 * `type` param.
 */
export function parseServiceType(
	value: string | null | undefined,
	options: readonly string[],
): string | null {
	const candidate = value?.trim().toLocaleLowerCase();
	if (!candidate) {
		return null;
	}

	return (
		options.find((option) => option.toLocaleLowerCase() === candidate) ?? null
	);
}

/** A blank term is a 400 upstream, so it collapses to "no search". */
export function parseServiceQuery(
	value: string | null | undefined,
): string | null {
	return value?.trim() || null;
}
