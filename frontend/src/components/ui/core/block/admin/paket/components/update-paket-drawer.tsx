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
import { usePaketUploadStore } from "@/store/paket-upload-store"
import { usePaketForm, purgeUncommittedPaketImages } from "../hooks/use-paket-mutations"
import { toFormDefaults, areFormValuesEqual } from "../utils/paket-form-mapper"
import type { Paket } from "../../../paket/types/paket-types"
import PaketForm from "./paket-form"
import { PaketFormActions } from "./paket-form-actions"

interface UpdatePaketDrawerProps {
  paket: Paket
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Responsive Update shell — Dialog on desktop (≥md), Drawer on mobile (<md). */
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

  const hasActualChanges = () => {
    const currentValues = form.store.state.values
    const originalValues = toFormDefaults(paket)
    
    return !areFormValuesEqual(currentValues, originalValues)
  }

  /** On discard, sweep only uploads that were ADDED this session (not in the
   * original paket) — originals stay referenced by the DB and must survive. */
  const discardUncommittedUploads = () => {
    const current = form.store.state.values
    const original = toFormDefaults(paket)
    const known = new Set<string>([
      ...(typeof original.thumbnail === "string" && original.thumbnail
        ? [original.thumbnail]
        : []),
      ...(original.images ?? []).filter((img): img is string =>
        typeof img === "string"
      ),
    ])
    purgeUncommittedPaketImages(
      [
        typeof current.thumbnail === "string" ? current.thumbnail : "",
        ...((current.images ?? []).filter(
          (img): img is string => typeof img === "string"
        )),
      ].filter((url) => url !== "" && !known.has(url))
    )
  }

  const requestClose = () => {
    if (activeUploads > 0) {
      toast.error("Masih ada upload gambar — tunggu sampai selesai.")
      return
    }
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
    discardUncommittedUploads()
    form.reset()
    setConfirmDiscard(false)
    onOpenChange(false)
  }

  const handleCancel = () => {
    discardUncommittedUploads()
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
                Perbarui detail paket "{paket.nama_paket}".
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
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="sticky top-0 z-30 flex flex-row items-center gap-4 border-b bg-background px-6 py-5 sm:px-10">
            <DialogTitle>Ubah Paket</DialogTitle>
            <DialogDescription className="hidden sm:block">
              Perbarui detail paket "{paket.nama_paket}".
            </DialogDescription>
          </DialogHeader>
          <div className="show-scrollbar flex-1 overflow-y-auto overscroll-contain p-6">
            <PaketForm key={open ? "open" : "closed"} form={form}>
              <DialogFooter className="sticky bottom-0 z-50 flex w-full flex-row justify-end gap-3 border-t bg-background px-6 py-4">
                <PaketFormActions
                  form={form}
                  submitLabel="Simpan Perubahan"
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
