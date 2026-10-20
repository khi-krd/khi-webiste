type ProjectsSearchParams = {
	year?: string | null;
	type?: string | null;
	q?: string | null;
	page?: number | null;
};

export function projectsHref({
	year,
	type,
	q,
	page,
}: ProjectsSearchParams = {}): string {
	const params = new URLSearchParams();

	if (year) params.set("year", year);
	if (type) params.set("type", type);
	if (q?.trim()) params.set("q", q.trim());
	if (page && page > 1) params.set("page", String(page));

	const query = params.toString();
	return query ? `/projects?${query}` : "/projects";
}

export function projectDetailHref(id: string): string {
	return `/projects/${id}`;
}
