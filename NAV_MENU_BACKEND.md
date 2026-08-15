# Nav Menu — Backend & Dashboard Guide

Move the hamburger menu (its links, its bilingual text, and the background photo
behind each link) out of hardcoded frontend config and into the CMS, so an editor
can change it from the dashboard without a deploy.

| | |
| --- | --- |
| Backend | `/Users/khi/Desktop/khi_backend` — Spring Boot 4, Java 21, PostgreSQL |
| Dashboard | `/Users/khi/Desktop/khi-dashboard` — Next.js 16, React 19, TypeScript |
| Website | `/Users/khi/Desktop/khi-webiste` — Next.js 15 |
| API base | `https://blissful-spontaneity-production.up.railway.app` |
| Path | `/api/v1/nav-menu` |

**Status:** backend ✅ built · dashboard ✅ built · website ⬜ not wired up yet (§7).

---

## 1 · The logic

The menu has **10 top-level items** (news, projects, sound, video, gallery,
writings, services, about, contact, donate). Each item has:

- a **label** and a **description** in two languages (CKB Sorani, KMR Kurmanji)
- a **link** (`/news`, `/audio`, …)
- a **background photo** — shown full-screen behind the menu when you hover that item
- **0–8 secondary links** (the small list under "گەڕان" in the right panel)

So: **two tables** — one for the items, one for their secondary links.

```
nav_menu_items                    nav_menu_links
──────────────                    ──────────────
id                                id
item_key      (unique) ────────┐  item_id  (FK) ──┘
label_ckb / label_kmr          └─<  label_ckb / label_kmr
description_ckb / _kmr            href
href                              display_order
image_url                         active
display_order
active
```

### Rules

1. **Secondary links are saved with their parent item.** The item's JSON body carries
   the whole `links[]` array and the server replaces the set. One form, one save
   button — no separate CRUD for links.
2. **Ordering is the server's job.** Items come back sorted by `display_order`, links
   likewise. If a link has no `display_order`, use its position in the array.
3. **`active = false` hides a row** from the website but keeps it in the dashboard —
   for items *and* for secondary links. The public `GET` drops both; the dashboard
   asks for `?includeInactive=true` and sees everything (§3.3).
4. **CKB is required, KMR is optional.** Blank optional strings are saved as `null`.
5. **`item_key` must not change after it is created.** For six sections (news,
   projects, sound, video, gallery, writings) the website uses this key to build the
   secondary links automatically from CMS categories/tags/topics — renaming the key
   silently breaks that link. For services/about/contact/donate the links in the
   table are the only source.
6. **Images are not stored in this table** — only the URL string. Upload goes through
   the existing shared media endpoint (§4).

---

## 2 · Tables

> No migration file is needed. This backend has no Flyway/Liquibase —
> `ddl-auto: update` creates the tables from the entity classes at boot. This SQL
> just documents the resulting shape.

```sql
CREATE TABLE nav_menu_items (
    id              BIGSERIAL     PRIMARY KEY,
    item_key        VARCHAR(60)   NOT NULL UNIQUE,
    label_ckb       VARCHAR(200)  NOT NULL,
    label_kmr       VARCHAR(200),
    description_ckb TEXT,
    description_kmr TEXT,
    href            VARCHAR(300)  NOT NULL,
    image_url       TEXT,
    display_order   INTEGER       NOT NULL DEFAULT 0,
    active          BOOLEAN       NOT NULL DEFAULT TRUE
);

CREATE TABLE nav_menu_links (
    id            BIGSERIAL     PRIMARY KEY,
    item_id       BIGINT        NOT NULL REFERENCES nav_menu_items (id) ON DELETE CASCADE,
    label_ckb     VARCHAR(200)  NOT NULL,
    label_kmr     VARCHAR(200),
    href          VARCHAR(300)  NOT NULL,
    display_order INTEGER       NOT NULL DEFAULT 0,
    active        BOOLEAN       NOT NULL DEFAULT TRUE
);
```

---

## 3 · Endpoints

Five endpoints. No pagination — it is ten rows.

