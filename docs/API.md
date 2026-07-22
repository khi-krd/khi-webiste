# KHI Website — External API Requirements & Coverage

This document describes the REST API contract expected by **khi-website** (public site), cross-referenced against the external API consumed by **khi-dashboard** (admin CMS). It lists required endpoints, query parameters, response shapes, site coverage, and gaps.

## Table of contents

- [Configuration](#configuration)
- [Coverage summary](#coverage-summary)
- [Endpoints the site requires](#endpoints-the-site-requires)
  - [1. About](#1-about)
  - [2. Contact](#2-contact)
  - [3. News](#3-news)
  - [4. Projects](#4-projects)
  - [5. Writings](#5-writings)
  - [6. Sound tracks (audio)](#6-sound-tracks-audio)
  - [7. Videos](#7-videos)
  - [8. Image collections (gallery)](#8-image-collections-gallery)
  - [9. Services](#9-services)
  - [10. Featured (homepage hero)](#10-featured-homepage-hero)
  - [11. Media (indirect)](#11-media-indirect)
- [Not required from external API (static / mock today)](#not-required-from-external-api-static--mock-today)
- [Integration mismatches (fix before production)](#integration-mismatches-fix-before-production)
- [Suggested new endpoints (if backend is extended)](#suggested-new-endpoints-if-backend-is-extended)
- [Source references](#source-references)

---



## Configuration


| Variable                 | Required         | Description                                                         |
| ------------------------ | ---------------- | ------------------------------------------------------------------- |
| `API_BASE_URL`           | Yes (production) | Base URL of the external REST API, e.g. `https://api.example.com`   |
| `API_REVALIDATE_SECONDS` | No               | CMS fetch cache: `0` / `no-store` (default) = always fresh; positive = ISR TTL in seconds. Legacy alias: `REVALIDATE_SECONDS`. |
| `REVALIDATION_SECRET`    | No (ISR)         | Secret for `POST /api/revalidate` on-demand tag/path invalidation   |
| `CLOUDFLARE_ZONE_ID`     | No               | Optional; enables Cloudflare purge from `/api/revalidate`           |
| `CLOUDFLARE_API_TOKEN`   | No               | Cloudflare API token with Cache Purge permission                    |
| `USE_MOCK_DATA`          | No               | Mock policy mode — see values below (default: `off`)                |
| `NEXT_PUBLIC_MEDIA_HOST` | Recommended (media) | Primary S3/CDN hostname; used for PDF proxy hints — `next/image` allows any HTTPS/HTTP host via wildcard `remotePatterns` |
| `NEXT_PUBLIC_SITE_URL`   | Yes (SEO)        | Canonical site origin                                               |

**`USE_MOCK_DATA` modes** (parsed in `src/lib/api/config.ts`, applied via `src/lib/api/mock-policy.ts`):

| Mode | Accepted values | Behaviour |
| ---- | --------------- | --------- |
| `off` | `false`, `0`, `off`, unset | Always call the API when `API_BASE_URL` is set. Never use `src/lib/mock/*` — return real data or empty/null. |
| `full` | `true`, `1`, `full`, `yes`, `on` | Skip API calls. Always use mock data. |
| `auto` | `auto`, `sparse`, `fallback` | Call the API. On **homepage sections only**, pad sparse results with mock items (never replace existing API items). Other pages never fall back to mock. |

**Request behaviour**

- All fetches go through `src/lib/api/client.ts`. By default they use `cache: "no-store"` so CMS writes appear immediately. Set `API_REVALIDATE_SECONDS` to a positive TTL to enable ISR with cache tags; then call `POST /api/revalidate` on publish (optional Cloudflare purge via `CLOUDFLARE_*` env vars).
- HTML / API responses send `Cache-Control: no-store` (and Cloudflare-specific CDN headers) so browsers and edge do not keep stale pages.
- **Cloudflare (dashboard, not in repo):** turn **Origin Cache Control** ON; do **not** use “Cache Everything” on HTML/locale routes; bypass cache for `/api/*`. Optional: set `CLOUDFLARE_ZONE_ID` + `CLOUDFLARE_API_TOKEN` and call `POST /api/revalidate` with `urls` after CMS writes to purge edge.
- Responses may be a raw Spring page/DTO **or** wrapped as `{ success: true, data: … }` (see `unwrapApiPayload`).
- Mock fallback depends on `USE_MOCK_DATA` mode (see table above). In `off` mode, failed requests return empty results rather than demo content.

**Rich text fields**

Long-form text returned by the API should be **Markdown** (preferred) or legacy **HTML**. The public site renders both through `src/lib/rich-text/` (GFM Markdown via `marked`, sanitized before display). Plain text is treated as Markdown.

**Supported formats & syntax**


| Format           | Detection                                                                         | Supported syntax                                                                                                                | Notes                                                 |
| ---------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Markdown         | Default when content does not start with `<`                                      | Headings (`#`–`######`), paragraphs, **bold**, *italic*, links, lists, blockquotes, horizontal rules, fenced code, tables (GFM) | Preferred for all new content                         |
| Markdown + media | Leading `<video>`, `<audio>`, `<img>`, or gallery/video/audio/file `<div>` blocks | Same as Markdown, plus inline media blocks                                                                                      | Used for embedded players and gallery layouts         |
| Legacy HTML      | Content starts with `<` (e.g. `<p>…</p>`)                                         | `p`, headings, lists, links, emphasis, `blockquote`, `code`, `pre`, `table`, `img`, `video`, `audio`, `figure`, `div`           | Sanitized on render; scripts and unsafe tags stripped |


**Rich text fields by resource**


| Resource          | API field                | Locale mirror                                | Used on site                                                           | Display                                                      |
| ----------------- | ------------------------ | -------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------ |
| About             | `ckbContent.body`        | `kmrContent.body`                            | `/about` — mission section                                             | Full rich text                                               |
| Contact           | `ckbContent.description` | `kmrContent.description`                     | `/contact` *(not wired yet)*                                           | Full rich text                                               |
| News              | `ckbContent.description` | `kmrContent.description`                     | `/news`, `/news/[slug]`, homepage latest updates                       | Full rich text                                               |
| Projects          | `ckbContent.description` | `kmrContent.description`                     | `/projects`, `/projects/[id]`, homepage                                | Full rich text on detail; plain excerpt on cards             |
| Writings          | `ckbContent.description` | `kmrContent.description`                     | `/writings`, `/writings/[segment]`                                     | Plain excerpt on cards; full rich text on detail where shown |
| Sound tracks      | `ckbContent.description` | `kmrContent.description`                     | `/audio`, `/audio/[id]`, homepage sound                                | Full rich text                                               |
| Videos            | `ckbContent.description` | `kmrContent.description`                     | `/videos`, `/videos/[id]`, `/videos/shortfilms`, homepage film & video | Full rich text (sidebar + detail)                            |
| Image collections | `ckbContent.description` | `kmrContent.description`                     | `/gallery`, `/gallery/[slug]`, homepage image collection               | Full rich text                                               |
| Services          | `contents[].description` | One entry per `languageCode` (`CKB` / `KMR`) | `/services` — section prose                                            | Full rich text                                               |
| Featured          | `description`            | —                                            | Homepage hero                                                          | Full rich text (stripped to plain text in hero)               |


All fields above accept `string` content in **Markdown or HTML**. Kurmanji (`kmrContent.`*) and Sorani (*`ckbContent.`) follow the same rules; the site picks the locale-appropriate variant with fallback to the other script.

**Pagination convention**

Most list endpoints use Spring pageable query params:


| Param  | Type     | Required | Notes                                                      |
| ------ | -------- | -------- | ---------------------------------------------------------- |
| `page` | `number` | Yes      | **0-based** page index                                     |
| `size` | `number` | Yes      | Page size; site bulk-fetches use `200` (`BULK_FETCH_SIZE`) |


Expected page body (after unwrapping):

```json
{
  "content": [],
  "totalElements": 0,
  "totalPages": 0,
  "number": 0,
  "size": 20,
  "empty": true
}
```

---



## Coverage summary


| Site area                   | API available       | Site integrated | Effective coverage |
| --------------------------- | ------------------- | --------------- | ------------------ |
| Homepage — featured hero    | ✅ Featured          | ✅               | **~100%**          |
| Homepage — latest updates   | ✅ News              | ✅               | **~95%**           |
| Homepage — projects         | ✅ Projects          | ✅               | **~90%**           |
| Homepage — sound            | ✅ Sound tracks      | ✅               | **~90%**           |
| Homepage — writings         | ✅ Writings          | ✅               | **~85%**           |
| Homepage — film / video     | ✅ Videos            | ✅               | **~90%**           |
| Homepage — image collection | ✅ Image collections | ✅               | **~90%**           |
| News                        | ✅                   | ✅               | **~95%**           |
| Projects                    | ✅                   | ✅               | **~90%**           |
| Writings                    | ✅                   | ✅               | **~85%**           |
| Audio                       | ✅                   | ✅               | **~90%**           |
| Videos / short films        | ✅                   | ✅               | **~90%**           |
| Gallery                     | ✅                   | ✅               | **~90%**           |
| About                       | ✅ (copy only)       | Partial         | **~25%**           |
| Services                    | ✅ (text only)       | Partial         | **~30%**           |
| Contact                     | ✅ (office data)     | ❌ Not wired     | **~40%** potential |
| Donate                      | ✅                   | ✅               | **~90%**           |
| Contact / donate forms      | ✅ (donate)          | Partial         | **~45%**           |
| Global search               | ❌                   | ❌               | **0%**             |
| Sitemap                     | ❌ (derived)         | ❌               | **0%**             |


---



## Endpoints the site requires



### 1. About

**Used by:** `/[locale]/about` (mission title, body, meta description)


| Method | Path                 | Query params   | Site integration                                               |
| ------ | -------------------- | -------------- | -------------------------------------------------------------- |
| `GET`  | `/api/v1/about`      | `page`, `size` | `getAboutPages()`                                              |
| `GET`  | `/api/v1/about/{id}` | —              | `getAboutPageBySlug()` *(expects slug today — see mismatches)* |


**Required response fields (per item)**


| Field                        | Type                            | Required                                              |
| ---------------------------- | ------------------------------- | ----------------------------------------------------- |
| `id`                         | `number`                        | ✅                                                     |
| `slugCkb`                    | `string`                        | Optional                                              |
| `slugKmr`                    | `string`                        | Optional                                              |
| `active`                     | `boolean`                       | Optional                                              |
| `ckbContent.title`           | `string`                        | At least one locale                                   |
| `ckbContent.body`            | `string` (Markdown or HTML)     | For mission section                                   |
| `ckbContent.metaDescription` | `string`                        | SEO                                                   |
| `kmrContent.*`               | same                            | Kurmanji fallback                                     |
| `stats[]`                    | `{ labelCkb, labelKmr, value }` | Optional (schema supports; not displayed on site yet) |


**Not covered by API:** founder photo, team members, partner cards, hero video/poster.

---



### 2. Contact

**Used by:** `/[locale]/contact` *(module exists; page still uses mocks)*


| Method | Path                     | Query params   | Site integration          |
| ------ | ------------------------ | -------------- | ------------------------- |
| `GET`  | `/api/v1/contact/active` | `page`, `size` | `getActiveContactPages()` |


**Required response fields (per office)**


| Field                     | Type                        | Required          |
| ------------------------- | --------------------------- | ----------------- |
| `id`                      | `number`                    | ✅                 |
| `active`                  | `boolean`                   | ✅                 |
| `slugCkb` / `slugKmr`     | `string`                    | Optional          |
| `phone`                   | `string`                    | ✅                 |
| `secondaryPhone`          | `string`                    | Optional          |
| `email`                   | `string`                    | ✅                 |
| `mapEmbedUrl`             | `string`                    | Optional          |
| `latitude` / `longitude`  | `number`                    | Optional (maps)   |
| `ckbContent.title`        | `string`                    | Office name       |
| `ckbContent.address`      | `string`                    | Optional          |
| `ckbContent.workingHours` | `string`                    | Optional          |
| `ckbContent.description`  | `string` (Markdown or HTML) | Optional          |
| `kmrContent.*`            | same                        | Kurmanji fallback |


**Also available in external API (not integrated on the site yet)**


| Method | Path                          | Notes         |
| ------ | ----------------------------- | ------------- |
| `GET`  | `/api/v1/contact/{id}`        | Single office |
| `GET`  | `/api/v1/contact/slug/{slug}` | Slug lookup   |


**Not covered by API:** social platform links, office hero images, HQ/regional badges, visitor contact form submission.

---



### 3. News

**Used by:** `/[locale]/news`, `/[locale]/news/[slug]`, homepage latest updates & bento


| Method | Path                  | Query params              | Site integration                         |
| ------ | --------------------- | ------------------------- | ---------------------------------------- |
| `GET`  | `/api/v1/news`        | `page`, `size`            | `getNews()`, `getLatestUpdates()`, bento |
| `GET`  | `/api/v1/news/search` | `keyword`, `page`, `size` | `getNews(query)`                         |
| `GET`  | `/api/v1/news/{id}`   | —                         | `getNewsBySlug()` (numeric slug only)    |


**Required response fields (per item)**


| Field                                   | Type                        | Required           |
| --------------------------------------- | --------------------------- | ------------------ |
| `id`                                    | `number`                    | ✅                  |
| `coverUrl`                              | `string`                    | ✅ (card image)     |
| `coverThumbnailUrl`                     | `string`                    | Optional           |
| `coverMediaType`                        | `IMAGE`                     | `VIDEO`            |
| `datePublished`                         | `ISO string`                | ✅                  |
| `contentLanguages`                      | `CKB`                       | `KMR`[]            |
| `category.ckbName` / `category.kmrName` | `string`                    | Taxonomy / filters |
| `ckbContent.title`                      | `string`                    | ✅                  |
| `ckbContent.description`                | `string` (Markdown or HTML) | Excerpt / body     |
| `kmrContent.*`                          | same                        | Kurmanji           |
| `tags.ckb` / `tags.kmr`                 | `string[]`                  | Optional           |
| `keywords.ckb` / `keywords.kmr`         | `string[]`                  | Optional           |


**Typical fetch sizes:** list `20`, latest updates `8`.

---



### 4. Projects

**Used by:** `/[locale]/projects`, `/[locale]/projects/[id]`, homepage projects section


| Method | Path                              | Query params              | Site integration                          |
| ------ | --------------------------------- | ------------------------- | ----------------------------------------- |
| `GET`  | `/api/v1/projects/getAll`         | `page`, `size`            | `getProjects()`, `getProjectById()`       |
| `GET`  | `/api/v1/projects/search/tag`     | `tag`, `page`, `size`     | `getProjectListItems(filter)`             |
| `GET`  | `/api/v1/projects/search/keyword` | `keyword`, `page`, `size` | `getProjectListItems(filter)`             |
| `GET`  | `/api/v1/projects/{id}`           | —                         | Available in API; site resolves from list |


**Required response fields (per item)**


| Field                                 | Type                        | Required      |
| ------------------------------------- | --------------------------- | ------------- |
| `id`                                  | `number`                    | ✅             |
| `coverUrl`                            | `string`                    | ✅             |
| `coverMediaType`                      | `IMAGE`                     | `VIDEO`       |
| `projectDate`                         | `ISO string`                | ✅             |
| `status`                              | `ACTIVE`                    | `ONGOING`     |
| `contentLanguages`                    | `CKB`                       | `KMR`[]       |
| `ckbContent.title`                    | `string`                    | ✅             |
| `ckbContent.subtitle` / `description` | `string` (Markdown or HTML) | Card + detail |
| `ckbContent.location`                 | `string`                    | Optional      |
| `kmrContent.*`                        | same                        | Kurmanji      |
| `tagsCkb` / `tagsKmr`                 | `string[]`                  | Filter        |
| `keywordsCkb` / `keywordsKmr`         | `string[]`                  | Search        |


---



### 5. Writings

**Used by:** `/[locale]/writings`, `/[locale]/writings/[segment]`, homepage writings carousel


| Method | Path                                 | Query params   | Site integration                                  |
| ------ | ------------------------------------ | -------------- | ------------------------------------------------- |
| `GET`  | `/api/v1/writings`                   | `page`, `size` | `getAllWritings()`, `getWritingsPage()`, carousel |
| `GET`  | `/api/v1/writings/{id}`              | —              | `getWritingById()`                                |
| `GET`  | `/api/v1/writings/series/{seriesId}` | —              | `getWritingSeriesBooks()`                         |


**Available in external API (not integrated on the site)**


| Method | Path                              | Query params              |
| ------ | --------------------------------- | ------------------------- |
| `GET`  | `/api/v1/writings/search/writer`  | `name`, `page`, `size`    |
| `GET`  | `/api/v1/writings/search/tag`     | `tag`, `page`, `size`     |
| `GET`  | `/api/v1/writings/search/keyword` | `keyword`, `page`, `size` |
| `GET`  | `/api/v1/writings/topics`         | —                         |
| `GET`  | `/api/v1/writings/series/parents` | —                         |


**Required response fields (per writing)**


| Field                                       | Type                               | Required                 |
| ------------------------------------------- | ---------------------------------- | ------------------------ |
| `id`                                        | `number`                           | ✅                        |
| `contentLanguages`                          | `CKB`                              | `KMR`[]                  |
| `ckbCoverUrl` / `kmrCoverUrl`               | `string`                           | At least one             |
| `hoverCoverUrl`                             | `string`                           | Optional                 |
| `ckbContent.title`                          | `string`                           | ✅                        |
| `ckbContent.writer`                         | `string`                           | ✅                        |
| `ckbContent.description`                    | `string` (Markdown or HTML)        | Excerpt                  |
| `ckbContent.fileUrl`                        | `string`                           | PDF viewer               |
| `ckbContent.fileFormat`                     | `PDF`                              | `DOCX`                   |
| `ckbContent.pageCount`                      | `number`                           | Optional                 |
| `ckbContent.genre`                          | `string`                           | Optional free-text genre |
| `kmrContent.*`                              | same                               | Kurmanji                 |
| `bookGenres`                                | enum[]                             | ✅ (see genre note below) |
| `publishedByInstitute`                      | `boolean`                          | ✅                        |
| `tags` / `keywords`                         | `{ ckb: string[], kmr: string[] }` | ✅                        |
| `series.seriesId`                           | `string`                           | Optional                 |
| `series.seriesName`                         | `string`                           | Optional                 |
| `series.seriesOrder`                        | `number`                           | Optional                 |
| `topicId` / `topicNameCkb` / `topicNameKmr` | —                                  | Optional                 |


**Series detail (**`/series/{seriesId}`**)**


| Field                           | Type     | Required |
| ------------------------------- | -------- | -------- |
| `seriesId`                      | `string` | ✅        |
| `seriesName`                    | `string` | Optional |
| `totalBooks`                    | `number` | Optional |
| `books[].id`                    | `number` | ✅        |
| `books[].titleCkb` / `titleKmr` | `string` | ✅        |
| `books[].seriesOrder`           | `number` | Optional |


**Genre alignment note:** the site Zod schema accepts `POETRY`, `NOVEL`, `SHORT_STORY`, `DRAMA`, `HISTORY`, `BIOGRAPHY`, `PHILOSOPHY`, `RELIGION`, `FOLKLORE`, `POLITICS`, `SOCIOLOGY`, `ECONOMICS`, `LAW`, `LINGUISTICS`, `ARTS`, `CULTURAL`, `SCIENCE`, `MEDICINE`, `EDUCATIONAL`, `CHILDREN`, `TRAVEL`, `OTHER`. Backend may return additional values (`ESSAY`, `POLITICAL`, `ACADEMIC`, etc.) — those records fail validation until schemas are aligned.

---



### 6. Sound tracks (audio)

**Used by:** `/[locale]/audio`, `/[locale]/audio/[id]`, homepage sound section


| Method | Path                                     | Query params   | Site integration               |
| ------ | ---------------------------------------- | -------------- | ------------------------------ |
| `GET`  | `/api/v1/sound-tracks`                   | `page`, `size` | `getAllSoundTracks()`, listing |
| `GET`  | `/api/v1/sound-tracks/{id}`              | —              | `getAudioTrackById()`          |
| `GET`  | `/api/v1/sound-tracks/album-of-memories` | `page`, `size` | `getAlbumOfMemories()`         |
| `GET`  | `/api/v1/sound-tracks/topics`            | —              | `getAudioTopics()`             |


**Available in external API (filtering applied in site listing logic today)**


| Method | Path                                  | Query params              |
| ------ | ------------------------------------- | ------------------------- |
| `GET`  | `/api/v1/sound-tracks/search`         | `q`, `page`, `size`       |
| `GET`  | `/api/v1/sound-tracks/by-state`       | `state`, `page`, `size`   |
| `GET`  | `/api/v1/sound-tracks/by-sound-type`  | `type`, `page`, `size`    |
| `GET`  | `/api/v1/sound-tracks/by-topic`       | `topicId`, `page`, `size` |
| `GET`  | `/api/v1/sound-tracks/search/tag`     | `value`, `page`, `size`   |
| `GET`  | `/api/v1/sound-tracks/search/keyword` | `value`, `page`, `size`   |


**Required response fields (per track)**


| Field                                       | Type                        | Required           |
| ------------------------------------------- | --------------------------- | ------------------ |
| `id`                                        | `number`                    | ✅                  |
| `soundType`                                 | `string`                    | ✅                  |
| `trackState`                                | `SINGLE`                    | `MULTI`            |
| `albumOfMemories`                           | `boolean`                   | ✅                  |
| `ckbCoverUrl` / `kmrCoverUrl`               | `string`                    | At least one       |
| `contentLanguages`                          | `CKB`                       | `KMR`[]            |
| `ckbContent.title`                          | `string`                    | ✅                  |
| `ckbContent.description`                    | `string` (Markdown or HTML) | Optional           |
| `files[]`                                   | see below                   | ✅ (playback)       |
| `tags` / `keywords`                         | bilingual sets              | ✅                  |
| `topicId` / `topicNameCkb` / `topicNameKmr` | —                           | Taxonomy / filters |
| `createdAt` / `updatedAt`                   | ISO string                  | ✅                  |


**Per file (**`files[]`**)**


| Field                      | Type                                   | Required             |
| -------------------------- | -------------------------------------- | -------------------- |
| `id`                       | `number`                               | ✅                    |
| `fileUrl`                  | `string`                               | For direct audio     |
| `externalUrl` / `embedUrl` | `string`                               | For external players |
| `title`                    | `string`                               | Optional             |
| `fileType`                 | `AUDIO`                                | `VIDEO`              |
| `durationSeconds`          | `number`                               | Optional             |
| `brochures[]`              | `{ imageUrl, caption, brochureOrder }` | Detail page          |


---



### 7. Videos

**Used by:** `/[locale]/videos`, `/[locale]/videos/[id]`, `/[locale]/videos/shortfilms`, homepage film & video sections


| Method | Path                    | Query params   | Site integration           |
| ------ | ----------------------- | -------------- | -------------------------- |
| `GET`  | `/api/v1/videos`        | `page`, `size` | `getAllVideos()`, listings |
| `GET`  | `/api/v1/videos/{id}`   | —              | `getVideoById()`           |
| `GET`  | `/api/v1/videos/topics` | —              | `getVideoTopics()`         |


**Available in external API (not integrated on the site)**


| Method | Path                            | Query params            |
| ------ | ------------------------------- | ----------------------- |
| `GET`  | `/api/v1/videos/search/tag`     | `value`, `page`, `size` |
| `GET`  | `/api/v1/videos/search/keyword` | `value`, `page`, `size` |


**Required response fields (per video)**


| Field                                                 | Type                        | Required                       |
| ----------------------------------------------------- | --------------------------- | ------------------------------ |
| `id`                                                  | `number`                    | ✅                              |
| `videoType`                                           | `FILM`                      | `VIDEO_CLIP`                   |
| `albumOfMemories`                                     | `boolean`                   | ✅                              |
| `ckbCoverUrl` / `kmrCoverUrl` / `hoverCoverUrl`       | `string`                    | Covers                         |
| `topicId` / `topicNameCkb` / `topicNameKmr`           | —                           | Short-films filter (`topicId`) |
| `contentLanguages`                                    | `CKB`                       | `KMR`[]                        |
| `ckbContent.title`                                    | `string`                    | ✅                              |
| `ckbContent.description`                              | `string` (Markdown or HTML) | Optional                       |
| `ckbContent.director` / `producer` / `location`       | `string`                    | Detail                         |
| `sourceUrl` / `sourceExternalUrl` / `sourceEmbedUrl`  | `string`                    | Playback                       |
| `videoClipItems[]`                                    | clips for `VIDEO_CLIP`      | Optional                       |
| `castMembers[]` / `highlightClips[]`                  | —                           | Detail (short films)           |
| `durationSeconds` / `publishmentDate`                 | —                           | Cards                          |
| `tagsCkb` / `tagsKmr` / `keywordsCkb` / `keywordsKmr` | `string[]`                  | Optional                       |
| `createdAt` / `updatedAt`                             | ISO string                  | ✅                              |


**Homepage fetch pattern:** `getVideoListing` with `videoType: FILM`, `memories: true`, `size: 4` (film section); short films exclude `topicId` for short-films topic.

---



### 8. Image collections (gallery)

**Used by:** `/[locale]/gallery`, `/[locale]/gallery/[slug]`, homepage image collection


| Method | Path                             | Query params   | Site integration                             |
| ------ | -------------------------------- | -------------- | -------------------------------------------- |
| `GET`  | `/api/v1/image-collections`      | `page`, `size` | `getGalleryPosts()`, `getImageCollection()`  |
| `GET`  | `/api/v1/image-collections/{id}` | —              | `getGalleryPostBySlug()` (numeric slug only) |


**Available in external API (not passed by the site)**


| Method | Path                               | Query params                |
| ------ | ---------------------------------- | --------------------------- |
| `GET`  | `/api/v1/image-collections`        | `type`, `topicId` (filters) |
| `GET`  | `/api/v1/image-collections/topics` | —                           |


**Required response fields (per collection)**


| Field                                       | Type                        | Required   |
| ------------------------------------------- | --------------------------- | ---------- |
| `id`                                        | `number`                    | ✅          |
| `collectionType`                            | `SINGLE`                    | `GALLERY`  |
| `ckbCoverUrl` / `kmrCoverUrl`               | `string`                    | Card image |
| `contentLanguages`                          | `CKB`                       | `KMR`[]    |
| `ckbContent.title`                          | `string`                    | ✅          |
| `ckbContent.description`                    | `string` (Markdown or HTML) | Body       |
| `ckbContent.location` / `collectedBy`       | `string`                    | Optional   |
| `kmrContent.*`                              | same                        | Kurmanji   |
| `imageAlbum[]`                              | see below                   | ✅          |
| `publishmentDate`                           | ISO string                  | Optional   |
| `topicId` / `topicNameCkb` / `topicNameKmr` | —                           | Optional   |


**Per album image (**`imageAlbum[]`**)**


| Field                       | Type     | Required |
| --------------------------- | -------- | -------- |
| `id`                        | `number` | ✅        |
| `imageUrl`                  | `string` | ✅        |
| `captionCkb` / `captionKmr` | `string` | Optional |
| `sortOrder`                 | `number` | ✅        |
| `widthPx` / `heightPx`      | `number` | Layout   |


---



### 9. Services

**Used by:** `/[locale]/services` — dynamic sections from `GET /api/v1/services/all`

| Method | Path                   | Query params   | Site integration          |
| ------ | ---------------------- | -------------- | ------------------------- |
| `GET`  | `/api/v1/services/all` | `page`, `size` | `getServiceRecords()` via `apiFetchPage` |
| `GET`  | `/api/v1/services`     | `page`, `size` | Admin / optional filter   |

**Envelope:** `{ success, message, data: { content, totalElements, … } }` — unwrapped by `unwrapApiPayload`.

**Behavior:** One active service record = one nav item + one scroll section, in API response order (`sortOrder` on backend). Section count is not fixed.

**Key fields:** `contents[]` (CKB/KMR title + Markdown/HTML description), `galleryMedia[]` (ordered `IMAGE`/`VIDEO` slots), `navAnchorId`, `layoutType`, `partnerIds[]`, legacy `featureImageUrls` / `thumbnailUrls` / `heroPosterUrl`.

**Fetch notes:** Per-item Zod parse via `apiFetchPage` + `normalizeServiceRecord`. Records without a resolvable title are skipped. Empty API → mock fallback sections.

See [`docs/SERVICES_BACKEND.md`](SERVICES_BACKEND.md) for full backend spec.

---

### 10. Donate

**Used by:** `/[locale]/donate` — hero, type cards, forms, bank/FastPay numbers

| Method | Path                           | Site integration                |
| ------ | ------------------------------ | ------------------------------- |
| `GET`  | `/api/v1/donations/settings`   | `getDonatePageDataFromApi()`    |
| `GET`  | `/api/v1/donations/types`      | `getDonatePageDataFromApi()`    |
| `POST` | `/api/v1/donations/archive`    | `submitArchiveDonationAction()` |
| `POST` | `/api/v1/donations/financial`  | `submitFinancialDonationAction()` |

**Envelope:** `{ success, message, data }` — unwrapped by `unwrapApiPayload`.

**Settings fields used:** `heroImageUrl`, `accountNumber` (FIB display), `iban` (FastPay display), `archiveDonationsEnabled`, `financialDonationsEnabled`.

**Types:** `FINANCIAL` / `ARCHIVE` enable flags filter cards, hero CTAs, participation paths, and forms. Empty types array → show all (fallback).

**Form mapping:** Archive material types and financial `paymentMethod: BANK_TRANSFER` (FIB/FastPay UI options). Amount presets remain static in i18n/mock.

**Not covered by API:** type card images, supporters image, amount presets, page copy (i18n), archive file upload (`attachmentUrl` not sent yet).

See [`docs/DONATE_BACKEND.md`](DONATE_BACKEND.md) for full backend spec.

---

### 11. Featured (homepage hero)

**Used by:** homepage `FeaturedHero`


| Method | Path                  | Query params | Site integration     |
| ------ | --------------------- | ------------ | -------------------- |
| `GET`  | `/api/v1/featured`    | `locale`     | `getFeaturedItems()` |


**Status:** ✅ **Implemented.** Site calls `GET /api/v1/featured?locale=` and maps the response to hero slides. When the API returns a valid empty array, the hero shows static fallback slides. Demo mock is used only in `USE_MOCK_DATA=full`/`auto` (homepage), or when the fetch/parse fails in those modes.

**Locale:** `kmr` and `ku` resolve to Kurmanji; any other value (including omission) resolves to `ckb`.

**Response:** array of featured items, globally sorted by `featuredOrder` ascending (nulls last), then `displayOrder` assigned sequentially.

| Field            | Type                        | Required | Notes |
| ---------------- | --------------------------- | -------- | ----- |
| `id`             | `string`                    | ✅        | Composite `{source}-{entityId}` |
| `source`         | `news` \| `project` \| …    | ✅        | Entity type: `news`, `project`, `writing`, `video`, `sound-track`, `image-collection` |
| `entityId`       | `number`                    | ✅        | Original database ID |
| `type`           | `book` \| `audio` \| …      | ✅        | Hero category: `article`, `archive`, `book`, `video`, `audio`, `gallery` |
| `slug`           | `string`                    | ✅        | Route segment (entity ID string, or localized slug for image collections) |
| `title`          | `string`                    | ✅        | Localized title |
| `description`    | `string` (Markdown or HTML) | ✅        | Stripped to plain text in hero |
| `image.url`      | `string`                    | ✅        | Hero image URL |
| `image.alt`      | `string`                    | Optional | Defaults to title |
| `featuredOrder`  | `number` \| `null`          | Optional | Global sort priority |
| `displayOrder`   | `number`                    | Optional | Final order in response (1..N) |

Items without a resolvable image URL are omitted server-side. An empty array is valid.

**Admin (not consumed by this site):** per-entity `PATCH /api/v1/{resource}/{id}/featured` endpoints manage `featured` and `featuredOrder` across news, projects, writings, videos, sound-tracks, and image-collections.

---



### 12. Media (indirect)

**Used by:** all cover URLs, PDFs, audio files, gallery images


| Method   | Path                   | Notes                              |
| -------- | ---------------------- | ---------------------------------- |
| `POST`   | `/api/v1/media/upload` | Admin only; public site reads URLs |
| `DELETE` | `/api/v1/media`        | Admin only                         |


**Public site requirements**

- Cover and gallery URLs may be served from any HTTPS (or HTTP) host; `next.config.ts` uses wildcard `remotePatterns` so CMS-provided image URLs render without per-host configuration.
- Prefer `NEXT_PUBLIC_MEDIA_HOST` / S3 (`s3-khiwebsite.s3.us-east-1.amazonaws.com`) for production media when possible.
- Writing PDFs are proxied via `GET /api/writings/pdf?src=…` (Next.js route, not external API).

---

