# Donation type cards ("دەتوانم چی ببەخشم؟") — dashboard guide (khi-dashboard)

Goal: a page in the dashboard where an admin can add, edit, re-order, hide and
delete the cards of the donate page's **"دەتوانم چی ببەخشم؟" / "What can I
donate?"** section. The backend contract is in the backend guide — this is only
the admin screen.

Page address: **`/dashboard/donations/type-cards`**

It follows exactly the same pattern the social-links page uses:
`types → query keys → service → hooks → component → page → sidebar`.

One thing this screen has that social links does not: **an image per card**.
Reuse the image-upload flow the dashboard already has (the one behind the
donation hero picture / cover pickers) — upload first, then save the returned
URL string in `imageUrl`.

---

## The one design rule to show the editor

**The card at the top of the list (lowest `displayOrder`) is the BIG featured
card on the website, and it is the only one whose description is visible.**
All other cards are small tiles showing just the title. The numbers on the site
("01", "02"…) are the list positions — the editor never types them.

Make this visible in the UI: badge the first row with something like
"کارتی گەورە / featured", and show a description column so the editor
remembers to fill it for at least that first card.

## Step 1 — `types/donation-type-card.ts`

```ts
export type DonationTypeCardDto = {
  id: number
  titleCkb: string | null
  titleKmr: string | null
  descriptionCkb: string | null
  descriptionKmr: string | null
  imageUrl: string
  displayOrder: number
  active: boolean
}

export type DonationTypeCardPayload = {
  titleCkb?: string | null
  titleKmr?: string | null
  descriptionCkb?: string | null
  descriptionKmr?: string | null
  imageUrl: string
  displayOrder?: number
  active?: boolean
}
```

## Step 2 — `lib/donation-type-card-query-keys.ts`

```ts
export const donationTypeCardKeys = {
  all: ["donation-type-cards"] as const,
  lists: () => [...donationTypeCardKeys.all, "list"] as const,
  list: (includeInactive: boolean) =>
    [...donationTypeCardKeys.lists(), { includeInactive }] as const,
}
```

## Step 3 — `services/donationTypeCardService.ts`

```ts
import api from "@/lib/axios"
import { unwrapApiData } from "@/lib/api-unwrap"
import type {
  DonationTypeCardDto,
  DonationTypeCardPayload,
} from "@/types/donation-type-card"

const BASE = "/api/v1/donations/type-cards"

function normalize(raw: unknown): DonationTypeCardDto {
  const r = (raw ?? {}) as Record<string, unknown>
  return {
    id: Number(r.id ?? 0),
    titleCkb: (r.titleCkb as string) ?? null,
    titleKmr: (r.titleKmr as string) ?? null,
    descriptionCkb: (r.descriptionCkb as string) ?? null,
    descriptionKmr: (r.descriptionKmr as string) ?? null,
    imageUrl: String(r.imageUrl ?? ""),
    displayOrder: Number(r.displayOrder ?? 0),
    active: r.active !== false,
  }
}

/** The dashboard always asks for hidden rows too, so they stay editable. */
export async function getDonationTypeCards(
  includeInactive = true,
): Promise<DonationTypeCardDto[]> {
  const { data } = await api.get<unknown>(BASE, {
    params: includeInactive ? { includeInactive: true } : undefined,
  })
  const list = unwrapApiData(data)
  return Array.isArray(list) ? list.map(normalize) : []
}

export async function createDonationTypeCard(payload: DonationTypeCardPayload) {
  const { data } = await api.post<unknown>(BASE, payload)
  return normalize(unwrapApiData(data))
}

/** PUT replaces the whole row — always send every field. */
export async function updateDonationTypeCard(
  id: number,
  payload: DonationTypeCardPayload,
) {
  const { data } = await api.put<unknown>(`${BASE}/${id}`, payload)
  return normalize(unwrapApiData(data))
}

export async function deleteDonationTypeCard(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`)
}
```

## Step 4 — `hooks/useDonationTypeCards.ts`

```ts
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { donationTypeCardKeys } from "@/lib/donation-type-card-query-keys"
import {
  createDonationTypeCard,
  deleteDonationTypeCard,
  getDonationTypeCards,
  updateDonationTypeCard,
} from "@/services/donationTypeCardService"
import type { DonationTypeCardPayload } from "@/types/donation-type-card"

export function useDonationTypeCards(includeInactive = true) {
  return useQuery({
    queryKey: donationTypeCardKeys.list(includeInactive),
    queryFn: () => getDonationTypeCards(includeInactive),
  })
}

export function useDonationTypeCardMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: donationTypeCardKeys.all })

  const create = useMutation({
    mutationFn: (payload: DonationTypeCardPayload) =>
      createDonationTypeCard(payload),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: DonationTypeCardPayload
    }) => updateDonationTypeCard(id, payload),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: number) => deleteDonationTypeCard(id),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
```

## Step 5 — the image

Each card must have a picture before it can be saved (`imageUrl` is required by
the backend). Do it the same way the donation hero picture is set:

1. The form shows an image picker with a preview of the current `imageUrl`.
2. Picking a file calls the **existing upload service** the dashboard already
   uses for images; it answers with a URL on S3.
3. Store that URL in the form state; it is sent as the `imageUrl` string when
   the card is saved. Nothing card-specific about the upload itself.

Tell the editor: the picture is a background — the site darkens it and puts
white text on top, so **busy or bright pictures are fine, faces near the bottom
edge are not** (the title sits in the bottom third).

## Step 6 — the component

One screen, same skeleton as the social-links manager:

- **A list, sorted by `displayOrder`** — thumbnail, Sorani title, Kurmanji
  title, order number, active toggle, edit + delete buttons.
- The **first row gets a "featured / کارتی گەورە" badge** — that is the big card.
- **Re-ordering**: up/down arrows (or a number field) that swap `displayOrder`
  values. Each move is a `PUT` of the full row. Drag-and-drop is nice but not
  required.
- **Create / edit dialog** with:
  - title (Sorani) + title (Kurmanji) — validate that at least one is filled,
    the same rule the backend enforces
  - description (Sorani) + description (Kurmanji) — textarea; hint under it:
    "پیشان دەدرێت تەنیا لەسەر کارتی یەکەم / shown on the featured card only"
  - image picker (Step 5) — required
  - active toggle
- **Hide, don't delete**: switching `active` off is a `PUT` with
  `"active": false` and every other field unchanged. The row stays editable in
  the dashboard and comes back with one click. Keep delete behind a confirm
  dialog.

## Step 7 — the page and the sidebar

- `app/dashboard/donations/type-cards/page.tsx` renders the component inside the
  usual dashboard shell.
- Add a sidebar entry under the existing **Donations** group:
  "کارتەکانی بەخشین / Donation cards" → `/dashboard/donations/type-cards`.

## Checklist before calling it done

1. Load the list with `?includeInactive=true` so hidden rows are visible.
2. Creating a card with both titles empty is rejected by the backend (400) —
   catch it in the form before sending.
3. `PUT` sends **every field**, not only the changed one, or the other fields
   are blanked.
4. After every successful save, the website's cache still holds the old cards
   for a while. If the dashboard already has a "revalidate website" call, fire
   it with tag `donations`; otherwise the change appears when the cache window
   passes.
5. Try the full loop once: create a sixth card → it appears at the end of the
   rail on the website; move it to position 0 → it becomes the big featured
   card; switch it off → the section shows five cards again.
