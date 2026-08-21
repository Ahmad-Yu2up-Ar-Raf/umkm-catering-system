"use client"

import { useState } from "react"
import { useStore } from "@tanstack/react-store"
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
import { usePaketUploadStore } from "@/store/paket-upload-store"
import { usePaketForm } from "../hooks/use-paket-mutations"
import PaketForm from "./paket-form"
import { PaketFormActions } from "./paket-form-actions"

interface CreatePaketDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Responsive Create shell — Dialog on desktop (≥md), Drawer on mobile (<md). */
export function CreatePaketDrawer({
  open,
  onOpenChange,
}: CreatePaketDrawerProps) {
  const isMobile = useIsMobile()
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const form = usePaketForm({
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
              <DrawerTitle>Tambah Paket</DrawerTitle>
              <DrawerDescription>
                Lengkapi detail paket catering baru di bawah ini.
              </DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-4">
              <PaketForm key={open ? "open" : "closed"} form={form}>
                <DrawerFooter className="px-0 pb-0">
                  <PaketFormActions
                    form={form}
                    submitLabel="Simpan"
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
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="sticky top-0 z-30 flex flex-row items-center gap-4 border-b bg-background px-6 py-5 sm:px-10">
            <DialogTitle>Tambah Paket</DialogTitle>
            <DialogDescription className="hidden sm:block">
              Lengkapi detail paket catering baru di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <div className="show-scrollbar flex-1 overflow-y-auto overscroll-contain p-6">
            <PaketForm key={open ? "open" : "closed"} form={form}>
              <DialogFooter className="sticky bottom-0 z-50 flex w-full flex-row justify-end gap-3 border-t bg-background px-6 py-4">
                <PaketFormActions
                  form={form}
                  submitLabel="Simpan"
                  onCancel={handleCancel}
                />
              </DialogFooter>
            </PaketForm>
          </div>
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
