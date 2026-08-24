"use client"

import { useState } from "react"
import { useStore } from "@tanstack/react-store"
import { useFieldContext } from "@/hooks/use-form"
import { FormBase, type FormControlProps } from "./form-base"
import { Input } from "@/components/ui/fragments/shadcn-ui/input"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

interface FormTagInputProps extends Omit<
  FormControlProps,
  "type" | "maxLength" | "inputMode"
> {
  placeholder?: string
}

export function FormTagInput(props: FormTagInputProps) {
  const field = useFieldContext<string[]>()
  const [draft, setDraft] = useState("")
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
  const value = useStore(field.store, (state) => state.value) ?? []

  // 1. LOGIKA VALIDASI
  const hasErrors = errors.length > 0
  const hasValue = value && value.length > 0
  const isInvalid = hasErrors && submissionAttempts > 0
  const isValid = hasValue && !hasErrors

  // 2. THEMING SYSTEM (Persis FormInput)
  const defaultInputColor = props.inputClassName || "text-primary"
  const focusClass = props.isFocusClassName || "border-primary bg-primary/5"
  const validClass = props.isValidClassName || "border-primary bg-primary/5"
  const invalidClass =
    props.isInvalidClassName ||
    "border-destructive bg-destructive/8 focus-visible:text-destructive focus-visible:placeholder:text-destructive/70"

  // 3. PRIORITAS VISUAL
  // FIX: Hapus opasitas /4 agar border solid, dan pastikan bg transparan
  let containerStateClass = "border-border bg-transparent"

  if (isInvalid) {
    containerStateClass = invalidClass
  } else if (isValid) {
    containerStateClass = validClass
  } else if (isFocused) {
    containerStateClass = focusClass
  }

  const addTag = () => {
    const tag = draft.trim()
    if (!tag) return
    if (!value.includes(tag)) {
      field.handleChange([...value, tag])
      field.handleBlur()
    }
    setDraft("")
  }

  const removeTag = (index: number) => {
    field.handleChange(value.filter((_, i) => i !== index))
    field.handleBlur()
  }

  return (
    <FormBase {...props}>
      <div
        className={cn(
          "flex w-full flex-col gap-3",
          isSubmitting && "pointer-events-none opacity-50"
        )}
      >
        {value.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Daftar item">
            {value.map((tag, index) => (
              <li
                key={`${tag}-${index}`}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border border-border bg-muted/40 py-1 pr-1 pl-3 text-xs transition-colors",
                  isInvalid &&
                    "border-destructive/30 bg-destructive/10 text-destructive"
                )}
              >
                {tag}
                <Button
                  type="button"
                variant={"outline"}
                  aria-label={`Hapus ${tag}`}
                  onClick={() => removeTag(index)}
                  className="flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          {/* Kontainer Utama */}
          <div
            className={cn(
              "relative flex h-12 flex-1 items-center overflow-hidden rounded-2xl border transition-all duration-300 ease-in-out",
              containerStateClass
            )}
          >
            <Input
              id={field.name}
              aria-invalid={isInvalid}
              value={draft}
              placeholder={props.placeholder ?? "Ketik dan tambahkan..."}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addTag()
                }
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false)
                field.handleBlur()
              }}
              disabled={isSubmitting}
              className={cn(
                "h-full border-0 bg-transparent px-3 text-sm shadow-none focus-visible:ring-0",
                isInvalid &&
                  "text-destructive placeholder:text-destructive/70 focus-visible:text-destructive focus-visible:placeholder:text-destructive/70",
                isValid && "font-medium text-primary",
                !isInvalid && !isValid && defaultInputColor
              )}
            />
          </div>

          <Button
            type="button"
            variant={isInvalid ? "destructive" : "outline"}
            size="sm"
            className="h-12 shrink-0 rounded-2xl px-4"
            onClick={addTag}
            disabled={isSubmitting || !draft.trim()}
          >
            <HugeiconsIcon icon={Add01Icon} className="size-4" />
            Tambah
          </Button>
        </div>
      </div>
    </FormBase>
  )
}
