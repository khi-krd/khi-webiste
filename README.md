# KHI Website

Public website for the Kurdish Heritage Institute. Next.js 16 (App Router,
Turbopack) with next-intl, serving two locales: **ckb** (Sorani, RTL, default)
and **ku** (Kurmanji, LTR). All content comes from a REST CMS at
`API_BASE_URL`; the site itself holds no database.

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then fill in API_BASE_URL and NEXT_PUBLIC_SITE_URL
pnpm dev
```

Node 24 and pnpm 11 (see `packageManager` in `package.json`).

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` | Production build (runs `sync:pdf-worker` first) |
| `pnpm start` | Serve a production build |
| `pnpm lint` | Biome lint + format check |
| `pnpm format` | Biome autofix |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest unit tests |
| `pnpm check:i18n` | Fail if the ckb/ku message catalogues have drifted |
| `pnpm validate:api` | Live smoke test of CMS responses against the Zod schemas |
| `pnpm sync:pdf-worker` | Re-copy the pdf.js worker from `pdfjs-dist` into `public/pdf/` |

`ANALYZE=true pnpm build` emits a bundle treemap.

## Configuration

See `.env.example` for the full annotated list. Two variables are **required**
and enforced at startup by `src/lib/env.ts` — a production container refuses to
serve without them rather than silently rendering an empty site:

- `API_BASE_URL` — the CMS. Runtime.
- `NEXT_PUBLIC_SITE_URL` — canonical https origin. **Build-time**, because
  `NEXT_PUBLIC_*` is inlined into the client bundle during `next build`.

`ENABLE_HSTS` is also build-time: `headers()` in `next.config.ts` is evaluated
during the build and baked into the routes manifest.

## Deploying

Built for Docker on a single host, behind a TLS-terminating reverse proxy.
`output: "standalone"` is set, so the runtime image carries only the traced
dependency set.

```bash
docker compose build
docker compose up -d
```

Once HTTPS is confirmed working end to end, rebuild with `ENABLE_HSTS=true` —
sending HSTS from a plain-HTTP origin pins browsers to a scheme the site cannot
serve and is hard to undo.

### Security headers

`next.config.ts` sets `X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy`, `Permissions-Policy` and a **Report-Only** CSP. The CSP is
not enforcing yet: Next emits inline bootstrap scripts and `featured-hero.tsx`
injects an inline JSON-LD block, so switching it on requires nonces threaded
through `src/proxy.ts`. Watch the violation reports first, then rename the
header to `Content-Security-Policy`.

## Notes for contributors

- **`src/lib/mock/` is not dead code.** Alongside the fixtures it holds types,
  constants and formatters that production components import. It also lacks a
  `server-only` guard, so some fixture modules reach client bundles. Treat
  extracting the shared helpers into their real homes as pending cleanup.
- **Fixture media was removed from `public/`** to keep the deploy image small,
  so `USE_MOCK_DATA=full` renders with broken image/video/audio URLs. Text,
  layout and data shape still work.
- **Two Biome rules are downgraded to warnings** in `biome.json`:
  - `useExhaustiveDependencies` — Biome flags deps that are present but not read
    inside the effect. Several are deliberate re-run triggers (e.g. `src` in
    `video-still-preview.tsx` resets `failed` when the source changes); taking
    the suggestion would introduce stale-state bugs.
  - `useSemanticElements` — the filter bars, tab strips and PDF viewer are
    deliberate ARIA composite widgets built on `div`/`li`, with roles and
    keyboard handling implemented by hand.
- **`public/pdf/pdf.worker.min.mjs` is generated**, not hand-maintained. It is
  re-copied from the installed `pdfjs-dist` on every build; a version mismatch
  between the worker and the API breaks the PDF viewer at runtime with no build
  error.
- The i18n proxy (`src/proxy.ts`) rewrites every extensionless path without a
  locale prefix. Metadata file conventions like `opengraph-image` therefore live
  under `src/app/[locale]/`, not `src/app/`.
- **There is deliberately no `src/app/[locale]/loading.tsx`.** A Suspense
  boundary at the locale root flushes the shell before `notFound()` runs, which
  locked *every* 404 on the site to HTTP 200 — a soft-404 that search engines
  index as real content. That defeated the `notFound()`-in-`generateMetadata`
  calls in the dynamic detail routes too. Navigation feedback comes from
  `RouteProgress` (top progress bar) instead. Re-adding a `loading.tsx` at that
  level will silently reintroduce the soft-404s.

Backend API contracts are documented in [`docs/`](docs/).
