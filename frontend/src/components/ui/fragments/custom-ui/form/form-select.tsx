"use client"

import { useStore } from "@tanstack/react-store"
import { useFieldContext } from "@/hooks/use-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/fragments/shadcn-ui/select"
import { FormBase, type FormControlProps } from "./form-base"
import { cn } from "@/lib/utils"

export interface SelectOption {
  value: string
  label: string
}

interface FormSelectProps
  extends Omit<
    FormControlProps,
    "type" | "maxLength" | "inputMode" | "placeholder" | "LeftIcon"
  > {
  options: readonly SelectOption[]
  placeholder?: string
  /** When provided, renders a "clear/none" item that writes `null` to the field. */
  noneLabel?: string
}

const NONE_VALUE = "__none__"

/**
 * FormSelect — shadcn Select wired into TanStack Form via `useFieldContext`.
 * Passed as `field.Select` after registration in `src/hooks/use-form.ts`.
 * `noneLabel` turns the select into an optional field: picking it stores `null`.
 */
export function FormSelect({
  options,
  placeholder,
  noneLabel,
  ...props
}: FormSelectProps) {
  const field = useFieldContext<string | null>()

  const isSubmitting = useStore(
    field.form.baseStore,
    (state) => state.isSubmitting
  )
  const submissionAttempts = useStore(
    field.form.baseStore,
    (state) => state.submissionAttempts
  )
  const errors = useStore(field.store, (state) => state.meta.errors)
  const value = useStore(field.store, (state) => state.value)

  const hasErrors = errors.length > 0
  const isInvalid = hasErrors && submissionAttempts > 0

  const selectValue =
    value === null || value === undefined ? "" : value

  return (
    <FormBase {...props}>
      <Select
        value={selectValue}
        onValueChange={(v) => {
          field.handleChange(v === NONE_VALUE ? null : v)
          // Selection is an implicit commit — run blur validation so a
          // stale submit-phase error clears instantly.
          field.handleBlur()
        }}
        disabled={isSubmitting}
      >
        <SelectTrigger
          id={field.name}
          aria-invalid={isInvalid}
          onBlur={field.handleBlur}
          className={cn(
            "h-12 w-full rounded-2xl border-border bg-background",
            "focus:border-primary focus:ring-primary/20 data-[state=open]:border-primary",
            selectValue && "data-[state=closed]:border-primary/50",
            isInvalid && "border-destructive bg-destructive/8"
          )}
        >
          <SelectValue
            placeholder={placeholder ?? props.label}
          />
        </SelectTrigger>
        <SelectContent>
          {noneLabel && (
            <SelectItem value={NONE_VALUE}>{noneLabel}</SelectItem>
          )}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormBase>
  )
}
