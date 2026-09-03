# Book genres — dashboard guide (khi-dashboard)

Goal: genres stop being a fixed list burned into the code. A new dashboard page
lets an admin **add, rename, re-order, hide and delete** book genres — and the
book create/edit form picks genres from that list instead of the hardcoded
enum. The backend contract is in the backend guide; this is the admin side.

Page address: **`/dashboard/writings/genres`**

Two work items:

- **A.** The genres CRUD screen — same 7-step pattern as social links:
  `types → query keys → service → hooks → component → page → sidebar`.
- **B.** One change inside the **existing book form**: the genre multi-select
  reads from the API and submits `genreIds`.

---

## What to tell the editor (the three verbs)

| The editor wants to… | The right action | What happens on the website |
| --- | --- | --- |
| Fix or translate a genre's name | **Edit** — change the names | The chip and every book's label change everywhere, at once |
| Retire a genre but keep old books intact | **Hide** — switch `active` off | The chip disappears; books keep the genre and keep rendering |
| Remove a genre created by mistake | **Delete** (confirm dialog) | It is detached from every book that had it — cannot be undone |

The `slug` is machine-only and permanent: show it read-only after creation.

## Part A — the genres screen

### Step 1 — `types/book-genre.ts`

```ts
export type BookGenreDto = {
  id: number
  slug: string
  nameCkb: string | null
  nameKmr: string | null
  displayOrder: number
  active: boolean
  /** Optional on the API — how many books use this genre. */
  bookCount?: number
}

export type BookGenrePayload = {
  slug: string
  nameCkb?: string | null
  nameKmr?: string | null
  displayOrder?: number
  active?: boolean
}
```

### Step 2 — `lib/book-genre-query-keys.ts`

```ts
export const bookGenreKeys = {
  all: ["book-genres"] as const,
  lists: () => [...bookGenreKeys.all, "list"] as const,
  list: (includeInactive: boolean) =>
    [...bookGenreKeys.lists(), { includeInactive }] as const,
}
```

### Step 3 — `services/bookGenreService.ts`

```ts
import api from "@/lib/axios"
import { unwrapApiData } from "@/lib/api-unwrap"
import type { BookGenreDto, BookGenrePayload } from "@/types/book-genre"

const BASE = "/api/v1/book-genres"

function normalize(raw: unknown): BookGenreDto {
  const r = (raw ?? {}) as Record<string, unknown>
  return {
    id: Number(r.id ?? 0),
    slug: String(r.slug ?? "").toUpperCase(),
    nameCkb: (r.nameCkb as string) ?? null,
    nameKmr: (r.nameKmr as string) ?? null,
    displayOrder: Number(r.displayOrder ?? 0),
    active: r.active !== false,
    bookCount: r.bookCount == null ? undefined : Number(r.bookCount),
  }
}

/** The dashboard always asks for hidden rows too, so they stay editable. */
export async function getBookGenres(includeInactive = true): Promise<BookGenreDto[]> {
  const { data } = await api.get<unknown>(BASE, {
    params: includeInactive ? { includeInactive: true } : undefined,
  })
  const list = unwrapApiData(data)
  return Array.isArray(list) ? list.map(normalize) : []
}

export async function createBookGenre(payload: BookGenrePayload) {
  const { data } = await api.post<unknown>(BASE, payload)
  return normalize(unwrapApiData(data))
}

/** PUT replaces the whole row — always send every field. */
export async function updateBookGenre(id: number, payload: BookGenrePayload) {
  const { data } = await api.put<unknown>(`${BASE}/${id}`, payload)
  return normalize(unwrapApiData(data))
}

export async function deleteBookGenre(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`)
}
```

### Step 4 — `hooks/useBookGenres.ts`

```ts
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { bookGenreKeys } from "@/lib/book-genre-query-keys"
import {
  createBookGenre,
  deleteBookGenre,
  getBookGenres,
  updateBookGenre,
} from "@/services/bookGenreService"
import type { BookGenrePayload } from "@/types/book-genre"

export function useBookGenres(includeInactive = true) {
  return useQuery({
    queryKey: bookGenreKeys.list(includeInactive),
    queryFn: () => getBookGenres(includeInactive),
  })
}

export function useBookGenreMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: bookGenreKeys.all })

  const create = useMutation({
    mutationFn: (payload: BookGenrePayload) => createBookGenre(payload),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: BookGenrePayload }) =>
      updateBookGenre(id, payload),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: number) => deleteBookGenre(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
```

### Step 5 — the component

One screen, same skeleton as the social-links manager:

- **A list sorted by `displayOrder`** — slug (small, gray, monospace), Sorani
  name, Kurmanji name, book count when the API sends it, active toggle,
  edit + delete buttons.
- **Re-ordering**: up/down arrows or a number field; each move is a `PUT` of
  the full row. The order here IS the order of the chips on the website.
- **Create dialog**:
  - name (Sorani) + name (Kurmanji) — at least one required, same rule the
    backend enforces
  - slug — auto-suggest from the Latin name (UPPERCASE, `_` for spaces), but
    editable **only at creation**; after saving it is read-only
  - active toggle, order number
- **Edit dialog**: identical, but the slug field is disabled with a hint:
  "ناتوانرێت بگۆڕدرێت / cannot change — used in links".
  Expect a **400** if a stale client still sends a changed slug for a genre
  that books use.
- **Delete** stays behind a confirm dialog that shows the book count:
  "ئەم جۆرە لە {count} کتێب لادەبردرێت / this genre will be removed from
  {count} books." When the editor only wants the chip gone, point them to the
  toggle instead.
- Expect a **409** when creating a slug that already exists — message:
  "this genre already exists, edit it instead."

### Step 6 — the page and the sidebar

- `app/dashboard/writings/genres/page.tsx` renders the component in the usual
  dashboard shell.
- Sidebar entry under the existing **Writings** group:
  "جۆرەکانی کتێب / Book genres" → `/dashboard/writings/genres`.

## Part B — the book form

The create/edit book form has a genre multi-select fed by the hardcoded enum
today. Change it to:

1. Load options with `useBookGenres(false)` — **active genres only**; a hidden
   genre should not be attachable to new books (books that already have it keep
   it).
2. Show each option by its name in the dashboard's language, falling back to
   the other language when one is missing.
3. Submit **`genreIds: number[]`** on the book payload. During the transition
   the backend still accepts the old slug array, but move to ids now so the
   old path can be dropped.
4. When editing an existing book, pre-select from the book's `genres` objects
   (the response carries `{id, slug, nameCkb, nameKmr}` per genre).

## Checklist before calling it done

1. Load the genres list with `?includeInactive=true` so hidden rows stay
   visible and editable.
2. Creating with both names empty → backend 400; catch it in the form first.
3. `PUT` sends **every field**, or the others are blanked.
4. After a change, the website cache still holds old data for a while — fire
   the existing "revalidate website" call with tag `writings` if the dashboard
   has one.
5. Full loop once: create a genre → it appears in the book form's options;
   attach it to a book; rename it → the book form shows the new name; hide
   it → it leaves the options but stays on that book; delete it → gone from
   the book too.
6. Remember the note from the backend guide: until the **website** switches to
   the dynamic list, a brand-new genre is editable and attachable here but its
   chip does not appear on the public site yet. That is expected, not a bug.