| Method | Path | Auth | Purpose | Success |
| --- | --- | --- | --- | --- |
| `GET` | `/api/v1/nav-menu` | public | whole menu, active only, with links | `200` |
| `GET` | `/api/v1/nav-menu/{id}` | public | one item (for the edit form) | `200` |
| `POST` | `/api/v1/nav-menu` | ADMIN | create | `201` |
| `PUT` | `/api/v1/nav-menu/{id}` | ADMIN | update (replaces its links) | `200` |
| `DELETE` | `/api/v1/nav-menu/{id}` | ADMIN | delete (links cascade) | `200` |

Writes need `Authorization: Bearer <token>` on an `ADMIN` or `SUPER_ADMIN` account —
`EMPLOYEE` and `GUEST` get `403`. Reads need nothing.

`GET` takes one optional param: `?includeInactive=true` — the dashboard list uses it,
the website does not.

### 3.1 Request fields (POST / PUT)

Both verbs take the same body. Strings are trimmed; a blank optional string is
stored as `null`.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `itemKey` | string ≤ 60 | **yes** | lower-cased on save (`"News"` → `"news"`); unique, case-insensitive |
| `labelCkb` | string ≤ 200 | **yes** | |
| `labelKmr` | string ≤ 200 | no | |
| `descriptionCkb` | text | no | |
| `descriptionKmr` | text | no | |
| `href` | string ≤ 300 | **yes** | site-relative, e.g. `/news` |
| `imageUrl` | text | no | absolute URL from `/api/v1/media/upload` (§4) |
| `displayOrder` | integer | no | omitted → `0` |
| `active` | boolean | no | omitted → `true` |
| `links` | array | no | see below — omitted ≠ `[]` |

Each entry of `links`:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `labelCkb` | string ≤ 200 | **yes** | |
| `labelKmr` | string ≤ 200 | no | |
| `href` | string ≤ 300 | **yes** | |
| `displayOrder` | integer | no | omitted → its 1-based position in the array |
| `active` | boolean | no | omitted → `true` |

Link ids are never sent by the client — the server drops the old rows and inserts
the array as given, so every save mints fresh link ids.

Extra fields are ignored rather than rejected: you can take a response object and
`PUT` it straight back, `id`s and all. A posted `id` is not honoured — the item id
comes from the URL and link ids are always regenerated. Building an explicit
payload (§6.5) is still the house rule, since that is what does the trimming and
the blank → `null` conversion.

| `links` value | Effect |
| --- | --- |
| omitted / `null` | existing links left untouched |
| `[]` | all links removed |
| `[ … ]` | the whole set is replaced by this array |

### 3.2 POST `/api/v1/nav-menu`

```json
{
  "itemKey": "news",
  "labelCkb": "هەواڵ",
  "labelKmr": "Nûçe",
  "descriptionCkb": "هەواڵی لێکۆڵینەوەیەکان لەسەر کەلتوور و مێژوو.",
  "descriptionKmr": "Nûçeyên lêkolînê li ser çand û dîrok.",
  "href": "/news",
  "imageUrl": "https://s3-khiwebsite.s3.us-east-1.amazonaws.com/khi-web-folders/images/abc-news.jpg",
  "displayOrder": 1,
  "active": true,
  "links": [
    { "labelCkb": "کەلتوور", "labelKmr": "Çand",  "href": "/news?category=culture" },
    { "labelCkb": "مێژوو",   "labelKmr": "Dîrok", "href": "/news?category=history" }
  ]
}
```

`201 Created` — the saved row, ids and defaults filled in:

```json
{
  "success": true,
  "message": "Nav menu item created",
  "data": {
    "id": 1,
    "itemKey": "news",
    "labelCkb": "هەواڵ",
    "labelKmr": "Nûçe",
    "href": "/news",
    "imageUrl": "https://s3-khiwebsite.s3.us-east-1.amazonaws.com/khi-web-folders/images/abc-news.jpg",
    "displayOrder": 1,
    "active": true,
    "links": [
      { "id": 1, "labelCkb": "کەلتوور", "labelKmr": "Çand",  "href": "/news?category=culture", "displayOrder": 1, "active": true },
      { "id": 2, "labelCkb": "مێژوو",   "labelKmr": "Dîrok", "href": "/news?category=history", "displayOrder": 2, "active": true }
    ]
  }
}
```

