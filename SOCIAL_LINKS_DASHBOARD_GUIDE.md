# Social links — dashboard guide (khi-dashboard)

Goal: a page in the dashboard where an admin can add, edit, hide and delete the
social media links. The backend is ready (see the backend guide) — this is only
the admin screen.

Page address: **`/dashboard/settings/social`**

It follows exactly the same pattern the menu page (`/dashboard/menu`) already
uses: `types → query keys → service → hooks → component → page → sidebar`.

---

## Step 1 — `types/social.ts`

```ts
export type SocialLinkDto = {
  id: number
  platform: string
  url: string
  labelCkb: string | null
  labelKmr: string | null
  displayOrder: number
  active: boolean
}

export type SocialLinkPayload = {
  platform: string
  url: string
  labelCkb?: string | null
  labelKmr?: string | null
  displayOrder?: number
  active?: boolean
}

/** Only these four are drawn on the website today. */
export const SOCIAL_PLATFORMS = [
  "FACEBOOK",
  "INSTAGRAM",
  "YOUTUBE",
  "WHATSAPP",
] as const
```

## Step 2 — `lib/social-query-keys.ts`

```ts
export const socialKeys = {
  all: ["social-links"] as const,
  lists: () => [...socialKeys.all, "list"] as const,
  list: (includeInactive: boolean) =>
    [...socialKeys.lists(), { includeInactive }] as const,
}
```

## Step 3 — `services/socialService.ts`

```ts
import api from "@/lib/axios"
import { unwrapApiData } from "@/lib/api-unwrap"
import type { SocialLinkDto, SocialLinkPayload } from "@/types/social"

const BASE = "/api/v1/settings/social"

function normalize(raw: unknown): SocialLinkDto {
  const r = (raw ?? {}) as Record<string, unknown>
  return {
    id: Number(r.id ?? 0),
    platform: String(r.platform ?? "").toUpperCase(),
    url: String(r.url ?? ""),
    labelCkb: (r.labelCkb as string) ?? null,
    labelKmr: (r.labelKmr as string) ?? null,
    displayOrder: Number(r.displayOrder ?? 0),
    active: r.active !== false,
  }
}

/** The dashboard always asks for hidden rows too, so they stay editable. */
export async function getSocialLinks(includeInactive = true): Promise<SocialLinkDto[]> {
  const { data } = await api.get<unknown>(BASE, {
    params: includeInactive ? { includeInactive: true } : undefined,
  })
  const list = unwrapApiData(data)
  return Array.isArray(list) ? list.map(normalize) : []
}

export async function createSocialLink(payload: SocialLinkPayload) {
  const { data } = await api.post<unknown>(BASE, payload)
  return normalize(unwrapApiData(data))
}

/** PUT replaces the whole row — always send every field. */
export async function updateSocialLink(id: number, payload: SocialLinkPayload) {
  const { data } = await api.put<unknown>(`${BASE}/${id}`, payload)
  return normalize(unwrapApiData(data))
}

export async function deleteSocialLink(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`)
}
```

> `includeInactive` is already live on the backend (2026-08-26), so this returns
> hidden rows too.

## Step 4 — `hooks/useSocialLinks.ts`

```ts
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { socialKeys } from "@/lib/social-query-keys"
import {
  createSocialLink,
  deleteSocialLink,
  getSocialLinks,
  updateSocialLink,
} from "@/services/socialService"
import type { SocialLinkPayload } from "@/types/social"

export function useSocialLinksQuery(includeInactive = true) {
  return useQuery({
    queryKey: socialKeys.list(includeInactive),
    queryFn: () => getSocialLinks(includeInactive),
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateSocialLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: SocialLinkPayload) => createSocialLink(payload),
    onSuccess: () => void qc.invalidateQueries({ queryKey: socialKeys.lists() }),
  })
}

export function useUpdateSocialLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { id: number; payload: SocialLinkPayload }) =>
      updateSocialLink(v.id, v.payload),
    onSuccess: () => void qc.invalidateQueries({ queryKey: socialKeys.lists() }),
  })
}

export function useDeleteSocialLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteSocialLink(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: socialKeys.lists() }),
  })
}
```

## Step 5 — `components/settings/social-links-panel.tsx`

One card per link: platform, URL, order, on/off switch, save and delete. The
"add" button pushes an empty draft row into the same list.

```tsx
"use client"

import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { extractApiErrorMessage } from "@/lib/api-error"
import { toastError, toastSuccess } from "@/lib/toast"
import {
  useCreateSocialLink,
  useDeleteSocialLink,
  useSocialLinksQuery,
  useUpdateSocialLink,
} from "@/hooks/useSocialLinks"
import { SOCIAL_PLATFORMS, type SocialLinkDto } from "@/types/social"

type Row = SocialLinkDto & { isNew?: boolean }

const EMPTY: Row = {
  id: 0,
  platform: "FACEBOOK",
  url: "",
  labelCkb: null,
  labelKmr: null,
  displayOrder: 0,
  active: true,
  isNew: true,
}

