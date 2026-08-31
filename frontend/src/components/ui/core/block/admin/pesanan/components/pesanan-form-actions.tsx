"use client"

import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { Spinner } from "@/components/ui/fragments/shadcn-ui/spinner"
import type { PesananFormReturnType } from "../hooks/use-pesanan-form"

interface PesananFormActionsProps {
  form: PesananFormReturnType
  submitLabel: string
  onCancel: () => void
}

export function PesananFormActions({
  form,
  submitLabel,
  onCancel,
}: PesananFormActionsProps) {
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <div className="flex w-full items-center justify-end gap-3 pt-2">
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
            type="submit"
            disabled={isSubmitting}
            className="w-fit"
          >
            {isSubmitting && <Spinner className="mr-2 size-4" />}
            {submitLabel}
          </Button>
        </div>
      )}
    </form.Subscribe>
  )
}