type ProjectsSearchParams = {
	year?: string | null;
	tag?: string | null;
	q?: string | null;
	page?: number | null;
};

export function projectsHref({
	year,
	tag,
	q,
	page,
}: ProjectsSearchParams = {}): string {
	const params = new URLSearchParams();

	if (year) params.set("year", year);
	if (tag) params.set("tag", tag);
	if (q?.trim()) params.set("q", q.trim());
	if (page && page > 1) params.set("page", String(page));

	const query = params.toString();
	return query ? `/projects?${query}` : "/projects";
}

export function projectDetailHref(id: string): string {
	return `/projects/${id}`;
}
