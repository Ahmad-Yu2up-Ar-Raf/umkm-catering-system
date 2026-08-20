"use client"

import { useStore } from "@tanstack/react-store"
import { useFieldContext } from "@/hooks/use-form"
import { Checkbox } from "@/components/ui/fragments/shadcn-ui/checkbox"
import { FormBase, type FormControlProps } from "./form-base"
import { cn } from "@/lib/utils"

interface FormCheckboxProps extends Omit<
  FormControlProps,
  "type" | "maxLength" | "inputMode" | "placeholder" | "LeftIcon"
> {
  /** Visible label rendered inside the toggle card (FormBase label is omitted). */
  label?: string
}

/**
 * FormCheckbox — single boolean field (`is_best_seller`) wired into TanStack
 * Form. Renders a bordered card with the label next to the control, matching
 * the CheckboxGroup visual language.
 */
export function FormCheckbox({ label, ...props }: FormCheckboxProps) {
  const field = useFieldContext<boolean>()

  const isSubmitting = useStore(
    field.form.baseStore,
    (state) => state.isSubmitting
  )
  const submissionAttempts = useStore(
    field.form.baseStore,
    (state) => state.submissionAttempts
  )
  const errors = useStore(field.store, (state) => state.meta.errors)
  const value = useStore(field.store, (state) => state.value) ?? false

  const isInvalid = errors.length > 0 && submissionAttempts > 0

  return (
    <FormBase {...props}>
      <div
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl border p-4 transition-all duration-200",
          value
            ? "border-primary bg-primary/5"
            : "border-border bg-card",
          isInvalid && "border-destructive/40",
          isSubmitting && "pointer-events-none opacity-50"
        )}
        aria-invalid={isInvalid || undefined}
      >
        <Checkbox
          id={field.name}
          checked={value}
          onCheckedChange={(checked) => field.handleChange(checked === true)}
          disabled={isSubmitting}
        />
        <label
          htmlFor={field.name}
          className="text-sm font-medium select-none"
        >
          {label}
        </label>
      </div>
    </FormBase>
  )
}
