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
import { areFormValuesEqual } from "../utils/galeri-form-mapper"
import GaleriForm from "./galeri-form"
import { GaleriFormActions } from "./galeri-form-actions"

interface CreateGaleriDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Responsive Create shell — Dialog on desktop (≥md), Drawer on mobile (<md). */
export function CreateGaleriDrawer({
  open,
  onOpenChange,
}: CreateGaleriDrawerProps) {
  const isMobile = useIsMobile()
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const form = useGaleriForm({
    onSuccessCallback: () => {
      form.reset()
      onOpenChange(false)
    },
  })

  const activeUploads = useGaleriUploadStore((s) => s.activeUploads)

  const hasActualChanges = () => {
    const currentValues = form.store.state.values
    const defaults = {
      nama_acara: "",
      kategori_acara: "Lainnya",
      deskripsi_acara: null,
      tanggal_acara: null,
      lokasi: null,
      jumlah_tamu: null,
      is_featured: false,
      thumbnail: "",
      images: [],
    }

    return !areFormValuesEqual(currentValues, defaults)
  }

  /** In a create draft every string URL in form state is an uncommitted
   * Cloudinary upload — sweep it on discard/cancel so storage stays clean. */
  const discardUncommittedUploads = () => {
    const values = form.store.state.values
    purgeUncommittedGaleriImages([
      ...(typeof values.thumbnail === "string" ? [values.thumbnail] : []),
      ...((values.images ?? []).filter(
        (img): img is string => typeof img === "string"
      )),
    ])
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
              <DrawerTitle>Tambah Galeri</DrawerTitle>
              <DrawerDescription>
                Lengkapi detail galeri baru di bawah ini.
              </DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-4">
              <GaleriForm key={open ? "open" : "closed"} form={form}>
                <DrawerFooter className="px-0 pb-0">
                  <GaleriFormActions
                    form={form}
                    submitLabel="Simpan"
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
          <DialogHeader className="sticky top-0 z-30 flex flex-col items-center gap-2 border-b bg-background px-6 py-5 sm:px-10">
            <DialogTitle className="text-2xl">Tambah Galeri</DialogTitle>
            <DialogDescription className="hidden sm:block">
              Lengkapi detail galeri baru di bawah ini.
            </DialogDescription>
          </DialogHeader>

          <GaleriForm key={open ? "open" : "closed"} form={form}>
            <DialogFooter className="sticky bottom-0 z-50 flex w-full flex-row justify-end gap-3 border-t bg-background px-6 py-4">
              <GaleriFormActions
                form={form}
                submitLabel="Simpan"
                onCancel={handleCancel}
              />
            </DialogFooter>
          </GaleriForm>
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