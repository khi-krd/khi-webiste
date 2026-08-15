# Feature Image — Hero Carousel

Add one field, **feature image**, so an editor can give each featured item a
picture made for the homepage hero, instead of the hero re-using the item's cover
and cropping it badly.

| | |
| --- | --- |
| Backend | `/Users/khi/Desktop/khi_backend` — Spring Boot 4, Java 21, PostgreSQL |
| Dashboard | `/Users/khi/Desktop/khi-dashboard` — Next.js 16, React 19, TypeScript |
| Website | `/Users/khi/Desktop/khi-webiste` — Next.js 15 (**no changes needed**) |
| Endpoint | `GET /api/v1/featured` (read) · `PATCH /api/v1/{resource}/{id}/featured` (write) |

---

## 1 · The problem

The hero is full-screen (`h-svh`, `object-cover`), so it needs a **wide** picture.
The item's cover is not wide — a book cover is portrait, a book scan is a spread.

Live example from the carousel right now: the featured writing's cover is
`4724 × 2475` and it is a **scan of a book spread** (front + back side by side).
The hero fills the screen with it, so the visitor sees half a spread, off-centre.
Nothing is wrong with the cover — it is simply not a hero picture.

**Fix:** one optional image per item, sized for the hero. When it is set, the hero
uses it. When it is not, everything behaves exactly as today.

---

## 2 · The logic

Featuring already works like this: six content types (news, projects, writings,
videos, sound-tracks, image-collections) each carry `featured` + `featuredOrder`.
`GET /api/v1/featured` gathers all the flagged records, sorts them, and returns a
slide for each with an `image.url` picked from that record's cover.

The change is **one new column on each of those six tables**, and **one line in each
of the six mappers**:

```
image.url  =  featureImageUrl  (if set)   ←  NEW
              ↓ otherwise
              the existing cover logic, unchanged
```

That is the whole feature. Three consequences worth knowing:

1. **The website needs no code change.** It already reads `image.url` and paints it
   full-screen. Filling that field with a better picture is invisible to it.
2. **The field is optional.** An item with no feature image keeps using its cover, so
   nothing breaks the day the column is added.
3. **Do not make it required.** The backend already drops any featured record whose
   image is blank (`featuredSlide()` returns `null` on a blank URL), so the fallback
   to the cover must stay.

### Naming

Call the column `feature_image_url`, and the JSON field `featureImageUrl`.
The codebase already uses `heroImageUrl` on Contact and DonationSettings, and
`featureImageUrls` on Service — `featureImageUrl` matches the user's language
("feature image") and does not collide with either.

---

## 3 · The image spec (for editors)

The hero is the whole screen, so the picture is displayed at viewport size and
centre-cropped.

| | |
| --- | --- |
| **Size** | **2560 × 1440** (16:9). Minimum 1920 × 1080. |
| Format | JPEG, quality ~80 |
| File size | keep under ~500 KB — the website serves the original file as-is |

**Where to keep the subject.** The slide's title and description sit at the
**bottom**, on the **right** side in Kurdish, and dark gradients cover the bottom
~40% and the right ~40% so the text stays readable. On phones the same picture is
cropped to a tall portrait.

So: put the subject **in the upper-middle, toward the left**, and keep it away from
the outer edges — those get cut off on narrow screens.

---

## 4 · Backend guide

Three small edits per content type, all in `/Users/khi/Desktop/khi_backend`.
No migration file is needed — `ddl-auto: update` adds the column at boot.

### 4.1 The column

Add to `News`, `Project`, `Writing`, `Video`, `SoundTrack`, `ImageCollection`:

```java
@Column(name = "feature_image_url", columnDefinition = "TEXT")
private String featureImageUrl;
```

Resulting SQL (informational — Hibernate creates it):

```sql
ALTER TABLE news               ADD COLUMN feature_image_url TEXT;
ALTER TABLE projects           ADD COLUMN feature_image_url TEXT;
ALTER TABLE writings           ADD COLUMN feature_image_url TEXT;
ALTER TABLE videos             ADD COLUMN feature_image_url TEXT;
ALTER TABLE sound_tracks       ADD COLUMN feature_image_url TEXT;
ALTER TABLE image_collections  ADD COLUMN feature_image_url TEXT;
```

### 4.2 Prefer it in the mappers

`SiteContentService` has one mapper per type, each ending in a call to
`featuredSlide(...)`. Wrap the existing image argument with the new field —
`firstNonBlank` is already imported and used there.

News (`newsFeatured`):

```java
String imageUrl = news.getCoverMediaType() == null
        || news.getCoverMediaType() == MediaKind.IMAGE
        ? firstNonBlank(news.getCoverUrl(), news.getCoverThumbnailUrl())
        : news.getCoverThumbnailUrl();

imageUrl = firstNonBlank(news.getFeatureImageUrl(), imageUrl);   // ← add this line
```

Writing / Video / SoundTrack / ImageCollection (same shape in all four):

```java
return featuredSlide(
        "writing", writing.getId(), "book", String.valueOf(writing.getId()),
        title, description,
        firstNonBlank(writing.getFeatureImageUrl(),              // ← add this
                      imageUrl, writing.getHoverCoverUrl()),
        locale, writing.isFeatured(), writing.getFeaturedOrder());
```

Do the same for `projectFeatured`. That is the entire read path — `image.url` now
carries the feature image whenever one exists.

### 4.3 Let the dashboard save it

The dashboard sets featured state through
`PATCH /api/v1/{resource}/{id}/featured`, which takes `FeaturedRequest`. That DTO
already has an unused `imageUrl` field from an older design; add the new one
explicitly so the intent is clear:

