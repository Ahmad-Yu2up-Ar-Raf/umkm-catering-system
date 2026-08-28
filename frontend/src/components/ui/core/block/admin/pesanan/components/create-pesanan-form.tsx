"use client"

import React, { useEffect, useRef } from "react"
import { useStore } from "@tanstack/react-store"
import { DialogFooter } from "@/components/ui/fragments/shadcn-ui/dialog"
import { PesananCalcPanel } from "./pesanan-calc-panel"
import { usePaketSearch } from "../hooks/use-paket-search"
import type { PaketSearchOption } from "../types/pesanan-types"
import type { PesananCreateDrawerFormApi } from "../hooks/use-pesanan-form"

interface CreatePesananFormProps {
  form: PesananCreateDrawerFormApi
  onPaketSelect: (paket: PaketSearchOption) => void
}

export function CreatePesananForm({
  form,
  onPaketSelect,
}: CreatePesananFormProps) {
  const { data: paketOptions } = usePaketSearch(
    form.store.state.values.paket_id.toString() || ""
  )

  // Watch for paket_id changes and call onPaketSelect
  const paketId = useStore(form.store, (s) => s.values.paket_id)
  const prevPaketIdRef = React.useRef(paketId)
  
  React.useEffect(() => {
    if (paketId !== prevPaketIdRef.current && paketId !== Number.NaN) {
      const selected = paketOptions?.find((p) => p.id === paketId)
      if (selected) onPaketSelect(selected)
      prevPaketIdRef.current = paketId
    }
  }, [paketId, paketOptions, onPaketSelect])

  return (
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
            <PesananCalcPanel form={form} selectedPaket={null} />
          </aside>
        </div>
      </main>
      <DialogFooter className="flex w-full shrink-0 flex-row justify-end gap-3 border-t px-6 py-3">
        <button
          type="button"
          onClick={() => {}}
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
    </div>
  )
}