**Null fields are omitted, not returned as `null`.** An item saved with only the
three required fields comes back without `labelKmr`, `descriptionCkb`,
`descriptionKmr` or `imageUrl` at all:

```json
{
  "success": true,
  "message": "Nav menu item created",
  "data": {
    "id": 1,
    "itemKey": "donate",
    "labelCkb": "بەخشین",
    "href": "/donate",
    "displayOrder": 0,
    "active": true,
    "links": []
  }
}
```

So the client must normalize before binding to inputs, or React switches the field
from controlled to uncontrolled. The dashboard does this in
`lib/nav-menu-normalize.ts`, which turns every missing optional into an explicit
`null`. `displayOrder`, `active` and `links` are always present.

### 3.3 GET `/api/v1/nav-menu`

Items sorted by `display_order` then `id`, links likewise. Same object shape as
above, wrapped in an array:

```json
{
  "success": true,
  "message": "Nav menu fetched",
  "data": [
    {
      "id": 1,
      "itemKey": "news",
      "labelCkb": "هەواڵ",
      "labelKmr": "Nûçe",
      "href": "/news",
      "imageUrl": "https://s3-khiwebsite.s3.us-east-1.amazonaws.com/khi-web-folders/images/abc-news.jpg",
      "displayOrder": 1,
      "active": true,
      "links": [
        { "id": 1, "labelCkb": "کەلتوور", "labelKmr": "Çand",  "href": "/news?category=culture", "displayOrder": 1, "active": true },
        { "id": 2, "labelCkb": "مێژوو",   "labelKmr": "Dîrok", "href": "/news?category=history", "displayOrder": 2, "active": true }
      ]
    }
  ]
}
```

What `includeInactive` changes — it filters **links** as well as items:

| Call | Items returned | Links returned |
| --- | --- | --- |
| `GET /api/v1/nav-menu` | `active: true` only | `active: true` only |
| `GET /api/v1/nav-menu?includeInactive=true` | all | all |
| `GET /api/v1/nav-menu/{id}` | the one asked for | all — it feeds the edit form |

An empty menu is `"data": []`, never `null`.

### 3.4 PUT `/api/v1/nav-menu/{id}`

Full replace, not a patch: **every field you omit is reset to its default**
(`displayOrder` → `0`, `active` → `true`, optional strings → `null`). Send the whole
object back. The single exception is `links`, per the table in §3.1.

`200 OK`, `"message": "Nav menu item updated"`, `data` shaped exactly like §3.2 —
old links are gone and the new ones come back with fresh ids.

`itemKey` may be sent unchanged (it is not a conflict against itself), but changing
it breaks the website's automatic secondary links — see rule 5.

### 3.5 DELETE `/api/v1/nav-menu/{id}`

Links cascade. There is no `data` key on the response — the envelope omits nulls:

```json
{
  "success": true,
  "message": "Nav menu item deleted"
}
```

### 3.6 Errors

Failures do **not** use the `success/message/data` envelope. They use the standard
error envelope from `GlobalExceptionHandler`:

| Status | `code` | When |
| --- | --- | --- |
| `400` | `VALIDATION_ERROR` | a required field is missing or a length cap is exceeded |
| `403` | — | not logged in, or role below `ADMIN`, on a write |
| `404` | `NOT_FOUND` | no item with that id (GET one, PUT, DELETE) |
| `409` | `CONFLICT` | `itemKey` already belongs to another item |

`400` → `fieldErrors` names the offending path, nested links included:

```json
{
  "timestamp": "2026-08-15T19:43:04.487091Z",
  "status": 400,
  "path": "/api/v1/nav-menu",
  "method": "POST",
  "traceId": "509f8af1-08d1-43ed-8588-abdf50f931c2",
  "code": "VALIDATION_ERROR",
  "message": "One or more fields failed validation.",
  "fieldErrors": [
    { "field": "links[0].href", "message": "must not be blank" },
    { "field": "itemKey",       "message": "must not be blank" }
  ]
}
```

`409` → `details.itemKey` echoes the key that clashed, already normalized.
`404` → `details.id` echoes the id.

Two things the dashboard has to handle:

