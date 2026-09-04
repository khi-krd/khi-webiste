import {
	DocumentTextIcon,
	MusicalNoteIcon,
	PhotoIcon,
	VideoCameraIcon,
} from "@heroicons/react/24/outline";
import type { ComponentProps, ComponentType } from "react";
import type { PlatformMediaKind } from "@/lib/platform/constants";

const KIND_ICONS: Record<
	PlatformMediaKind,
	ComponentType<ComponentProps<"svg">>
> = {
	audio: MusicalNoteIcon,
	video: VideoCameraIcon,
	image: PhotoIcon,
	text: DocumentTextIcon,
};

/** The one glyph per platform media kind — none are directional. */
export function KindIcon({
	kind,
	className,
}: {
	kind: PlatformMediaKind;
	className?: string;
}) {
	const Icon = KIND_ICONS[kind];
	return <Icon aria-hidden className={className} />;
}
