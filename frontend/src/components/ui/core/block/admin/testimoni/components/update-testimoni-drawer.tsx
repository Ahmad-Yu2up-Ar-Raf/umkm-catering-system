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
import { useTestimoniForm } from "../hooks/use-testimoni-mutations"
import { toFormDefaults, areFormValuesEqual } from "../utils/testimoni-form-mapper"
import type { Testimoni } from "../types/testimoni-types"
import type { PaketSearchOption } from "../../pesanan/types/pesanan-types"
import { TestimoniForm } from "./testimoni-form"
import { TestimoniFormActions } from "./testimoni-form-actions"

interface UpdateTestimoniDrawerProps {
  testimoni: Testimoni
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Responsive Update shell — Dialog on desktop (≥md), Drawer on mobile (<md). */
export function UpdateTestimoniDrawer({
  testimoni,
  open,
  onOpenChange,
}: UpdateTestimoniDrawerProps) {
  const isMobile = useIsMobile()
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const form = useTestimoniForm({
    testimoni,
    onSuccessCallback: () => {
      form.reset()
      onOpenChange(false)
    },
  })

  const initialPaket: PaketSearchOption | null = testimoni.paket
    ? {
        id: testimoni.paket.id,
        nama_paket: testimoni.paket.nama_paket,
        thumbnail: testimoni.paket.thumbnail,
        min_order: null,
        harga_per_porsi:
          testimoni.paket.harga_per_porsi === null ||
          testimoni.paket.harga_per_porsi === undefined
            ? "0"
            : String(testimoni.paket.harga_per_porsi),
        kapasitas_produksi: null,
      }
    : null

  const hasActualChanges = () => {
    const currentValues = form.store.state.values
    const originalValues = toFormDefaults(testimoni)

    return !areFormValuesEqual(currentValues, originalValues)
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
              <DrawerTitle>Ubah Testimoni</DrawerTitle>
              <DrawerDescription>
                Perbarui testimoni dari "{testimoni.nama}".
              </DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto">
              <TestimoniForm key={open ? "open" : "closed"} form={form} initialPaket={initialPaket}>
                <DrawerFooter className="shrink-0 border-t p-4">
                  <TestimoniFormActions
                    form={form}
                    submitLabel="Simpan Perubahan Testimoni"
                    onCancel={handleCancel}
                  />
                </DrawerFooter>
              </TestimoniForm>
            </div>
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
          <DialogHeader className="flex sr-only shrink-0 flex-col items-center gap-2 border-b bg-background px-6 py-6 sm:px-10">
            <DialogTitle className="font-heading text-3xl">
              Ubah{" "}
              <span className="font-accent text-primary italic">Testimoni</span>
            </DialogTitle>
            <DialogDescription className="hidden sm:block">
              Perbarui testimoni dari "{testimoni.nama}".
            </DialogDescription>
          </DialogHeader>

          <TestimoniForm key={open ? "open" : "closed"} form={form} initialPaket={initialPaket}>
            <DialogFooter className="flex w-full shrink-0 flex-row justify-end gap-3 border-t px-6 py-3">
              <TestimoniFormActions
                form={form}
                submitLabel="Simpan Perubahan Testimoni"
                onCancel={handleCancel}
              />
            </DialogFooter>
          </TestimoniForm>
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
