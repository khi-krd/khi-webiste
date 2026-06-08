"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import {
	type KeyboardEvent as ReactKeyboardEvent,
	useCallback,
	useEffect,
	useId,
	useRef,
} from "react";
import { createPortal } from "react-dom";
import { Container } from "@/components/ui/container";

const VideoPlayer = dynamic(
	() => import("@/components/ui/video-player").then((mod) => mod.VideoPlayer),
	{ ssr: false },
);

const FOCUSABLE =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const OVERLAY_DURATION = 0.35;

function getFocusable(container: HTMLElement | null): HTMLElement[] {
	if (!container) return [];
	return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
}

type AboutIntroVideoModalProps = {
	open: boolean;
	onClose: () => void;
	videoSrc: string;
	poster: string;
	title: string;
	closeLabel: string;
	dialogLabel: string;
};

export function AboutIntroVideoModal({
	open,
	onClose,
	videoSrc,
	poster,
	title,
	closeLabel,
	dialogLabel,
}: AboutIntroVideoModalProps) {
	const reduceMotion = useReducedMotion();
	const dialogId = useId();
	const panelRef = useRef<HTMLDivElement>(null);
	const closeRef = useRef<HTMLButtonElement>(null);
	const triggerRef = useRef<HTMLElement | null>(null);

	const onKeyDown = useCallback(
		(event: ReactKeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				onClose();
				return;
			}

			if (event.key !== "Tab" || !panelRef.current) return;

			const focusable = getFocusable(panelRef.current);
			if (focusable.length === 0) return;

			const first = focusable[0];
			const last = focusable[focusable.length - 1];

			if (event.shiftKey) {
				if (document.activeElement === first) {
					event.preventDefault();
					last.focus();
				}
			} else if (document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		},
		[onClose],
	);

	useEffect(() => {
		if (open) {
			triggerRef.current = document.activeElement as HTMLElement | null;
			document.body.style.overflow = "hidden";
			requestAnimationFrame(() => closeRef.current?.focus());
		} else {
			document.body.style.overflow = "";
			triggerRef.current?.focus();
		}

		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);

	const overlayMotion = reduceMotion
		? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } }
		: {
				initial: { opacity: 0 },
				animate: { opacity: 1 },
				exit: { opacity: 0 },
			};

	if (typeof document === "undefined") return null;

	return createPortal(
		<AnimatePresence>
			{open && (
				<motion.div
					key="about-video-modal"
					ref={panelRef}
					id={dialogId}
					role="dialog"
					aria-modal="true"
					aria-label={dialogLabel}
					onKeyDown={onKeyDown}
					className="fixed inset-0 z-[100] flex flex-col bg-foreground/90"
					{...overlayMotion}
					transition={{
						duration: reduceMotion ? 0 : OVERLAY_DURATION,
						ease: "easeOut",
					}}
				>
					<Container className="max-w-none shrink-0 pt-8 sm:pt-10">
						<div className="flex justify-end">
							<button
								ref={closeRef}
								type="button"
								onClick={onClose}
								aria-label={closeLabel}
								className="inline-flex min-h-11 min-w-11 items-center justify-center border border-transparent bg-primary-foreground/10 p-2 text-primary-foreground transition-colors hover:border-primary-foreground/30 hover:bg-primary-foreground/20 focus-visible:border-primary-foreground/40 focus-visible:bg-primary-foreground/20"
							>
								<XMarkIcon className="size-6 shrink-0" aria-hidden="true" />
							</button>
						</div>
					</Container>

					<div className="flex min-h-0 flex-1 items-center justify-center px-6 pb-10 sm:px-8 sm:pb-14">
						<div className="w-full max-w-6xl">
							<VideoPlayer
								src={videoSrc}
								title={title}
								poster={poster}
								posterAlt={title}
								variant="full"
								className="w-full"
							/>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body,
	);
}
