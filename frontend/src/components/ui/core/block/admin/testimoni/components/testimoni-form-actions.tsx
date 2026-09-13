"use client"

import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { Spinner } from "@/components/ui/fragments/shadcn-ui/spinner"
import type { TestimoniFormReturnType } from "../hooks/use-testimoni-mutations"

interface TestimoniFormActionsProps {
  form: TestimoniFormReturnType
  submitLabel: string
  onCancel: () => void
}

/** Footer actions shared by the Create/Update Sheet & Drawer shells. */
export function TestimoniFormActions({
  form,
  submitLabel,
  onCancel,
}: TestimoniFormActionsProps) {
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <div className="flex w-full items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-fit"
          >
            Batalkan
          </Button>
          <Button type="submit" disabled={isSubmitting} className="w-fit">
            {isSubmitting && <Spinner className="mr-2 size-4" />}
            {submitLabel}
          </Button>
        </div>
      )}
    </form.Subscribe>
  )
}
