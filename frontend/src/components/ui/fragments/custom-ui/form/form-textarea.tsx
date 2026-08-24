import React, { useState } from "react"
import { useStore } from "@tanstack/react-store"
import { FormBase, type FormControlProps } from "./form-base"
import { useFieldContext } from "@/hooks/use-form"
import { cn } from "@/lib/utils"
import { Textarea } from "../../shadcn-ui/textarea"

export type FormTextAreaProps = FormControlProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>

export function FormTextArea(props: FormTextAreaProps) {
  const field = useFieldContext<string>()
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

  // 1. LOGIKA VALIDASI (FIXED)
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
    "border-destructive bg-destructive/5 focus-visible:text-destructive focus-visible:placeholder:text-destructive"

  // 3. PRIORITAS VISUAL
  let containerStateClass = "border-border bg-card"

  if (isInvalid) {
    containerStateClass = invalidClass
  } else if (isValid) {
    containerStateClass = validClass
  } else if (isFocused) {
    containerStateClass = focusClass
  }

  return (
    <FormBase {...props}>
      <div
        className={cn(
          "relative flex w-full overflow-hidden rounded-2xl border border-border/40 transition-all duration-300 ease-in-out",
          "min-h-[120px]",
          containerStateClass,
          isSubmitting && "pointer-events-none opacity-50",
          props.className
        )}
      >
        <Textarea
          id={field.name}
          name={field.name}
          value={value ?? ""}
          disabled={isSubmitting}
          aria-invalid={isInvalid}
          placeholder={props.placeholder}
          rows={props.rows || 4}
          onChange={(e) => {
            field.handleChange(e.target.value)
            field.handleBlur()
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false)
            field.handleBlur()
          }}
          className={cn(
            "w-full resize-none border-0 bg-transparent px-5 py-4 pr-4 text-sm shadow-none transition-colors focus-visible:ring-0",
            isInvalid &&
              "text-destructive placeholder:text-destructive focus-visible:text-destructive focus-visible:placeholder:text-destructive",
            isValid && "font-medium text-primary",
            !isInvalid && defaultInputColor
          )}
        />
      </div>
    </FormBase>
  )
}
