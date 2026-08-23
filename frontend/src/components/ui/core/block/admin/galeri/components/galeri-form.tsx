"use client"

import type { ReactNode } from "react"
import { FieldGroup } from "@/components/ui/fragments/shadcn-ui/field"
import {
  CalendarIcon,
  Image01Icon,
  Restaurant01Icon,
} from "@hugeicons/core-free-icons"
import {
  GALERI_KATEGORI_OPTIONS,
} from "../config/galeri-enum-options"
import type { GaleriFormReturnType } from "../hooks/use-galeri-mutations"

interface GaleriFormProps {
  form: GaleriFormReturnType
  children?: ReactNode
}

/**
 * Shared Create/Update Galeri form. Grouped into Required (top) vs Optional (bottom).
 */
export default function GaleriForm({ form, children }: GaleriFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="show-scrollbar flex flex-1 flex-col gap-8 overflow-y-auto overscroll-contain"
    >
      <main className="flex flex-col gap-8 p-10">
        {/* Required Section */}
        <FieldGroup className="flex flex-col gap-6">
          <form.AppField name="nama_acara">
            {(field) => (
              <field.Input
                label="Nama Acara"
                LeftIcon={Restaurant01Icon}
                placeholder="Contoh: Pernikahan Budi & Siti"
              />
            )}
          </form.AppField>

          <form.AppField name="kategori_acara">
            {(field) => (
              <field.Select
                label="Kategori Acara"
                options={GALERI_KATEGORI_OPTIONS}
              />
            )}
          </form.AppField>

          <form.AppField name="thumbnail">
            {(field) => <field.ImageUpload label="Foto Utama / Thumbnail" />}
          </form.AppField>

          <form.AppField name="images">
            {(field) => (
              <field.ImagesUpload label="Galeri Gambar" maxFiles={10} />
            )}
          </form.AppField>
        </FieldGroup>

        {/* Optional Section */}
        <div className="space-y-6 border-t border-border pt-4">
          <header className="mb-4">
            <h1 className="text-lg font-semibold">Detail Tambahan</h1>
            <p className="text-sm text-muted-foreground">
              Informasi opsional untuk melengkapi data
            </p>
          </header>

          <FieldGroup className="flex flex-col gap-6">
            <form.AppField name="deskripsi_acara">
              {(field) => (
                <field.TextArea
                  label="Deskripsi Acara"
                  LeftIcon={Restaurant01Icon}
                  placeholder="Ceritakan momen spesial acara ini..."
                />
              )}
            </form.AppField>

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
              {(field) => <field.Checkbox label="Tandai sebagai Galeri Unggulan" />}
            </form.AppField>
          </FieldGroup>
        </div>
      </main>

      {children}
    </form>
  )
}