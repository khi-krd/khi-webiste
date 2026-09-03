# Donation type cards ("دەتوانم چی ببەخشم؟") — backend guide

The donate page has a section called **"دەتوانم چی ببەخشم؟" / "What can I donate?"** —
a mosaic of picture cards: one big featured card with a title and a description,
and a rail of smaller cards with a title each. Today those cards are **hardcoded
in the website** (texts in `messages/*.json`, pictures in `public/menu/`). An
editor cannot add, remove, reword or re-order them.

Goal: the cards become rows in the database. The dashboard does full CRUD on
them — **any number of cards** — and the website draws whatever the API returns.

Written: 2026-09-03.

---

## 1. How the section draws (what the data must support)

- Cards are shown **sorted by `displayOrder` ascending**.
- **The first card is the big featured one.** It shows its number chip ("01"),
  its title large, and its **description**.
- Every other card is a small tile: number chip + title. Their descriptions are
  stored but not drawn today (keep them — the design may use them later, e.g.
  on hover).
- The number chips ("01", "02", "03"…) are **not stored** — the website derives
  them from the position in the sorted list. Editors only manage the order.
- If the API returns **no active cards**, the website hides the whole section.
  That is a normal state, not an error.

So each card needs: two titles (Sorani / Kurmanji), two descriptions, one
picture, an order number, and an on/off switch. Nothing else.

## 2. Where everything lives

Mirror the social-links structure — it is the same shape of resource:

| Thing | File |
| --- | --- |
| Table / entity | `khi_app/model/donation/DonationTypeCard.java` (new) |
| Database queries | `khi_app/repository/donation/DonationTypeCardRepository.java` (new) |
| Logic | the existing donation service (or a small `DonationTypeCardService`) |
| Endpoints | the existing public donation controller, next to `/donations/types` |
| Request / response shapes | the donation DTOs file |
| Who is allowed | `user/configs/SecurityConfig.java` — same rules as social links |

If you copy `SocialLink` + its repository + its controller methods and rename
them, you are 90% finished — the only additions are the two description columns
and the image URL.

## 3. The table: `donation_type_cards`

| Column | Type | Meaning |
| --- | --- | --- |
| `id` | number | Auto-generated. |
| `title_ckb` | text (max 200) | Title in Sorani. |
| `title_kmr` | text (max 200) | Title in Kurmanji. |
| `description_ckb` | text (max 1000) | Description in Sorani. Drawn only on the featured (first) card today. |
| `description_kmr` | text (max 1000) | Description in Kurmanji. |
| `image_url` | text (max 2000), **required** | The card's background picture — an S3 URL from the normal image-upload flow. |
| `display_order` | number | Small number first (0, 1, 2…). Defaults to 0. **Position 1 = the big featured card.** |
| `active` | true/false | `false` = hidden from the website, but still saved. Defaults to `true`. |

Validation rule: **at least one of `title_ckb` / `title_kmr` must be non-blank**
(the website falls back to the other language when one is missing, same as the
donation hero copy). A card with no title in either language is a 400.

Unlike social links there is **no unique column** — editors may create as many
cards as they want.

## 4. The endpoints

Base path: `/api/v1/donations/type-cards`

| Method | Path | Success status | Who can call it |
| --- | --- | --- | --- |
| `GET` | `/api/v1/donations/type-cards` | 200 | **Everyone** — no login |
| `GET` | `/api/v1/donations/type-cards?includeInactive=true` | 200 | Everyone (used by the dashboard) |
| `POST` | `/api/v1/donations/type-cards` | 201 Created | Admin only |
| `PUT` | `/api/v1/donations/type-cards/{id}` | 200 | Admin only |
| `DELETE` | `/api/v1/donations/type-cards/{id}` | 200 | Admin only |

`includeInactive` works exactly like `/api/v1/settings/social` and
`/api/v1/nav-menu`: default `false` (website — active rows only), `true` returns
every row so the dashboard can edit hidden ones.

"Admin only" = a logged-in user with role `ADMIN` or `SUPER_ADMIN`, sending
`Authorization: Bearer <token>`.

### Request body (POST and PUT)

```json
{
  "titleCkb": "ئەرشیفی بینراو",
  "titleKmr": "Arşîva dîtbarî",
  "descriptionCkb": "وێنەی کۆنی کەسایەتییەکان، جلوبەرگ و شوێنەوارەکان.",
  "descriptionKmr": "Wêneyên kevn yên kesayetan, cil û cihên dîrokî.",
  "imageUrl": "https://s3-khiwebsite.s3.../images/donate-visual-archive.jpg",
  "displayOrder": 0,
  "active": true
}
```

- `titleCkb`, `titleKmr` — at least one required, max 200 each. Trimmed; blank
  saved as `null`.
- `descriptionCkb`, `descriptionKmr` — optional, max 1000 each. Blank → `null`.
- `imageUrl` — required, max 2000. The dashboard uploads the picture through the
  existing image-upload flow first and sends the resulting URL here.
- `displayOrder` — optional; `null` becomes 0.
- `active` — optional; `null` becomes `true`.

**`PUT` replaces the whole row.** Always send every field, not only the changed one.

### Response

The standard envelope, rows sorted by `displayOrder` ascending:

