"use client"

import { useState, useEffect } from "react"
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
import type { PaketSearchOption } from "../types/pesanan-types"

interface CreatePesananDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePesananDrawer({
  open,
  onOpenChange,
}: CreatePesananDrawerProps) {
  const isMobile = useIsMobile()
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [selectedPaket, setSelectedPaket] = useState<PaketSearchOption | null>(null)

  const form = usePesananForm({
    onSuccessCallback: () => {
      form.reset()
      setSelectedPaket(null)
      onOpenChange(false)
    },
  })

  // Watch for paket_id changes and auto-fill jumlah_paket from min_order
  const paketId = form.store.state.values.paket_id as number | null
  useEffect(() => {
    if (paketId !== null && paketId !== selectedPaket?.id) {
      // This will be called when user selects a paket from combobox
      // We need to find the selected paket from the search results
      // The combobox sets the value directly, so we need to track it here
    }
  }, [paketId, selectedPaket?.id])

  const hasActualChanges = () => {
    const currentValues = form.store.state.values
    const defaults = {
      nama_pemesan: "",
      no_telepon: "",
      paket_id: null,
      jumlah_paket: 1,
      detail_tambahan: [],
      biaya_tambahan: 0,
      catatan: null,
    }
    return (
      currentValues.nama_pemesan !== defaults.nama_pemesan ||
      currentValues.no_telepon !== defaults.no_telepon ||
      currentValues.paket_id !== defaults.paket_id ||
      currentValues.jumlah_paket !== defaults.jumlah_paket ||
      currentValues.detail_tambahan.length > 0 ||
      currentValues.biaya_tambahan !== defaults.biaya_tambahan ||
      currentValues.catatan !== defaults.catatan
    )
  }

  const requestClose = () => {
    if (hasActualChanges()) {
      setConfirmDiscard(true)
      return
    }
    form.reset()
    setSelectedPaket(null)
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
    setSelectedPaket(null)
    setConfirmDiscard(false)
    onOpenChange(false)
  }

  const handleCancel = () => {
    form.reset()
    setSelectedPaket(null)
    onOpenChange(false)
  }

  if (isMobile) {
    return (
      <>
        <Drawer open={open} onOpenChange={handleOpenChange}>
          <DrawerContent className="flex max-h-[95svh] flex-col overflow-hidden">
            <DrawerHeader className="shrink-0 border-b p-4 text-left">
              <DrawerTitle>Buat Pesanan Baru</DrawerTitle>
              <DrawerDescription>
                Lengkapi detail pesanan — total dihitung otomatis.
              </DrawerDescription>
            </DrawerHeader>

            <PesananForm key={open ? "open" : "closed"} form={form}>
              <DrawerFooter className="shrink-0 border-t p-4">
                <PesananFormActions
                  form={form}
                  submitLabel="Simpan Pesanan"
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
            <DialogTitle className="font-heading text-3xl">
              Buat{" "}
              <span className="font-accent text-primary italic">Pesanan</span>
            </DialogTitle>
            <DialogDescription className="hidden sm:block">
              Lengkapi detail pesanan — total dihitung otomatis.
            </DialogDescription>
          </DialogHeader>

          <PesananForm key={open ? "open" : "closed"} form={form}>
            <DialogFooter className="flex w-full shrink-0 flex-row justify-end gap-3 border-t px-6 py-3">
              <PesananFormActions
                form={form}
                submitLabel="Simpan Pesanan"
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