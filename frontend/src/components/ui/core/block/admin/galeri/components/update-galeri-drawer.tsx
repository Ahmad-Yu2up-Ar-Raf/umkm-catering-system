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
import { useGaleriUploadStore } from "@/store/galeri-upload-store"
import { useGaleriForm, purgeUncommittedGaleriImages } from "../hooks/use-galeri-mutations"
import { toFormDefaults, areFormValuesEqual } from "../utils/galeri-form-mapper"
import type { Galeri } from "../types/galeri-types"
import GaleriForm from "./galeri-form"
import { GaleriFormActions } from "./galeri-form-actions"

interface UpdateGaleriDrawerProps {
  galeri: Galeri
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Responsive Update shell — Dialog on desktop (≥md), Drawer on mobile (<md). */
export function UpdateGaleriDrawer({
  galeri,
  open,
  onOpenChange,
}: UpdateGaleriDrawerProps) {
  const isMobile = useIsMobile()
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const form = useGaleriForm({
    galeri,
    onSuccessCallback: () => {
      form.reset()
      onOpenChange(false)
    },
  })

  const activeUploads = useGaleriUploadStore((s) => s.activeUploads)

  const hasActualChanges = () => {
    const currentValues = form.store.state.values
    const originalValues = toFormDefaults(galeri)
    
    return !areFormValuesEqual(currentValues, originalValues)
  }

  /** On discard, sweep only uploads that were ADDED this session (not in the
   * original galeri) — originals stay referenced by the DB and must survive. */
  const discardUncommittedUploads = () => {
    const current = form.store.state.values
    const original = toFormDefaults(galeri)
    const known = new Set<string>([
      ...(typeof original.thumbnail === "string" && original.thumbnail
        ? [original.thumbnail]
        : []),
      ...(original.images ?? []).filter((img): img is string =>
        typeof img === "string"
      ),
    ])
    purgeUncommittedGaleriImages(
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
              <DrawerTitle>Ubah Galeri</DrawerTitle>
              <DrawerDescription>
                Perbarui detail galeri "{galeri.nama_acara}".
              </DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-4">
              <GaleriForm key={open ? "open" : "closed"} form={form}>
                <DrawerFooter className="px-0 pb-0">
                  <GaleriFormActions
                    form={form}
                    submitLabel="Simpan Perubahan"
                    onCancel={handleCancel}
                  />
                </DrawerFooter>
              </GaleriForm>
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
            <DialogTitle>Ubah Galeri</DialogTitle>
            <DialogDescription className="hidden sm:block">
              Perbarui detail galeri "{galeri.nama_acara}".
            </DialogDescription>
          </DialogHeader>
          <div className="show-scrollbar flex-1 overflow-y-auto overscroll-contain p-6">
            <GaleriForm key={open ? "open" : "closed"} form={form}>
              <DialogFooter className="sticky bottom-0 z-50 flex w-full flex-row justify-end gap-3 border-t bg-background px-6 py-4">
                <GaleriFormActions
                  form={form}
                  submitLabel="Simpan Perubahan"
                  onCancel={handleCancel}
                />
              </DialogFooter>
            </GaleriForm>
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