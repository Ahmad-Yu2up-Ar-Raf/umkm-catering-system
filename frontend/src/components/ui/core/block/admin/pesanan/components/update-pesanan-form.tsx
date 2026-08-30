"use client"

import type { Pesanan } from "../types/pesanan-types"
import { PESANAN_STATUSES, STATUS_LABELS } from "../types/pesanan-types"
import { formatRupiah } from "../utils/pesanan-calculator"
import { DialogFooter } from "@/components/ui/fragments/shadcn-ui/dialog"

interface UpdatePesananFormProps {
  pesanan: Pesanan
  status: StatusPesanan
  catatan: string
  onStatusChange: (value: StatusPesanan) => void
  onCatatanChange: (value: string) => void
  handleSubmit: () => void
  isUpdating: boolean
  handleCancel: () => void
}

export function UpdatePesananForm({
  pesanan,
  status,
  catatan,
  onStatusChange,
  onCatatanChange,
  handleSubmit,
  isUpdating,
  handleCancel,
}: UpdatePesananFormProps) {
  const statusOptions = PESANAN_STATUSES.map((value) => ({
    value,
    label: STATUS_LABELS[value],
  }))

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <main className="show-scrollbar flex-1 overflow-y-auto overscroll-contain p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-8 max-w-md mx-auto">
          <section>
            <header className="mb-6">
              <h2 className="font-heading text-xl font-semibold">Edit Pesanan</h2>
              <p className="text-sm text-muted-foreground">
                Hanya status dan catatan yang dapat diubah. Data keuangan mengikuti snapshot saat pesanan dibuat.
              </p>
            </header>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <label className="text-sm font-medium text-foreground">Paket</label>
                <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50 border border-border">
                  {pesanan.paket && (
                    <p className="font-medium text-foreground">{pesanan.paket.nama_paket}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Jumlah Paket</label>
                  <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 border border-border">
                    <span className="font-mono text-lg tabular-nums text-foreground">
                      {pesanan.jumlah_paket} porsi
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Harga Satuan (Snapshot)</label>
                  <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 border border-border">
                    <span className="font-mono text-lg tabular-nums text-foreground">
                      {formatRupiah(pesanan.harga_paket_satuan)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Total Harga (Snapshot)</label>
                <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 border border-border">
                  <span className="font-heading text-xl font-bold text-primary tabular-nums">
                    {formatRupiah(pesanan.total_harga)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Status Pesanan</label>
                <select
                  value={status}
                  onChange={(e) => onStatusChange(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Catatan</label>
                <textarea
                  value={catatan}
                  onChange={(e) => onCatatanChange(e.target.value)}
                  rows={4}
                  className="flex h-24 min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground"
                  placeholder="Catatan untuk pesanan ini..."
                />
              </div>
            </div>
          </section>
        </div>
      </main>
      <DialogFooter className="flex w-full shrink-0 flex-row justify-end gap-3 border-t px-6 py-3">
        <button
          type="button"
          onClick={handleCancel}
          className="flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isUpdating}
          className="flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </DialogFooter>
  </div>
  )
}