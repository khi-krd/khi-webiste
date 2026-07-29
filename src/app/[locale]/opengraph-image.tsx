import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * Default social card, inherited by every route that does not define its own.
 * Without this, shared links render as a blank preview.
 *
 * Lives under `[locale]/`, not `app/`: the next-intl proxy matcher rewrites any
 * extensionless path without a locale prefix, so a root-level `/opengraph-image`
 * gets 307'd to `/ckb/opengraph-image` and never returns the PNG.
 *
 * Generated at build time by Next's Satori renderer, so it must stay within the
 * supported CSS subset (flex only — no grid, no external stylesheets).
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Kurdish Heritage Institute";

// Sampled from public/logo.png so the card matches the mark.
const GREEN = "#0f5c3f";
const CREAM = "#f4f1ea";

export default async function OpengraphImage() {
	const logo = readFileSync(join(process.cwd(), "public", "logo.png"));
	const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: 40,
				background: GREEN,
				color: CREAM,
			}}
		>
			{/* biome-ignore lint/performance/noImgElement: ImageResponse renders through Satori, which only understands raw <img>; next/image does not exist in this context. */}
			<img src={logoSrc} width={220} height={220} alt="" />
			{/*
			  Latin only: Satori's bundled font has no Arabic-script coverage and
			  the local fonts in public/ are Latin-only, so Sorani text would
			  render as tofu. The bilingual identity is carried by the logo mark.
			*/}
			<div
				style={{
					display: "flex",
					fontSize: 62,
					fontWeight: 700,
					letterSpacing: -1,
				}}
			>
				Kurdish Heritage Institute
			</div>
		</div>,
		size,
	);
}
