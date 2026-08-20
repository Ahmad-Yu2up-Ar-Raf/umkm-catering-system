"use client"

import type { ReactNode } from "react"
import { FieldGroup } from "@/components/ui/fragments/shadcn-ui/field"
import {
  CalculatorIcon,
  Dish01Icon,
  PackageIcon,
  Restaurant01Icon,
} from "@hugeicons/core-free-icons"
import { PAKET_KATEGORI_OPTIONS, KATEGORI_ACARA_OPTIONS } from "../config/paket-enum-options"
import type { PaketFormReturnType } from "../hooks/use-paket-mutations"

interface PaketFormProps {
  form: PaketFormReturnType
  children?: ReactNode
}

/**
 * Shared Create/Update Paket form. Hosted inside the responsive Sheet/Drawer
 * shells — scroll ownership stays with the shell, this component only owns the
 * field layout. Upload fields resolve Files in the form's submit handler.
 */
export default function PaketForm({ form, children }: PaketFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="flex flex-col gap-8"
    >
      <main className="grid gap-8">
        {/* Identitas & harga */}
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

          <form.AppField name="kategori_paket">
            {(field) => (
              <field.Select
                label="Kategori Paket"
                options={PAKET_KATEGORI_OPTIONS}
              />
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

          <form.AppField name="harga_per_porsi">
            {(field) => (
              <field.Input
                label="Harga per Porsi (Rp)"
                type="number"
                inputMode="numeric"
                LeftIcon={CalculatorIcon}
                placeholder="Contoh: 22000"
              />
            )}
          </form.AppField>

          <form.AppField name="min_order">
            {(field) => (
              <field.Input
                label="Min. Order"
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="Contoh: 1 atau 10 (per paket)"
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

          <form.AppField name="jenis_kemasan">
            {(field) => (
              <field.Input
                label="Jenis Kemasan"
                LeftIcon={PackageIcon}
                placeholder="Contoh: Box kertas, Besek, melamin"
              />
            )}
          </form.AppField>

          <form.AppField name="is_best_seller">
            {(field) => (
              <field.Checkbox label="Tandai sebagai Best Seller" />
            )}
          </form.AppField>
        </FieldGroup>

        {/* Media */}
        <FieldGroup className="grid gap-6">
          <form.AppField name="thumbnail">
            {(field) => (
              <field.ImageUpload label="Foto Utama / Thumbnail" />
            )}
          </form.AppField>

          <form.AppField name="images">
            {(field) => (
              <field.ImagesUpload label="Galeri Gambar" maxFiles={8} />
            )}
          </form.AppField>
        </FieldGroup>

        {/* Menu & fasilitas */}
        <FieldGroup className="grid gap-6">
          <form.AppField name="menu_utama">
            {(field) => (
              <field.TagInput
                label="Menu Utama"
                placeholder="Contoh: Ayam goreng (Enter untuk menambah)"
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
        </FieldGroup>

        {/* Deskripsi */}
        <FieldGroup className="grid gap-6">
          <form.AppField name="catatan_alergen">
            {(field) => (
              <field.TextArea
                label="Catatan Alergen"
                placeholder="Opsional — contoh: mengandung kacang, seafood"
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
      </main>

      {children}
    </form>
  )
}
