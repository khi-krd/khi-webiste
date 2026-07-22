# Donate — Backend API

Spec for **khi-backend** / CMS so **`/[locale]/donate`** works in **khi-website**.

**Out of scope:** payment gateway integration, online checkout, webhooks, transaction verification, or any automated money movement. Financial donations are **intent registrations** only — the user chooses an amount and method, then manually transfers funds using displayed account details.

---

## Overview

The Donate page is a single scroll page with five sections:

| # | Section | Purpose |
|---|---------|---------|
| 1 | **Hero** | Full-bleed background image + CTAs to forms |
| 2 | **Types grid** | “What can I donate?” cards (archive + financial categories) |
| 3 | **Participation** | Two path cards linking to forms + explanatory copy |
| 4 | **Forms** | Archive submission form + financial intent form |
| 5 | **Closing** | Supporters block + copy-to-clipboard bank/FastPay numbers |

**Locales**

| URL | Notes |
|-----|-------|
| `/ckb/donate` | Sorani (Central Kurdish) |
| `/ku/donate` | Kurmanji |

Most page copy is **i18n** today (`messages/ckb.json`, `messages/ku.json` under the `Donate` namespace). The backend currently drives **settings**, **type visibility toggles**, and **form submissions**.

> **Request from khi-website (2026-07-22):** Please add **CMS-managed page copy** to the Donate API so editors can change headings, intros, and type-card text without a frontend deploy. See **[§ Request: CMS page copy](#request-cms-page-copy)** below for the exact fields and seed content.

---

## What the frontend expects from the backend

| Data | Source today | Backend endpoint |
|------|--------------|------------------|
| Hero background image | API → mock fallback | `GET /api/v1/donations/settings` → `heroImageUrl` |
| FIB account number (display) | API → mock fallback | `settings.accountNumber` |
| FastPay number (display) | API → mock fallback | `settings.iban` *(mapped to FastPay in frontend)* |
| Show/hide archive types | API | `settings.archiveDonationsEnabled` + types |
| Show/hide financial type | API | `settings.financialDonationsEnabled` + types |
| Archive form submission | API (partial) | `POST /api/v1/donations/archive` |
| Financial intent submission | API (partial) | `POST /api/v1/donations/financial` |
| Type card images | **Static mock** | Not from API yet |
| Supporters section image | **Static mock** | Not from API yet |
| Amount presets (25k/50k/100k) | **Static mock** | Not from API yet |
| All headings, labels, descriptions | **i18n** | **Requested** — see [§ Request: CMS page copy](#request-cms-page-copy) |

**Dev fallback:** if the API is empty/unavailable, the site shows mock data from `src/lib/mock/donate.ts`. If CMS copy fields are null/blank, the site continues to fall back to i18n.

---

## Request: CMS page copy

**Status:** Requested by **khi-website** — not implemented on backend or consumed by the site yet.

**Why:** Today strings like **«هاوکاری و بەخشین»**, **«دەتوانم چی ببەخشم؟»**, and the five type-card titles (**«ئەرشیفی بینراو»**, **«بەڵگەنامەکان»**, …) live only in `messages/ckb.json` / `messages/ku.json`. The API exposes `titleCkb` / `descriptionCkb` on settings and coarse type toggles, but the site does **not** read them yet because they do not cover the full page.

**Ask:** Extend the Donate API so the CMS can manage the copy below. The frontend will consume API values when present and keep i18n as fallback.

### Recommended approach

**Phase 1 (minimum — covers the content named above)**

1. Extend `GET/PUT /api/v1/donations/settings` with page-level copy fields (hero + types section intro).
2. Add `GET /api/v1/donations/type-cards` (or embed `typeCards[]` in settings) for the **five fixed cards**.

**Phase 2 (optional later):** participation, forms labels, closing section — same pattern or a `contents[]` block like Services.

Prefer **`titleCkb` / `titleKmr` + `descriptionCkb` / `descriptionKmr`** pairs for consistency with existing settings fields, unless you adopt a shared `contents[]` model across KHI.

### A. Settings — page + hero + types section intro

Add to `donation_settings` / `GET /api/v1/donations/settings`:

| Field | Used on site for | CKB seed (from i18n today) |
|-------|------------------|----------------------------|
| `pageTitleCkb` / `pageTitleKmr` | `<title>`, hidden H1 | `هاوکاری و بەخشین` |
| `metaDescriptionCkb` / `metaDescriptionKmr` | SEO meta | *(see `messages/ckb.json` → `Donate.metaDescription`)* |
| `heroEyebrowCkb` / `heroEyebrowKmr` | Hero label | `هاوکاری و بەخشین` |
| `titleCkb` / `titleKmr` | Hero H2 *(already in schema — please populate)* | `هاوکاری و بەخشین` |
| `descriptionCkb` / `descriptionKmr` | Hero intro *(already in schema)* | `ئینستیتیوتی کەلەپووری کورد، وەک ئەرکێکی نەتەوەیی…` |
| `heroCtaArchiveCkb` / `heroCtaArchiveKmr` | Hero button → `#archive-form` | `سپاردنی ئەرشیڤ` |
| `heroCtaFinancialCkb` / `heroCtaFinancialKmr` | Hero button → `#financial-form` | `پشتیوانیی دارایی` |
| `typesHeadingCkb` / `typesHeadingKmr` | Types grid H2 | `دەتوانم چی ببەخشم؟` |
| `typesDescriptionCkb` / `typesDescriptionKmr` | Types grid intro | `هەر جۆرێک لە میرات — لە وێنە و دەستنووسەوە تا پشتیوانیی دارایی — بەهاکانی هەیە بۆ پاراستنی شوناسی نەتەوەیی.` |

**Frontend rule:** for each field, use API value when non-blank for the active locale; otherwise `messages/{locale}.json` under `Donate.*`.

### B. Type cards — five fixed items

The site has **five hardcoded card IDs** (order + featured layout). Please return one row per ID:

| `code` (stable id) | `sortOrder` | Featured? | Group | CKB title (seed) | CKB description (seed) |
|--------------------|-------------|-----------|-------|------------------|------------------------|
| `visualArchive` | 1 | Yes (large card) | ARCHIVE | `ئەرشیفی بینراو` | `وێنەی کۆنی کەسایەتییەکان، جلوبەرگ و شوێنەوارەکان.` |
| `documents` | 2 | No | ARCHIVE | `بەڵگەنامەکان` | `کتێبی دەگمەن، نامە، نەخشە، قەباڵە و دەستنووس.` |
| `oralHeritage` | 3 | No | ARCHIVE | `کەلەپووری زارەکی` | `کاسێت، قەوان، یان هەر فایلێکی دەنگی و ڤیدیۆیی کۆن.` |
| `financial` | 4 | No | FINANCIAL | `پشتیوانیی دارایی` | `بۆ دابینکردنی تێچووی پڕۆژە گرنگەکان و بەردەوامیی ئنستیتیوت.` |
| `scientific` | 5 | No | ARCHIVE | `هاوکاریی زانستی` | `یارمەتیدان لە ناسینەوەی وێنە و کەرەستە کۆنەکان.` |

**Suggested endpoint:** `GET /api/v1/donations/type-cards`  
**Admin:** `PUT /api/v1/donations/type-cards/{code}` or bulk replace on settings update.

**Per-card fields:**

| Field | Type | Notes |
|-------|------|-------|
| `code` | enum | `visualArchive` \| `documents` \| `oralHeritage` \| `financial` \| `scientific` |
| `sortOrder` | number | Display order; `1` = featured large card |
| `titleCkb` / `titleKmr` | string | Card title |
| `descriptionCkb` / `descriptionKmr` | string | Card body |
| `imageUrl` | string | Optional — replaces static mock image |
| `enabled` | boolean | Optional override; default follows `ARCHIVE` / `FINANCIAL` group toggles |

**Example response:**

```json
{
  "success": true,
  "message": "Donation type cards fetched",
  "data": [
    {
      "code": "visualArchive",
      "sortOrder": 1,
      "titleCkb": "ئەرشیفی بینراو",
      "titleKmr": "Arşîva dîtbarî",
      "descriptionCkb": "وێنەی کۆنی کەسایەتییەکان، جلوبەرگ و شوێنەوارەکان.",
      "descriptionKmr": "…",
      "imageUrl": "https://cdn.example.com/donations/visual-archive.jpg",
      "enabled": true
    }
  ]
}
```

Kurmanji seed strings: copy from `messages/ku.json` → `Donate.types.items.*` when seeding the database.

### C. What stays i18n for now (Phase 2)

Unless you want one large CMS blob, these can remain frontend i18n until needed:

- Participation section (`چۆن بەشداری بکەم؟`, path cards, body)
- Form field labels / validation messages
- Closing supporters block copy (FIB/FastPay **numbers** already come from settings)
- Amount presets (25k / 50k / 100k)

### D. Acceptance criteria (backend)

- [ ] Settings GET returns populated hero + types-section copy fields (CKB + KMR).
- [ ] Type-cards GET returns all **five** codes with titles + descriptions.
- [ ] Admin PUT can update copy without code deploy.
- [ ] Blank/null fields are allowed (frontend falls back to i18n).
- [ ] Existing `FINANCIAL` / `ARCHIVE` type toggles still control group visibility.

### E. Frontend follow-up (khi-website — after backend ships)

- [ ] Read new settings fields in `getDonatePageDataFromApi()`.
- [ ] Read type-cards endpoint; fall back to i18n + mock images when absent.
- [ ] Keep `messages/*.json` as fallback for all CMS fields.

**Reference files for full seed copy:** `messages/ckb.json` and `messages/ku.json` → `Donate` namespace.

---

## Endpoints

### Public (site)

| Method | Path | Use |
|--------|------|-----|
| `GET` | `/api/v1/donations/settings` | Page config + hero + bank display numbers |
| `GET` | `/api/v1/donations/types` | Enable/disable donation categories |
| `GET` | `/api/v1/donations/type-cards` | **Requested** — per-card titles, descriptions, images |
| `POST` | `/api/v1/donations/archive` | Archive donation offer submission |
| `POST` | `/api/v1/donations/financial` | Financial donation **intent** submission |

### Admin (CMS)

| Method | Path | Use |
|--------|------|-----|
| `PUT` | `/api/v1/donations/settings` | Update page settings |
| `GET` | `/api/v1/donations/archive` | List archive submissions (`page`, `size`) |
| `PATCH` | `/api/v1/donations/archive/{id}/status` | Review workflow |
| `GET` | `/api/v1/donations/financial` | List financial intents (`page`, `size`) |
| `PATCH` | `/api/v1/donations/financial/{id}/status` | Review workflow |

**Response envelope** (consistent with other KHI APIs):

```json
{
  "success": true,
  "message": "…",
  "data": { /* payload */ }
}
```

The frontend unwraps `data` automatically when `success === true`.

---

## 1. Donation settings

Singleton record (one row). Controls hero media, bank display info, and form availability.

### `GET /api/v1/donations/settings`

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | number | — | Present on read |
| `titleCkb` | string | Optional | Not used by frontend yet; reserved for CMS-driven hero title |
| `titleKmr` | string | Optional | Same |
| `descriptionCkb` | string | Optional | Reserved for CMS-driven hero intro |
| `descriptionKmr` | string | Optional | Same |
| `heroImageUrl` | string | Recommended | Full URL for hero background |
| `bankName` | string | Optional | Not displayed yet; useful for CMS/admin |
| `accountName` | string | Optional | Not displayed yet |
| `accountNumber` | string | Recommended | Shown as **FIB account** on closing section |
| `iban` | string | Recommended | Shown as **FastPay number** on closing section *(frontend maps `iban` → `fastpayNumber`)* |
| `swiftCode` | string | Optional | Not displayed yet |
| `paymentInstructionsCkb` | string | Optional | Not displayed yet |
| `paymentInstructionsKmr` | string | Optional | Not displayed yet |
| `financialDonationsEnabled` | boolean | Recommended | Default `true`. `false` hides the financial type card + form path |
| `archiveDonationsEnabled` | boolean | Recommended | Default `true`. `false` hides archive-related type cards |

### Example response

```json
{
  "success": true,
  "message": "Donation settings fetched",
  "data": {
    "id": 1,
    "titleCkb": "بەخشین",
    "titleKmr": "Bexşîn",
    "descriptionCkb": "…",
    "descriptionKmr": "…",
    "heroImageUrl": "https://cdn.example.com/donations/hero.jpg",
    "bankName": "First Iraqi Bank",
    "accountName": "Kurdish Heritage Institute",
    "accountNumber": "2345 8901 4567 1201",
    "iban": "0770 123 4567",
    "swiftCode": null,
    "paymentInstructionsCkb": null,
    "paymentInstructionsKmr": null,
    "financialDonationsEnabled": true,
    "archiveDonationsEnabled": true
  }
}
```

### `PUT /api/v1/donations/settings`

Same body shape as above (without `id` on create). Admin-only.

---

## 2. Donation types

Coarse category toggles. The frontend has **5 fixed type cards** (hardcoded IDs + i18n copy); the API only controls whether archive-related cards and the financial card appear.

### `GET /api/v1/donations/types`

Returns an array (not paginated):

```json
{
  "success": true,
  "message": "Donation types fetched",
  "data": [
    {
      "code": "FINANCIAL",
      "titleCkb": "پشتیوانیی دارایی",
      "titleKmr": "Piştgiriya darayî",
      "enabled": true
    },
    {
      "code": "ARCHIVE",
      "titleCkb": "بەخشینی ئەرشیفی",
      "titleKmr": "Bexşa arşîvê",
      "enabled": true
    }
  ]
}
```

### Type codes

| `code` | Frontend cards affected |
|--------|-------------------------|
| `ARCHIVE` | `visualArchive`, `documents`, `oralHeritage`, `scientific` |
| `FINANCIAL` | `financial` |

### Visibility logic (as implemented in frontend)

- If `archiveDonationsEnabled === false` → all archive cards hidden.
- If `financialDonationsEnabled === false` → financial card hidden.
- If types array is empty → all cards shown (fallback).
- If types exist → card group shown only when matching `code` has `enabled: true`.

### Per-card metadata (not from API today)

These are fixed in the frontend; backend does not need to return them unless you extend the API later:

| Frontend `id` | Index | Archive group? |
|---------------|-------|----------------|
| `visualArchive` | 1 (featured) | Yes |
| `documents` | 2 | Yes |
| `oralHeritage` | 3 | Yes |
| `financial` | 4 | No (financial) |
| `scientific` | 5 | Yes |

Titles/descriptions come from i18n keys: `Donate.types.items.{id}.title` / `.description` **today**. **Requested:** move to `GET /api/v1/donations/type-cards` — see [§ Request: CMS page copy](#request-cms-page-copy).

---

## 3. Archive donation submission

Users offer physical or digital archive materials (photos, manuscripts, cassettes, etc.). This is an **offer/intake form**, not an instant upload to the public archive.

### `POST /api/v1/donations/archive`

**Content-Type:** `application/json` *(current frontend implementation)*

### Request body

| Field | Type | Required | Frontend source | Notes |
|-------|------|----------|-----------------|-------|
| `donorName` | string | ✅ | Form: “User name” | Trimmed |
| `email` | string | — | Hardcoded `""` today | Accept empty; optional for future |
| `phone` | string | ✅ | Form: “Contact number” | Trimmed |
| `materialType` | enum | ✅ | Form dropdown | See mapping below |
| `title` | string | Optional | Form: “Register name” | Optional display/credit name |
| `description` | string | Optional | Form: “Note / brief history” | Free text |
| `estimatedDate` | string | Optional | Not collected yet | e.g. `"1950"` — reserve for future |
| `attachmentUrl` | string | Optional | **Not sent yet** | See file upload gap below |

### Material type enum + frontend mapping

| Frontend value | API value |
|----------------|-----------|
| `cassetteAudio` | `AUDIO` |
| `photograph` | `PHOTOGRAPH` |
| `manuscript` | `MANUSCRIPT` |
| `document` | `DOCUMENT` |
| `video` | `VIDEO` |
| `other` | `OTHER` |

Allowed values: `PHOTOGRAPH` | `MANUSCRIPT` | `DOCUMENT` | `AUDIO` | `VIDEO` | `OTHER`

### Example request

```json
{
  "donorName": "Ahmed Hassan",
  "email": "",
  "phone": "07701234567",
  "materialType": "PHOTOGRAPH",
  "title": "Historic Erbil family photo",
  "description": "Black-and-white photograph from the 1960s."
}
```

### Response

```json
{
  "success": true,
  "message": "Archive donation offer received",
  "data": {
    "id": 201,
    "donorName": "Ahmed Hassan",
    "email": "",
    "phone": "07701234567",
    "materialType": "PHOTOGRAPH",
    "title": "Historic Erbil family photo",
    "description": "Black-and-white photograph from the 1960s.",
    "estimatedDate": null,
    "attachmentUrl": null,
    "status": "PENDING",
    "createdAt": "2026-07-22T10:00:00"
  }
}
```

### Status workflow (admin)

| Status | Meaning |
|--------|---------|
| `PENDING` | New submission |
| `APPROVED` | Accepted / follow-up scheduled |
| `REJECTED` | Declined or duplicate |

`PATCH /api/v1/donations/archive/{id}/status`

```json
{ "status": "APPROVED" }
```

### Admin list

`GET /api/v1/donations/archive?page=0&size=20`

Paginated Spring-style response inside `data`:

```json
{
  "content": [ /* ArchiveDonationResponse[] */ ],
  "totalElements": 42,
  "totalPages": 3,
  "number": 0,
  "size": 20
}
```

---

## 4. File upload gap (archive form)

The archive form UI includes an optional file field, but **the frontend does not upload files yet**. Validation on the client:

| Rule | Value |
|------|-------|
| Max size | 10 MB |
| Accepted MIME types | `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `audio/mpeg`, `audio/wav`, `audio/ogg`, `video/mp4`, `video/webm`, `application/pdf` |

**Recommended backend options** (pick one):

**Option A — Multipart on same endpoint**

```
POST /api/v1/donations/archive
Content-Type: multipart/form-data
```

Fields: same as JSON + `file` (optional). Backend stores file, sets `attachmentUrl` on the record.

**Option B — Two-step upload**

```
POST /api/v1/uploads/donations   → { "url": "https://…" }
POST /api/v1/donations/archive     → { …, "attachmentUrl": "https://…" }
```

Until upload is wired, accept submissions without `attachmentUrl`.

---

## 5. Financial donation intent

Records that a user **intends** to donate a specific amount via a manual transfer method. No payment processing.

### `POST /api/v1/donations/financial`

### Request body

| Field | Type | Required | Frontend source | Notes |
|-------|------|----------|-----------------|-------|
| `donorName` | string | ✅ | Form | Trimmed |
| `email` | string | — | Hardcoded `""` | Optional |
| `phone` | string | Optional | Not collected | Reserve |
| `amount` | number | ✅ | Form | Must be `> 0` |
| `currency` | string | ✅ | Form | Uppercased: `IQD` or `USD` |
| `paymentMethod` | string | ✅ | Form selection | See mapping |
| `transactionReference` | string | Optional | Not collected | User could add later |
| `message` | string | Optional | Not collected | Reserve |

### Payment method mapping (frontend → API)

Both UI options map to the same backend value today:

| Frontend `id` | API `paymentMethod` |
|---------------|---------------------|
| `fib` | `BANK_TRANSFER` |
| `fastpay` | `BANK_TRANSFER` |

Consider storing the **UI choice** (`FIB` / `FASTPAY`) as a separate field if you need to distinguish them in admin.

### Amount presets (static today)

Frontend shows three preset buttons (IQD only in UI):

| Preset id | Value |
|-----------|-------|
| `large` | 100,000 |
| `medium` | 50,000 |
| `small` | 25,000 |

These are **not from the API**. User can also enter any custom amount.

### Example request

```json
{
  "donorName": "Sara Mohammed",
  "email": "",
  "amount": 50000,
  "currency": "IQD",
  "paymentMethod": "BANK_TRANSFER"
}
```

### Response

```json
{
  "success": true,
  "message": "Financial donation received",
  "data": {
    "id": 200,
    "donorName": "Sara Mohammed",
    "email": "",
    "phone": null,
    "amount": 50000,
    "currency": "IQD",
    "paymentMethod": "BANK_TRANSFER",
    "transactionReference": null,
    "message": null,
    "status": "PENDING",
    "createdAt": "2026-07-22T10:00:00"
  }
}
```

After success, the UI shows a confirmation message and the closing section already displays FIB/FastPay numbers from settings for manual transfer.

### Admin

Same status enum as archive: `PENDING` | `APPROVED` | `REJECTED`.

- `GET /api/v1/donations/financial?page=0&size=20`
- `PATCH /api/v1/donations/financial/{id}/status`

---

## 6. How the site uses the API

1. `GET /api/v1/donations/settings` → hero image, bank numbers, enable flags
2. `GET /api/v1/donations/types` → filter type cards
3. Render page with i18n copy + API media/settings
4. User submits archive form → `POST /api/v1/donations/archive`
5. User submits financial form → `POST /api/v1/donations/financial`
6. Closing section shows `accountNumber` + `iban` from settings (copy-to-clipboard)

**Anchor targets**

| Element | ID |
|---------|-----|
| Archive form | `#archive-form` |
| Financial form | `#financial-form` |

Hero CTAs and participation cards link to these anchors.

---

## 7. Validation (backend)

### Settings

- `heroImageUrl`, `accountNumber`, `iban`: valid URLs/strings when provided.
- Booleans default to `true` if omitted on first seed.

### Archive submission

- `donorName`: non-empty, max ~200 chars.
- `phone`: non-empty (frontend requires it).
- `materialType`: must be valid enum.
- `attachmentUrl`: valid URL if present.
- Rate limiting / spam protection recommended (public endpoint).

### Financial intent

- `donorName`: non-empty.
- `amount`: finite number `> 0`.
- `currency`: `IQD` or `USD` (uppercase).
- `paymentMethod`: accept `BANK_TRANSFER` at minimum.
- Do **not** attempt card capture or gateway redirects.

### Types

- Exactly two codes expected: `FINANCIAL`, `ARCHIVE`.
- `enabled` boolean required per row.

---

## 8. Database model (suggested)

### `donation_settings` (singleton)

One row. Columns match settings fields above.

### `donation_types`

| Column | Type |
|--------|------|
| `code` | enum: `FINANCIAL`, `ARCHIVE` |
| `title_ckb` | text |
| `title_kmr` | text |
| `enabled` | boolean |

### `archive_donations`

| Column | Type |
|--------|------|
| `id` | bigint PK |
| `donor_name` | varchar |
| `email` | varchar nullable |
| `phone` | varchar |
| `material_type` | enum |
| `title` | varchar nullable |
| `description` | text nullable |
| `estimated_date` | varchar nullable |
| `attachment_url` | varchar nullable |
| `status` | enum: PENDING/APPROVED/REJECTED |
| `created_at` | timestamp |
| `updated_at` | timestamp |

### `financial_donations`

| Column | Type |
|--------|------|
| `id` | bigint PK |
| `donor_name` | varchar |
| `email` | varchar nullable |
| `phone` | varchar nullable |
| `amount` | decimal |
| `currency` | varchar(3) |
| `payment_method` | varchar |
| `transaction_reference` | varchar nullable |
| `message` | text nullable |
| `status` | enum |
| `created_at` | timestamp |
| `updated_at` | timestamp |

---

## 9. CMS checklist

- [ ] Settings editor (hero image upload, FIB account, FastPay number, enable toggles)
- [ ] Donation types toggles (`FINANCIAL` / `ARCHIVE`)
- [ ] Archive submissions inbox (list, detail, status change, export)
- [ ] Financial intents inbox (list, detail, status change, filter by currency/status)
- [ ] File upload for archive attachments (when frontend is wired)
- [ ] Optional: notification email on new submission
- [ ] **CMS page copy** — hero + types heading + five type-card titles/descriptions (see [§ Request: CMS page copy](#request-cms-page-copy))
- [ ] Optional: participation / forms / closing copy (Phase 2)

---

## 10. Future backend extensions (not required for v1)

| Feature | Why |
|---------|-----|
| Per-type card **copy** (title + description) | **Requested** — `GET /api/v1/donations/type-cards` |
| Per-type card images + order | Same endpoint (`imageUrl`, `sortOrder`) |
| `supportersImageUrl` in settings | Closing section image |
| `amountPresets[]` in settings | CMS-managed suggested amounts |
| Separate `fastpayNumber` field | Stop overloading `iban` |
| `preferredPaymentChannel` on financial records | Distinguish FIB vs FastPay |
| Localized settings via `contents[]` | Match Services page pattern instead of `titleCkb`/`titleKmr` |

---

## 11. Known gaps to coordinate

1. **File upload** — UI exists; backend should accept files; frontend still needs wiring.
2. **`email` always empty** — both forms omit it; backend should not require it.
3. **`iban` used for FastPay** — naming mismatch; consider a dedicated field.
4. **Payment method granularity** — both map to `BANK_TRANSFER`; admin cannot see FIB vs FastPay choice.
5. **Settings localized titles** — schema exists but page still uses i18n; **formal request filed** in [§ Request: CMS page copy](#request-cms-page-copy).
6. **Type card content/images** — copy requested via type-cards endpoint; images still static until API ships.

---

## Code references (khi-website)

| What | Path |
|------|------|
| Zod schemas | `src/types/donation.ts` |
| API fetch + submit | `src/lib/api/donations.ts` |
| Server actions | `src/lib/actions/donations.ts` |
| Mock fallbacks | `src/lib/mock/donate.ts` |
| Archive form schema | `src/lib/schemas/donate-archive-form.ts` |
| Financial form schema | `src/lib/schemas/donate-financial-form.ts` |
| Page | `src/app/[locale]/donate/page.tsx` |
| Components | `src/components/donate/*` |