- **`403` has an empty body.** `err.response.data.message` is `undefined`, so the
  toast must fall back to its own text.
- **Send `Accept-Language: ckb`** (or `kmr`) to get the Kurdish `message`. Without
  it you get the generic English fallback — `"Conflict"`, `"Resource not found"` —
  because the request defaults to the English bundle, whose file is currently
  misnamed (see §5). `messageKu` is always populated regardless.

### 3.7 curl

```bash
BASE=https://blissful-spontaneity-production.up.railway.app
TOKEN=<admin jwt>

# public read
curl "$BASE/api/v1/nav-menu"

# dashboard read
curl "$BASE/api/v1/nav-menu?includeInactive=true" -H "Authorization: Bearer $TOKEN"

# create
curl -X POST "$BASE/api/v1/nav-menu" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept-Language: ckb" \
  -d '{"itemKey":"news","labelCkb":"هەواڵ","href":"/news",
       "links":[{"labelCkb":"کەلتوور","href":"/news?category=culture"}]}'

# update, delete
curl -X PUT    "$BASE/api/v1/nav-menu/1" -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" -d '{"itemKey":"news","labelCkb":"هەواڵ","href":"/news"}'
curl -X DELETE "$BASE/api/v1/nav-menu/1" -H "Authorization: Bearer $TOKEN"
```

---

## 4 · Images

**No new upload code.** Reuse the existing endpoint and store the URL it returns:

```http
POST /api/v1/media/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

file=<binary>     (required)
type=image        (optional, defaults to "image")
```

```json
{ "success": true, "data": { "fileUrl": "https://s3-khiwebsite.s3.../abc-photo.jpg", "fileName": "photo.jpg" } }
```

Take `data.fileUrl` → send it as `imageUrl`. The URL is absolute and public.

Recommend **2000px+ wide** images to editors — this photo fills the entire screen
behind the menu, and anything smaller looks soft on a large monitor.

---

## 5 · Backend guide

> **Built.** All six files exist under `ak.dev.khi_backend.khi_app`, plus the
> `SecurityConfig` rules below, two i18n keys, and
> `src/test/java/.../khi_app/api/site/NavMenuIntegrationTests.java` — eight MockMvc
> tests over H2 covering create/list/update/delete, link replacement, the
> inactive filter, the duplicate key and the role rules.

```
model/site/NavMenuItem.java
model/site/NavMenuLink.java
repository/site/NavMenuItemRepository.java
dto/site/NavMenuDtos.java
service/site/NavMenuService.java
api/site/NavMenuController.java
```

Three details worth knowing, all in the shipped code:

- `@ToString.Exclude @EqualsAndHashCode.Exclude` on `NavMenuItem.links` and
  `NavMenuLink.item` — plain `@Data` on both sides recurses forever and touches a
  lazy proxy.
- `findById` is overridden with `@EntityGraph(attributePaths = "links")` too, not
  just the two list queries. Without it, `open-in-view: false` gives you a
  `LazyInitializationException`.
- Not-found throws `NotFoundException("navMenu.not_found", Map.of("id", id))` —
  the convention in the newer `WritingService`/`ServiceService`, rather than the
  older `EntityNotFoundException` in `SiteContentService`. Both map to `404`.

The two message keys live in `messages_ckb.properties` and
`messages_kmr.properties`: `navMenu.not_found`, `navMenu.itemKey.duplicate`.
They are in the English bundle as well, but that file is named
`" messages_en.properties"` — with a leading space — so it does not match the
`classpath:i18n/messages` basename and has never loaded. Pre-existing, affects
every endpoint, not just this one; renaming it is the fix.

### Service — the one method worth reading

`apply(entity, request)` is shared by create and update. `links == null` means
"leave them alone"; anything else replaces the set:

