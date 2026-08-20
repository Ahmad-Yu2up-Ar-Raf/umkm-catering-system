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

/** Footer actions shared by the Create/Update Sheet & Drawer shells. */
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
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-fit"
            >
              Batalkan
            </Button>
            <Button
              type="submit"
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
