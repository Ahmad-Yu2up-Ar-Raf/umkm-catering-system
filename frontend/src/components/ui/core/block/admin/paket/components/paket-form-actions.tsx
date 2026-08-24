"use client"

import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { Spinner } from "@/components/ui/fragments/shadcn-ui/spinner"
import { usePaketUploadStore } from "@/store/paket-upload-store"
import type { PaketFormReturnType } from "../hooks/use-paket-mutations"

interface PaketFormActionsProps {
  form: PaketFormReturnType
  submitLabel: string
  onCancel: () => void
}

export function PaketFormActions({
  form,
  submitLabel,
  onCancel,
}: PaketFormActionsProps) {
  const activeUploads = usePaketUploadStore((s) => s.activeUploads)

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => {
        const uploading = activeUploads > 0
        return (
          <div className="flex w-full items-center justify-end gap-3 pt-2">
            <span className="mr-auto text-xs text-muted-foreground">
              {uploading && "Mengunggah gambar…"}
            </span>
            <Button
              size={"lg"}
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-fit"
            >
              Batalkan
            </Button>
            <Button
              size={"lg"}
              type="submit" // <-- Kembalikan jadi type="submit" murni
              disabled={isSubmitting || uploading}
              className="w-fit"
              title={uploading ? "Tunggu upload gambar selesai" : undefined}
            >
              {isSubmitting && <Spinner className="mr-2 size-4" />}
              {submitLabel}
            </Button>
          </div>
        )
      }}
    </form.Subscribe>
  )
}