```java
private void apply(NavMenuItem item, NavMenuItemRequest r) {
    item.setItemKey(r.getItemKey().trim().toLowerCase());
    item.setLabelCkb(r.getLabelCkb().trim());
    item.setLabelKmr(trimToNull(r.getLabelKmr()));
    item.setDescriptionCkb(trimToNull(r.getDescriptionCkb()));
    item.setDescriptionKmr(trimToNull(r.getDescriptionKmr()));
    item.setHref(r.getHref().trim());
    item.setImageUrl(trimToNull(r.getImageUrl()));
    item.setDisplayOrder(r.getDisplayOrder() == null ? 0 : r.getDisplayOrder());
    item.setActive(r.getActive() == null || r.getActive());

    if (r.getLinks() == null) return;          // null = leave links alone

    item.getLinks().clear();                    // orphanRemoval deletes the old rows
    for (int i = 0; i < r.getLinks().size(); i++) {
        var lr = r.getLinks().get(i);
        var link = new NavMenuLink();
        link.setItem(item);
        link.setLabelCkb(lr.getLabelCkb().trim());
        link.setLabelKmr(trimToNull(lr.getLabelKmr()));
        link.setHref(lr.getHref().trim());
        link.setDisplayOrder(lr.getDisplayOrder() == null ? i + 1 : lr.getDisplayOrder());
        link.setActive(lr.getActive() == null || lr.getActive());
        item.getLinks().add(link);
    }
}
```

### ⚠️ Security

`SecurityConfig` makes every `GET /api/v1/**` public automatically, but an
unlisted **write** path falls through to "any logged-in user" — including `GUEST`.

Shipped as one extra line in each of the three existing admin-only blocks (the ones
already holding `/api/v1/settings/social/**`), which sit above the
`GET /api/v1/**` catch-all:

```java
.requestMatchers(HttpMethod.POST,
        "/api/v1/featured/**",
        // … the paths that were already listed …
        "/api/v1/nav-menu/**"          // ← added
).hasAnyRole("ADMIN", "SUPER_ADMIN")
// same one-line addition in the PUT and DELETE blocks
```

`/api/v1/nav-menu/**` also matches the bare `/api/v1/nav-menu`, so `POST` to the
collection is covered. Verified by `writesAreAdminOnlyWhileReadsArePublic` —
`EMPLOYEE` and `GUEST` get `403` on POST/PUT/DELETE, anonymous `GET` gets `200`.

---

## 6 · Dashboard guide

> **Built.** App: `/Users/khi/Desktop/khi-dashboard` — Next.js 16 (App Router),
> React 19, TypeScript, Tailwind, TanStack Query, react-hook-form + zod, axios.
> Screen lives at **`/dashboard/menu`**.

### 6.1 Files

```
app/dashboard/menu/page.tsx              route → <NavMenuListClient/>
app/dashboard/menu/layout.tsx            metadata + RTL shell

components/menu/nav-menu-list-client.tsx  the screen: loads the list, adds drafts
components/menu/nav-menu-item-card.tsx    one item = one inline form (the main file)
components/menu/nav-menu-links-editor.tsx the secondary-links repeater
components/menu/nav-menu-delete-dialog.tsx
components/menu/nav-menu-error-state.tsx
components/menu/nav-menu-strings.ts       all Kurdish UI copy (the NS object)

services/navMenuService.ts               the five API calls
hooks/useNavMenu.ts                      TanStack Query hooks
lib/nav-menu-form-data.ts                form values → request payload
lib/nav-menu-normalize.ts                API response → UI-safe shape
lib/nav-menu-query-keys.ts
lib/validations/nav-menu.ts              the zod schema
types/nav-menu.ts                        DTOs + the derived-keys helper
```

Sidebar entry points at `/dashboard/menu` in `components/app-sidebar.tsx`.

### 6.2 The screen

There is **no list page plus separate editor page**. `/dashboard/menu` shows every
item as a card, and each card *is* its own form — the editor opens the page, edits a
label or swaps a photo, and saves that one card. Ten items, all visible, no
navigation. "Add item" pushes a draft card onto the end of the list, and the draft
saves with `POST` instead of `PUT`.

### 6.3 API layer

`services/navMenuService.ts` holds all five calls against `const BASE = "/api/v1/nav-menu"`,
using the shared axios instance. The token, the `/railway-proxy` base URL and the
401 handling all live in `lib/axios.ts` — call sites never touch headers.

```ts
export async function getNavMenu(includeInactive = true): Promise<NavMenuItemDto[]> {
  const { data } = await api.get<unknown>(BASE, {
    params: includeInactive ? { includeInactive: true } : undefined,
  })
  return normalizeNavMenuList(unwrapApiData(data))
}
```

