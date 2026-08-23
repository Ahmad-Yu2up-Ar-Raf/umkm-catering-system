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
 * FormImagesUpload — multi-image gallery field. Holds canonical Cloudinary
 * URLs (existing assets) and/or raw `File`s (pending deferred uploads;
 * resolved to URLs during form submit).
 */
export function FormImagesUpload({
  maxFiles = 8,
  ...props
}: FormImagesUploadProps) {
  const field = useFieldContext<Array<string | File>>()

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
        items={value}
        onChange={(items) => {
          field.handleChange(items)
          // Dropzone has no native blur — run blur validation explicitly so
          // stale gallery errors clear the moment picks land.
          field.handleBlur()
        }}
        multiple
        maxFiles={maxFiles}
        isInvalid={isInvalid}
        disabled={isSubmitting}
      />
    </FormBase>
  )
}
