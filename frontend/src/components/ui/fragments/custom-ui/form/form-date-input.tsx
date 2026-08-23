import { useState } from "react"
import { useStore } from "@tanstack/react-store"
import { format, parse } from "date-fns"
import { id } from "date-fns/locale"
import { useFieldContext } from "@/hooks/use-form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/fragments/shadcn-ui/popover"
import { Calendar } from "@/components/ui/fragments/shadcn-ui/calendar"
import { FormBase, type FormControlProps } from "./form-base"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"

export type FormDateInputProps = FormControlProps & {
  defaultMonthFallback?: Date
  disableFuture?: boolean
  disablePast?: boolean // 👈 Tambahkan ini untuk mematikan tanggal lalu
  captionLayout?:
    "label" | "dropdown" | "dropdown-months" | "dropdown-years" | undefined
}

export function FormDateInput({
  defaultMonthFallback,
  disableFuture = false,
  disablePast = false, // 👈 Default false
  captionLayout,
  ...props
}: FormDateInputProps) {
  const field = useFieldContext<string>()
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

  const hasErrors = errors.length > 0
  const hasValue = value !== undefined && value !== ""

  // ✅ FIX: Konsisten menggunakan patokan submissionAttempts saja
  const isInvalid = hasErrors && submissionAttempts > 0
  const isValid = hasValue && !hasErrors

  const dateValue = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined

  const handleSelect = (date: Date | undefined) => {
    field.handleChange(date ? format(date, "yyyy-MM-dd") : "")
    // Calendar selection has no native blur — run blur validation so stale
    // error rings/messages clear instantly on pick.
    field.handleBlur()
    setIsOpen(false)
  }

  return (
    <FormBase {...props}>
      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open)
          // 🚨 FIX: Hapus field.handleBlur() dari onOpenChange
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            type="button"
            id={field.name}
            disabled={isSubmitting}
            className={cn(
              "group relative flex h-14 hover:bg-primary/5 w-full items-center overflow-hidden rounded-2xl border border-border/40 p-0 shadow-none transition-all duration-300 focus:outline-none focus-visible:ring-0",

              !isOpen &&
                !isValid &&
                !isInvalid &&
                "border-border bg-card ",
              !isOpen && isValid && !isInvalid && "border-primary bg-primary/5",
              isOpen && !isInvalid && "border-primary bg-primary/5",
              isInvalid &&
                "border-destructive bg-destructive/5 text-destructive",
              isSubmitting &&
                "pointer-events-none cursor-not-allowed opacity-50",
              props.className
            )}
          >
            <div
              className={cn(
                "flex flex-1 items-center bg-transparent px-4 text-sm transition-colors",
                // props.LeftIcon ? "pl-15" : "pl-4",
                (isValid || isOpen) && !isInvalid
                  ? "font-medium text-primary"
                  : "text-muted-foreground group-hover:text-primary",
                isInvalid && "font-medium text-destructive"
              )}
            >
              {dateValue
                ? format(dateValue, "dd MMMM yyyy", { locale: id })
                : props.placeholder || "Pilih Tanggal"}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={handleSelect}
            defaultMonth={dateValue || defaultMonthFallback || new Date()}
            captionLayout={captionLayout}
            disabled={(date) => {
              const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
              const isFuture = date > new Date()

              // Kalau disableFuture aktif, matikan tanggal masa depan
              if (disableFuture && isFuture) return true

              // Kalau disablePast aktif, matikan tanggal masa lalu
              if (disablePast && isPast) return true

              return false
            }}
          />
        </PopoverContent>
      </Popover>
    </FormBase>
  )
}
