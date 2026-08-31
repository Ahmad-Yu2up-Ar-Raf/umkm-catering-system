"use client"

import type { ReactNode } from "react"
import { useStore } from "@tanstack/react-store"
import { useMemo } from "react"
import { FieldGroup } from "@/components/ui/fragments/shadcn-ui/field"
import { PesananCalcPanel } from "./pesanan-calc-panel"
import { usePaketSearch } from "../hooks/use-paket-search"
import { usePaketDetail } from "../hooks/use-paket-detail"
import type { PesananFormReturnType } from "../hooks/use-pesanan-form"
import type { PesananCreateFormValues } from "../schemas/pesanan-schema"
import type { PaketSearchOption } from "../types/pesanan-types"

interface PesananFormProps {
  form: PesananFormReturnType & { store: { state: { values: PesananCreateFormValues } } }
  children?: ReactNode
  /** Pre-selected package to ensure it's always in options (for update drawer) */
  initialPaket?: PaketSearchOption | null
}

export function PesananForm({
  form,
  children,
  initialPaket,
}: PesananFormProps) {
  const paketId = useStore(form.store, (s) => s.values.paket_id) as number | null

  // --- List query: lightweight, stable, NOT dependent on selection ---
  // Fetches up to 20 packages for the dropdown (q=""). Local filtering in
  // FormCombobox handles search-as-you-type.
  const { data: paketOptions } = usePaketSearch("")

  // --- Detail query: fetch-on-select, triggers skeleton in calc panel ---
  const { data: paketDetail, isLoading: isDetailLoading } = usePaketDetail(paketId)

  // Ensure initialPaket is always in options (for update drawer)
  const mergedPaketOptions = useMemo(() => {
    const baseOptions = paketOptions ?? []
    if (!initialPaket) return baseOptions
    const exists = baseOptions.some((p) => p.id === initialPaket.id)
    if (exists) return baseOptions
    return [initialPaket, ...baseOptions]
  }, [paketOptions, initialPaket])

  // Resolve selected package for fallback label (before detail loads)
  const selectedPaketFallback = useMemo(() => {
    if (!paketId) return null
    const fromSearch = mergedPaketOptions?.find((p) => p.id === paketId)
    if (fromSearch) return fromSearch
    if (initialPaket && initialPaket.id === paketId) return initialPaket
    return null
  }, [paketId, mergedPaketOptions, initialPaket])

  // Prefer full detail (with thumbnail) when available, fallback to search option
  const calcPaket = paketDetail
    ? {
        id: paketDetail.id,
        nama_paket: paketDetail.nama_paket,
        thumbnail: paketDetail.thumbnail,
        harga_per_porsi: paketDetail.harga_per_porsi,
        min_order: paketDetail.min_order,
        kapasitas_produksi: paketDetail.kapasitas_produksi,
      }
    : selectedPaketFallback

  const isCalcLoading = !!paketId && isDetailLoading

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="flex flex-1 flex-col overflow-hidden"
    >
      <main className="show-scrollbar flex-1 overflow-y-auto overscroll-contain">
        <div className="grid grid-cols-1 items-start gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          {/* LEFT PANE: Input Form */}
          <div className="flex flex-col gap-12">
            <section>
              <header className="mb-6">
                <h2 className="font-heading text-xl font-semibold">
                  Informasi Pesanan
                </h2>
                <p className="text-sm text-muted-foreground">
                  Lengkapi detail pesanan di bawah ini.
                </p>
              </header>
              <FieldGroup className="flex flex-col gap-6">
                <form.AppField name="paket_id">
                  {(field) => (
                    <field.Combobox
                      label="Paket"
                      placeholder="Cari & pilih paket..."
                      options={mergedPaketOptions?.map((p) => ({
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
              </FieldGroup>
            </section>
          </div>

          {/* RIGHT PANE: Live Calculation Panel — now with thumbnail + skeleton */}
          <aside className="hidden lg:flex lg:flex-col">
            <PesananCalcPanel
              form={form}
              paketDetail={calcPaket}
              isLoading={isCalcLoading}
            />
          </aside>
        </div>
      </main>
      {children}
    </form>
  )
}
