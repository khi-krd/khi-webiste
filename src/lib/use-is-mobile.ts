"use client";

import { useEffect, useState } from "react";

const MOBILE_MAX_WIDTH = 639;

export function useIsMobile() {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);
		const update = () => setIsMobile(mediaQuery.matches);
		update();
		mediaQuery.addEventListener("change", update);
		return () => mediaQuery.removeEventListener("change", update);
	}, []);

	return isMobile;
}

export function useCoarsePointer() {
	const [isCoarse, setIsCoarse] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(pointer: coarse)");
		const update = () => setIsCoarse(mediaQuery.matches);
		update();
		mediaQuery.addEventListener("change", update);
		return () => mediaQuery.removeEventListener("change", update);
	}, []);

	return isCoarse;
}
