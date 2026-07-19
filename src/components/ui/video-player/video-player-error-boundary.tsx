"use client";

import { Component, type ReactNode } from "react";

type VideoPlayerErrorBoundaryProps = {
	children: ReactNode;
	fallback: ReactNode;
};

type VideoPlayerErrorBoundaryState = {
	hasError: boolean;
};

/**
 * Vidstack can throw during rapid mount/unmount (Next.js navigation, clip
 * swaps). Catch those and fall back instead of crashing the route.
 */
export class VideoPlayerErrorBoundary extends Component<
	VideoPlayerErrorBoundaryProps,
	VideoPlayerErrorBoundaryState
> {
	state: VideoPlayerErrorBoundaryState = { hasError: false };

	static getDerivedStateFromError(): VideoPlayerErrorBoundaryState {
		return { hasError: true };
	}

	componentDidCatch(error: Error) {
		const message = error.message ?? "";
		if (
			message.includes("provider destroyed") ||
			message.includes("$state") ||
			message.includes("is not a function")
		) {
			return;
		}
		console.error("Video player error:", error);
	}

	render() {
		if (this.state.hasError) {
			return this.props.fallback;
		}
		return this.props.children;
	}
}
