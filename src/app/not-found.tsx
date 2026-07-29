import { routing } from "@/i18n/routing";

/**
 * Root 404 — reached only for paths that carry no valid locale, since
 * `[locale]/[...rest]` catches everything under a known locale and renders the
 * fully localised `[locale]/not-found.tsx` instead.
 *
 * There is no root layout (the locale layout is the one that renders <html>),
 * so this has no fonts, theme tokens or next-intl provider and must be
 * self-contained. Copy is bilingual because the locale is unknown here.
 */
export default function RootNotFound() {
	return (
		<html lang={routing.defaultLocale} dir="rtl">
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
						پەڕە نەدۆزرایەوە
					</h1>
					<p style={{ margin: "0 0 1rem", color: "#555" }}>
						ئەو پەڕەیەی بەدوایدا دەگەڕێیت بوونی نییە یان گوازراوەتەوە.
					</p>
					<p
						dir="ltr"
						style={{ margin: "0 0 1.5rem", color: "#555", fontSize: "0.9rem" }}
					>
						Rûpela ku tu lê digerî tune ye an hatiye guhertin.
					</p>
					<a
						href={`/${routing.defaultLocale}`}
						style={{ color: "inherit", textUnderlineOffset: "4px" }}
					>
						گەڕانەوە بۆ پەڕەی سەرەکی · Vegere rûpela sereke
					</a>
				</main>
			</body>
		</html>
	);
}
