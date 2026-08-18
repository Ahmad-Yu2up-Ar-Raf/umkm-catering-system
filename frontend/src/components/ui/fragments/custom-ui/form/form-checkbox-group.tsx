"use client"

import { useStore } from "@tanstack/react-store"
import { useFieldContext } from "@/hooks/use-form"
import { FormBase, type FormControlProps } from "./form-base"
import { Checkbox } from "@/components/ui/fragments/shadcn-ui/checkbox"
import { cn } from "@/lib/utils"

interface CheckboxOption {
  label: string
  value: string | number
}

interface FormCheckboxGroupProps extends Omit<
  FormControlProps,
  "type" | "maxLength" | "inputMode" | "placeholder" | "LeftIcon"
> {
  options: CheckboxOption[]
}

export function FormCheckboxGroup(props: FormCheckboxGroupProps) {
  const field = useFieldContext<Array<string | number>>()

  const isSubmitting = useStore(
    field.form.baseStore,
    (state) => state.isSubmitting
  )
  const submissionAttempts = useStore(
    field.form.baseStore,
    (state) => state.submissionAttempts
  )
  const errors = useStore(field.store, (state) => state.meta.errors)
  const value = useStore(field.store, (state) => state.value) || []

  const hasErrors = errors.length > 0
  const isInvalid = hasErrors && submissionAttempts > 0

  const handleCheckboxChange = (
    checked: boolean | "indeterminate",
    optionValue: string | number
  ) => {
    const currentValues = Array.isArray(value) ? [...value] : []
    if (checked === true) {
      if (!currentValues.includes(optionValue)) {
        field.handleChange([...currentValues, optionValue])
      }
    } else {
      field.handleChange(currentValues.filter((v) => v !== optionValue))
    }
  }

  return (
    <FormBase {...props}>
      <div
        className={cn(
          "w-full py-2",
          isSubmitting && "pointer-events-none opacity-50",
          props.className
        )}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {props.options.map((option, index) => {
            const isChecked =
              Array.isArray(value) && value.includes(option.value)
            return (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all duration-200 hover:bg-muted/40",
                  isChecked
                    ? "border-primary bg-primary/5 font-medium text-primary"
                    : "border-border bg-card text-foreground",
                  isInvalid && "border-destructive/40"
                )}
              >
                <Checkbox
                  id={index === 0 ? field.name : undefined}
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(checked, option.value)
                  }
                  disabled={isSubmitting}
                />
                <span className="text-sm select-none">{option.label}</span>
              </label>
            )
          })}
        </div>
      </div>
    </FormBase>
  )
}
