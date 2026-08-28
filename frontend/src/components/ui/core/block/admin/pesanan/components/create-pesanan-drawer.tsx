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
import { usePesananCreateForm } from "../hooks/use-pesanan-form"
import { CreatePesananForm } from "./create-pesanan-form"
import type { PaketSearchOption } from "../types/pesanan-types"
import { validateAgainstPaket } from "../schemas/pesanan-schema"

interface CreatePesananDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePesananDrawer({
  open,
  onOpenChange,
}: CreatePesananDrawerProps) {
  const isMobile = useIsMobile()
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [selectedPaket, setSelectedPaket] = useState<PaketSearchOption | null>(null)

  const form = usePesananCreateForm({
    onSuccessCallback: () => {
      form.reset()
      setSelectedPaket(null)
      onOpenChange(false)
    },
  })

  const handlePaketSelect = (paket: PaketSearchOption) => {
    setSelectedPaket(paket)
    form.setFieldValue("paket_id", paket.id)
    if (paket.min_order) {
      form.setFieldValue("jumlah_paket", paket.min_order)
    }
  }

  const hasActualChanges = () => {
    const currentValues = form.store.state.values
    const defaults = {
      nama_pemesan: "",
      no_telepon: "",
      paket_id: Number.NaN,
      jumlah_paket: 1,
      detail_tambahan: [],
      biaya_tambahan: 0,
      catatan: null,
    }
    return (
      currentValues.nama_pemesan !== defaults.nama_pemesan ||
      currentValues.no_telepon !== defaults.no_telepon ||
      currentValues.paket_id !== defaults.paket_id ||
      currentValues.jumlah_paket !== defaults.jumlah_paket ||
      currentValues.detail_tambahan.length > 0 ||
      currentValues.biaya_tambahan !== defaults.biaya_tambahan ||
      currentValues.catatan !== defaults.catatan
    )
  }

  const requestClose = () => {
    if (hasActualChanges()) {
      setConfirmDiscard(true)
      return
    }
    form.reset()
    setSelectedPaket(null)
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
    setSelectedPaket(null)
    setConfirmDiscard(false)
    onOpenChange(false)
  }

  const handleCancel = () => {
    form.reset()
    setSelectedPaket(null)
    onOpenChange(false)
  }

  const handleSubmit = async () => {
    if (!selectedPaket) {
      form.setFieldMeta("paket_id", (meta) => ({
        ...meta,
        errors: ["Pilih paket terlebih dahulu."],
      }))
      return
    }
    const violation = validateAgainstPaket(
      form.store.state.values as Parameters<typeof validateAgainstPaket>[0],
      selectedPaket
    )
    if (violation) {
      form.setFieldMeta(violation.field, (meta) => ({
        ...meta,
        errors: [violation.message],
      }))
      return
    }
    form.handleSubmit()
  }

  if (isMobile) {
    return (
      <>
        <Drawer open={open} onOpenChange={handleOpenChange}>
          <DrawerContent className="flex max-h-[95svh] flex-col overflow-hidden">
            <DrawerHeader className="shrink-0 border-b p-4 text-left">
              <DrawerTitle>Buat Pesanan Baru</DrawerTitle>
              <DrawerDescription>
                Lengkapi detail pesanan — total dihitung otomatis.
              </DrawerDescription>
            </DrawerHeader>

            <CreatePesananForm
              form={form}
              onPaketSelect={handlePaketSelect}
            />

            <DrawerFooter className="shrink-0 border-t p-4">
              <div className="flex w-full justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="pesanan-create-form"
                  disabled={form.store.state.isSubmitting}
                  className="flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  {form.store.state.isSubmitting ? "Menyimpan..." : "Simpan Pesanan"}
                </button>
              </div>
            </DrawerFooter>
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
        <DialogContent className="flex h-full max-h-[95vh] w-full max-w-5xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="flex sr-only shrink-0 flex-col items-center gap-2 border-b bg-background px-6 py-6 sm:px-10">
            <DialogTitle className="font-heading text-3xl">
              Buat{" "}
              <span className="font-accent text-primary italic">Pesanan</span>
            </DialogTitle>
            <DialogDescription className="hidden sm:block">
              Lengkapi detail pesanan — total dihitung otomatis.
            </DialogDescription>
          </DialogHeader>

          <form
            id="pesanan-create-form"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleSubmit()
            }}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <CreatePesananForm
              form={form}
              onPaketSelect={handlePaketSelect}
            />

            <DialogFooter className="flex w-full shrink-0 flex-row justify-end gap-3 border-t px-6 py-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={form.store.state.isSubmitting}
                className="flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                {form.store.state.isSubmitting ? "Menyimpan..." : "Simpan Pesanan"}
              </button>
            </DialogFooter>
          </form>
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