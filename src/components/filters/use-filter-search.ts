"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Shared search-box state for the filter wrappers: a local draft synced to
 * the URL value, plus a 300 ms debounce so typing navigates with `replace`
 * instead of stacking history entries.
 */
export function useFilterSearch(activeQuery: string | null | undefined) {
	const [query, setQuery] = useState(activeQuery ?? "");
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		setQuery(activeQuery ?? "");
	}, [activeQuery]);

	useEffect(
		() => () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		},
		[],
	);

	const schedule = (fn: (value: string) => void, value: string) => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => fn(value), 300);
	};

	const cancel = () => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
	};

	return { query, setQuery, schedule, cancel };
}
