import React, { useState } from "react"
import { useStore } from "@tanstack/react-store"
import { FormBase, type FormControlProps } from "./form-base"
import { useFieldContext } from "@/hooks/use-form"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { Textarea } from "../../shadcn-ui/textarea" // Sesuaikan path jika beda

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

  // 🚨 FIX ROOT CAUSE: Subscribe realtime ke store agar bebas bug delay render!
  const errors = useStore(field.store, (state) => state.meta.errors)
  const value = useStore(field.store, (state) => state.value)

  // 1. LOGIKA VALIDASI
  const hasErrors = errors.length > 0
  const hasValue = value !== undefined && value !== ""

  const isInvalid = hasErrors && submissionAttempts > 0
  const isValid = hasValue && !hasErrors

  // 2. THEMING SYSTEM (Persis seperti FormInput)
  const defaultIconColor = props.iconClassName || "text-primary"
  const defaultInputColor = props.inputClassName || "text-primary"
  const focusClass = props.isFocusClassName || "border-primary bg-primary/5"
  const validClass = props.isValidClassName || "border-primary bg-primary/5"
  const invalidClass =
    props.isInvalidClassName ||
    "border-destructive bg-destructive/5 focus-visible:text-destructive focus-visible:placeholder:text-destructive"

  // 3. PRIORITAS VISUAL (Invalid > Valid > Focus > Normal)
  let containerStateClass = "border-border bg-card"
  let iconStateColor = defaultIconColor

  if (isInvalid) {
    containerStateClass = invalidClass
    iconStateColor = "text-destructive"
  } else if (isValid) {
    containerStateClass = validClass
    iconStateColor = defaultIconColor // Warna valid netep
  } else if (isFocused) {
    containerStateClass = focusClass
    iconStateColor = iconStateColor
  }

  return (
    <FormBase {...props}>
      <div
        className={cn(
          "relative flex w-full overflow-hidden rounded-2xl border border-border/40 transition-all duration-300 ease-in-out",
          "min-h-[120px]", // 🎯 TINGGI TEXTAREA: Jauh lebih tinggi dari FormInput
          containerStateClass,
          isSubmitting && "pointer-events-none opacity-50",
          props.className
        )}
      >
        {/* {props.LeftIcon && (
          <div
            className={cn(
              "absolute top-4 left-2.5 z-10 flex items-center justify-center transition-colors [&_svg]:size-5 [&_svg]:shrink-0",
              iconStateColor
            )}
          >
            <HugeiconsIcon icon={props.LeftIcon} />
          </div>
        )} */}

        <Textarea
          id={field.name}
          name={field.name}
          value={value ?? ""}
          disabled={isSubmitting}
          aria-invalid={isInvalid}
          placeholder={props.placeholder}
          rows={props.rows || 4} // Default 4 baris
          onChange={(e) => field.handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false)
            field.handleBlur()
          }}
          className={cn(
            "w-full resize-none border-0 bg-transparent px-5 py-4 pr-4 text-sm shadow-none transition-colors focus-visible:ring-0",
            // props.LeftIcon ? "pl-16" : "pl-4", // Padding kiri yang aman untuk Icon
            // Text Priority Logic
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
