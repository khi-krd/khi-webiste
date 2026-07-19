"use client";

import { Component, type ReactNode } from "react";

type VideoPlayerErrorBoundaryProps = {
	children: ReactNode;
	fallback: ReactNode;
};

type VideoPlayerErrorBoundaryState = {
	hasError: boolean;
};

function rejectionMessage(reason: unknown): string {
	if (typeof reason === "string") return reason;
	if (reason instanceof Error) return reason.message;
	return String(reason ?? "");
}

/** Known Vidstack teardown noise (YouTube/Vimeo provider dispose). */
function isBenignVidstackTeardown(reason: unknown): boolean {
	const message = rejectionMessage(reason);
	return (
		message.includes("provider destroyed") ||
		message.includes("$state") ||
		message.includes("is not a function")
	);
}

let rejectionGuardInstalled = false;

/**
 * Vidstack rejects in-flight YouTube/Vimeo RPC promises with "provider destroyed"
 * on unmount. That surfaces as an unhandledrejection — React error boundaries
 * cannot catch it, and Next DevTools ignores preventDefault().
 *
 * Capture-phase + stopImmediatePropagation runs before Next's bubble listener.
 */
function installVidstackRejectionGuard() {
	if (rejectionGuardInstalled || typeof window === "undefined") return;
	rejectionGuardInstalled = true;

	window.addEventListener(
		"unhandledrejection",
		(event) => {
			if (!isBenignVidstackTeardown(event.reason)) return;
			event.preventDefault();
			event.stopImmediatePropagation();
		},
		true,
	);
}

/**
 * Vidstack can throw during rapid mount/unmount (Next.js navigation, clip
 * swaps). Catch those and fall back instead of crashing the route.
 */
export class VideoPlayerErrorBoundary extends Component<
	VideoPlayerErrorBoundaryProps,
	VideoPlayerErrorBoundaryState
> {
	state: VideoPlayerErrorBoundaryState = { hasError: false };

	constructor(props: VideoPlayerErrorBoundaryProps) {
		super(props);
		installVidstackRejectionGuard();
	}

	static getDerivedStateFromError(): VideoPlayerErrorBoundaryState {
		return { hasError: true };
	}

	componentDidCatch(error: Error) {
		if (isBenignVidstackTeardown(error)) return;
		console.error("Video player error:", error);
	}

	render() {
		if (this.state.hasError) {
			return this.props.fallback;
		}
		return this.props.children;
	}
}
