"use client"

import type { ReactNode } from "react"
import { FieldGroup } from "@/components/ui/fragments/shadcn-ui/field"
import {
  CalendarIcon,
  Image01Icon,
  Restaurant01Icon,
} from "@hugeicons/core-free-icons"
import { GALERI_KATEGORI_OPTIONS } from "../config/galeri-enum-options"
import type { GaleriFormReturnType } from "../hooks/use-galeri-mutations"

interface GaleriFormProps {
  form: GaleriFormReturnType
  children?: ReactNode
}

/**
 * Shared Create/Update Galeri form.
 * Grid layout matching Paket: left column (1.2fr) = main form, right column (0.8fr) = sticky thumbnail sidebar.
 */
export default function GaleriForm({ form, children }: GaleriFormProps) {
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
        {/* Grid layout: left column (main form) + right sticky sidebar (thumbnail) */}
        <div className="grid grid-cols-1 items-start gap-12 p-6 sm:p-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          {/* LEFT COLUMN: Main form fields */}
          <div className="flex flex-col gap-12">
            {/* Required Section: Informasi Dasar */}
            <section>
              <header className="mb-8 border-b pb-6">
                <h2 className="font-heading text-xl font-semibold">
                  Informasi Dasar
                </h2>
                <p className="text-sm text-muted-foreground">
                  Data wajib untuk galeri acara ini.
                </p>
              </header>
              <FieldGroup className="flex flex-col gap-8">
                <form.AppField name="nama_acara">
                  {(field) => (
                    <field.Input
                      label="Nama Acara"
                      LeftIcon={Restaurant01Icon}
                      placeholder="Contoh: Pernikahan Budi & Siti"
                    />
                  )}
                </form.AppField>
              </FieldGroup>
            </section>

            {/* Optional Section: Detail Tambahan */}
            <section className="border-t border-border pt-8">
              <header className="mb-11">
                <h2 className="font-heading text-xl font-semibold">
                  Detail Tambahan
                </h2>
                <p className="text-sm text-muted-foreground">
                  Informasi opsional untuk melengkapi data galeri.
                </p>
              </header>
              <FieldGroup className="flex flex-col gap-8">
                <form.AppField name="kategori_acara">
                  {(field) => (
                    <field.Select
                      label="Kategori Acara"
                      options={GALERI_KATEGORI_OPTIONS}
                    />
                  )}
                </form.AppField>

                <form.AppField name="deskripsi_acara">
                  {(field) => (
                    <field.TextArea
                      label="Deskripsi Acara"
                      LeftIcon={Restaurant01Icon}
                      placeholder="Ceritakan momen spesial acara ini..."
                    />
                  )}
                </form.AppField>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <form.AppField name="tanggal_acara">
                    {(field) => (
                      <field.DateInput
                        label="Tanggal Acara"
                        LeftIcon={CalendarIcon}
                        placeholder="Pilih tanggal"
                      />
                    )}
                  </form.AppField>

                  <form.AppField name="lokasi">
                    {(field) => (
                      <field.Input
                        label="Lokasi"
                        LeftIcon={Image01Icon}
                        placeholder="Contoh: Hotel Mulia, Jakarta"
                      />
                    )}
                  </form.AppField>
                </div>

                <form.AppField name="jumlah_tamu">
                  {(field) => (
                    <field.Input
                      label="Jumlah Tamu"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      placeholder="Opsional — estimasi jumlah tamu"
                    />
                  )}
                </form.AppField>
                <form.AppField name="is_featured">
                  {(field) => (
                    <field.Checkbox label="Tandai sebagai Galeri Unggulan" />
                  )}
                </form.AppField>
              </FieldGroup>
            </section>
          </div>

          {/* RIGHT COLUMN: Sticky Thumbnail Sidebar */}
          <aside className="sticky top-4 flex flex-col gap-8 rounded-2xl border bg-secondary/20 p-6 sm:top-10 lg:p-7">
            <header className="flex items-center gap-2 border-b pb-4">
              <div>
                <h2 className="font-heading text-lg font-semibold tracking-tight">
                  Media & Foto
                </h2>
                <p className="text-xs text-muted-foreground">
                  Visual untuk galeri ini.
                </p>
              </div>
            </header>

            <div className="flex flex-col gap-8">
              <form.AppField name="gambar_acara">
                {(field) => <field.ImageUpload label="Foto Utama" />}
              </form.AppField>
            </div>
          </aside>
        </div>
      </main>
      {children}
    </form>
  )
}
