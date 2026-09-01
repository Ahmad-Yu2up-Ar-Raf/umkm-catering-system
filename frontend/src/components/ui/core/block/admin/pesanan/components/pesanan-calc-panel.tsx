"use client"

import { useStore } from "@tanstack/react-store"
import { HugeiconsIcon } from "@hugeicons/react"
import { Image01Icon } from "@hugeicons/core-free-icons"
import { Skeleton } from "@/components/ui/fragments/shadcn-ui/skeleton"
import type { PesananFormReturnType } from "../hooks/use-pesanan-form"
import { calculateOrder, formatRupiah } from "../utils/pesanan-calculator"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { Badge } from "@/components/ui/fragments/shadcn-ui/badge"
import { cn } from "@/lib/utils"
import type { Paket } from "../../../paket/types/paket-types"
import {
  getCategoryColor,
  getCategoryIcon,
  getAcaraColor,
  getAcaraIcon,
} from "../../../paket/utils/paket-kategori-utils.ts"
import { Separator } from "@/components/ui/fragments/shadcn-ui/separator.tsx"

type CalcPaketDetail = Paket | null

interface CalcPanelProps {
  form: PesananFormReturnType
  paketDetail: CalcPaketDetail
  isLoading: boolean
}

export function PesananCalcPanel({
  form,
  paketDetail,
  isLoading,
}: CalcPanelProps) {
  const jumlah = useStore(form.store, (s) => {
    const state = s as { values: { jumlah_paket: number | null } }
    return state.values.jumlah_paket ?? 0
  })

  const biaya = useStore(form.store, (s) => {
    const state = s as { values: { biaya_tambahan: number | null } }
    return state.values.biaya_tambahan ?? 0
  })

  const hargaSatuan = Number(paketDetail?.harga_per_porsi ?? 0)
  const preview = calculateOrder(
    Number(jumlah) || 0,
    hargaSatuan,
    Number(biaya) || 0
  )
  const categoryIcon =
    paketDetail && getCategoryIcon(paketDetail.kategori_paket)
  const categoryColor =
    paketDetail && getCategoryColor(paketDetail.kategori_paket)
  // Skeleton matches final layout pixel-perfect to prevent CLS
  if (isLoading) {
    return (
      <aside className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
        <Skeleton className="h-4 w-32 rounded" />
        {/* Thumbnail skeleton: aspect-square matches final image */}
        <Skeleton className="aspect-[4/3] w-full rounded-xl" />
        <div className="flex flex-col gap-2 border-b border-border pb-3">
          <div className="flex justify-between gap-4">
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <div className="flex justify-between gap-4">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          <div className="flex justify-between gap-4">
            <Skeleton className="h-4 w-12 rounded" />
            <Skeleton className="h-4 w-10 rounded" />
          </div>
          <div className="flex justify-between gap-4">
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
        </div>
        <div className="flex items-baseline justify-between pt-1">
          <Skeleton className="h-4 w-10 rounded" />
          <Skeleton className="h-7 w-28 rounded" />
        </div>
        <Skeleton className="h-3 w-full rounded" />
      </aside>
    )
  }

  return (
    <>
      {/* <p className="text-gold-deep mb-6 flex items-center gap-3.5 text-[11px] font-normal tracking-[0.28em] uppercase">
        <div aria-hidden="true" className="h-px w-10 bg-primary" />
        <h3 className="text-primary">Ringakasa Pemesanan</h3>
      </p> */}
      <div className="sticky top-0 hidden h-fit flex-col gap-3 rounded-2xl bg-muted/30 p-6 ring ring-border/80 lg:flex">
        {/* Thumbnail + Name — only when a package is selected */}
        {paketDetail ? (
          <>
            <div className="flex flex-col gap-3">
              <div className="w-full overflow-hidden rounded-xl border border-border bg-muted">
                {paketDetail.thumbnail ? (
                  <MediaItem
                    webViewLink={paketDetail.thumbnail}
                    alt={paketDetail.nama_paket}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : null}
                {/* Fallback placeholder — always in DOM for CLS stability, toggled via display */}
                <div
                  className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground"
                  style={{ display: paketDetail.thumbnail ? "none" : "flex" }}
                >
                  <HugeiconsIcon
                    icon={Image01Icon}
                    className="size-8 opacity-60"
                  />
                </div>
              </div>
              <div className="mt-2 space-y-3">
                <Badge
                  icon={categoryIcon!}
                  variant="outline"
                  className={cn(
                    "w-fit gap-2 border-0 text-accent-foreground shadow-none lg:text-xs [&_svg]:size-4",
                    categoryColor,
                    "hover:bg-transparent"
                  )}
                >
                  <span className="font-medium capitalize">
                    {paketDetail.kategori_paket}
                  </span>
                </Badge>
                <p className="mb-0 font-heading text-2xl font-medium tracking-tight text-foreground">
                  {paketDetail.nama_paket}
                </p>
              </div>
            </div>
            {/* <Separator /> */}
          </>
        ) : null}

        <div className="flex flex-col gap-4 border-t border-b border-border py-6 text-sm tracking-wider">
          {/* <Row label="Paket" value={paketDetail?.nama_paket ?? "—"} /> */}
          <Row label="Harga/satuan" value={formatRupiah(hargaSatuan)} />
          <Row
            label="Jumlah"
            value={`× ${Number.isFinite(jumlah) ? jumlah : 0}`}
          />
          <Row label="Subtotal" value={formatRupiah(preview.subtotal)} />
          <Row
            label="Biaya tambahan"
            value={formatRupiah(preview.biayaTambahan)}
          />
        </div>
        <div className="flex items-baseline justify-between pt-0">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-heading text-xl font-bold text-primary">
            {formatRupiah(preview.total)}
          </span>
        </div>
        <p className="sr-only text-xs text-muted-foreground/50">
          Total final dihitung ulang oleh server saat disimpan.
        </p>
      </div>
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  )
}
