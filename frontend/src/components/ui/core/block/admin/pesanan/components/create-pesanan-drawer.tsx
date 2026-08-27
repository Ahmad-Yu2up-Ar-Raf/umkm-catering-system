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
import { usePesananCreateForm, type PesananCreateDrawerFormApi } from "../hooks/use-pesanan-form"
import { usePaketSearch } from "../hooks/use-paket-search"
import { PesananCalcPanel } from "./pesanan-calc-panel"
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

  // Debounced search for paket combobox
  const { data: paketOptions } = usePaketSearch(
    form.store.state.values.paket_id.toString() || ""
  )

  const handlePaketSelect = (paket: PaketSearchOption) => {
    setSelectedPaket(paket)
    form.setFieldValue("paket_id", paket.id)
    // Reset jumlah_paket to min_order when paket changes
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

  const renderForm = () => (
    <div className="flex flex-1 flex-col overflow-hidden">
      <main className="show-scrollbar flex-1 overflow-y-auto overscroll-contain p-6 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-8">
          {/* LEFT PANE: Input Form */}
          <div className="flex flex-col gap-8">
            <section>
              <header className="mb-6">
                <h2 className="font-heading text-xl font-semibold">Informasi Pesanan</h2>
                <p className="text-sm text-muted-foreground">
                  Lengkapi detail pesanan di bawah ini.
                </p>
              </header>
              <div className="flex flex-col gap-6">
                <form.AppField name="paket_id">
                  {(field) => (
                    <field.Combobox
                      label="Paket"
                      placeholder="Cari & pilih paket..."
                      options={paketOptions?.map((p) => ({
                        label: p.nama_paket,
                        value: p.id,
                      })) ?? []}
                      LeftIcon={null}
                      onValueChange={(val: string) => {
                        if (!val) {
                          field.handleChange(undefined)
                          setSelectedPaket(null)
                          return
                        }
                        const selected = paketOptions?.find((p) => String(p.id) === val)
                        if (selected) handlePaketSelect(selected)
                      }}
                      disabled={form.store.state.isSubmitting}
                    />
                  )}
                </form.AppField>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <form.AppField name="nama_pemesan">
                    {(field) => (
                      <field.Input
                        label="Nama Pemesan"
                        placeholder="Contoh: Budi Santoso"
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="no_telepon">
                    {(field) => (
                      <field.Input
                        label="No. Telepon"
                        type="tel"
                        placeholder="Contoh: 081234567890"
                      />
                    )}
                  </form.AppField>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <form.AppField name="jumlah_paket">
                    {(field) => (
                      <field.Input
                        label="Jumlah Paket"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        placeholder="Contoh: 10"
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="biaya_tambahan">
                    {(field) => (
                      <field.CurrencyInput
                        label="Biaya Tambahan"
                        placeholder="Contoh: Rp 50.000"
                      />
                    )}
                  </form.AppField>
                </div>

                <form.AppField name="detail_tambahan">
                  {(field) => (
                    <field.TagInput
                      label="Detail Tambahan"
                      placeholder="Contoh: Tambahan nasi, air mineral (Enter untuk menambah)"
                    />
                  )}
                </form.AppField>

                <form.AppField name="catatan">
                  {(field) => (
                    <field.TextArea
                      label="Catatan"
                      placeholder="Catatan khusus untuk pesanan ini..."
                    />
                  )}
                </form.AppField>
              </div>
            </section>
          </div>

          {/* RIGHT PANE: Live Calculation Panel */}
          <aside className="hidden lg:flex">
            <PesananCalcPanel form={form} selectedPaket={selectedPaket} />
          </aside>
        </div>
      </main>
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
  )

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

            {renderForm()}

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
              form.handleSubmit()
            }}
            className="flex flex-1 flex-col overflow-hidden"
          >
            {renderForm()}
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