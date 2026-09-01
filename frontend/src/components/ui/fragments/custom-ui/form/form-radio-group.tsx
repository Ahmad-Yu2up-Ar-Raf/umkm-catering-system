import React from "react"
import { useStore } from "@tanstack/react-store"
import { useFieldContext } from "@/hooks/use-form"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/fragments/shadcn-ui/radio-group"
import { Label } from "@/components/ui/fragments/shadcn-ui/label"
import { FormBase, type FormControlProps } from "./form-base"
import { cn } from "@/lib/utils"

export type RadioOption = {
  label: string
  value: string
  icon?: React.ReactNode
  // 🎨 HYBRID STYLING: Bebas kustomisasi warna aktif tiap opsi
  activeContainerClass?: string
  activeTextClass?: string
  activeIconClass?: string
  activeRadioClass?: string
}

export type FormRadioGroupProps = Omit<FormControlProps, "LeftIcon"> & {
  options: RadioOption[]
  containerClassName?: string
}

export function FormRadioGroup(props: FormRadioGroupProps) {
  const field = useFieldContext<string>()

  const isSubmitting = useStore(
    field.form.baseStore,
    (state) => state.isSubmitting
  )
  const submissionAttempts = useStore(
    field.form.baseStore,
    (state) => state.submissionAttempts
  )

  // 🚨 FIX: Wajib di-subscribe secara realtime!
  const errors = useStore(field.store, (state) => state.meta.errors)
  const value = useStore(field.store, (state) => state.value)

  // Konsisten dengan komponen input lain
  const hasErrors = errors.length > 0
  const isInvalid = hasErrors && submissionAttempts > 0

  const handleSelect = (val: string) => {
    if (isSubmitting) return
    field.handleChange(val)
    // Blur tidak dipanggil agar tidak agresif memicu form-validation
  }

  return (
    <FormBase {...props}>
      <RadioGroup
        id={field.name}
        name={field.name}
        value={value ?? ""}
        disabled={isSubmitting}
        onValueChange={handleSelect}
        className={cn(
          "flex h-fit w-full flex-col gap-3 py-0 sm:flex-row",
          props.containerClassName
        )}
      >
        {props.options.map((option) => {
          const isSelected = value === option.value

          // Fallback tema default (Primary / Biru) jika custom tidak diset
          const defaultContainer = "border-primary bg-primary/5"
          const defaultText = "font-bold text-primary"
          const defaultIcon = "bg-primary/20 text-primary"
          const defaultRadio = "border-primary text-primary"

          return (
            <Label
              key={option.value}
              htmlFor={`${field.name}-${option.value}`}
              className={cn(
                "flex flex-1 cursor-pointer items-center gap-3.5 rounded-2xl border p-4 transition-all duration-200 active:scale-[0.98]",
                // Normal
                !isSelected &&
                  !isInvalid &&
                  "border-border bg-card hover:bg-muted/30",
                // Active State (Custom Inject)
                isSelected &&
                  !isInvalid &&
                  (option.activeContainerClass || defaultContainer),
                // Invalid State
                isInvalid &&
                  !isSelected &&
                  "border-destructive bg-destructive/5",
                isInvalid &&
                  isSelected &&
                  "border-destructive bg-destructive/10",
                // Disabled
                isSubmitting &&
                  "pointer-events-none cursor-not-allowed opacity-50"
              )}
            >
              {/* Box Icon (Jika Ada) */}
              {option.icon && (
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors [&_svg]:size-5",
                    !isSelected && !isInvalid && "text-muted-foreground",
                    isSelected &&
                      !isInvalid &&
                      (option.activeIconClass || defaultIcon),
                    isInvalid && "text-destructive"
                  )}
                >
                  {option.icon}
                </div>
              )}

              {/* Teks Label */}
              <span
                className={cn(
                  "flex-1 text-sm font-medium transition-colors",
                  !isSelected && !isInvalid && "text-muted-foreground",
                  isSelected &&
                    !isInvalid &&
                    (option.activeTextClass || defaultText),
                  isInvalid && "text-destructive"
                )}
              >
                {option.label}
              </span>

              {/* Shadcn Radio Item */}
              <RadioGroupItem
                value={option.value}
                id={`${field.name}-${option.value}`}
                className={cn(
                  "border-2 transition-colors",
                  !isSelected && !isInvalid && "border-muted-foreground",
                  isSelected &&
                    !isInvalid &&
                    (option.activeRadioClass || defaultRadio),
                  isInvalid &&
                    "data-checked:text-pink-500-foreground data-checked:bg-deborder-destructive dark:data-checked:bg-deborder-destructive [&_span[data-state=checked]]:text-deborder-destructive border-destructive text-destructive aria-invalid:aria-checked:border-destructive data-checked:border-destructive"
                )}
              />
            </Label>
          )
        })}
      </RadioGroup>
    </FormBase>
  )
}
