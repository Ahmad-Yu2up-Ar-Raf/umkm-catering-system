"use client"

import { useState } from "react"
import { useStore } from "@tanstack/react-store"
import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/fragments/shadcn-ui/sheet"
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
import { usePaketUploadStore } from "@/store/paket-upload-store"
import { usePaketForm } from "../hooks/use-paket-mutations"
import type { Paket } from "../../../paket/types/paket-types"
import PaketForm from "./paket-form"
import { PaketFormActions } from "./paket-form-actions"

interface UpdatePaketDrawerProps {
  paket: Paket
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Responsive Update shell — same form as Create, seeded from the row being edited. */
export function UpdatePaketDrawer({
  paket,
  open,
  onOpenChange,
}: UpdatePaketDrawerProps) {
  const isMobile = useIsMobile()
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const form = usePaketForm({
    paket,
    onSuccessCallback: () => {
      form.reset()
      onOpenChange(false)
    },
  })

  const activeUploads = usePaketUploadStore((s) => s.activeUploads)
  const isDirty = useStore(form.store, (state) => state.isDirty)

  const requestClose = () => {
    if (activeUploads > 0) {
      toast.error("Masih ada upload gambar — tunggu sampai selesai.")
      return
    }
    if (isDirty) {
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
          <DrawerContent className="flex flex-col">
            <DrawerHeader className="border-b p-4 text-left">
              <DrawerTitle>Ubah Paket</DrawerTitle>
              <DrawerDescription>
                Perbarui detail paket “{paket.nama_paket}”.
              </DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-4">
              <PaketForm key={open ? "open" : "closed"} form={form}>
                <DrawerFooter className="px-0 pb-0">
                  <PaketFormActions
                    form={form}
                    submitLabel="Simpan Perubahan"
                    onCancel={handleCancel}
                  />
                </DrawerFooter>
              </PaketForm>
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
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="right" className="w-full gap-0 overflow-y-auto p-0 sm:max-w-2xl">
          <SheetHeader className="sticky top-0 z-30 space-y-1 border-b bg-background p-6 text-left">
            <SheetTitle>Ubah Paket</SheetTitle>
            <SheetDescription>
              Perbarui detail paket “{paket.nama_paket}”.
            </SheetDescription>
          </SheetHeader>
          <div className="p-6">
            <PaketForm key={open ? "open" : "closed"} form={form}>
              <SheetFooter className="sticky bottom-0 z-50 -mx-6 mt-4 flex w-[calc(100%+3rem)] flex-row justify-end gap-3 border-t bg-background px-8 py-4">
                <PaketFormActions
                  form={form}
                  submitLabel="Simpan Perubahan"
                  onCancel={handleCancel}
                />
              </SheetFooter>
            </PaketForm>
          </div>
        </SheetContent>
      </Sheet>

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
