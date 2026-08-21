"use client"

import React, { useState, useEffect } from "react"
import { useStore } from "@tanstack/react-store"
import { useFieldContext } from "@/hooks/use-form"
import { Input } from "@/components/ui/fragments/shadcn-ui/input"
import { FormBase, type FormControlProps } from "./form-base"
import { cn } from "@/lib/utils"

const formatIDR = (val: number | undefined | null) => {
  if (val === undefined || val === null || isNaN(val)) return ""
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val)
}

/**
 * FormCurrencyInput — Specialized text input that masks numeric values as IDR
 * (Rp 1.000) while persisting raw integers to the form state.
 */
export function FormCurrencyInput(props: FormControlProps) {
  const field = useFieldContext<number | undefined>()
  const [isFocused, setIsFocused] = useState(false)
  
  const value = useStore(field.store, (s) => s.value)
  const isSubmitting = useStore(field.form.baseStore, (s) => s.isSubmitting)
  const submissionAttempts = useStore(field.form.baseStore, (s) => s.submissionAttempts)
  const errors = useStore(field.store, (s) => s.meta.errors)

  const [displayValue, setDisplayValue] = useState("")

  // Sync display value with state value (internal number -> formatted string)
  useEffect(() => {
    if (!isFocused) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayValue(formatIDR(value))
    }
  }, [value, isFocused])

  const isInvalid = errors.length > 0 && submissionAttempts > 0
  const isValid = value !== undefined && value !== null && errors.length === 0

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "")
    const numericValue = rawValue === "" ? undefined : parseInt(rawValue, 10)
    
    // Update internal state immediately
    field.handleChange(numericValue)
    
    // Update display value with mask
    setDisplayValue(formatIDR(numericValue))
  }

  const containerStateClass = isInvalid
    ? props.isInvalidClassName || "border-destructive bg-destructive/8 focus-visible:text-destructive"
    : isValid
    ? props.isValidClassName || "border-primary bg-primary/5"
    : isFocused
    ? props.isFocusClassName || "border-primary bg-primary/5"
    : "border-border"

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
          value={displayValue}
          placeholder={props.placeholder}
          type="text"
          disabled={isSubmitting}
          aria-invalid={isInvalid}
          onChange={handleChange}
          onFocus={() => {
            setIsFocused(true)
            // Show raw digits while focused to facilitate editing? 
            // Requirements say: "displays Rp prefix and . for thousands separators dynamically as the user types"
            // So we keep formatting while focused.
          }}
          onBlur={() => {
            setIsFocused(false)
            field.handleBlur()
          }}
          className={cn(
            "h-full border-0 bg-transparent px-3 text-sm shadow-none focus-visible:ring-0",
            isInvalid && "text-destructive placeholder:text-destructive",
            isValid && "font-medium text-primary",
            !isInvalid && !isValid && (props.inputClassName || "text-primary")
          )}
        />
      </div>
    </FormBase>
  )
}
