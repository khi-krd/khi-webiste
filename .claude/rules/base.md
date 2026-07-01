this is a new projects lets handle this project carefully because we have smooth things to do, lets start with:

The website name is Kurdish Heritage institute (ئینستیوتی کەلەپووری کودی )

Set environment variables. Add the backend REST API base URL and any media/S3 host to .env.local (and an .env.example to commit). Everything downstream depends on knowing where data comes from.

Wire up i18n. Create the routing config (ckb + ku), the request config, the navigation helpers, and the proxy.ts (not middleware.ts — the Next 16 rename). This is the bedrock since every route lives under [locale]. → Blocked on a decision: default/fallback locale, ckb or ku? I asked last time; I still need this to set the routing config correctly.

Build the [locale] layout. Set lang and dir per locale on <html>, mount the next-intl provider, and add generateStaticParams so both locales render statically (important for your SEO priority). Add a not-found for invalid locales.

Add fonts. Wire next/font for both scripts. → Blocked on a decision: which font(s), and do they cover both Arabic (Sorani) and Latin/Hawar (Kurmanji)? One family covering both is ideal; otherwise we load per-locale.

Establish the Tailwind v4 + RTL baseline. Define theme tokens (colors, type scale, spacing) in CSS, set base typography for each script, and confirm logical-property utilities mirror correctly by eyeballing both directions early.

Set the folder structure and conventions. Decide where components, feature modules, and the lib/ layer live. Lock the Server-Component-by-default rule into the structure.

Build the typed REST client + zod layer. A small fetch wrapper with ISR/revalidate, plus zod schemas that validate every API response. This is the contract the whole site is built on — worth doing carefully before pages consume it.

Configure next/image with wildcard `remotePatterns` (`hostname: "**"`) so any CMS cover URL renders; prefer S3 via `NEXT_PUBLIC_MEDIA_HOST` for production uploads.

Lay down SEO scaffolding. Metadata helpers, hreflang for both locales, sitemap.ts, robots, and a JSON-LD helper you'll specialize per content type later.

Build the shell. Header/nav, language switcher (using the next-intl navigation helpers so it preserves the route), and footer — the layout that wraps every page and must mirror cleanly in RTL.