```json
{
  "success": true,
  "message": "Donation type cards fetched",
  "data": [
    {
      "id": 1,
      "titleCkb": "ئەرشیفی بینراو",
      "titleKmr": "Arşîva dîtbarî",
      "descriptionCkb": "وێنەی کۆنی کەسایەتییەکان، جلوبەرگ و شوێنەوارەکان.",
      "descriptionKmr": "Wêneyên kevn yên kesayetan, cil û cihên dîrokî.",
      "imageUrl": "https://s3-khiwebsite.s3.../images/donate-visual-archive.jpg",
      "displayOrder": 0,
      "active": true
    }
  ]
}
```

### Errors

| Situation | Status | Body |
| --- | --- | --- |
| Both titles blank, or missing/too-long `imageUrl` | 400 | validation error listing the fields |
| `PUT` / `DELETE` on an unknown id | 404 | `"Donation type card not found: {id}"` |
| No token, or a non-admin token, on write | 401 / 403 | standard error envelope |

## 5. Try it

```bash
API=https://your-backend-url        # your Railway URL

# 1. Read what the website will see (no login needed)
curl "$API/api/v1/donations/type-cards"

# 2. Read what the dashboard sees — hidden rows included
curl "$API/api/v1/donations/type-cards?includeInactive=true"

# 3. Log in and copy the token from the answer
curl -X POST "$API/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"YOUR_ADMIN","password":"YOUR_PASSWORD"}'

TOKEN=paste_the_token_here

# 4. Add a card  → 201 Created
curl -X POST "$API/api/v1/donations/type-cards" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"titleCkb":"ئەرشیفی بینراو","titleKmr":"Arşîva dîtbarî","descriptionCkb":"وێنەی کۆنی کەسایەتییەکان، جلوبەرگ و شوێنەوارەکان.","descriptionKmr":"Wêneyên kevn yên kesayetan, cil û cihên dîrokî.","imageUrl":"https://.../donate-visual-archive.jpg","displayOrder":0,"active":true}'

# 5. Change a card (id = 1) — send every field
curl -X PUT "$API/api/v1/donations/type-cards/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"titleCkb":"ئەرشیفی بینراو","titleKmr":"Arşîva dîtbarî","descriptionCkb":"...","descriptionKmr":"...","imageUrl":"https://.../new-picture.jpg","displayOrder":0,"active":true}'

# 6. Hide a card instead of deleting it
#    (same PUT with "active": false)

# 7. Delete a card
curl -X DELETE "$API/api/v1/donations/type-cards/1" -H "Authorization: Bearer $TOKEN"
```

## 6. Seed data — the five cards the site shows today

These are the exact texts currently hardcoded in the website. Upload five
pictures first (the current ones are in the website repo under `public/menu/`),
then create one row per line, in this order:

| # | titleCkb | titleKmr | descriptionCkb | descriptionKmr |
| --- | --- | --- | --- | --- |
| 0 | ئەرشیفی بینراو | Arşîva dîtbarî | وێنەی کۆنی کەسایەتییەکان، جلوبەرگ و شوێنەوارەکان. | Wêneyên kevn yên kesayetan, cil û cihên dîrokî. |
| 1 | بەڵگەنامەکان | Belge | کتێبی دەگمەن، نامە، نەخشە، قەباڵە و دەستنووس. | Pirtûkên nadiran, name, nexşe, pul û destnivîs. |
| 2 | کەلەپووری زارەکی | Mîrateya zimanî | کاسێت، قەوان، یان هەر فایلێکی دەنگی و ڤیدیۆیی کۆن. | Kaset, qefî, an her pelê dengî û vîdyoyê yê kevn. |
| 3 | پشتیوانیی دارایی | Piştgiriya darayî | بۆ دابینکردنی تێچووی پڕۆژە گرنگەکان و بەردەوامیی ئنستیتیوت. | Ji bo peydakirina mesrefa projeyên girîng û domdariya enstîtuyê. |
| 4 | هاوکاریی زانستی | Hevkariya zanistî | یارمەتیدان لە ناسینەوەی وێنە و کەرەستە کۆنەکان. | Alîkariya nasîna wêne û tiştên kevn. |

`displayOrder` = the `#` column. Row 0 (ئەرشیفی بینراو) is the big featured card.

## 7. Rules to remember

1. **Order decides the layout.** The lowest `displayOrder` becomes the big
   featured card and shows its description. Everything else is a small tile.
2. **`active: false` is the safe way to hide a card** — better than deleting it.
3. **`GET` is public, including `?includeInactive=true`.** An inactive card is
   hidden from the website, not secret. Never put private text in a card, even
   switched off.
4. **No fixed card count.** Zero cards hides the section; one card shows only
   the featured one; more cards just extend the rail.
5. `PUT` replaces the whole row — a client that sends only the changed field
   will blank the others.

## 8. The website's cache

The website caches donation data under the tag `donations`. After a change,
either wait for the cache window to pass, or purge it immediately:

```bash
curl -X POST "https://your-website-url/api/revalidate" \
  -H "x-revalidation-secret: $REVALIDATION_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"tags":["donations"]}'
```

## 9. Website side — done (2026-09-03)

The website already reads this endpoint: `getDonationTypeCards()` in
`src/lib/api/donations.ts`, fetched alongside the donation settings.

- **The moment the first active card is saved, the CMS set replaces the
  hardcoded one entirely** — count, order, texts and pictures all come from
  the table.
- **The hardcoded cards are the fallback for an empty table only** (and for the
  time before this endpoint is deployed — a failed request behaves like an
  empty table). Seed the table (§6) so the CMS is the real source.
- A row missing its picture, or missing a title in **both** languages, is
  skipped by the website rather than drawn broken — matching the 400 rules
  in §4.
