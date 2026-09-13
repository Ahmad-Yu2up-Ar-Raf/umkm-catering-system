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
import { areFormValuesEqual } from "../utils/testimoni-form-mapper"
import { TestimoniForm } from "./testimoni-form"
import { TestimoniFormActions } from "./testimoni-form-actions"

interface CreateTestimoniDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Responsive Create shell — Dialog on desktop (≥md), Drawer on mobile (<md). */
export function CreateTestimoniDrawer({
  open,
  onOpenChange,
}: CreateTestimoniDrawerProps) {
  const isMobile = useIsMobile()
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const form = useTestimoniForm({
    onSuccessCallback: () => {
      form.reset()
      onOpenChange(false)
    },
  })

  const hasActualChanges = () => {
    const currentValues = form.store.state.values
    const defaults = {
      nama: "",
      pesanan: "",
      acara: "",
      lokasi: "",
      visibility: "private",
      rating: 5,
      tanggal_acara: null,
      paket_id: null,
    }

    return !areFormValuesEqual(currentValues, defaults)
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
              <DrawerTitle>Tambah Testimoni</DrawerTitle>
              <DrawerDescription>
                Lengkapi detail testimoni baru di bawah ini.
              </DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto">
              <TestimoniForm key={open ? "open" : "closed"} form={form}>
                <DrawerFooter className="shrink-0 border-t p-4">
                  <TestimoniFormActions
                    form={form}
                    submitLabel="Simpan Testimoni"
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
              Buat{" "}
              <span className="font-accent text-primary italic">Testimoni</span>
            </DialogTitle>
            <DialogDescription className="hidden sm:block">
              Lengkapi detail testimoni baru di bawah ini.
            </DialogDescription>
          </DialogHeader>

          <TestimoniForm key={open ? "open" : "closed"} form={form}>
            <DialogFooter className="flex w-full shrink-0 flex-row justify-end gap-3 border-t px-6 py-3">
              <TestimoniFormActions
                form={form}
                submitLabel="Simpan Testimoni"
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
