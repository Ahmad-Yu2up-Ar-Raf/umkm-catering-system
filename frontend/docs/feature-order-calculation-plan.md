<!-- Context Anchor & Monorepo Topology -->
> **Scope:** Feature Plan — "Kalkulator Pesanan" (Order Calculation Modal, sitemap #3.1 conversion step) · **Monorepo Root:** `../../`
>
> Companion docs: [Design (single source)](../docs/design.md) · [Frontend Architecture](../frontend/docs/architecture.md) · [Design System MASTER](../frontend/design-system/MASTER.md) · [Paket Detail Contract](../frontend/docs/paket-detail-page-plan.md) · [Backend API](../backend/docs/api-collection.md) · [Backend DB](../backend/docs/database.md) · [Root Architecture (userflow §3.1)](../../docs/architecture.md)
>
> **Status: PLANNING — validated discovery pass. No production code changes until implementation phase.**

---

# Order Calculation Modal — Implementation Plan

## 1. Executive Summary

The Paket Detail page (`/paket/:id`, sitemap #3.1) is the conversion step in the customer flow
`Catalog → Detail → Kalkulator Porsi → WhatsApp` (root `docs/architecture.md` §3.1 — the calculator
node is already in the official userflow diagram; the detail-page contract deferred it to "when the
client asks", §30 of `paket-detail-page-plan.md` — this task is that ask).

The goal: **replace the direct WhatsApp CTA in `DetailSummary`** with an interactive order
calculation dialog that collects the order details, computes a live estimate, and on submit opens
the `wa.me` deep link with a **fully prefilled, structured message** — eliminating the manual
"Admin, saya mau pesan…" back-and-forth.

| Pillar | Decision (short) |
|---|---|
| **Trigger** | `OriginButton` "Pesan via WhatsApp" → wraps a Shadcn `DialogTrigger` (asChild). No href anymore — opens the modal. |
| **Surface** | Shadcn `Dialog` (Radix) — dark fixed overlay (`bg-black/80`), `rounded-4xl` warm-cream panel, built-in `data-open` fade/zoom (tw-animate-css) — the same dialog grammar as `ShareDialog` / admin, the same dark-ink family as `GlobalImageModal`. |
| **Layout** | Desktop `lg:grid-cols-[0.9fr_1.1fr]`: LEFT product image + live price breakdown (summary panel), RIGHT the form. Mobile: single column, form first, sticky price footer. |
| **Form stack** | **@tanstack/react-form** via the existing `useAppForm` (`src/hooks/use-form.ts`) + Zod factory schema — NOT react-hook-form (explicitly forbidden by AGENTS.md; the repo's form pattern is TanStack Form, proven by `use-auth.ts`). |
| **Calculation** | Pure function, derived state: `base = jumlah_porsi × Number(harga_per_porsi)`. Add-on names are listed but **never priced** (no add-on price data exists — see §4.3). Estimate is honest: "belum termasuk biaya tambahan". |
| **Validation** | Zod factory `createOrderSchema({ minOrder, capacity, addonOptions })` — mirrors the `login-schema.ts` pattern, parametrized by package runtime values. |
| **Payload** | Multiline WhatsApp message (structured bullet list) → `getWhatsAppLink(BUSINESS_NUMBER, msg)` → `window.open(url, "_blank", "noopener")`. |
| **New deps** | **None.** Everything needed is installed (`@tanstack/react-form`, `zod`, `date-fns`, `radix-ui`, `framer-motion`, Hugeicons, `ky`, TanStack Query). |
| **Backend** | **No changes.** Server still owns `total_harga` on `pesanan` creation; the modal total is a UX-only preview per root AGENTS.md §4. |

---

## 2. Project Overview & Business Goals

### 2.1 Who / What / Why (from `docs/project-context.md` + root `docs/architecture.md`)

- **Business:** UMKM catering ("Catering Nusantara") selling home-cooked Nusantara catering
  (Nasi Box, Prasmanan, Snack Box, Tumpeng) with conversion happening **entirely over WhatsApp**.
- **Customer flow (§3.1):** Home → Katalog → **Detail Paket → Kalkulator Porsi → Pesan via WhatsApp**.
- **Admin flow (§3.2):** The WhatsApp message becomes the **manual input** to the admin Mini POS —
  the cleaner the message, the less re-typing and arithmetic the admin does.

### 2.2 Goals

1. **Reduce friction:** customer picks package → fills 5 fields → gets a structured WA message
   pre-sent to the business number. No "apa yang mau dipesan?" round-trip.
2. **Reduce admin error:** the WA payload mirrors the admin POS input shape
   (`nama_pemesan`, `jumlah_paket`, `detail_tambahan` as a list, `catatan`) so transcribing is
   copy-paste, not interpretation.
3. **Honest estimate:** show a live, deterministic base estimate (`qty × harga_per_porsi`) with an
   explicit "biaya tambahan dikonfirmasi via WhatsApp" note — **never fabricate add-on prices**
   (Hallmark gate 46 honest copy; root rule "never trust frontend numbers as financial truth").

### 2.3 Non-goals (this task does NOT)

- Creating a `pesanan` server record (that's the admin POS; the public site only converts to WA).
- Add-on pricing in the data model (needs a backend schema change — out of scope, §8.3).
- Cart / multi-package ordering (business model is single-package inquiry).
- Any new route/page (sitemap lock — modal lives on the existing detail page).

---

## 3. Technical Architecture & Stack

### 3.1 Stack (all already installed — verified in `package.json`)

| Concern | Tool | Where it's already used |
|---|---|---|
| Form state + validation | `@tanstack/react-form` v1 + `zod` | `src/hooks/use-form.ts`, `use-auth.ts`, `login-schema.ts` |
| HTTP | `ky` (via `src/api/client.ts`) | every query/mutation |
| Server data | TanStack Query v5 | `use-detail-query.ts`, `use-paket-query.ts` |
| Dialog | `radix-ui` Dialog via `src/components/ui/fragments/shadcn-ui/dialog.tsx` | `ShareDialog`, admin |
| Date picker | `react-day-picker` via `calendar.tsx` + `FormDateInput` (date-fns formatting, `id` locale) | admin forms (built, registered in this task) |
| Motion | `framer-motion` (dialog entrance optional) + `tw-animate-css` (Radix data-state) | `GlobalImageModal`, reveals |
| Icons | `@hugeicons/react` + `@hugeicons/core-free-icons` | everywhere (zero lucide) |
| Currency | `Intl.NumberFormat("id-ID", …)` — repo convention: one-liner per consumer, no shared module | `detail-view-model.ts` |

### 3.2 Data flow

```
PaketDetailBlock (query: ["paket","detail",id])
   → toDetailViewModel(paket)          // ADD: raw minOrder + capacity to the VM
      → DetailContent
         → DetailSummary               // trigger swap (§5.3)
            → OrderCalculationDialog   // Radix Dialog
               ├─ OrderSummaryPanel    // left rail: MediaItem + live breakdown
               └─ OrderForm            // useAppForm + zod factory
                    ├─ useOrderCalculator(vm, values)   // pure derived calc
                    └─ onSubmit → buildWaOrderMessage → getWhatsAppLink → window.open
```

### 3.3 Directory map (new files)

```
src/components/ui/core/block/detail/
├── components/
│   ├── order-calculation-dialog.tsx   # Dialog shell + 2-col grid (NEW)
│   ├── order-summary-panel.tsx        # Left rail: image + live price breakdown (NEW)
│   ├── order-form.tsx                 # useAppForm wiring + WA submit (NEW)
│   └── detail-summary.tsx             # MODIFIED: trigger swap only
├── utils/
│   ├── detail-view-model.ts           # MODIFIED: expose minOrder:number, capacity:number|null (additive)
│   └── order-calculator.ts            # NEW: pure calc + formatIDR + WA message builder
└── validations/
    └── order-schema.ts                # NEW: createOrderSchema factory (zod)

src/hooks/use-form.ts                  # MODIFIED: register TextArea / DateInput / CheckboxGroup
```

Mirrors the existing detail convention: `components/` + `utils/`; no new top-level folders, no new
stores (dialog open state is local to `DetailSummary` — per architecture §3, transient UI state).

---

## 4. Validation & Calculation Logic

### 4.1 The data reality (critical discovery)

Verified against `PaketSeeder.php` and `PaketResource`:

- `menu_tambahan` is a **plain `string[]` of names** — `["Kerupuk", "Acar"]`, `["Puding", "Es Buah"]`,
  `["Risoles", "Lumpia", "Kue Lapis", "Pastel"]`, … — **no prices attached**.
- `pesanan.biaya_tambahan` exists on the backend (default 0) but there is **no source field** for
  add-on unit prices anywhere in the 4-table schema.
- `HargaService::totalHarga = (jumlah_paket × harga_paket_satuan) + biaya_tambahan` — the add-on
  term is server-decided at order time.

**Consequence:** the task's formula `(Jumlah Porsi × harga_per_porsi) + add-on prices` **cannot be
computed truthfully** for add-ons today. The design therefore:

1. Computes the deterministic `base = qty × harga_per_porsi` live (this is real and safe).
2. Lists the selected add-ons (names) in the message and shows them in the breakdown as
   "dikonfirmasi via WhatsApp" — no fabricated numbers (root AGENTS.md: never trust frontend
   numbers; design.md §10 honest copy).
3. The single estimate line reads `Estimasi: Rp440.000 (belum termasuk biaya tambahan)`.

### 4.2 `menu_tambahan` vs "Lauk Pelengkap" vs "Menu Tambahan"

The task names two add-on groups ("Lauk Pelengkap" checkbox group + "Menu Tambahan" multi-select)
but both would read from the **same single source** — `paket.menu_tambahan` (the VM's `menuExtra`).
There is no second add-on list in the data model. Decision:

- Render **one** add-on group from `vm.menuExtra ?? []` using the existing `FormCheckboxGroup`
  (a multi-select checkbox list — satisfies both "checkbox group" and "multi-select" in one
  control, zero new UI code).
- Label it `Lauk Pelengkap / Menu Tambahan` — matching the label the package already uses on the
  detail page (`DetailMenu` renders the same list as "Lauk / Pelengkap").
- A free-text `Catatan` field covers special requests (additional menu wishes) — the current
  business handles those ad-hoc via WhatsApp anyway.

### 4.3 Zod schema blueprint (factory — mirrors `login-schema.ts` style)

```ts
// validations/order-schema.ts
import * as z from "zod"
import { isMatch, isValid, parse } from "date-fns"

/** Package runtime values injected at form-creation time (per-package validation). */
export interface OrderSchemaParams {
  minOrder: number
  capacity: number | null          // null → no upper bound
  addonOptions: string[]           // vm.menuExtra ?? []
}

const YYYY_MM_DD = /^\d{4}-\d{2}-\d{2}$/

export const createOrderSchema = ({
  minOrder,
  capacity,
  addonOptions,
}: OrderSchemaParams) =>
  z.object({
    nama_pemesan: z
      .string()
      .trim()
      .min(3, "Nama wajib diisi minimal 3 karakter"),
    lokasi_acara: z
      .string()
      .trim()
      .min(5, "Lokasi acara wajib diisi"),
    tanggal_acara: z
      .string()
      .trim()
      .refine((v) => YYYY_MM_DD.test(v) && isValid(parse(v, "yyyy-MM-dd", new Date())), {
        message: "Tanggal acara tidak valid",
      })
      .refine(
        (v) =>
          parse(v, "yyyy-MM-dd", new Date()) >=
          new Date(new Date().setHours(0, 0, 0, 0)),
        { message: "Tanggal acara tidak boleh di masa lalu" }
      ),
    jumlah_porsi: z
      .number({ message: "Jumlah porsi wajib diisi" })
      .int("Jumlah porsi harus bilangan bulat")
      .min(minOrder, `Minimal ${minOrder} porsi`),
    lauk_pelengkap: z
      .array(z.string())
      .max(addonOptions.length, "Pilihan tidak valid")
      .default([]),
    catatan: z.string().max(500, "Catatan maksimal 500 karakter").trim().optional().default(""),
  })
  // capacity bound applied conditionally (null = unlimited)
  .superRefine((val, ctx) => {
    if (capacity != null && val.jumlah_porsi > capacity) {
      ctx.addIssue({
        path: ["jumlah_porsi"],
        code: z.ZodIssueCode.custom,
        message: `Melebihi kapasitas produksi (maks. ${capacity} porsi)`,
      })
    }
  })

export type OrderFormValues = z.infer<ReturnType<typeof createOrderSchema>>
```

Notes:

- `FormInput` with `inputMode="numeric"` + `type="number"` stores a real `number` — so
  `z.number()` (not `z.coerce`) matches, same as the existing form components.
- `FormDateInput` stores `"yyyy-MM-dd"` strings (its `handleSelect` formats via date-fns) — the
  schema validates that exact shape.
- `superRefine` keeps the capacity check explicit and gives a per-field error path.
- `loginSchema` uses plain `z.object(...)` passed straight to `validators.onSubmit`; the factory
  does the same, just parametrized — consistent with repo pattern (TanStack Form v1 accepts
  standard-schema validators; zod ≥3.25 implements the interface natively — proven by the
  existing auth flow).

### 4.4 Calculation engine (pure, derived — no state)

```ts
// utils/order-calculator.ts
/** Repo convention: Intl formatter, local to the consumer. */
export const formatIDR = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)

export interface OrderCalcInput {
  jumlahPorsi: number
  hargaPerPorsi: number          // Number(vm price) — decimal:2 string normalized at the VM
  laukPelengkap: string[]
}

export interface OrderCalcResult {
  baseTotal: number
  hasPrice: boolean
  totalLabel: string             // "Rp 440.000" — add-on note rendered by the UI
  addons: string[]
}

/** Deterministic, derived-only. Server still owns the final total_harga. */
export const calculateOrder = ({
  jumlahPorsi,
  hargaPerPorsi,
  laukPelengkap,
}: OrderCalcInput): OrderCalcResult => {
  const baseTotal = jumlahPorsi * hargaPerPorsi
  return {
    baseTotal,
    hasPrice: Number.isFinite(baseTotal) && baseTotal > 0,
    totalLabel: formatIDR(baseTotal),
    addons: laukPelengkap,
  }
}
```

Derivation in the form (no effect, no memo needed beyond TanStack Form's store):

```tsx
const values = useStore(form.baseStore, (s) => s.values)
const calc = useMemo(
  () => calculateOrder({
    jumlahPorsi: values.jumlah_porsi || 0,
    hargaPerPorsi: vm.hargaPerPorsi,      // added to the VM (raw number)
    laukPelengkap: values.lauk_pelengkap,
  }),
  [values.jumlah_porsi, values.lauk_pelengkap, vm.hargaPerPorsi]
)
```

### 4.5 WhatsApp payload builder

```ts
// utils/order-calculator.ts (same file — one pure module)
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"
import type { OrderFormValues } from "../validations/order-schema"
import type { DetailViewModel } from "./detail-view-model"

export const buildWaOrderMessage = (
  values: OrderFormValues,
  vm: DetailViewModel,
  totalLabel: string
): string =>
  [
    `Halo Catering Nusantara, saya ingin memesan:`,
    `• Paket: ${vm.name}`,
    `• Tanggal acara: ${format(parse(values.tanggal_acara, "yyyy-MM-dd", new Date()), "dd MMMM yyyy", { locale: localeID })}`,
    `• Lokasi acara: ${values.lokasi_acara}`,
    `• Jumlah: ${values.jumlah_porsi} porsi`,
    values.lauk_pelengkap.length > 0
      ? `• Lauk pelengkap: ${values.lauk_pelengkap.join(", ")}`
      : null,
    `• Estimasi: ${totalLabel} (belum termasuk biaya tambahan — mohon konfirmasi)`,
    values.catatan ? `• Catatan: ${values.catatan}` : null,
  ]
    .filter(Boolean)
    .join("\n")
```

Submit handler (in `order-form.tsx`, following `use-auth.ts` conventions):

```tsx
onSubmit: async ({ value }) => {
  const msg = buildWaOrderMessage(value, vm, calc.totalLabel)
  window.open(getWhatsAppLink(BUSINESS_NUMBER, msg), "_blank", "noopener")
  toast.success("Pesanan dikirim ke WhatsApp — admin akan mengonfirmasi")
  onSuccess()                       // close the dialog
},
```

---

## 5. Component Design & Layout

### 5.1 Dialog shell (Radix, existing grammar — no new motion code)

```tsx
// components/order-calculation-dialog.tsx
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/fragments/shadcn-ui/dialog"
import type { DetailViewModel } from "../utils/detail-view-model"
import { OrderSummaryPanel } from "./order-summary-panel"
import { OrderForm } from "./order-form"

export function OrderCalculationDialog({
  open,
  onOpenChange,
  vm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  vm: DetailViewModel
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl gap-0 overflow-hidden p-0 sm:max-w-4xl"
        showCloseButton
      >
        <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          {/* LEFT — product + live total (desktop only; mobile collapses) */}
          <OrderSummaryPanel vm={vm} />
          {/* RIGHT — form (scrollable on short viewports) */}
          <div className="max-h-[85svh] overflow-y-auto p-6 md:p-8">
            <DialogHeader className="mb-2">
              <DialogTitle className="font-heading text-2xl">{vm.name}</DialogTitle>
              <DialogDescription>
                Lengkapi detail pesanan — estimasi dihitung otomatis.
              </DialogDescription>
            </DialogHeader>
            <OrderForm vm={vm} onSuccess={() => onOpenChange(false)} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

Design alignment:

- **Backdrop:** `DialogOverlay` is `bg-black/80` + `backdrop-blur-xs` — the same ink-dark family
  as `GlobalImageModal`'s `bg-zinc-950/92 backdrop-blur-sm`; the modal "reads" as one system.
- **Surface:** `bg-popover rounded-4xl ring-1 ring-foreground/5` — warm cream, matches
  `ShareDialog`/admin dialogs. No hardcoded colors.
- **Animation:** Radix `data-open:animate-in fade-in-0 zoom-in-95` (100ms, tw-animate-css) — the
  project's established dialog language. No extra Framer needed; nothing to bounce.
- **Close:** the default ghost close button (top-right, `Cancel01Icon`) — matches the lightbox's
  position, smaller footprint. ESC + backdrop click close come free from Radix.
- **Typography:** `DialogTitle` is already `font-heading` (Fraunces); body copy Space Grotesk.

### 5.2 Left summary panel

```tsx
// components/order-summary-panel.tsx
"use client"

import { useMemo } from "react"
import { useStore } from "@tanstack/react-store"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { Separator } from "@/components/ui/fragments/shadcn-ui/separator"
import { useFieldContext, useFormContext } from "@/hooks/use-form"
import { formatIDR, calculateOrder } from "../utils/order-calculator"
import type { DetailViewModel } from "../utils/detail-view-model"

/** Left rail — package photo + live estimate. Reads form state directly. */
export function OrderSummaryPanel({ vm }: { vm: DetailViewModel }) {
  const { form } = useFormContext()
  const values = useStore(form.baseStore, (s) => s.values)

  const calc = useMemo(
    () =>
      calculateOrder({
        jumlahPorsi: values.jumlah_porsi || 0,
        hargaPerPorsi: vm.hargaPerPorsi,
        laukPelengkap: values.lauk_pelengkap,
      }),
    [values.jumlah_porsi, values.lauk_pelengkap, vm.hargaPerPorsi]
  )

  return (
    <aside className="hidden flex-col lg:flex">
      <div className="relative aspect-[4/3] overflow-hidden">
        <MediaItem
          webViewLink={vm.gallery[0] ?? DETAIL_FALLBACK_IMAGE}
          alt={vm.name}
          layout="fullWidth"
          sizes="40vw"
        />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6 md:p-8">
        <p className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          {vm.name}
        </p>
        <dl className="flex flex-col gap-3">
          <div className="flex justify-between gap-3">
            <dt className="text-xs tracking-widest text-muted-foreground uppercase">Harga dasar</dt>
            <dd className="text-sm font-medium text-foreground">{vm.priceLabel} / porsi</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-xs tracking-widest text-muted-foreground uppercase">Jumlah porsi</dt>
            <dd className="text-sm font-medium text-foreground">{values.jumlah_porsi || "—"}</dd>
          </div>
        </dl>
        <Separator />
        <div className="flex items-end justify-between gap-3">
          <dt className="text-xs tracking-widest text-muted-foreground uppercase">Estimasi</dt>
          <dd className="font-sans text-3xl font-semibold tracking-tight text-foreground">
            {calc.hasPrice ? calc.totalLabel : "—"}
          </dd>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Belum termasuk biaya tambahan — admin mengonfirmasi via WhatsApp.
        </p>
      </div>
    </aside>
  )
}
```

Mobile fallback: the same estimate block renders as a **sticky footer bar** under the form
(`sticky bottom-0 bg-popover/95 backdrop-blur`) — detail decided at build; one component, two
layouts. Touch targets ≥44px (design.md §8).

### 5.3 Trigger swap in `DetailSummary` (the only modification to existing code)

Current (lines 142–150 of `detail-summary.tsx`):

```tsx
<OriginButton
  href={whatsappHref}
  intensity={0.8}
  range={120}
  className="group w-full text-xs tracking-widest uppercase md:bg-secondary/20"
>
  <HugeiconsIcon icon={WhatsappIcon} className="size-5" />
  Pesan via WhatsApp
</OriginButton>
```

Becomes:

```tsx
const [orderOpen, setOrderOpen] = useState(false)

// …and later, replacing the CTA block:
<Dialog open={orderOpen} onOpenChange={setOrderOpen}>
  <DialogTrigger asChild>
    <OriginButton
      intensity={0.8}
      range={120}
      className="group w-full text-xs tracking-widest uppercase md:bg-secondary/20"
    >
      <HugeiconsIcon icon={WhatsappIcon} className="size-5" />
      Pesan via WhatsApp
    </OriginButton>
  </DialogTrigger>
  <OrderCalculationDialog open={orderOpen} onOpenChange={setOrderOpen} vm={vm} />
</Dialog>
```

- `OriginButton` without `href` renders `motion.button` (type="button" default — safe inside
  Radix's asChild), and it forwards refs → `DialogTrigger asChild` composes cleanly. The magnet
  + origin-fill behavior is preserved; only the destination changes.
- `whatsappHref` (the old static link) moves into the modal's submit path. The static
  "info ketersediaan" message is replaced by the structured order message (§4.5).
- `Dialog` root is placed **outside** the `motion.div` price/CTA group so mount animation of the
  summary is unaffected.

### 5.4 Form component (TanStack Form — the repo pattern)

```tsx
// components/order-form.tsx
"use client"

import { useMemo } from "react"
import { useStore } from "@tanstack/react-store"
import { toast } from "sonner"

import { useAppForm } from "@/hooks/use-form"
import { FieldGroup } from "@/components/ui/fragments/shadcn-ui/field"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { Spinner } from "@/components/ui/fragments/shadcn-ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserIcon, Location01Icon, Calendar01Icon,
  NumberIcon, Dish01Icon, WhatsappIcon,
} from "@hugeicons/core-free-icons"

import { createOrderSchema } from "../validations/order-schema"
import { calculateOrder, buildWaOrderMessage } from "../utils/order-calculator"
import { getWhatsAppLink, BUSINESS_NUMBER } from "@/lib/whatsapp"
import type { DetailViewModel } from "../utils/detail-view-model"

export function OrderForm({
  vm,
  onSuccess,
}: {
  vm: DetailViewModel
  onSuccess: () => void
}) {
  const form = useAppForm({
    validators: {
      onSubmit: createOrderSchema({
        minOrder: vm.minOrder,
        capacity: vm.capacity,
        addonOptions: vm.menuExtra ?? [],
      }),
    },
    defaultValues: {
      nama_pemesan: "",
      lokasi_acara: "",
      tanggal_acara: "",
      jumlah_porsi: vm.minOrder,
      lauk_pelengkap: [],
      catatan: "",
    },
    onSubmit: async ({ value }) => {
      const calc = calculateOrder({
        jumlahPorsi: value.jumlah_porsi,
        hargaPerPorsi: vm.hargaPerPorsi,
        laukPelengkap: value.lauk_pelengkap,
      })
      const msg = buildWaOrderMessage(value, vm, calc.totalLabel)
      window.open(getWhatsAppLink(BUSINESS_NUMBER, msg), "_blank", "noopener")
      toast.success("Pesanan dikirim ke WhatsApp — admin akan mengonfirmasi")
      onSuccess()
    },
  })

  const values = useStore(form.baseStore, (s) => s.values)
  const isSubmitting = useStore(form.baseStore, (s) => s.isSubmitting)

  const calc = useMemo(
    () =>
      calculateOrder({
        jumlahPorsi: values.jumlah_porsi || 0,
        hargaPerPorsi: vm.hargaPerPorsi,
        laukPelengkap: values.lauk_pelengkap,
      }),
    [values.jumlah_porsi, values.lauk_pelengkap, vm.hargaPerPorsi]
  )

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="flex flex-col gap-6"
    >
      <FieldGroup className="gap-5">
        <form.AppField name="nama_pemesan">
          {(field) => (
            <field.Input LeftIcon={UserIcon} placeholder="Nama lengkap Anda" />
          )}
        </form.AppField>

        <form.AppField name="lokasi_acara">
          {(field) => (
            <field.TextArea LeftIcon={Location01Icon} placeholder="Alamat / lokasi acara" />
          )}
        </form.AppField>

        <form.AppField name="tanggal_acara">
          {(field) => (
            <field.DateInput LeftIcon={Calendar01Icon} disablePast placeholder="Pilih tanggal acara" />
          )}
        </form.AppField>

        <form.AppField name="jumlah_porsi">
          {(field) => (
            <field.Input
              LeftIcon={NumberIcon}
              type="number"
              inputMode="numeric"
              placeholder="Jumlah porsi"
            />
          )}
        </form.AppField>

        {vm.menuExtra && vm.menuExtra.length > 0 && (
          <form.AppField name="lauk_pelengkap">
            {(field) => (
              <field.CheckboxGroup
                label="Lauk Pelengkap / Menu Tambahan"
                options={vm.menuExtra!.map((item) => ({ label: item, value: item }))}
              />
            )}
          </form.AppField>
        )}

        <form.AppField name="catatan">
          {(field) => (
            <field.TextArea LeftIcon={Dish01Icon} placeholder="Catatan (opsional) — mis. alergi, menu khusus" />
          )}
        </form.AppField>
      </FieldGroup>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-xs tracking-widest text-muted-foreground uppercase">Estimasi</span>
          <span className="font-sans text-2xl font-semibold text-foreground">
            {calc.hasPrice ? calc.totalLabel : "—"}
          </span>
        </div>
        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full cursor-pointer">
          <HugeiconsIcon icon={WhatsappIcon} className="size-5" />
          <span className="font-bold">Kirim ke WhatsApp</span>
          {isSubmitting && <Spinner className="text-primary-foreground" />}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Belum termasuk biaya tambahan — dikonfirmasi admin via WhatsApp.
        </p>
      </div>
    </form>
  )
}
```

### 5.5 Registration change in `src/hooks/use-form.ts`

```ts
import { FormInput } from "@/components/ui/fragments/custom-ui/form/form-input"
import { FormTextArea } from "@/components/ui/fragments/custom-ui/form/form-textarea"
import { FormDateInput } from "@/components/ui/fragments/custom-ui/form/form-date-input"
import { FormCheckboxGroup } from "@/components/ui/fragments/custom-ui/form/form-checkbox-group"

const { useAppForm } = createFormHook({
  fieldComponents: {
    Input: FormInput,
    TextArea: FormTextArea,
    DateInput: FormDateInput,
    CheckboxGroup: FormCheckboxGroup,
  },
  formComponents: {},
  fieldContext,
  formContext,
})
```

`FormTextArea` / `FormDateInput` / `FormCheckboxGroup` already exist and are wired to
`useFieldContext`; they are merely unregistered today. This change is additive — auth forms
keep working.

### 5.6 View model additions (additive, zero breakage)

`DetailViewModel` gains three raw values consumed by the schema factory + calculator:

```ts
export interface DetailViewModel {
  // …existing fields…
  /** RAW numeric values for the order modal (formatted labels already exist). */
  minOrder: number
  capacity: number | null
  hargaPerPorsi: number
}

// in toDetailViewModel():
minOrder: paket.min_order,
capacity: paket.kapasitas_produksi,
hargaPerPorsi: Number(paket.harga_per_porsi),
```

---

## 6. Calculation Flow Diagram

```
┌─ PaketDetailBlock ─────────────────────────────────────────────┐
│  FetchPaketDetail(id) → Paket → toDetailViewModel(vm)          │
└───────────────────────────────┬────────────────────────────────┘
                                ▼
┌─ DetailSummary ───────────────┴────────────────────────────────┐
│  OriginButton "Pesan via WhatsApp"                              │
│    └─ (was: <a href=wa.me> — now) DialogTrigger asChild         │
└───────────────────────────────┬────────────────────────────────┘
                                ▼ open
┌─ OrderCalculationDialog (Radix Dialog, bg-black/80 overlay) ────┐
│  grid lg:grid-cols-[0.9fr_1.1fr]                                │
│  ├─ LEFT  OrderSummaryPanel                                     │
│  │        MediaItem(vm.gallery[0]) + live breakdown             │
│  └─ RIGHT OrderForm (useAppForm + createOrderSchema factory)    │
│           nama_pemesan · lokasi_acara · tanggal_acara           │
│           jumlah_porsi (≥minOrder, ≤capacity)                   │
│           lauk_pelengkap[] (FormCheckboxGroup) · catatan        │
│                │  form.baseStore values (subscription)          │
│                ▼                                                │
│        calculateOrder (PURE, derived, no state)                 │
│        base = jumlah_porsi × Number(harga_per_porsi)            │
│        totalLabel = formatIDR(base)   [add-ons NOT priced]      │
│                │                                                │
│                ├──► live re-render: LEFT panel + estimate line  │
│                ▼                                                │
│        submit → zod factory validates (minOrder/capacity/etc.)  │
│                │ invalid → field errors (submissionAttempts>0)  │
│                │ valid                                           │
│                ▼                                                │
│        buildWaOrderMessage(values, vm, totalLabel)              │
│        getWhatsAppLink(BUSINESS_NUMBER, msg)                    │
│        window.open(url, "_blank", "noopener")                   │
│        toast.success → onOpenChange(false)                      │
└─────────────────────────────────────────────────────────────────┘

Server truth (untouched): admin POS creates `pesanan` → HargaService recomputes
total_harga = (jumlah_paket × harga_paket_satuan) + biaya_tambahan. Frontend
estimate is UX-only preview (root AGENTS.md §4).
```

---

## 7. Integration Plan (phases)

| Phase | Scope | Files | Gate |
|---|---|---|---|
| **0 — Preflight** | Verify form primitives; register `TextArea`/`DateInput`/`CheckboxGroup` in `use-form.ts`; token pass on `form-date-input.tsx` (see §8.2 — green → `primary`) | `hooks/use-form.ts`, `fragments/custom-ui/form/form-date-input.tsx` | `typecheck` |
| **1 — Types & schema** | `order-schema.ts` factory; VM additions (`minOrder`/`capacity`/`hargaPerPorsi`) | `validations/order-schema.ts`, `utils/detail-view-model.ts` | `typecheck` |
| **2 — Calculator** | `order-calculator.ts` (pure calc + `formatIDR` + WA builder) | `utils/order-calculator.ts` | `typecheck` |
| **3 — Dialog shell** | `order-calculation-dialog.tsx` (2-col grid, scrollable form column) + `order-summary-panel.tsx` | 2 new components | `typecheck && lint:design` |
| **4 — Form** | `order-form.tsx` (useAppForm, live calc, validation) | `components/order-form.tsx` | `typecheck && lint` |
| **5 — Trigger swap** | `DetailSummary`: OriginButton → `DialogTrigger asChild` + mount dialog | `components/detail-summary.tsx` | `typecheck && lint && lint:design` |
| **6 — Motion/UX polish** | mobile sticky estimate bar, focus/ESC checks, reduced-motion, 375/768/1024/1440 | dialog + panel | `lint:design` + manual |
| **7 — Verification** | Full checklist (§9) | — | all three gates `[]` + browser |

---

## 8. Risk Assessment & Mitigation

| Risk | Severity | Mitigation |
|---|---|---|
| **Add-on prices don't exist in the data model** (§4.1) — the requested formula's `+ add-on prices` term is uncomputable truthfully | High | Never fabricate. Deterministic base + "belum termasuk biaya tambahan" note + add-on names in the WA message. If the client later adds add-on pricing (backend change), the calculator gains one optional `addonPriceMap` param — the UI copy changes only. |
| **react-hook-form requested, but AGENTS.md forbids it** — the repo's form stack is `@tanstack/react-form` (proven in `use-auth.ts`) | Medium | Use `useAppForm` exactly like auth. This is a spec-vs-codebase contradiction; the plan follows the codebase. |
| **`FormDateInput` uses hardcoded `text-green-500` success tokens** — violates the "tokens only / no green in the warm palette" rule and would look jomplang inside the dialog | Medium | Small token pass in Phase 0 (custom-ui fragment — editable per convention): `border-green-500` → `border-primary`, `text-green-500` → `text-primary`. Zero behavior change. |
| **`DialogContent` default `sm:max-w-md`** would crush the 2-col layout | Low | Override `className="max-w-4xl sm:max-w-4xl"` (already in §5.1). |
| **Long form on short viewports** (mobile landscape) | Low | Right column `max-h-[85svh] overflow-y-auto`; mobile estimate moves to a sticky bottom bar. |
| **`menu_tambahan` null / empty** | Low | `vm.menuExtra ?? []`; checkbox group section omitted when empty (honest omission rule §7.3 of detail contract). |
| **Tumpeng Mini per-package semantics** (`min_order: 10`, price is per portion) | Low | Validation uses `min_order` exactly as the catalog card does ("Min. 10 porsi"); estimate = qty × per-portion price, consistent with the server formula. Label stays "/ porsi" — no invented "/ paket" price. |
| **Dialog stacking vs GlobalImageModal** (both z-50+; lightbox is z-[100] at App root) | Low | Order modal is z-50 (standard Radix); the gallery/lightbox is only reachable behind the dialog backdrop → no stacking conflict. |
| **`harga_per_porsi` 0/NaN** (hand-entered admin rows) | Low | `calculateOrder.hasPrice` guard → `"—"`; submit still allowed (admin confirms price) — matches detail page's existing `hasPrice` behavior. |
| **Reduced motion** | Low | Radix/tw-animate-css fade+zoom is 100ms opacity/scale; verify `prefers-reduced-motion` visually (project standard is manual QA, AGENTS.md §7). |
| **No double-send / double-tab** | Low | `isSubmitting` disables the submit button (TanStack Form `isSubmitting` + `disabled`), same as `LoginForm`. |

---

## 9. Verification Checklist (acceptance)

- [ ] `npm run typecheck && npm run lint && npm run lint:design` — all clean (`lint:design` = `[]`).
- [ ] Trigger: clicking "Pesan via WhatsApp" opens the dialog; the old direct-wa.me behavior is gone.
- [ ] Layout: desktop 2-col (image+breakdown left, form right); mobile single column + sticky estimate; 375/768/1024/1440 no overflow.
- [ ] Live calc: qty change / checkbox toggle updates the estimate instantly (no lag, no submit).
- [ ] Honesty: estimate line says "belum termasuk biaya tambahan"; no fabricated add-on prices anywhere.
- [ ] Validation: empty nama → error; past date → error; qty < `min_order` → error; qty > `kapasitas_produksi` → error (when set); errors appear after first submit attempt (submissionAttempts pattern).
- [ ] Submit: opens `https://wa.me/6287870306031?text=<encoded structured message>` in a new tab with `noopener`; toast fires; dialog closes.
- [ ] Message content: paket, tanggal (dd MMMM yyyy, id-ID), lokasi, jumlah, lauk list, estimasi, catatan — correct.
- [ ] A11y: ESC closes, backdrop click closes, focus trapped, close button labeled, focus returns to trigger; touch targets ≥44px.
- [ ] Reduced motion: no jarring motion; dialog still usable.
- [ ] Dark mode: dialog readable (token-based).
- [ ] No new deps, no backend changes, no changes to shadcn core `ui/` files.

---

## 10. Deliberate Simplifications (ponytail notes)

- **One add-on group** instead of the spec's two (Lauk Pelengkap + Menu Tambahan) — both would read
  the same `menu_tambahan` array; one `FormCheckboxGroup` is the entire UI, zero new code. Add a
  second group only if the client supplies a second list.
- **No zustand store for the dialog** — open state is local to `DetailSummary` (transient UI
  state per architecture §3). A store only earns its keep if a second surface needs to open it.
- **No Framer entrance on the dialog** — Radix's built-in `data-open` fade/zoom is the project's
  dialog grammar; adding AnimatePresence here would be motion-for-motion's-sake (design.md §7).
- **Add-on pricing left out of the calculator** — there is no data for it; a param can be added
  when the backend grows one (see §8 risk row).

*End of plan. Stop — do not modify production code in this pass.*
