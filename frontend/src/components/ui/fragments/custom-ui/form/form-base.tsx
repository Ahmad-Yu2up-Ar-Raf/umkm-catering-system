import type { InputProps } from "@/components/ui/fragments/shadcn-ui/input"
import type { ReactNode } from "react"
import { useFieldContext } from "@/hooks/use-form"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/fragments/shadcn-ui/field"
import type { IconSvgElement } from "@hugeicons/react"
import { useStore } from "@tanstack/react-store"
import { cn } from "@/lib/utils"

export type FormControlProps = {
  label?: string
  description?: string
  type?: InputProps["type"]
  placeholder?: string
  className?: string
  LeftIcon?: IconSvgElement
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  maxLength?: number
  iconClassName?: string
  inputClassName?: string
  isFocusClassName?: string
  isValidClassName?: string
  isInvalidClassName?: string
}

type FormBaseProps = FormControlProps & {
  children: ReactNode
  horizontal?: boolean
  controlFirst?: boolean
}

export function FormBase({
  children,
  label,
  description,
  controlFirst,
  horizontal,
}: FormBaseProps) {
  const field = useFieldContext()

  const submissionAttempts = useStore(
    field.form.baseStore,
    (state) => state.submissionAttempts
  )

  // 🚨 FIX: Subscribe secara eksplisit ke store untuk realtime error updates!
  const errors = useStore(field.store, (state) => state.meta.errors)

  const hasErrors = errors.length > 0
  const isInvalid = hasErrors && submissionAttempts > 0

  const labelElement = (
    <FieldLabel
      className={cn(
        "mb-2 px-1 tracking-widest text-muted-foreground",
        isInvalid && "text-destructive"
      )}
      htmlFor={field.name}
    >
      {label}
    </FieldLabel>
  )

  const captionElem = isInvalid ? (
    <FieldError className="mt-2 text-xs" errors={errors} />
  ) : description && !isInvalid ? (
    <FieldDescription>{description}</FieldDescription>
  ) : null

  return (
    <Field orientation={horizontal ? "horizontal" : undefined}>
      {controlFirst ? (
        <>
          {children}
          <FieldContent>
            {labelElement}
            {captionElem}
          </FieldContent>
        </>
      ) : (
        <>
          <FieldContent>{labelElement}</FieldContent>
          {children}
          {captionElem}
        </>
      )}
    </Field>
  )
}
