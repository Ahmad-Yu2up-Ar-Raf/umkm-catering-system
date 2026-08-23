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
 * FormImageUpload — single-image (thumbnail) field. Value is the canonical
 * Cloudinary URL string (`string`).
 */
export function FormImageUpload(props: FormImageUploadProps) {
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
  const value = useStore(field.store, (state) => state.value) ?? ""

  const isInvalid = errors.length > 0 && submissionAttempts > 0

  return (
    <FormBase {...props}>
      <MediaDropzone
        urls={value ? [value] : []}
        onChange={(urls) => {
          field.handleChange(urls[0] ?? "")
          // Dropzone has no native blur — run blur validation explicitly so
          // a stale "Foto utama wajib diisi" clears the moment a URL lands.
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
