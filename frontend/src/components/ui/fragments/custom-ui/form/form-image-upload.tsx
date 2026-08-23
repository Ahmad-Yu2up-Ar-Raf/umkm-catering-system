"use client"

import { useStore } from "@tanstack/react-store"
import { useFieldContext } from "@/hooks/use-form"
import { FormBase, type FormControlProps } from "./form-base"
import { MediaDropzone } from "./media-dropzone"

type FormImageUploadProps = Omit<
  FormControlProps,
  "type" | "maxLength" | "inputMode" | "placeholder" | "LeftIcon"
>

/**
 * FormImageUpload — single-image (thumbnail) field. Holds a canonical
 * Cloudinary URL (existing asset) OR a raw `File` (pending deferred upload;
 * resolved to a URL during form submit).
 */
export function FormImageUpload(props: FormImageUploadProps) {
  const field = useFieldContext<string | File>()

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

  const isInvalid = errors.length > 0 && submissionAttempts > 0

  return (
    <FormBase {...props}>
      <MediaDropzone
        items={value ? [value] : []}
        onChange={(items) => {
          field.handleChange(items[items.length - 1])
          // Dropzone has no native blur — run blur validation explicitly so
          // a stale "Foto utama wajib diisi" clears the moment a pick lands.
          field.handleBlur()
        }}
        multiple={false}
        maxFiles={1}
        isInvalid={isInvalid}
        disabled={isSubmitting}
      />
    </FormBase>
  )
}