Note `getNavMenuItem` swallows a `404` into `null` rather than throwing, so a
deleted row does not blow up the detail query.

### 6.4 Query hooks

`hooks/useNavMenu.ts` — `useNavMenuListQuery`, `useNavMenuItemQuery`,
`useCreateNavMenuItem`, `useUpdateNavMenuItem`, `useDeleteNavMenuItem`.
Two behaviours to know:

- **Delete is optimistic.** The row disappears immediately and is restored on error
  — a refetch round-trip is more visible than the write itself on a ten-row list.
- **Update writes the detail cache** (`setQueryData`) and invalidates the lists.

### 6.5 Form → payload

The form is react-hook-form + `zodResolver(navMenuItemSchema)`. The schema in
`lib/validations/nav-menu.ts` mirrors the column widths from §2 so the client
rejects before the API does, and enforces `href` starting with `/` and `itemKey`
matching `^[a-z0-9][a-z0-9-]*$`.

`lib/nav-menu-form-data.ts` builds the request body explicitly — this is where
trimming and blank → `null` happen (§3.1):

```ts
export function navMenuFormValuesToPayload(values: NavMenuItemFormValues): NavMenuWritePayload {
  return {
    itemKey: values.itemKey.trim().toLowerCase(),
    labelCkb: values.labelCkb.trim(),
    labelKmr: trimOrNull(values.labelKmr),
    // …
    links: values.links
      .filter((l) => l.labelCkb.trim() && l.href.trim())   // drop half-filled rows
      .map((l, i) => ({ /* …, displayOrder: i + 1 */ })),
  }
}
```

Link ids are deliberately never sent, and `displayOrder` is renumbered from the
array position — matching what the server does anyway (§3.1).

### 6.6 The image field

The card reuses the shared uploader, `components/shared/media-cover-upload.tsx`,
which handles drag-and-drop, the file dialog, a paste-a-URL input, the preview and
the `POST /api/v1/media/upload` call. It stores the returned `fileUrl` string:

```tsx
<Controller
  name="imageUrl"
  control={control}
  render={({ field }) => (
    <MediaCoverUpload
      aspectClass="aspect-[21/9]"
      previewUrl={field.value ?? null}
      urlValue={field.value ?? ""}
      onUrlChange={(url) => field.onChange(url || null, { shouldDirty: true })}
    />
  )}
/>
```

### 6.7 Editor guidance built into the UI

- **`itemKey`** is locked once the item exists — changing it detaches that section
  from its automatic links on the website.
- **Secondary links**: `isDerivedLinksKey()` from `types/nav-menu.ts` flags the six
  sections (news, projects, sound, video, gallery, writings) whose links the website
  builds from CMS taxonomy, and the card warns that what is typed there only shows
  when the automatic list is empty. For services/about it is the only source.
- The website renders at most **8** links per section
  (`NAV_MENU_MAX_VISIBLE_LINKS`).

---

## 7 · Website side — the remaining work

This is the one piece not built yet. The public site
(`/Users/khi/Desktop/khi-webiste`) still reads the hardcoded `NAV_ITEMS` array in
`src/config/site.ts`.

To wire it up:

1. Add `src/lib/api/nav-menu.ts` calling `GET /api/v1/nav-menu` through the existing
   `apiFetch` helper, with a cache tag so `POST /api/revalidate` can bust it.
2. Keep `NAV_ITEMS` as the offline fallback — `apiFetch` returns `null` on any
   failure rather than throwing, so the menu must still render when the CMS is down.
3. Pick the language with `locale === "ckb" ? labelCkb : labelKmr` — the site's `ku`
   locale is the backend's `KMR`.
4. In `nav-drawer.tsx`, change `bgItem?.imageSrc ?? NAV_DEFAULT_IMAGE` to a truthy
   check (`||`) — a null `imageUrl` from the database would otherwise pass an empty
   string to `next/image` and throw.
5. `publications-dropdown.tsx` reads `NAV_ITEMS` synchronously at module load, so it
   needs converting to a server-fed component before the static config can go away.
   This is the one place a naive swap breaks the build.