```java
// SiteContentDtos.FeaturedRequest
private String featureImageUrl;   // null = leave unchanged, "" = clear
```

Then in each `setXFeatured` method in `SiteContentService`, persist it:

```java
if (request.getFeatureImageUrl() != null) {
    news.setFeatureImageUrl(trimToNull(request.getFeatureImageUrl()));
}
```

Using `null` to mean "don't touch" lets the existing feature/unfeature calls keep
working unchanged — they simply omit the field.

Finally, return it on each entity's response DTO (`NewsResponse`, `WritingResponse`, …)
so the dashboard can show what is currently set:

```java
private String featureImageUrl;
```

### 4.4 Security

Nothing to add. These PATCH endpoints are already restricted with
`@PreAuthorize("hasRole('ADMIN')")` on each controller method, and
`/api/v1/media/**` (the upload) is already ADMIN-only.

> Note for later: the `POST/PUT/DELETE /api/v1/featured/**` matchers in
> `SecurityConfig` guard endpoints that do not exist — the real write path is the
> per-resource PATCH, which is not in those lists. It is protected by the
> annotations, so this is untidy rather than unsafe.

---

## 5 · Dashboard guide

App: `/Users/khi/Desktop/khi-dashboard`. The featured screen is
`app/dashboard/featured/page.tsx` → `components/featured/featured-list-client.tsx`.

**Put the upload on the featured screen**, not in the six content forms. The editor
curates the carousel there, sees each slide in order, and that is exactly where they
will want to fix a bad crop. It is also one screen to change instead of six forms.

### 5.1 Extend the types

`types/featured.ts`:

```ts
export type FeaturedPayload = {
  featured?: boolean
  featuredOrder?: number
  featureImageUrl?: string | null   // ← new
}
```

`lib/featured-catalog.ts` — add the field to the view model:

```ts
export type FeaturedCatalogItem = {
  // …existing fields…
  coverUrl?: string | null
  featureImageUrl?: string | null   // ← new
}
```

and read it in each `mapXToCatalogItem` (all seven are in the same file):

```ts
featureImageUrl: news.featureImageUrl?.trim() || null,
```

Also add `featureImageUrl?: string | null` to the entity DTOs in `types/news.ts`,
`types/projects.ts`, `types/writings.ts`, `types/videos.ts`, `types/sounds.ts`,
`types/image-collections.ts` — one line each, next to `featured` / `featuredOrder`.

### 5.2 Add the upload control to a featured row

`components/featured/featured-sortable-row.tsx`. Reuse the existing uploader —
`MediaCoverUpload` from `components/shared/media-cover-upload.tsx` — which already
handles drag-and-drop, the file dialog, a paste-a-URL input, the preview, and the
call to `POST /api/v1/media/upload`. Its default aspect is `21/9`; pass `16/9`
because that is the hero's shape:

```tsx
<MediaCoverUpload
  label={NS.field.featureImage}
  aspectClass="aspect-video"
  helperText={NS.field.featureImageHint}
  previewUrl={item.featureImageUrl ?? null}
  urlValue={item.featureImageUrl ?? ""}
  onUrlChange={(url) => {
    void onPatch(item, { featureImageUrl: url.trim() ? url : null })
  }}
/>
```

`onPatch` is the same callback the row already uses for reorder/remove — it goes
through `usePatchFeaturedMutation`, so the token, the optimistic overlay and the
query invalidation all come for free.

Keep it out of the way: the row is compact, so show the uploader in an expandable
area (a "دەستکاری وێنە" toggle on the row) rather than inline for all items at once.

### 5.3 Preview the right picture

Once the field exists, the row thumbnail should show what the website will actually
display. In `featured-sortable-row.tsx` (and `featured-catalog-row.tsx`) change the
source to prefer the feature image:

```tsx
const cover = item.featureImageUrl?.trim() || item.coverUrl?.trim() || null
```

Give the thumbnail the `wide` aspect when a feature image is set, so the editor sees
the hero crop rather than a book shape.

### 5.4 Strings

Labels live in a co-located strings file, not in `messages/`. Add to
`components/featured/featured-strings.ts`:

```ts
field: {
  featureImage: "وێنەی هیرۆ",
  featureImageHint: "٢٥٦٠×١٤٤٠ — بابەتەکە لە ناوەڕاست و سەرەوە دابنێ",
},
toast: {
  imageUpdated: "وێنەی هیرۆ نوێکرایەوە ✓",
  imageRemoved: "وێنەی هیرۆ لابرا",
},
```

### 5.5 Optional — also in the content forms

If an editor should be able to set the picture while writing the article (before it
is ever featured), add the same `MediaCoverUpload` to that entity's form. Per entity
that is five files, following the existing `coverUrl` pattern exactly:

```
types/<entity>.ts                 featureImageUrl?: string | null
lib/validations/<entity>.ts       featureImageUrl: z.string().optional().nullable()
lib/<entity>-form-data.ts         pass it through to the payload
lib/<entity>-media-normalize.ts   read it back off the DTO
components/<entity>/<entity>-form.tsx   a <Controller> + <MediaCoverUpload>
```

Start with the featured screen only. Add this later if editors ask for it.

---

## 6 · Order of work

1. Backend: add the column to the six entities, add the `firstNonBlank(...)` line to
   the six mappers. Deploy — the carousel behaves exactly as before, because every
   `featureImageUrl` is null.
2. Backend: accept `featureImageUrl` on the featured PATCH and return it on the
   entity responses.
3. Dashboard: extend the types, add the uploader to the featured row, prefer it in
   the preview.
4. Editors upload one 2560×1440 picture per featured item. Each one improves the
   hero the moment it is saved.

The website is never touched, and every step is safe to deploy on its own.
