"use client"

import { useState } from "react"
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
import { usePesananForm } from "../hooks/use-pesanan-form"
import { PesananForm } from "./pesanan-form"
import { PesananFormActions } from "./pesanan-form-actions"
import type { Pesanan } from "../types/pesanan-types"

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

  const form = usePesananForm({
    pesanan,
    onSuccessCallback: () => {
      form.reset()
      onOpenChange(false)
    },
  })

  const hasActualChanges = () => {
    const currentValues = form.store.state.values as unknown as {
      nama_pemesan: string
      no_telepon: string
      alamat: string | null
      paket_id: number | null
      jumlah_paket: number | null
      tanggal_acara: string
      status_pesanan: string | null
      menu_tambahan: string[]
      detail_tambahan: string[]
      biaya_tambahan: number | null
      catatan: string | null
    }
    const originalValues = {
      nama_pemesan: pesanan.nama_pemesan,
      no_telepon: pesanan.no_telepon,
      alamat: pesanan.alamat ?? null,
      paket_id: pesanan.paket_id,
      jumlah_paket: pesanan.jumlah_paket,
      tanggal_acara: pesanan.tanggal_acara ?? "",
      status_pesanan: pesanan.status_pesanan ?? null,
      menu_tambahan: pesanan.menu_tambahan ?? [],
      detail_tambahan: pesanan.detail_tambahan ?? [],
      biaya_tambahan: pesanan.biaya_tambahan != null ? Number(pesanan.biaya_tambahan) : null,
      catatan: pesanan.catatan ?? null,
    }
    const arraysEqual = (a: string[], b: string[]) =>
      a.length === b.length && a.every((v, i) => v === b[i])
    return (
      currentValues.nama_pemesan !== originalValues.nama_pemesan ||
      currentValues.no_telepon !== originalValues.no_telepon ||
      (currentValues.alamat ?? null) !== originalValues.alamat ||
      currentValues.paket_id !== originalValues.paket_id ||
      currentValues.jumlah_paket !== originalValues.jumlah_paket ||
      currentValues.tanggal_acara !== originalValues.tanggal_acara ||
      (currentValues.status_pesanan ?? null) !== originalValues.status_pesanan ||
      !arraysEqual(currentValues.menu_tambahan ?? [], originalValues.menu_tambahan) ||
      !arraysEqual(currentValues.detail_tambahan ?? [], originalValues.detail_tambahan) ||
      (currentValues.biaya_tambahan ?? null) !== originalValues.biaya_tambahan ||
      (currentValues.catatan ?? null) !== originalValues.catatan
    )
  }

  const requestClose = () => {
    if (hasActualChanges()) {
      setConfirmDiscard(true)
      return
    }
    form.reset()
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
    form.reset()
    setConfirmDiscard(false)
    onOpenChange(false)
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  if (isMobile) {
    return (
      <>
        <Drawer open={open} onOpenChange={handleOpenChange}>
          <DrawerContent className="flex max-h-[95svh] flex-col overflow-hidden">
            <DrawerHeader className="shrink-0 border-b p-4 text-left">
              <DrawerTitle>Edit Pesanan</DrawerTitle>
              <DrawerDescription>
                Perbarui detail pesanan "{pesanan.nomor_struk}".
              </DrawerDescription>
            </DrawerHeader>

<PesananForm key={open ? "open" : "closed"} form={form} initialPaket={pesanan.paket ? { id: pesanan.paket.id, nama_paket: pesanan.paket.nama_paket, thumbnail: pesanan.paket.thumbnail, min_order: pesanan.paket.min_order, harga_per_porsi: pesanan.paket.harga_per_porsi, kapasitas_produksi: pesanan.paket.kapasitas_produksi } : null}>
              <DrawerFooter className="shrink-0 border-t p-4">
                <PesananFormActions
                  form={form}
                  submitLabel="Simpan Perubahan"
                  onCancel={handleCancel}
                />
              </DrawerFooter>
            </PesananForm>
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
        <DialogContent className="flex h-full max-h-[95vh] w-full max-w-4xl flex-col gap-0 overflow-hidden p-0 lg:max-w-[80em]">
          <DialogHeader className="sr-only flex shrink-0 flex-col items-center gap-2 border-b bg-background px-6 py-6 sm:px-10">
            <DialogTitle className="font-heading text-2xl">
              Edit{" "}
              <span className="font-accent text-primary italic">Pesanan</span>
            </DialogTitle>
            <DialogDescription className="hidden sm:block">
              Perbarui detail pesanan "{pesanan.nomor_struk}".
            </DialogDescription>
          </DialogHeader>

          <PesananForm key={open ? "open" : "closed"} form={form} initialPaket={pesanan.paket ? { id: pesanan.paket.id, nama_paket: pesanan.paket.nama_paket, thumbnail: pesanan.paket.thumbnail, min_order: pesanan.paket.min_order, harga_per_porsi: pesanan.paket.harga_per_porsi, kapasitas_produksi: pesanan.paket.kapasitas_produksi } : null}>
            <DialogFooter className="flex w-full shrink-0 flex-row justify-end gap-3 border-t px-6 py-3">
              <PesananFormActions
                form={form}
                submitLabel="Simpan Perubahan"
                onCancel={handleCancel}
              />
            </DialogFooter>
          </PesananForm>
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