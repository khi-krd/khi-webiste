"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
	beginPageLoaderExit,
	clearPageLoadingState,
	hidePageLoaderStatic,
	PAGE_LOADER_BG_RGB,
} from "@/components/layout/page-loader-critical";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { cn } from "@/lib/utils";
import "./page-loader-overlay.css";

const revealEase = [0.22, 1, 0.36, 1] as const;
const exitEase = [0.4, 0, 0.2, 1] as const;

const START_DELAY_MS = 600;
const KHI_DURATION = 0.52;
const HOLD_MS = 750;
const EXIT_DURATION = 0.65;
const WORDMARK_EXIT_DURATION = 0.35;
const SAFETY_TIMEOUT_MS = 5000;

const KHI_ENTER_X = 22;

const bgOpaque = `rgba(${PAGE_LOADER_BG_RGB}, 1)`;
const bgTransparent = `rgba(${PAGE_LOADER_BG_RGB}, 0)`;

type Phase = "delay" | "enter" | "hold" | "exit" | "done";

function getInlineEndEnterX(): number {
	if (typeof document === "undefined") return KHI_ENTER_X;
	return document.documentElement.dir === "rtl" ? -KHI_ENTER_X : KHI_ENTER_X;
}

const enterTransition = {
	duration: KHI_DURATION,
	ease: revealEase,
};

/**
 * Full-viewport boot loader — wordmark reveal, then blur/fade to content.
 * Runs once per full page load (layout mount). Skipped when reduced motion is on.
 */
export function PageLoaderOverlay() {
	const reduceMotion = useReducedMotion();
	const [mounted, setMounted] = useState(false);
	const [phase, setPhase] = useState<Phase>("delay");
	const [khiEnterX] = useState(getInlineEndEnterX);

	const finish = useCallback(() => {
		clearPageLoadingState();
		setPhase("done");
	}, []);

	useLayoutEffect(() => {
		if (reduceMotion) {
			clearPageLoadingState();
			setPhase("done");
			return;
		}

		hidePageLoaderStatic();
		setMounted(true);
	}, [reduceMotion]);

	useEffect(() => {
		if (phase !== "exit") return;
		beginPageLoaderExit();
	}, [phase]);

	useEffect(() => {
		if (reduceMotion || phase === "done") return;

		const previousOverflow = document.documentElement.style.overflow;
		document.documentElement.style.overflow = "hidden";

		return () => {
			document.documentElement.style.overflow = previousOverflow;
		};
	}, [reduceMotion, phase]);

	useEffect(() => {
		if (reduceMotion || phase === "done") return;

		const timeoutId = window.setTimeout(finish, SAFETY_TIMEOUT_MS);
		return () => window.clearTimeout(timeoutId);
	}, [reduceMotion, phase, finish]);

	useEffect(() => {
		if (phase !== "delay") return;

		const timeoutId = window.setTimeout(
			() => setPhase("enter"),
			START_DELAY_MS,
		);
		return () => window.clearTimeout(timeoutId);
	}, [phase]);

	useEffect(() => {
		if (phase !== "hold") return;

		const timeoutId = window.setTimeout(() => setPhase("exit"), HOLD_MS);
		return () => window.clearTimeout(timeoutId);
	}, [phase]);

	if (reduceMotion || !mounted || phase === "done") {
		return null;
	}

	const isEntering = phase === "enter";
	const isExiting = phase === "exit";

	return (
		<motion.div
			key="page-loader"
			className={cn(
				"page-loader-overlay fixed inset-0 flex items-center justify-center px-6",
				isExiting ? "z-40" : "z-[2147483647]",
				isExiting && "pointer-events-none",
			)}
			initial={{ backgroundColor: bgOpaque }}
			animate={{
				backgroundColor: isExiting ? bgTransparent : bgOpaque,
			}}
			transition={{
				duration: isExiting ? EXIT_DURATION : 0,
				ease: exitEase,
			}}
			onAnimationComplete={() => {
				if (isExiting) finish();
			}}
		>
			<div role="status" className="relative max-w-full text-center">
				<VisuallyHidden>KHI</VisuallyHidden>

				<motion.div
					aria-hidden
					initial={false}
					animate={
						isExiting
							? { opacity: 0, filter: "blur(12px)", scale: 1.02 }
							: { opacity: 1, filter: "blur(0px)", scale: 1 }
					}
					transition={
						isExiting
							? { duration: WORDMARK_EXIT_DURATION, ease: exitEase }
							: { duration: 0.3, ease: revealEase }
					}
				>
					<motion.span
						className="font-heading text-[clamp(4rem,14vw+1rem,9rem)] font-bold leading-none text-primary-foreground"
						initial={{ opacity: 0, x: khiEnterX }}
						animate={
							isEntering || phase === "hold" || isExiting
								? { opacity: 1, x: 0 }
								: { opacity: 0, x: khiEnterX }
						}
						transition={enterTransition}
						onAnimationComplete={() => {
							if (phase === "enter") setPhase("hold");
						}}
					>
						KHI
					</motion.span>
				</motion.div>
			</div>
		</motion.div>
	);
}
