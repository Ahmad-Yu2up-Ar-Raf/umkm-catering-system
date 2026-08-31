"use client"

import { useStore } from "@tanstack/react-store"
import { HugeiconsIcon } from "@hugeicons/react"
import { Image01Icon } from "@hugeicons/core-free-icons"
import { Skeleton } from "@/components/ui/fragments/shadcn-ui/skeleton"
import type { PesananCreateDrawerFormApi } from "../hooks/use-pesanan-form"
import { calculateOrder, formatRupiah } from "../utils/pesanan-calculator"

type CalcPaketDetail = {
  id: number
  nama_paket: string
  thumbnail: string | null
  harga_per_porsi: string
  min_order?: number | null
  kapasitas_produksi?: number | null
} | null

interface CalcPanelProps {
  form: PesananCreateDrawerFormApi
  paketDetail: CalcPaketDetail
  isLoading: boolean
}

export function PesananCalcPanel({ form, paketDetail, isLoading }: CalcPanelProps) {
  const jumlah = useStore(form.store, (s) => {
    const state = s as { values: { jumlah_paket: number } }
    return state.values.jumlah_paket
  })

  const biaya = useStore(form.store, (s) => {
    const state = s as { values: { biaya_tambahan: number } }
    return state.values.biaya_tambahan
  })

  const hargaSatuan = Number(paketDetail?.harga_per_porsi ?? 0)
  const preview = calculateOrder(jumlah, hargaSatuan, biaya)

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
    <aside className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <h3 className="font-heading text-sm font-semibold text-foreground">
        Ringkasan Pesanan
      </h3>

      {/* Thumbnail + Name — only when a package is selected */}
      {paketDetail ? (
        <div className="flex flex-col gap-3">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-muted">
            {paketDetail.thumbnail ? (
              <img
                src={paketDetail.thumbnail}
                alt={paketDetail.nama_paket}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={(e) => {
                  // Graceful fallback: hide broken image, show placeholder
                  const target = e.currentTarget as HTMLImageElement
                  target.style.display = "none"
                  const fallback = target.nextElementSibling as HTMLElement | null
                  if (fallback) fallback.style.display = "flex"
                }}
              />
            ) : null}
            {/* Fallback placeholder — always in DOM for CLS stability, toggled via display */}
            <div
              className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground"
              style={{ display: paketDetail.thumbnail ? "none" : "flex" }}
            >
              <HugeiconsIcon icon={Image01Icon} className="size-8 opacity-60" />
            </div>
          </div>
          <p className="truncate text-sm font-medium text-foreground">
            {paketDetail.nama_paket}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 border-b border-border pb-3 text-sm">
        <Row label="Paket" value={paketDetail?.nama_paket ?? "—"} />
        <Row label="Harga/satuan" value={formatRupiah(hargaSatuan)} />
        <Row label="Jumlah" value={`× ${Number.isFinite(jumlah) ? jumlah : 0}`} />
        <Row label="Subtotal" value={formatRupiah(preview.subtotal)} />
        <Row label="Biaya tambahan" value={formatRupiah(preview.biayaTambahan)} />
      </div>
      <div className="flex items-baseline justify-between pt-1">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="font-heading text-xl font-bold text-primary">
          {formatRupiah(preview.total)}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Total final dihitung ulang oleh server saat disimpan.
      </p>
    </aside>
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
