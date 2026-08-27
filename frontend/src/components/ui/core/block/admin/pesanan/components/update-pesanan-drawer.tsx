"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/fragments/shadcn-ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/fragments/shadcn-ui/drawer"
import { DeleteDialog } from "@/components/ui/fragments/custom-ui/dialog/delete-dialog"
import { useIsMobile } from "@/hooks/use-mobile"
import { usePesananUpdateMutation } from "../hooks/use-pesanan-mutations"
import { toFormDefaults } from "../hooks/use-pesanan-form"
import { PesananStatusBadge } from "./pesanan-status-badge"
import { formatRupiah } from "../utils/pesanan-calculator"
import type { Pesanan } from "../types/pesanan-types"
import { PESANAN_STATUSES, STATUS_LABELS } from "../types/pesanan-types"

interface UpdatePesananDrawerProps {
  pesanan: Pesanan
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdatePesananDrawer({
  pesanan,
  open,
  onOpenChange,
}: UpdatePesananDrawerProps) {
  const isMobile = useIsMobile()
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const { mutate: updatePesanan, isPending: isUpdating } =
    usePesananUpdateMutation()

  const [status, setStatus] = useState(pesanan.status_pesanan)
  const [catatan, setCatatan] = useState(pesanan.catatan ?? "")

  const hasActualChanges = () => {
    return status !== pesanan.status_pesanan || catatan !== (pesanan.catatan ?? "")
  }

  const requestClose = () => {
    if (hasActualChanges()) {
      setConfirmDiscard(true)
      return
    }
    onOpenChange(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (next) {
      onOpenChange(true)
      return
    }
    requestClose()
  }

  const confirmDiscardAction = () => {
    setStatus(pesanan.status_pesanan)
    setCatatan(pesanan.catatan ?? "")
    setConfirmDiscard(false)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setStatus(pesanan.status_pesanan)
    setCatatan(pesanan.catatan ?? "")
    onOpenChange(false)
  }

  const handleSubmit = () => {
    updatePesanan(
      { id: pesanan.id, status_pesanan: status as Pesanan["status_pesanan"], catatan: catatan || null },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  const statusOptions = PESANAN_STATUSES.map((value) => ({
    value,
    label: STATUS_LABELS[value],
  }))

  const renderForm = () => (
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
                  onChange={(e) => setStatus(e.target.value)}
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
                  onChange={(e) => setCatatan(e.target.value)}
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
    </form>
  )

  if (isMobile) {
    return (
      <>
        <Drawer open={open} onOpenChange={handleOpenChange}>
          <DrawerContent className="flex max-h-[95svh] flex-col overflow-hidden">
            <DrawerHeader className="shrink-0 border-b p-4 text-left">
              <DrawerTitle>Edit Pesanan</DrawerTitle>
              <DrawerDescription>
                Perbarui status dan catatan untuk pesanan "{pesanan.nomor_struk}".
              </DrawerDescription>
            </DrawerHeader>

            {renderForm()}

            <DrawerFooter className="shrink-0 border-t p-4">
              <div className="flex w-full justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="pesanan-update-form"
                  disabled={isUpdating}
                  className="flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <DeleteDialog
          open={confirmDiscard}
          onOpenChange={setConfirmDiscard}
          title="Buang perubahan?"
          description="Perubahan yang belum disimpan akan hilang. Lanjutkan?"
          confirmLabel="Buang"
          onConfirm={confirmDiscardAction}
        />
      </>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="flex h-full max-h-[95vh] w-full max-w-lg flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="flex sr-only shrink-0 flex-col items-center gap-2 border-b bg-background px-6 py-6 sm:px-10">
            <DialogTitle className="font-heading text-2xl">
              Edit{" "}
              <span className="font-accent text-primary italic">Pesanan</span>
            </DialogTitle>
            <DialogDescription className="hidden sm:block">
              Perbarui status dan catatan untuk pesanan "{pesanan.nomor_struk}".
            </DialogDescription>
          </DialogHeader>

          <form
            id="pesanan-update-form"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleSubmit()
            }}
            className="flex flex-1 flex-col overflow-hidden"
          >
            {renderForm()}
          </form>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={confirmDiscard}
        onOpenChange={setConfirmDiscard}
        title="Buang perubahan?"
        description="Perubahan yang belum disimpan akan hilang. Lanjutkan?"
        confirmLabel="Buang"
        onConfirm={confirmDiscardAction}
      />
    </>
  )
}