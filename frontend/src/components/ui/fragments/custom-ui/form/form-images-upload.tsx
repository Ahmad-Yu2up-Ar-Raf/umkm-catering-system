"use client"

import { useStore } from "@tanstack/react-store"
import { useFieldContext } from "@/hooks/use-form"
import { FormBase, type FormControlProps } from "./form-base"
import { MediaDropzone } from "./media-dropzone"

interface FormImagesUploadProps extends Omit<
  FormControlProps,
  "type" | "maxLength" | "inputMode" | "placeholder" | "LeftIcon"
> {
  maxFiles?: number
}

/**
 * FormImagesUpload — multi-image gallery field. Value is an array of canonical
 * Cloudinary URLs (`string[]`).
 */
export function FormImagesUpload({
  maxFiles = 8,
  ...props
}: FormImagesUploadProps) {
  const field = useFieldContext<string[]>()

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

  return (
    <FormBase {...props}>
      <MediaDropzone
        urls={value}
        onChange={(urls) => field.handleChange(urls)}
        multiple
        maxFiles={maxFiles}
        isInvalid={isInvalid}
        disabled={isSubmitting}
      />
    </FormBase>
  )
}
