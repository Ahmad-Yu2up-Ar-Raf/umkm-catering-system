"use client"

import { useStore } from "@tanstack/react-store"
import type { PesananCreateDrawerFormApi } from "../hooks/use-pesanan-form"
import { calculateOrder, formatRupiah } from "../utils/pesanan-calculator"
import type { PaketSearchOption } from "../types/pesanan-types"

interface CalcPanelProps {
  form: PesananCreateDrawerFormApi
  selectedPaket: PaketSearchOption | null
}

export function PesananCalcPanel({ form, selectedPaket }: CalcPanelProps) {
  const jumlah = useStore(form.store, (s) => s.values.jumlah_paket)
  const biaya = useStore(form.store, (s) => s.values.biaya_tambahan)

  const hargaSatuan = Number(selectedPaket?.harga_per_porsi ?? 0)
  const preview = calculateOrder(jumlah, hargaSatuan, biaya)

  return (
    <aside className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <h3 className="font-heading text-sm font-semibold text-foreground">
        Ringkasan Pesanan
      </h3>
      <div className="flex flex-col gap-2 border-b border-border pb-3 text-sm">
        <Row label="Paket" value={selectedPaket?.nama_paket ?? "—"} />
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