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
import { toFormDefaults, areFormValuesEqual } from "../utils/paket-form-mapper"
import type { Paket } from "../../../paket/types/paket-types"
import PaketForm from "./paket-form"
import { PaketFormActions } from "./paket-form-actions"

interface UpdatePaketDrawerProps {
  paket: Paket
  open: boolean
  onOpenChange: (open: boolean) => void
}

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

  const discardUncommittedUploads = () => {
    const current = form.store.state.values
    const original = toFormDefaults(paket)
    const known = new Set<string>([
      ...(typeof original.thumbnail === "string" && original.thumbnail
        ? [original.thumbnail]
        : []),
      ...(original.images ?? []).filter(
        (img): img is string => typeof img === "string"
      ),
    ])
    purgeUncommittedPaketImages(
      [
        typeof current.thumbnail === "string" ? current.thumbnail : "",
        ...(current.images ?? []).filter(
          (img): img is string => typeof img === "string"
        ),
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
          <DrawerContent className="flex max-h-[95svh] flex-col overflow-hidden">
            <DrawerHeader className="shrink-0 border-b p-4 text-left">
              <DrawerTitle>Ubah Paket</DrawerTitle>
              <DrawerDescription>
                Perbarui detail paket "{paket.nama_paket}".
              </DrawerDescription>
            </DrawerHeader>

            <PaketForm key={open ? "open" : "closed"} form={form}>
              <DrawerFooter className="shrink-0 border-t p-4">
                <PaketFormActions
                  form={form}
                  submitLabel="Simpan Perubahan"
                  onCancel={handleCancel}
                />
              </DrawerFooter>
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
        {/* max-width dan max-height dioptimalkan layaknya layar pesanan */}
        <DialogContent className="flex h-full max-h-[95vh] w-full max-w-4xl flex-col gap-0 overflow-hidden p-0 lg:max-w-[80em]">
          <DialogHeader className="sr-only flex shrink-0 flex-col items-center gap-2 border-b bg-background px-6 py-6 sm:px-10">
            <DialogTitle className="font-heading text-3xl">
              Ubah{" "}
              <span className="font-accent text-primary italic">Paket</span>
            </DialogTitle>
            <DialogDescription className="hidden sm:block">
              Perbarui detail paket "{paket.nama_paket}".
            </DialogDescription>
          </DialogHeader>

          <PaketForm key={open ? "open" : "closed"} form={form}>
            <DialogFooter className="flex w-full shrink-0 flex-row justify-end gap-3 border-t px-6 py-3">
              <PaketFormActions
                form={form}
                submitLabel="Simpan Perubahan"
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
