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
import {
  usePaketForm,
  purgeUncommittedPaketImages,
} from "../hooks/use-paket-mutations"
import { areFormValuesEqual } from "../utils/paket-form-mapper"
import PaketForm from "./paket-form"
import { PaketFormActions } from "./paket-form-actions"

interface CreatePaketDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

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

  const hasActualChanges = () => {
    const currentValues = form.store.state.values
    const defaults = {
      nama_paket: "",
      kategori_paket: null,
      kategori_acara: null,
      harga_per_porsi: null,
      min_order: null,
      kapasitas_produksi: null,
      is_best_seller: false,
      menu_utama: [],
      menu_tambahan: [],
      fasilitas_termasuk: [],
      jenis_kemasan: "",
      catatan_alergen: null,
      deskripsi: "",
      thumbnail: "",
      images: [],
    }
    return !areFormValuesEqual(currentValues, defaults)
  }

  const discardUncommittedUploads = () => {
    const values = form.store.state.values
    purgeUncommittedPaketImages([
      ...(typeof values.thumbnail === "string" ? [values.thumbnail] : []),
      ...(values.images ?? []).filter(
        (img): img is string => typeof img === "string"
      ),
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
          <DrawerContent className="flex max-h-[95svh] flex-col overflow-hidden">
            <DrawerHeader className="shrink-0 border-b p-4 text-left">
              <DrawerTitle>Tambah Paket</DrawerTitle>
              <DrawerDescription>
                Lengkapi detail paket catering baru di bawah ini.
              </DrawerDescription>
            </DrawerHeader>

            <PaketForm key={open ? "open" : "closed"} form={form}>
              {/* <DrawerFooter className="shrink-0 border-t p-4">
                <PaketFormActions
                  form={form}
                  submitLabel="Simpan"
                  onCancel={handleCancel}
                />
              </DrawerFooter> */}
            </PaketForm>
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
        {/* max-width dan max-height dibesarkan di sini */}
        <DialogContent className="flex h-full max-h-[95vh] w-full max-w-4xl flex-col gap-0 overflow-hidden p-0 lg:max-w-[80em]">
          <DialogHeader className="flex sr-only shrink-0 flex-col items-center gap-2 border-b bg-background px-6 py-6 sm:px-10">
            <DialogTitle className="font-heading text-3xl">
              Buat{" "}
              <span className="font-accent text-primary italic">Paket</span>
            </DialogTitle>
            <DialogDescription className="hidden sm:block">
              Lengkapi detail paket catering baru di bawah ini.
            </DialogDescription>
          </DialogHeader>

          <PaketForm key={open ? "open" : "closed"} form={form}>
            <DialogFooter className="flex w-full shrink-0 flex-row justify-end gap-3 border-t px-6 py-3">
              <PaketFormActions
                form={form}
                submitLabel="Simpan Paket"
                onCancel={handleCancel}
              />
            </DialogFooter>
          </PaketForm>
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
