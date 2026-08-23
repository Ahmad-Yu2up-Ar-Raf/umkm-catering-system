"use client"

import React, { useState } from "react"
import { useStore } from "@tanstack/react-store"
import { useFieldContext } from "@/hooks/use-form"
import { Input } from "@/components/ui/fragments/shadcn-ui/input"
import { FormBase, type FormControlProps } from "./form-base"
import { cn } from "@/lib/utils"

export function FormInput(props: FormControlProps) {
  const field = useFieldContext<string | number | null>()
  const [isFocused, setIsFocused] = useState(false)

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

  // 1. LOGIKA VALIDASI (FIXED: null & undefined dihitung sebagai KOSONG)
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
    "border-destructive bg-destructive/8 focus-visible:text-destructive focus-visible:placeholder:text-destructive/70"

  // 3. PRIORITAS VISUAL
  let containerStateClass = "border-border "

  if (isInvalid) {
    containerStateClass = invalidClass
  } else if (isValid) {
    containerStateClass = validClass
  } else if (isFocused) {
    containerStateClass = focusClass
  }

  // 4. INTERCEPTOR ONCHANGE (FIXED: Kembalikan null saat input dibersihkan)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value

    if (props.inputMode === "numeric") {
      val = val.replace(/[^0-9]/g, "")
    }

    if (props.type === "number") {
      field.handleChange(
        (val === "" ? null : Number(val)) as string | number | null
      )
    } else {
      field.handleChange(val === "" ? null : val)
    }

    field.handleBlur()
  }

  return (
    <FormBase {...props}>
      <div
        className={cn(
          "relative flex h-12 w-full items-center overflow-hidden rounded-2xl border border-border/4 transition-all duration-300 ease-in-out",
          containerStateClass,
          isSubmitting && "pointer-events-none opacity-50",
          props.className
        )}
      >
        <Input
          id={field.name}
          name={field.name}
          value={value ?? ""}
          inputMode={props.inputMode}
          maxLength={props.maxLength}
          min={props.min}
          max={props.max}
          placeholder={props.placeholder}
          type={props.type}
          disabled={isSubmitting}
          aria-invalid={isInvalid}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false)
            field.handleBlur()
          }}
          className={cn(
            "right-0 h-full border-0 bg-transparent px-3 text-sm shadow-none transition-colors focus-visible:ring-0",
            isInvalid &&
              "text-destructive placeholder:text-destructive/70 focus-visible:text-destructive focus-visible:placeholder:text-destructive/70",
            isValid && "font-medium text-primary",
            !isInvalid && !isValid && defaultInputColor
          )}
        />
      </div>
    </FormBase>
  )
}