function LinkCard({ row, onDone }: { row: Row; onDone: () => void }) {
  const [draft, setDraft] = useState<Row>(row)
  const createMut = useCreateSocialLink()
  const updateMut = useUpdateSocialLink()
  const deleteMut = useDeleteSocialLink()
  const busy = createMut.isPending || updateMut.isPending || deleteMut.isPending

  async function save() {
    if (!draft.url.trim()) {
      toastError("لینکەکە بنووسە")
      return
    }
    // PUT replaces the whole row, so every field goes with it.
    const payload = {
      platform: draft.platform,
      url: draft.url.trim(),
      labelCkb: draft.labelCkb,
      labelKmr: draft.labelKmr,
      displayOrder: draft.displayOrder,
      active: draft.active,
    }
    try {
      if (draft.isNew) await createMut.mutateAsync(payload)
      else await updateMut.mutateAsync({ id: draft.id, payload })
      toastSuccess("پاشەکەوت کرا")
      onDone()
    } catch (err) {
      toastError(extractApiErrorMessage(err) ?? "هەڵەیەک ڕوویدا")
    }
  }

  async function remove() {
    if (draft.isNew) return onDone()
    try {
      await deleteMut.mutateAsync(draft.id)
      toastSuccess("سڕایەوە")
    } catch (err) {
      toastError(extractApiErrorMessage(err) ?? "هەڵەیەک ڕوویدا")
    }
  }

  return (
    <div dir="rtl" className="border-border/60 space-y-4 rounded-lg border p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>پلاتفۆرم</Label>
          <select
            value={draft.platform}
            onChange={(e) => setDraft({ ...draft, platform: e.target.value })}
            className="border-border h-10 w-full rounded-md border bg-transparent px-3 text-sm"
          >
            {SOCIAL_PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>ڕیزبەندی</Label>
          <Input
            type="number"
            value={draft.displayOrder}
            onChange={(e) =>
              setDraft({ ...draft, displayOrder: Number(e.target.value) || 0 })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>لینک</Label>
        <Input
          dir="ltr"
          placeholder="https://facebook.com/..."
          value={draft.url}
          onChange={(e) => setDraft({ ...draft, url: e.target.value })}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={draft.active}
            onCheckedChange={(v) => setDraft({ ...draft, active: v })}
          />
          <span>{draft.active ? "چالاک" : "شاراوە"}</span>
        </label>

        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={remove} disabled={busy}>
            <TrashIcon className="size-4" />
            سڕینەوە
          </Button>
          <Button size="sm" onClick={save} disabled={busy}>
            پاشەکەوت
          </Button>
        </div>
      </div>
    </div>
  )
}

export function SocialLinksPanel() {
  const listQuery = useSocialLinksQuery(true)
  const [drafts, setDrafts] = useState<number[]>([])

  if (listQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-40 rounded-lg" />
      </div>
    )
  }

  if (listQuery.isError) {
    return (
      <p className="text-destructive text-sm">
        هەڵە لە هێنانی لینکەکان. دووبارە هەوڵ بدەرەوە.
      </p>
    )
  }

  const rows = listQuery.data ?? []

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <LinkCard key={row.id} row={row} onDone={() => {}} />
      ))}

      {drafts.map((key) => (
        <LinkCard
          key={`draft-${key}`}
          row={{ ...EMPTY, displayOrder: rows.length }}
          onDone={() => setDrafts((d) => d.filter((x) => x !== key))}
        />
      ))}

      <Button
        variant="outline"
        onClick={() => setDrafts((d) => [...d, Date.now()])}
      >
        <PlusIcon className="size-4" />
        زیادکردنی لینک
      </Button>
    </div>
  )
}
```

## Step 6 — `app/dashboard/settings/social/page.tsx`

```tsx
import Link from "next/link"

import { SocialLinksPanel } from "@/components/settings/social-links-panel"

export default function SocialSettingsPage() {
  return (
    <div dir="rtl" className="mx-auto max-w-3xl space-y-8 px-4 py-6 lg:px-6">
      <nav
        className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm"
        aria-label="breadcrumb"
      >
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          داشبۆرد
        </Link>
        <span aria-hidden className="text-muted-foreground/50">/</span>
        <span className="text-foreground font-medium">سۆشیال میدیا</span>
      </nav>

      <header className="border-border/60 space-y-2 border-b pb-6">
        <h1 className="text-2xl font-semibold tracking-tight">سۆشیال میدیا</h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          لینکەکانی سۆشیال میدیا لێرە بگۆڕە. گۆڕانکاری ڕاستەوخۆ دەچێتە سەر ماڵپەڕ.
        </p>
      </header>

      <SocialLinksPanel />
    </div>
  )
}
```

## Step 7 — put it in the sidebar

In `components/app-sidebar.tsx`, inside the group labelled `t("labels.site")`
(the one that holds `مێنیوی ماڵپەڕ` → `/dashboard/menu`), add:

```tsx
{
  title: "سۆشیال میدیا",
  url: "/dashboard/settings/social",
  icon: <HugeiconsIcon icon={Link01Icon} strokeWidth={2} />,
},
```

Use any icon already imported in that file if `Link01Icon` is not available.

## Step 8 — test list

1. Open `/dashboard/settings/social` → the existing links are listed.
2. Change a URL → **پاشەکەوت** → refresh the page → the new URL is still there.
3. Turn a link off → it stays visible **in the dashboard**, and disappears from the website.
4. Turn it back on → it comes back on the website.
5. Add a link → it appears in the list.
6. Delete a link → it is gone after refresh.
7. Open the website contact page → the new URL is the one being used.

## Notes

- **One row per platform.** A second `FACEBOOK` row is rejected with **409
  Conflict** — that is expected; show "this platform already has a link, edit it
  instead" and edit the existing row.
- **Only a logged-in ADMIN or SUPER_ADMIN can save.** A `403` means the account
  does not have the role.
- **Only `FACEBOOK`, `INSTAGRAM`, `YOUTUBE`, `WHATSAPP` are drawn on the website
  today.** Adding e.g. `TIKTOK` saves fine but shows nothing until the website
  adds the icon for it.
- **The website caches for a short time.** If a change does not appear
  immediately, wait for the cache window or trigger the website's
  `/api/revalidate` with the tag `social` (see the API documentation, §8).
- **The website is already wired.** The contact page and the footer both read
  this endpoint. Until the first row is saved, both fall back to four built-in
  URLs — so the very first save in this page is what switches the site over.
