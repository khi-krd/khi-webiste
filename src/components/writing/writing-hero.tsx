import NextImage from "next/image";
import { WRITINGS_STILL } from "@/lib/writing/still";

type WritingHeroBackdropProps = {
	/** Optional soft texture — one image only, heavily diffused. */
	textureUrl?: string | null;
};

function WritingHeroBackground({ textureUrl }: { textureUrl?: string | null }) {
	return (
		<div
			aria-hidden
			className="pointer-events-none absolute inset-0 isolate overflow-hidden"
		>
			{/* Base paper wash */}
			<div className="absolute inset-0 bg-linear-to-b from-sunken/45 via-surface via-45% to-surface" />

			{/* Single diffused texture — no rotated collage */}
			{textureUrl ? (
				<div className="absolute inset-0 flex items-center justify-center opacity-100">
					<div className="relative h-[140%] w-[140%] max-w-none">
						<NextImage
							src={textureUrl}
							alt=""
							fill
							priority
							sizes="100vw"
							className="scale-105 object-cover opacity-[0.14] blur-3xl saturate-[0.45] brightness-[1.08]"
						/>
					</div>
				</div>
			) : null}

			{/* Soft top light */}
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_-20%,var(--color-sunken)_0%,transparent_58%)] opacity-70" />

			{/* Gentle vignette — keeps focus on centre copy */}
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_72%_at_50%_42%,transparent_0%,var(--color-surface)_78%)]" />

			{/* Bottom edge depth */}
			<div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-border/25 to-transparent" />
		</div>
	);
}

/**
 * Paper wash + diffused texture for the writings carousel container.
 *
 * This used to be a full hero band carrying an eyebrow and headline; with the
 * copy removed an empty strip was left over, so the wash now sits behind the
 * carousel itself and the strip is gone.
 */
export function WritingHeroBackdrop({
	textureUrl = WRITINGS_STILL,
}: WritingHeroBackdropProps) {
	return <WritingHeroBackground textureUrl={textureUrl} />;
}
