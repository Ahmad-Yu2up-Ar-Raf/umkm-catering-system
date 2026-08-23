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

/**
 * FormTagInput — string[] field collected as removable chips (menu lists,
 * fasilitas, etc.). Enter or the button appends; chips render as pills with a
 * remove button. Stored in the form as a plain string array — zero parsing on
 * submit.
 */
export function FormTagInput(props: FormTagInputProps) {
  const field = useFieldContext<string[]>()
  const [draft, setDraft] = useState("")

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

  const isInvalid = errors.length > 0 && submissionAttempts > 0

  const addTag = () => {
    const tag = draft.trim()
    if (!tag) return
    if (!value.includes(tag)) {
      field.handleChange([...value, tag])
      // Chip commit — run blur validation so stale errors clear instantly.
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
                className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 py-1 pr-1 pl-3 text-xs"
              >
                {tag}
                <Button
                  type="button"
                  aria-label={`Hapus ${tag}`}
                  onClick={() => removeTag(index)}
                  className="flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
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
            onBlur={field.handleBlur}
            disabled={isSubmitting}
            className="min-h-9 rounded-full flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 shrink-0"
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
