"use client"

import { useState } from "react"
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
  const [isOpen, setIsOpen] = useState(false)

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

  // 1. LOGIKA VALIDASI
  const hasErrors = errors.length > 0
  const hasValue = value !== undefined && value !== null && value !== ""
  const isInvalid = hasErrors && submissionAttempts > 0
  const isValid = hasValue && !hasErrors

  // 2. THEMING SYSTEM
  const defaultInputColor = props.inputClassName || "text-primary"
  const focusClass = props.isFocusClassName || "border-primary bg-primary/5"
  const validClass = props.isValidClassName || "border-primary bg-primary/5"
  const invalidClass =
    props.isInvalidClassName ||
    "border-destructive bg-destructive/8 text-destructive focus:ring-destructive/20"

  // 3. PRIORITAS VISUAL
  // FIX: Reset bg jadi transparan by default supaya gak kecampur bg-background milik shadcn.
  let containerStateClass = "border-border bg-transparent"

  if (isInvalid) {
    containerStateClass = invalidClass
  } else if (isValid) {
    containerStateClass = validClass
  } else if (isOpen) {
    containerStateClass = focusClass
  }

  const selectValue = value === null || value === undefined ? "" : value

  return (
    <FormBase {...props}>
      <Select
        value={selectValue}
        onValueChange={(v) => {
          field.handleChange(v === NONE_VALUE || v === "" ? null : v)
          field.handleBlur()
        }}
        onOpenChange={setIsOpen}
        disabled={isSubmitting}
      >
        <SelectTrigger
          id={field.name}
          aria-invalid={isInvalid}
          onBlur={field.handleBlur}
          className={cn(
            "w-full border px-3 text-sm shadow-none transition-all duration-300 ease-in-out",
            "focus:ring-0 focus:ring-offset-0 focus:outline-none data-[state=open]:ring-0",
            // FIX: Tambahkan !h-12 dan !rounded-2xl untuk menumbangkan styling bawaan data-[size=default]:h-9 dan rounded-full
            "!h-12 !rounded-2xl",
            containerStateClass,
            isInvalid &&
              "placeholder:text-destructive/70 data-placeholder:text-destructive/70",
            isValid && "font-medium text-primary",
            !isInvalid && !isValid && defaultInputColor
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
