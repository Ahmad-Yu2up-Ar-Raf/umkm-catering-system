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

interface FormSelectProps extends Omit<
  FormControlProps,
  "type" | "maxLength" | "inputMode" | "placeholder" | "LeftIcon"
> {
  options: readonly SelectOption[]
  placeholder?: string
  noneLabel?: string
}

const NONE_VALUE = "__none__"

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

  const selectValue = value === null || value === undefined ? "" : value

  return (
    <FormBase {...props}>
      <Select
        value={selectValue}
        onValueChange={(v) => {
          field.handleChange(v === NONE_VALUE || v === "" ? null : v)
          field.handleBlur()
        }}
        disabled={isSubmitting}
      >
        <SelectTrigger
          id={field.name}
          aria-invalid={isInvalid}
          onBlur={field.handleBlur}
          className={cn(
            "h-12 w-full rounded-2xl border-border bg-background transition-colors",
            "focus:border-primary focus:ring-primary/20 data-[state=open]:border-primary",
            selectValue &&
              !isInvalid &&
              "data-[state=closed]:border-primary/50",
            isInvalid &&
              "border-destructive bg-destructive/8 text-destructive focus:ring-destructive/20"
          )}
        >
          <SelectValue
            placeholder={placeholder ?? `Pilih ${props.label ?? ""}`.trim()}
          />
        </SelectTrigger>
        <SelectContent>
          {noneLabel && <SelectItem value={NONE_VALUE}>{noneLabel}</SelectItem>}
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
