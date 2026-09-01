import React from "react"
import { useStore } from "@tanstack/react-store"
import { useFieldContext } from "@/hooks/use-form"
import {
  FormBase,
  type FormControlProps,
} from "@/components/ui/fragments/custom/form/form-base"
import { cn } from "@/lib/utils"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/fragments/shadcn-ui/radio-group"
import { Label } from "@/components/ui/fragments/shadcn-ui/label"
import { HeartAddIcon, Money01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

const PAYMENT_METHODS = [
  {
    id: "mandiri",
    title: "Bayar Tunai",
    desc: "Bayar langsung di kasir poliklinik.",
    icon: Money01Icon,
    activeContainerClass: "border-emerald-500 bg-emerald-500/5",
    activeTextClass: "font-bold text-emerald-600",
    activeIconClass: "bg-emerald-500/20 text-emerald-600",
    activeRadioClass:
      "border-emerald-500 text-emerald-500 [&_span[data-state=checked]]:text-emerald-500 data-checked:border-emerald-500 data-checked:bg-emerald-500",
  },
  {
    id: "BPJS",
    title: "BPJS Kesehatan",
    desc: "Gunakan layanan asuransi BPJS.",
    icon: HeartAddIcon,
    activeContainerClass: "border-purple-500 bg-purple-500/5",
    activeTextClass: "font-bold text-purple-600",
    activeIconClass: "bg-purple-500/20 text-purple-600",
    activeRadioClass:
      "border-purple-500 text-purple-500 [&_span[data-state=checked]]:text-purple-500 data-checked:border-purple-500 data-checked:bg-purple-500",
  },
] as const

type FormPaymentMethodProps = Omit<FormControlProps, "LeftIcon">

export function PaymentMethodRadioGroup(props: FormPaymentMethodProps) {
  const field = useFieldContext<string>()

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

  const handleSelect = (val: string) => {
    if (isSubmitting) return
    field.handleChange(val)
  }

  return (
    <FormBase {...props}>
      <RadioGroup
        id={field.name}
        name={field.name}
        value={value ?? ""}
        disabled={isSubmitting}
        onValueChange={handleSelect}
        className="flex w-full flex-col gap-3"
      >
        {PAYMENT_METHODS.map((method) => {
          const isSelected = value === method.id

          return (
            <Label
              key={method.id}
              htmlFor={`${field.name}-${method.id}`}
              className={cn(
                "flex w-full cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all duration-200 active:scale-[0.99]",
                !isSelected &&
                  !isInvalid &&
                  "border-border bg-card hover:bg-muted/30",
                isSelected && !isInvalid && method.activeContainerClass,
                isInvalid &&
                  !isSelected &&
                  "border-destructive bg-destructive/5",
                isInvalid &&
                  isSelected &&
                  "border-destructive bg-destructive/10",
                isSubmitting &&
                  "pointer-events-none cursor-not-allowed opacity-50"
              )}
            >
              <div
                className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-full transition-colors",
                  !isSelected && !isInvalid && "bg-muted text-muted-foreground",
                  isSelected && !isInvalid && method.activeIconClass,
                  isInvalid && "bg-destructive/20 text-destructive"
                )}
              >
                <HugeiconsIcon icon={method.icon} className="size-6" />
              </div>

              <div className="flex flex-1 flex-col gap-1">
                <span
                  className={cn(
                    "text-base font-semibold transition-colors",
                    !isSelected && !isInvalid && "text-foreground",
                    isSelected && !isInvalid && method.activeTextClass,
                    isInvalid && "text-destructive"
                  )}
                >
                  {method.title}
                </span>
                <span
                  className={cn(
                    "text-xs transition-colors",
                    !isSelected && !isInvalid && "text-muted-foreground",
                    isSelected && !isInvalid && method.activeTextClass,
                    isInvalid && "text-destructive/80"
                  )}
                >
                  {method.desc}
                </span>
              </div>

              <RadioGroupItem
                value={method.id}
                id={`${field.name}-${method.id}`}
                className={cn(
                  "border-2 transition-colors",
                  !isSelected && !isInvalid && "border-muted-foreground",
                  isSelected && !isInvalid && method.activeRadioClass,
                  isInvalid && "border-destructive text-destructive"
                )}
              />
            </Label>
          )
        })}
      </RadioGroup>
    </FormBase>
  )
}
