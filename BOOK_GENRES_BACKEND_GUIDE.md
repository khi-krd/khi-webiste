# Book genres — backend guide (from enum to editor-managed rows)

The genre chips on the writings page (شیعر، ڕۆمان، مێژوو، هونەر…) and the genre
list on every book come from a **fixed Java enum** today (`BookGenre`:
`POETRY`, `NOVEL`, `HISTORY`…, 22 values). Nobody can add a genre, rename one,
or retire one without a code change and a redeploy — and the names shown to
readers live in the website's translation files, not in the CMS at all.

Goal: genres become rows in the database. The dashboard does full CRUD on them,
books link to them, and the enum goes away.

Written: 2026-09-03.

---

## 1. The shape of the change

Three pieces, in order of size:

1. **A new `book_genres` table** with CRUD endpoints — a copy of the
   social-links pattern you already built, plus one extra column (`slug`).
2. **Books link to genre rows** instead of carrying enum values — a normal
   many-to-many join table.
3. **A one-time migration** that seeds the 22 existing genres (names included —
   the seed table in §6 has them in both languages) and converts every book's
   enum values into links.

The public book responses keep their current `bookGenres` string array during
the transition (§5), so the website keeps working unchanged on deploy day.

## 2. The table: `book_genres`

| Column | Type | Meaning |
| --- | --- | --- |
| `id` | number | Auto-generated. |
| `slug` | text (max 60), **unique**, required | Stable machine key, UPPERCASE (`POETRY`, `NOVEL`…). Used in website URLs (`/writings?genre=POETRY`) and kept equal to the old enum codes for the seeded rows. **Never changes after creation** — renaming a genre means changing its names, not its slug. |
| `name_ckb` | text (max 200) | Name in Sorani — what the chip shows. |
| `name_kmr` | text (max 200) | Name in Kurmanji. |
| `display_order` | number | Small number first (0, 1, 2…). The chips row follows this order. Defaults to 0. |
| `active` | true/false | `false` = chip hidden on the website; books keep the link. Defaults to `true`. |

Validation: at least one of `name_ckb` / `name_kmr` must be non-blank; `slug`
required, trimmed, upper-cased, letters/digits/underscore only. Blank names are
saved as `null`.

Join table: `book_genre_links (book_id, genre_id)` — plain many-to-many,
`ON DELETE CASCADE` from both sides.

## 3. The endpoints

Base path: `/api/v1/book-genres`

| Method | Path | Success status | Who can call it |
| --- | --- | --- | --- |
| `GET` | `/api/v1/book-genres` | 200 | **Everyone** — no login |
| `GET` | `/api/v1/book-genres?includeInactive=true` | 200 | Everyone (used by the dashboard) |
| `POST` | `/api/v1/book-genres` | 201 Created | Admin only |
| `PUT` | `/api/v1/book-genres/{id}` | 200 | Admin only |
| `DELETE` | `/api/v1/book-genres/{id}` | 200 | Admin only |

`includeInactive` works exactly like `/api/v1/settings/social` and
`/api/v1/nav-menu`: default `false`, rows sorted by `display_order` ascending.

### Request body (POST and PUT)

```json
{
  "slug": "POETRY",
  "nameCkb": "شیعر",
  "nameKmr": "Şîir",
  "displayOrder": 0,
  "active": true
}
```

**`PUT` replaces the whole row.** Always send every field. Reject a `PUT` that
tries to change `slug` on a row that has book links (400) — the slug is the key
the website filters by.

### Response

The standard envelope:

```json
{
  "success": true,
  "message": "Book genres fetched",
  "data": [
    { "id": 1, "slug": "POETRY", "nameCkb": "شیعر", "nameKmr": "Şîir",
      "displayOrder": 0, "active": true, "bookCount": 42 }
  ]
}
```

`bookCount` (how many books link to the row) is optional but cheap — the
dashboard uses it to warn before delete. Include it if it is one join away.

### Errors

| Situation | Status | Body |
| --- | --- | --- |
| Both names blank, or missing/invalid `slug` | 400 | validation error listing the fields |
| Second row with the same `slug` | 409 Conflict | `"A record with this data already exists."` |
| Changing `slug` on a genre that books use | 400 | `"Slug cannot change while books use this genre"` |
| `PUT` / `DELETE` on an unknown id | 404 | `"Book genre not found: {id}"` |
| No token, or a non-admin token, on write | 401 / 403 | standard error envelope |

**`DELETE` detaches the genre from every book** (the join rows cascade) and the
books survive untouched. Hiding a chip without touching the books is
`active: false` — always the recommendation; the dashboard says so too.

## 4. The change to books

Today a book carries `bookGenres` as a list of enum values, and the create/edit
endpoints accept those enum strings.

After this change:

- **Entity**: the `@ElementCollection` of enums (or however `bookGenres` is
  stored today) becomes a `@ManyToMany` to `BookGenre` rows via
  `book_genre_links`.
- **Write side**: book create/update accepts `"genreIds": [1, 5, 12]`. Keep
  accepting the old `"bookGenres": ["POETRY"]` for one release if the dashboard
  needs time — resolve each string against `slug`.
- **Read side — do not break the website** (§5): every book response keeps
  `bookGenres` as a string array, now built from the linked rows' **slugs**,
  and additionally gains the full objects:

```json
{
  "bookGenres": ["POETRY", "HISTORY"],
  "genres": [
    { "id": 1, "slug": "POETRY", "nameCkb": "شیعر", "nameKmr": "Şîir" },
    { "id": 5, "slug": "HISTORY", "nameCkb": "مێژوو", "nameKmr": "Dîrok" }
  ]
}
```

