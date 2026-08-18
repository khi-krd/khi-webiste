# Site media — 3 things the editors cannot change today

Three pieces of media are hardcoded inside the website. Changing any of them needs a developer and
a deploy. We want them in the CMS.

| # | What | Type | Backend work | Dashboard work |
| --- | --- | --- | --- | --- |
| 1 | Film section background | Video | New endpoint — a copy of one you already built | New screen — a copy of one you already built |
| 2 | Logo | Image | 1 field | 1 picker |
| 3 | Donate band picture | Image | 1 field | 1 picker |

Items 2 and 3 live on the same new resource, so together they are **one endpoint and one screen**.

---

# 1 · Film section background video

## What it is

The homepage has two large sections: **Sound** and **Film**.

The **Sound** section plays a muted video looping behind the album covers. It already comes from
the CMS, through an endpoint you built:

```
GET /api/v1/sound-tracks/sound-reklam-video     ← exists and works
```

The **Film** section has no background at all. We want the same thing there — a "film reklam".

## Backend

Build the identical endpoint for film:

```
GET /api/v1/videos/film-reklam-video      — public, no auth
```

Response — the same shape as the sound one:

```json
{
  "success": true,
  "message": "Film reklam video fetched successfully",
  "data": {
    "id": 1,
    "videoUrl": "https://s3-khiwebsite.s3.../video/film-bg.mp4",
    "sizeBytes": 7199031,
    "mimeType": "video/mp4",
    "createdAt": "2026-08-18T10:00:00",
    "updatedAt": "2026-08-18T10:00:00"
  }
}
```

The same rules as the sound video:

- **One video, site-wide.** No id in the path, no pagination, no locale.
- **`404` when nothing is uploaded.** That is the normal empty state, not an error — the website
  hides the background and renders the Film section as usual.
- Add the matching admin upload/replace endpoint, however the sound one does it.

If you copy `SoundReklamVideo`, its controller and its admin endpoint, and rename them, you are
finished.

## Dashboard

Copy the screen you already have for the **sound** reklam video. Same upload, same replace, same
remove, same validation.

What to tell the editor:

- MP4. It plays **muted and looping** behind the film cards — no audio will ever be heard.
- Keep it small. The sound video is about 7 MB; treat that as the ceiling.
- Cards and text sit over the middle and bottom, so keep anything important away from there.
- Empty is fine — the section just renders on a plain dark ground.

---

# 2 · Logo

## What it is

The institute logo, in the **header and the footer of every page**. Today it is a file bundled
inside the website (`/logo.png`), so changing it means a code deploy.

## Backend

Add `logoUrl` to `SiteSettings`.

**`SiteSettings` currently has no controller** — it holds only `id` and `maxFeaturedSlides`, and
can only be changed by editing the database row. So this needs two new endpoints:

```
GET  /api/v1/site-settings      — public, no auth
PUT  /api/v1/site-settings      — ADMIN + SUPER_ADMIN
```

```json
{
  "success": true,
  "message": "Site settings fetched",
  "data": {
    "id": 1,
    "logoUrl": "https://s3-khiwebsite.s3.../branding/khi-logo.png",
    "donateImageUrl": "https://s3-khiwebsite.s3.../branding/archive.jpg",
    "maxFeaturedSlides": 7,
    "updatedAt": "2026-08-18T10:04:11"
  }
}
```

`logoUrl` is **nullable**. When it is null the website keeps its bundled logo, so this is safe to
ship before anyone uploads anything.

## Dashboard

A new screen — suggested: **Settings → Branding**. It holds this picker and the next one.

| | |
| --- | --- |
| Field | `logoUrl` |
| Rendered at | 64 × 64 px (52 × 52 on phones) |
| Upload | **512 × 512 PNG with a transparent background** |

The one thing the helper text must say: **the logo appears on a cream background in the header and
on a near-black background in the footer.** A logo with a white box baked into it looks correct at
the top of the page and wrong at the bottom. Transparent PNG — not JPG.

---

# 3 · Donate band picture

## What it is

The green **donate band above the footer**, on every page — the one reading
"نەتەوەیەک ئەرشیفی خۆی دەپارێزێت" with the "ئێستا ببەخشە" button.

Its photograph is currently a **stock picture of a notebook and a map, loaded from Unsplash**. It
is the most-seen placeholder on the site.

## Backend

Add `donateImageUrl` to the same `SiteSettings` resource as the logo — no separate endpoint.

Also **nullable**: when it is null the band renders on a plain dark ground.

## Dashboard

The second picker on the Branding screen.

| | |
| --- | --- |
| Field | `donateImageUrl` |
| Upload | **2000 × 1500 JPG** (minimum 1600 × 1200) |

Two things for the helper text:

1. **One upload, two treatments.** The same picture is shown sharp inside the slanted panel and
   again, blurred, behind it. The editor uploads one file.
2. **The panel is a slanted crop.** Keep the subject centred — the left and right edges are cut at
   some screen widths.

This is the best place on the site for a real archive photograph.

---

# 4 · Rules for all three

1. **Absolute `https://` URLs.** The site upgrades insecure requests, so `http://` is blocked, and
   a relative path will not resolve — the website and the API are on different hosts.
2. **Upload to the existing S3 bucket** (`s3-khiwebsite.s3.us-east-1.amazonaws.com`). A different
   host needs a website deploy before anything appears.
3. **Empty is a normal state, not an error.** All three have a working fallback. Images return
   `null`; the film video returns `404`, matching the sound video.
4. **Writing:** field omitted → leave the stored value alone; `""` → clear it; a URL → trim and
   store. Same as your existing `featureImageUrl` fields.
5. **Nothing is required.** No picker should block saving.

---

# 5 · Verify

```bash
BASE=https://blissful-spontaneity-production.up.railway.app
TOKEN=<admin jwt>

# 1 · film video — 404 before anything is uploaded, which is correct
curl -s "$BASE/api/v1/videos/film-reklam-video" | jq '.data.videoUrl'

# 2+3 · site settings, public, no auth
curl -s "$BASE/api/v1/site-settings" | jq '.data'

# write the logo
curl -X PUT "$BASE/api/v1/site-settings" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"logoUrl":"https://s3-khiwebsite.s3.us-east-1.amazonaws.com/branding/khi-logo.png"}'

# clearing works
curl -X PUT "$BASE/api/v1/site-settings" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"logoUrl":""}'
curl -s "$BASE/api/v1/site-settings" | jq '.data.logoUrl'    # expect null
```

---

# 6 · Checklist

**Backend**
- [ ] `GET /api/v1/videos/film-reklam-video`, copied from the sound one
- [ ] Its admin upload / replace endpoint
- [ ] `logoUrl` on `SiteSettings`
- [ ] `donateImageUrl` on `SiteSettings`
- [ ] `GET` + `PUT /api/v1/site-settings` (the entity has no controller today)
- [ ] All three nullable; the film video `404`s when empty

**Dashboard**
- [ ] Film reklam video screen, copied from the sound reklam video screen
- [ ] New Settings → Branding screen
- [ ] Logo picker — 512 × 512 transparent PNG, "shows on light and dark backgrounds"
- [ ] Donate band picker — 2000 × 1500 JPG, "used sharp and blurred", "keep the subject centred"
- [ ] `maxFeaturedSlides` editable on the same screen — it has never had a UI
- [ ] All three optional; saving empty must work
