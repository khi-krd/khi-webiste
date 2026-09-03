# Contact office photo — how to add it

Each office on the contact page (`/ckb/contact`, `/kmr/contact`) shows a photo
under the office name. This is the guide for putting a real photo there.

Last updated: 2026-09-03. Verified against the live API.

---

## The short version

**No backend work is needed.** The field already exists, the API already returns
it, and the website already reads it. It is simply **empty** for both offices
right now, so the site is showing a bundled placeholder photo instead.

Filling it in is two API calls:

| Step | Call | What it does |
| --- | --- | --- |
| 1 | `POST /api/v1/media/upload` | Uploads the photo file, gives you back an S3 URL |
| 2 | `PUT /api/v1/contact/{id}` | Saves that URL on the office, in `heroImageUrl` |

That is it. The website picks the new photo up on the next page load — no code
change, no redeploy.

---

## 1 · The field

The office photo lives in one field on the contact page record:

```
heroImageUrl        →  contact_pages.hero_image_url
```

It is a plain **string** holding an absolute URL. It is *not* a file upload on
the contact endpoint itself — you upload the file separately and store the
resulting URL here.

It is already part of the public response. Check it yourself:

```bash
curl -s https://blissful-spontaneity-production.up.railway.app/api/v1/contact/active \
  | grep heroImageUrl
```

Today that prints nothing, because the field is null for both offices and the
API omits null fields from the JSON entirely.

---

## 2 · Upload the photo

```
POST /api/v1/media/upload
Content-Type: multipart/form-data
Auth: admin token
```

Form fields:

| Field | Required | Notes |
| --- | --- | --- |
| `file` | yes | The image file |
| `type` | no | Media category, e.g. `image` |

Response:

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "fileUrl": "https://s3-khiwebsite.s3.us-east-1.amazonaws.com/khi-web-folders/images/office-slemani.jpg",
    "fileName": "office-slemani.jpg",
    "fileSize": 284117,
    "contentType": "image/jpeg"
  }
}
```

**Keep `data.fileUrl`.** That is what goes in `heroImageUrl`.

---

## 3 · Save it on the office

```
PUT /api/v1/contact/{id}
Content-Type: application/json
Auth: admin token
```

The two offices are **id 5** (Sulaymaniyah, HQ) and **id 6** (Duhok) *at the time
of writing*. Do not hardcode those numbers — the ids changed while this guide was
being written (3/4 → 5/6), so the seed data gets recreated. Read the current ids
from `GET /api/v1/contact/active` each time; match on `slugCkb`
(`peywendi-slemani`, `peywendi-dhok`), which is stable, not on the id.

`PUT` replaces the whole record, so send the office's existing fields back
along with the new `heroImageUrl` — do not send `heroImageUrl` on its own or you
will blank out the address, phone and everything else.

The accepted fields are:

```
slugCkb, slugKmr, ckbContent, kmrContent, phone, secondaryPhone,
email, mapEmbedUrl, latitude, longitude, heroImageUrl, officeType,
badgeCkb, badgeKmr, active, displayOrder
```

The safe recipe: `GET /api/v1/contact/5`, take the `data` object, set
`heroImageUrl`, `PUT` it back.

Verify:

```bash
curl -s .../api/v1/contact/5 | grep heroImageUrl
```

---

## 4 · What the dashboard needs

One image picker on the contact page edit form, labelled "Office photo",
wired to the `heroImageUrl` field — the same picker pattern already used for
other images in the dashboard: pick file → `POST /api/v1/media/upload` → put the
returned `fileUrl` into the form field → save with the rest of the form.

Nice to have, in this order of usefulness:

1. A thumbnail preview of the current photo, so an editor can see what is set.
2. A "remove photo" button that sends `heroImageUrl: null` — the website then
   goes back to the bundled fallback rather than showing a broken image.
3. A note under the field with the recommended size (below).

---

## 5 · What photo to use

The card renders the photo in a **16:10 box**, cropped to fill (`object-cover`),
at up to about half the screen width on desktop and full width on mobile.

| | Recommendation |
| --- | --- |
| Aspect ratio | 16:10 — anything else gets cropped top and bottom |
| Size | 1600 × 1000 px |
| Format | JPEG or WebP |
| File size | under 400 KB |
| Subject | Keep the important part centred — the edges are cropped on small screens |

The site applies a slight darkening and desaturation to office photos so they
sit with the page's palette. A photo that already looks flat or dark will end up
looking muddy — pick a bright, well-lit one.

Any HTTPS host works, not only S3 (`next.config.ts` allows all HTTPS image
hosts). HTTP URLs will **not** load — the browser blocks them as mixed content.

---

## 6 · What happens when it is empty

The website does not show a broken image or a grey box. Each office falls back
to a photo bundled with the site:

| Office | Fallback |
| --- | --- |
| Sulaymaniyah | `/about/475203467_1007002848126180_7383496220452921499_n.jpg` |
| Duhok | `/about/services-bg.jpg` |

So the page always looks finished. Setting `heroImageUrl` simply replaces the
fallback for that office.

The relevant code is [`src/lib/contact/resolve.ts`](src/lib/contact/resolve.ts):

```ts
image: {
  url: page.heroImageUrl?.trim() || OFFICE_IMAGES[officeId],
  alt: title,
},
```

Note `|| ` and the `.trim()`: an empty string or a string of spaces in the CMS
counts as "not set" and falls back, rather than rendering a broken image.

---

## 7 · Checklist

- [ ] Photo cropped to 16:10, under 400 KB
- [ ] `POST /api/v1/media/upload` → copy `data.fileUrl`
- [ ] `GET /api/v1/contact/{id}` → copy the `data` object
- [ ] Set `heroImageUrl` on it → `PUT /api/v1/contact/{id}`
- [ ] `GET /api/v1/contact/active` shows `heroImageUrl` for that office
- [ ] Reload `/ckb/contact` — the new photo is on the card