- **Filtering**: wherever books can be filtered by genre today, the parameter
  keeps working with the slug; matching by `genreId` may be added but is not
  required by the website.

## 5. Deploy order — why nothing breaks

The website today **silently drops any `bookGenres` value it does not
recognise** (its normalizer filters against the 22 known codes). So:

1. **Deploy the backend** with seeded rows (slugs = old enum codes). The
   website sees identical `bookGenres` arrays — zero visible change.
2. Editors may rename genres immediately in the dashboard — but the renamed
   words appear **on the website only after step 3**, because the site still
   draws its own translated labels.
3. **The website then switches** to reading `/api/v1/book-genres` for the chips
   row and the card labels, and to the `genres` objects on books. From that
   moment new genres, renames, ordering and `active` all take effect on the
   site. (Website work — tell that side when the endpoint is live.)

A genre created before step 3 is not an error: books carrying it keep
rendering; only its chip and label wait for step 3.

## 6. Migration + seed — the 22 genres and their names

One-time migration, in a transaction:

1. Create `book_genres` and `book_genre_links`.
2. Insert the 22 rows below (`display_order` = the `#` column — this matches
   the order readers see today).
3. For every book and every enum value it holds, insert the matching link row.
4. Keep the old column/collection until the website's switch (§5 step 3) is
   confirmed, then drop it.

| # | slug | nameCkb | nameKmr |
| --- | --- | --- | --- |
| 0 | POETRY | شیعر | Şîir |
| 1 | NOVEL | ڕۆمان | Roman |
| 2 | SHORT_STORY | چیرۆکی کورت | Çîroka kurt |
| 3 | DRAMA | شانۆ | Şano |
| 4 | HISTORY | مێژوو | Dîrok |
| 5 | BIOGRAPHY | ژیاننامە | Jiyanname |
| 6 | PHILOSOPHY | فەلسەفە | Felsefe |
| 7 | RELIGION | ئایین | Ol |
| 8 | FOLKLORE | زارگوتن | Zargotina gelêrî |
| 9 | POLITICS | سیاسەت | Siyaset |
| 10 | SOCIOLOGY | کۆمەڵناسی | Komelezanî |
| 11 | ECONOMICS | ئابووری | Aborî |
| 12 | LAW | یاسا | Qanûn |
| 13 | LINGUISTICS | زمانناسی | Zimanzanî |
| 14 | ARTS | هونەر | Huner |
| 15 | CULTURAL | کولتووری | Kultûrî |
| 16 | SCIENCE | زانست | Zanist |
| 17 | MEDICINE | پزیشکی | Pizîşkî |
| 18 | EDUCATIONAL | پەروەردەیی | Perwerdeyî |
| 19 | CHILDREN | منداڵان | Zarokan |
| 20 | TRAVEL | گەشتوگوزار | Ger û gerr |
| 21 | OTHER | یتر | Yên din |

If the database holds books with legacy alias codes (`POLITICAL`, `RELIGIOUS`,
`ESSAY`, `GEOGRAPHY`, `ACADEMIC`, `REFERENCE`…), map them in the migration:
`POLITICAL → POLITICS`, `RELIGIOUS → RELIGION`, and give any true extras their
own new row — do not drop a book's genre silently.

## 7. Try it

```bash
API=https://your-backend-url        # your Railway URL

# 1. Read the genres (no login needed)
curl "$API/api/v1/book-genres"

# 2. Log in and copy the token
curl -X POST "$API/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"YOUR_ADMIN","password":"YOUR_PASSWORD"}'

TOKEN=paste_the_token_here

# 3. Add a genre  → 201 Created
curl -X POST "$API/api/v1/book-genres" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"slug":"MEMOIR","nameCkb":"یادەوەری","nameKmr":"Bîranîn","displayOrder":22,"active":true}'

# 4. Rename a genre (id = 1) — names change, slug stays
curl -X PUT "$API/api/v1/book-genres/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"slug":"POETRY","nameCkb":"شیعر و هۆنراوە","nameKmr":"Şîir","displayOrder":0,"active":true}'

# 5. Hide a chip without touching books
#    (same PUT with "active": false)

# 6. Delete a genre — detaches it from every book
curl -X DELETE "$API/api/v1/book-genres/22" -H "Authorization: Bearer $TOKEN"

# 7. Attach genres to a book by id (book update)
#    {"genreIds":[1,5,12], ...the rest of the book fields...}
```

## 8. Rules to remember

1. **`slug` is forever.** It is the key in website URLs and in the compatible
   `bookGenres` array. Rename = change `nameCkb`/`nameKmr` only.
2. **Order decides the chips row.** Lowest `display_order` first.
3. **`active: false` hides the chip, keeps the books.** The safe way to retire
   a genre.
4. **`DELETE` detaches from all books** — reserve it for mistakes, not tidying.
5. **`GET` is public, including `?includeInactive=true`** — an inactive genre
   is hidden, not secret.
6. `PUT` replaces the whole row — send every field.

## 9. The website's cache

Writings (and their genres, once the website reads them) are cached under the
tag `writings`. After a change, purge it:

```bash
curl -X POST "https://your-website-url/api/revalidate" \
  -H "x-revalidation-secret: $REVALIDATION_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"tags":["writings"]}'
```

## 10. Website side — pending

The website still draws its 22 built-in genres with its own translated labels
(`BOOK_GENRES` in `src/lib/writing/genres.ts` + `messages/*.json`), and its
parser drops unknown codes — that tolerance is exactly what makes the deploy
order in §5 safe. Once this endpoint is live and seeded, the website will
switch the chips row, the card labels and the genre filter to the dynamic list.
Tell the website side when the endpoint is deployed.
