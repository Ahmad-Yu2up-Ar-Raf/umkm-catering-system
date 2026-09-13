"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { SentIcon } from "@hugeicons/core-free-icons"
import { FieldGroup } from "@/components/ui/fragments/shadcn-ui/field"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { Spinner } from "@/components/ui/fragments/shadcn-ui/spinner"
import type { ReviewFormReturnType } from "../hooks/use-paket-reviews"

/**
 * Anonymous review form. No paket selector (paketId comes from the page)
 * and no visibility control (forced to private server-side for moderation).
 * The form instance is owned by the caller (dialog shell) so it can guard
 * dirty closes — pass the same `useReviewForm` result down.
 */
export function ReviewForm({
  form,
  onCancel,
}: {
  form: ReviewFormReturnType
  onCancel?: () => void
}) {

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="flex flex-col gap-8"
    >
      <section>
        <header className="mb-6 border-b pb-4">
          <h3 className="font-heading text-lg font-semibold">Informasi Wajib</h3>
          <p className="text-xs text-muted-foreground">
            Data utama ulasan Anda.
          </p>
        </header>
        <FieldGroup className="flex flex-col gap-6">
          <form.AppField name="nama">
            {(field) => (
              <field.Input label="Nama" placeholder="Contoh: Ibu Ratna" />
            )}
          </form.AppField>

          <form.AppField name="pesanan">
            {(field) => (
              <field.TextArea
                label="Pesan / Ulasan"
                placeholder="Ceritakan pengalaman Anda dengan paket ini..."
                rows={4}
              />
            )}
          </form.AppField>

          <form.AppField name="rating">
            {(field) => <field.Rating label="Rating Bintang" size="md" />}
          </form.AppField>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <form.AppField name="acara">
              {(field) => (
                <field.Input
                  label="Acara"
                  placeholder="Contoh: Pernikahan"
                />
              )}
            </form.AppField>

            <form.AppField name="lokasi">
              {(field) => (
                <field.Input
                  label="Lokasi"
                  placeholder="Contoh: Taman Sari, Bogor"
                />
              )}
            </form.AppField>
          </div>
        </FieldGroup>
      </section>

      <section>
        <header className="mb-6 border-b pb-4">
          <h3 className="font-heading text-lg font-semibold">
            Detail Tambahan{" "}
            <span className="font-sans text-xs font-normal text-muted-foreground">
              (Opsional)
            </span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Konteks tambahan agar ulasan lebih bermakna.
          </p>
        </header>
        <FieldGroup className="flex flex-col gap-6">
          <form.AppField name="tanggal_acara">
            {(field) => (
              <field.DateInput
                label="Tanggal Acara"
                placeholder="Pilih tanggal (opsional)"
              />
            )}
          </form.AppField>
        </FieldGroup>
      </section>

      <p className="text-xs text-muted-foreground">
        Ulasan Anda akan tampil di halaman ini setelah disetujui oleh admin.
      </p>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-border bg-popover py-4 sm:flex-row sm:justify-end">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="w-full sm:w-fit"
              >
                Batal
              </Button>
            )}
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting}
              className="w-full sm:w-fit"
            >
              {isSubmitting ? (
                <Spinner className="mr-2 size-4" />
              ) : (
                <HugeiconsIcon icon={SentIcon} className="mr-2 size-4" />
              )}
              Ajukan Review
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  )
}
