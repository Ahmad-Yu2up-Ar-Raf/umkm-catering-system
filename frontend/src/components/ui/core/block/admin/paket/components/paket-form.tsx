"use client"

import type { ReactNode } from "react"
import { FieldGroup } from "@/components/ui/fragments/shadcn-ui/field"
import {
  CalculatorIcon,
  Dish01Icon,
  PackageIcon,
  Restaurant01Icon,
} from "@hugeicons/core-free-icons"
import {
  PAKET_KATEGORI_OPTIONS,
  KATEGORI_ACARA_OPTIONS,
} from "../config/paket-enum-options"
import type { PaketFormReturnType } from "../hooks/use-paket-mutations"

interface PaketFormProps {
  form: PaketFormReturnType
  children?: ReactNode
}

export default function PaketForm({ form, children }: PaketFormProps) {
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
        {/* FIX WIDTH GRID: 1.2fr Kiri, 0.8fr Kanan biar proporsional */}
        <div className="grid grid-cols-1 items-start gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          {/* KOLOM KIRI: Input Form Utama */}
          <div className="flex flex-col gap-12">
            <section>
              <header className="mb-6">
                <h2 className="font-heading text-xl font-semibold">
                  Informasi Dasar
                </h2>
                <p className="text-sm text-muted-foreground">
                  Data wajib untuk paket catering ini.
                </p>
              </header>
              <FieldGroup className="flex flex-col gap-6">
                <form.AppField name="nama_paket">
                  {(field) => (
                    <field.Input
                      label="Nama Paket"
                      LeftIcon={Dish01Icon}
                      placeholder="Contoh: Nasi Box Hemat"
                    />
                  )}
                </form.AppField>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <form.AppField name="kategori_paket">
                    {(field) => (
                      <field.Select
                        label="Kategori Paket"
                        options={PAKET_KATEGORI_OPTIONS}
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="harga_per_porsi">
                    {(field) => (
                      <field.CurrencyInput
                        label="Harga per Porsi"
                        LeftIcon={CalculatorIcon}
                        placeholder="Contoh: Rp 22.000"
                      />
                    )}
                  </form.AppField>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <form.AppField name="min_order">
                    {(field) => (
                      <field.Input
                        label="Min. Order"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        placeholder="Contoh: 1 (per paket)"
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="jenis_kemasan">
                    {(field) => (
                      <field.Input
                        label="Jenis Kemasan"
                        LeftIcon={PackageIcon}
                        placeholder="Contoh: Box kertas, Besek"
                      />
                    )}
                  </form.AppField>
                </div>

                <form.AppField name="menu_utama">
                  {(field) => (
                    <field.TagInput
                      label="Menu Utama"
                      placeholder="Contoh: Ayam goreng (Enter untuk menambah)"
                    />
                  )}
                </form.AppField>

                <form.AppField name="deskripsi">
                  {(field) => (
                    <field.TextArea
                      label="Deskripsi"
                      LeftIcon={Restaurant01Icon}
                      placeholder="Isi paket, porsi, atau nilai jual unik paket ini..."
                    />
                  )}
                </form.AppField>
              </FieldGroup>
            </section>

            {/* Optional Section */}
            <section className="border-t border-border pt-8">
              <header className="mb-6">
                <h2 className="font-heading text-xl font-semibold">
                  Detail Tambahan
                </h2>
                <p className="text-sm text-muted-foreground">
                  Informasi opsional untuk melengkapi data paket.
                </p>
              </header>

              <FieldGroup className="flex flex-col gap-6">
                {/* DIPINDAHKAN: Galeri Gambar ke Detail Tambahan */}
                <form.AppField name="images">
                  {(field) => (
                    <field.ImagesUpload label="Galeri Gambar" maxFiles={8} />
                  )}
                </form.AppField>
                <form.AppField name="kategori_acara">
                  {(field) => (
                    <field.Select
                      label="Kategori Acara"
                      options={KATEGORI_ACARA_OPTIONS}
                      noneLabel="— Bukan untuk acara tertentu —"
                    />
                  )}
                </form.AppField>

                <form.AppField name="kapasitas_produksi">
                  {(field) => (
                    <field.Input
                      label="Kapasitas Produksi"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      placeholder="Opsional — maksimum porsi per event"
                    />
                  )}
                </form.AppField>

                <form.AppField name="menu_tambahan">
                  {(field) => (
                    <field.TagInput
                      label="Menu Tambahan"
                      placeholder="Opsional — contoh: Sambal, kerupuk"
                    />
                  )}
                </form.AppField>

                <form.AppField name="fasilitas_termasuk">
                  {(field) => (
                    <field.TagInput
                      label="Fasilitas Termasuk"
                      placeholder="Opsional — contoh: Sendok, garpu, tissue"
                    />
                  )}
                </form.AppField>

                <form.AppField name="catatan_alergen">
                  {(field) => (
                    <field.TextArea
                      label="Catatan Alergen"
                      placeholder="Opsional — contoh: mengandung kacang, seafood"
                    />
                  )}
                </form.AppField>

                <form.AppField name="is_best_seller">
                  {(field) => (
                    <field.Checkbox label="Tandai sebagai Best Seller" />
                  )}
                </form.AppField>
              </FieldGroup>
            </section>
          </div>

          {/* KOLOM KANAN: Sticky Sidebar cuma buat Thumbnail Utama */}
          <aside className="sticky top-4 flex flex-col gap-6 rounded-2xl border bg-secondary/20 p-6 sm:top-10 lg:p-7">
            <header className="flex items-center gap-2 border-b pb-4">
              <div>
                <h2 className="font-heading text-lg font-semibold tracking-tight">
                  Media & Foto
                </h2>
                <p className="text-xs text-muted-foreground">
                  Visual untuk paket ini.
                </p>
              </div>
            </header>

            <div className="flex flex-col gap-8">
              <form.AppField name="thumbnail">
                {(field) => (
                  <field.ImageUpload label="Foto Utama (Thumbnail)" />
                )}
              </form.AppField>
            </div>
          </aside>
        </div>
      </main>
      {children}
    </form>
  )
}
