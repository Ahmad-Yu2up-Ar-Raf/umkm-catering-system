"use client"

import { useStore } from "@tanstack/react-store"

import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { Separator } from "@/components/ui/fragments/shadcn-ui/separator"
import { useFormContext } from "@/hooks/use-form"

import type { DetailViewModel } from "../utils/detail-view-model"
import { DETAIL_FALLBACK_IMAGE } from "../utils/detail-view-model"
import { useMemo } from "react"
import { calculateOrder } from "../utils/order-calculator"
import { Badge } from "@/components/ui/fragments/shadcn-ui/badge"
import { cn } from "@/lib/utils"

/**
 * OrderSummaryPanel — left rail of the order dialog (desktop only).
 *
 * Reads the SAME underlying form state via `useFormContext()` (wrapped by
 * `<form.AppForm>` in `OrderForm`), so the estimate re-renders live as the
 * customer types — zero prop drilling, one subscription.
 *
 * Defaults `jumlah_porsi` to `minOrder`; a blank/0 field renders the
 * estimate as "—" through `calculateOrder.hasPrice`.
 */
export function OrderSummaryPanel({ vm }: { vm: DetailViewModel }) {
  const form = useFormContext()
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
    <aside className="relative">
      <div className="sticky top-0 hidden h-fit flex-col gap-7 rounded-2xl bg-muted/30 p-5 ring ring-border/80 lg:flex">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
          <MediaItem
            webViewLink={vm.gallery[0] ?? DETAIL_FALLBACK_IMAGE}
            alt={vm.name}
            layout="fullWidth"
            sizes="40vw"
          />
        </div>

        <div className="flex flex-1 flex-col gap-5">
          <div className=" space-y-2">
            <Badge
              icon={vm.categoryIcon}
              variant="outline"
              className={cn(
                "w-fit gap-2 border-0 text-accent-foreground shadow-none lg:text-xs [&_svg]:size-4",
                vm.categoryColor,
                "hover:bg-transparent"
              )}
            >
              <span className="font-medium">{vm.categoryLabel}</span>
            </Badge>
            <p className="mb-4 font-heading text-2xl font-medium tracking-tight text-foreground">
              {vm.name}
            </p>
          </div>

          <dl className="flex flex-col gap-4">
            <div className="flex justify-between gap-3">
              <dt className="text-xs tracking-widest text-muted-foreground uppercase">
                Harga dasar
              </dt>
              <dd className="text-sm font-medium text-foreground">
                {vm.priceLabel} / porsi
              </dd>
            </div>
            {/* <div className="flex justify-between gap-3">
              <dt className="text-xs tracking-widest text-muted-foreground uppercase">
                Jumlah porsi
              </dt>
              <dd className="text-sm font-medium text-foreground">
                {values.jumlah_porsi || "—"} Porsi
              </dd>
            </div> */}
            <div className="flex justify-between gap-3">
              <dt className="text-xs tracking-widest text-muted-foreground uppercase">
                Kapasitas produksi
              </dt>
              <dd className="text-sm font-medium text-foreground">
                {vm.capacity != null && vm.capacity > 0
                  ? `Maks. ${vm.capacity} porsi`
                  : "—"}
              </dd>
            </div>
          </dl>

          <Separator />

          <div className="flex items-end justify-between gap-3">
            <dt className="text-xs tracking-widest text-muted-foreground uppercase">
              Estimasi
            </dt>
            <dd className="font-sans text-2xl font-semibold tracking-tight text-foreground">
              {calc.hasPrice ? calc.totalLabel : "—"}
            </dd>
          </div>

          {/* <p className="text-xs leading-relaxed text-muted-foreground">
            Belum termasuk biaya tambahan — admin mengonfirmasi via WhatsApp.
          </p> */}
        </div>
      </div>
    </aside>
  )
}
