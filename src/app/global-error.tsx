"use client";

/**
 * Last-resort boundary for crashes in the root layout itself — at that point
 * the locale layout never mounted, so there is no <html>, no fonts, no theme
 * tokens and no next-intl provider. It must therefore render its own document
 * and cannot use translations or the design-system components.
 *
 * Copy is intentionally bilingual (ckb + ku) rather than English-only: the
 * locale is unknown here, and both are the site's real audiences.
 */
export default function GlobalError({
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		// biome-ignore lint/a11y/useValidLang: "ckb" (Central Kurdish/Sorani) is a valid ISO 639-3 code and one of this site's two locales; Biome only recognises the shorter ISO 639-1 list.
		<html lang="ckb" dir="rtl">
			<body
				style={{
					margin: 0,
					minHeight: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					padding: "2rem",
					fontFamily: "system-ui, sans-serif",
					background: "#fff",
					color: "#111",
				}}
			>
				<main style={{ maxWidth: "32rem", textAlign: "center" }}>
					<h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
						هەڵەیەک ڕوویدا
					</h1>
					<p style={{ margin: "0 0 1.5rem", color: "#555" }}>
						نەمانتوانی ئەم پەڕەیە باربکەین. تکایە دووبارە هەوڵ بدەرەوە.
					</p>
					<p
						dir="ltr"
						style={{ margin: "0 0 1.5rem", color: "#555", fontSize: "0.9rem" }}
					>
						Tiştek çewt çû. Ji kerema xwe dîsa biceribîne.
					</p>
					<button
						type="button"
						onClick={reset}
						style={{
							border: "1px solid #111",
							background: "transparent",
							color: "inherit",
							padding: "0.6rem 1.25rem",
							font: "inherit",
							cursor: "pointer",
						}}
					>
						دووبارە هەوڵبدەرەوە · Dîsa biceribîne
					</button>
				</main>
			</body>
		</html>
	);
}
