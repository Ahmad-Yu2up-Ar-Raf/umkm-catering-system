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
      gambar_acara: "",
    }

    return !areFormValuesEqual(currentValues, defaults)
  }

  const discardUncommittedUploads = () => {
    const values = form.store.state.values as { gambar_acara: string | File }
    if (typeof values.gambar_acara === "string" && values.gambar_acara) {
      purgeUncommittedGaleriImages([values.gambar_acara])
    }
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
          <DrawerContent className="flex max-h-[95svh] flex-col overflow-hidden">
            <DrawerHeader className="shrink-0 border-b p-4 text-left">
              <DrawerTitle>Tambah Galeri</DrawerTitle>
              <DrawerDescription>
                Lengkapi detail galeri baru di bawah ini.
              </DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto">
              <GaleriForm key={open ? "open" : "closed"} form={form}>
                <DrawerFooter className="shrink-0 border-t p-4">
                  <GaleriFormActions
                    form={form}
                    submitLabel="Simpan Galeri"
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
        <DialogContent className="flex h-full max-h-[95vh] w-full max-w-4xl flex-col gap-0 overflow-hidden p-0 lg:max-w-[80em]">
          <DialogHeader className="flex sr-only shrink-0 flex-col items-center gap-2 border-b bg-background px-6 py-6 sm:px-10">
            <DialogTitle className="font-heading text-3xl">
              Buat{" "}
              <span className="font-accent text-primary italic">Galeri</span>
            </DialogTitle>
            <DialogDescription className="hidden sm:block">
              Lengkapi detail galeri baru di bawah ini.
            </DialogDescription>
          </DialogHeader>

          <GaleriForm key={open ? "open" : "closed"} form={form}>
            <DialogFooter className="flex w-full shrink-0 flex-row justify-end gap-3 border-t px-6 py-3">
              <GaleriFormActions
                form={form}
                submitLabel="Simpan Galeri"
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