import React, { useState } from "react"
import { useStore } from "@tanstack/react-store"
import { useFieldContext } from "@/hooks/use-form"
import { Input } from "@/components/ui/fragments/shadcn-ui/input"
import { FormBase, type FormControlProps } from "./form-base"
import { cn } from "@/lib/utils"

export function FormInput(props: FormControlProps) {
  const field = useFieldContext<string | number>()
  const [isFocused, setIsFocused] = useState(false)

  const isSubmitting = useStore(
    field.form.baseStore,
    (state) => state.isSubmitting
  )
  const submissionAttempts = useStore(
    field.form.baseStore,
    (state) => state.submissionAttempts
  )

  // 🚨 FIX ROOT CAUSE: Subscribe ke value & errors dari field.store
  // agar setiap ketikan (onChange) merender ulang UI secara realtime.
  const errors = useStore(field.store, (state) => state.meta.errors)
  const value = useStore(field.store, (state) => state.value)

  // 1. LOGIKA VALIDASI
  const hasErrors = errors.length > 0
  const hasValue = value !== undefined && value !== ""

  // Tahan error dan validasi hijau sebelum submit pertama
  const isInvalid = hasErrors && submissionAttempts > 0
  const isValid = hasValue && !hasErrors

  // 2. THEMING SYSTEM
  const defaultInputColor = props.inputClassName || "text-primary"
  const focusClass = props.isFocusClassName || "border-primary bg-primary/5"
  const validClass = props.isValidClassName || "border-primary bg-primary/5"
  const invalidClass =
    props.isInvalidClassName ||
    "border-destructive  bg-destructive/8  focus-visible:text-destructive focus-visible:placeholder:text-destructive"

  // 3. PRIORITAS VISUAL (Invalid > Valid > Focus > Normal)
  let containerStateClass = "border-border "

  if (isInvalid) {
    containerStateClass = invalidClass
  } else if (isValid) {
    containerStateClass = validClass
  } else if (isFocused) {
    containerStateClass = focusClass
  }

  // 4. INTERCEPTOR ONCHANGE
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value

    if (props.inputMode === "numeric") {
      val = val.replace(/[^0-9]/g, "") // Blokir semua huruf seketika
    }

    if (props.type === "number") {
      field.handleChange(
        (val === "" ? undefined : Number(val)) as string | number
      )
    } else {
      field.handleChange(val)
    }
    // Every keystroke is a commit — run blur validation so stale errors
    // clear on the first valid character.
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
        {/* {props.LeftIcon && (
          <div
            className={cn(
              "absolute left-4 z-10 flex h-full items-center justify-center transition-colors [&_svg]:size-4 [&_svg]:shrink-0",
              iconStateColor
            )}
          >
            <HugeiconsIcon icon={props.LeftIcon} />
          </div>
        )} */}

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
            // props.LeftIcon ? "pl-7" : "pl-4", // Fix padding agar icon tidak bertumpuk

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
