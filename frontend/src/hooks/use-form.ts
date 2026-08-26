"use client"

import { toast } from "sonner"
import {
  createFormHook,
  createFormHookContexts,
  type AppFieldExtendedReactFormApi,
  type FormAsyncValidateOrFn,
  type FormOptions,
  type FormValidateOrFn,
} from "@tanstack/react-form"
import type { AnyFormApi, AnyFormOptions } from "@tanstack/form-core"

import { FormInput } from "@/components/ui/fragments/custom-ui/form/form-input"
import { FormTextArea } from "@/components/ui/fragments/custom-ui/form/form-textarea"
import { FormDateInput } from "@/components/ui/fragments/custom-ui/form/form-date-input"
import { FormCheckboxGroup } from "@/components/ui/fragments/custom-ui/form/form-checkbox-group"
import { FormSelect } from "@/components/ui/fragments/custom-ui/form/form-select"
import { FormCheckbox } from "@/components/ui/fragments/custom-ui/form/form-checkbox"
import { FormTagInput } from "@/components/ui/fragments/custom-ui/form/form-tag-input"
import { FormImageUpload } from "@/components/ui/fragments/custom-ui/form/form-image-upload"
import { FormImagesUpload } from "@/components/ui/fragments/custom-ui/form/form-images-upload"
import { FormCurrencyInput } from "@/components/ui/fragments/custom-ui/form/form-currency-input"
import { FormCombobox } from "@/components/ui/fragments/custom-ui/form/form-combobox"

const fieldComponents = {
  Input: FormInput,
  TextArea: FormTextArea,
  DateInput: FormDateInput,
  CheckboxGroup: FormCheckboxGroup,
  Select: FormSelect,
  Checkbox: FormCheckbox,
  TagInput: FormTagInput,
  ImageUpload: FormImageUpload,
  ImagesUpload: FormImagesUpload,
  CurrencyInput: FormCurrencyInput,
  Combobox: FormCombobox,
} as const

const formComponents = {} as Record<string, never>

type FieldComponents = typeof fieldComponents
type FormComponents = typeof formComponents

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

const { useAppForm: useBaseAppForm } = createFormHook({
  fieldComponents,
  formComponents,
  fieldContext,
  formContext,
})

/* =====================================================================
 * GLOBAL form behaviors — every form created through `useAppForm`
 * inherits these with zero per-form setup.
 * ===================================================================== */

/**
 * Focus the FIRST invalid field (render/registration order) after a failed
 * submit. Every custom field forwards `id={field.name}`, so `getElementById`
 * lands on the exact control; a generic `[aria-invalid]` fallback covers any
 * future field that forgets its id.
 */
function focusFirstInvalidField(formApi: AnyFormApi) {
  const fieldMeta = (
    formApi.state as { fieldMeta?: Record<string, { errors?: unknown[] }> }
  ).fieldMeta
  const firstName = Object.keys(fieldMeta ?? {}).find(
    (name) => (fieldMeta?.[name]?.errors?.length ?? 0) > 0
  )
  const target =
    (firstName ? document.getElementById(firstName) : null) ??
    document.querySelector<HTMLElement>('[aria-invalid="true"]')

  if (target instanceof HTMLElement) {
    target.focus({ preventScroll: true })
    target.scrollIntoView({ behavior: "smooth", block: "center" })
  }
}

/** Default invalid-submit handler: Sonner toast + jump to the first mistake. */
function globalOnSubmitInvalid({ formApi }: { formApi: AnyFormApi }) {
  toast.error("Validasi Gagal", {
    description: "Periksa kembali isian form yang ditandai merah.",
  })
  // Defer a frame so the error states settle, then scroll to the mistake.
  requestAnimationFrame(() => focusFirstInvalidField(formApi))
}

type AnyValidators = AnyFormOptions["validators"]

/**
 * CORE of the ghost-reset fix. TanStack v1 purges a field's SUBMIT-phase error
 * whenever a change/blur validation runs WITHOUT producing an error. When a
 * form only declares `onSubmit` validators (the common case), those phases
 * validate nothing → `hasErrored=false` → the previous error is wiped on the
 * next blur/keystroke even though the field is still invalid.
 *
 * Fix: reuse the SAME schema for `onChange`/`onBlur`, so a still-invalid field
 * errors in those phases (never purged) and a genuinely-fixed field clears.
 * The UI still only SHOWS errors after the first submit attempt — the
 * `submissionAttempts > 0` gate lives in FormBase / the field components.
 */
function withGlobalBehaviors<TFormData>(
  opts: FormOptions<TFormData, any, any, any, any, any, any, any, any, any, any, any>
): AnyFormOptions {
  const validators = {
    ...(opts.validators ?? {}),
  } as AnyValidators & Record<string, unknown>

  if (validators.onSubmit !== undefined) {
    if (validators.onChange === undefined) {
      validators.onChange = validators.onSubmit
    }
    if (validators.onBlur === undefined) {
      validators.onBlur = validators.onSubmit
    }
  }

  return {
    ...opts,
    validators: validators as AnyValidators,
    onSubmitInvalid: (opts.onSubmitInvalid ??
      globalOnSubmitInvalid) as AnyFormOptions["onSubmitInvalid"],
  }
}

/**
 * `useAppForm` — the ONE hook every form in the app uses. Thin, fully-typed
 * wrapper around TanStack's `createFormHook` result that injects the global
 * validation-failure UX (schema-preserving onChange/onBlur, error toast,
 * first-error auto-focus) so no form file ever needs to re-implement it.
 */
export function useAppForm<
  TFormData,
  TOnMount extends FormValidateOrFn<TFormData> | undefined = undefined,
  TOnChange extends FormValidateOrFn<TFormData> | undefined = undefined,
  TOnChangeAsync extends FormAsyncValidateOrFn<TFormData> | undefined = undefined,
  TOnBlur extends FormValidateOrFn<TFormData> | undefined = undefined,
  TOnBlurAsync extends FormAsyncValidateOrFn<TFormData> | undefined = undefined,
  TOnSubmit extends FormValidateOrFn<TFormData> | undefined = undefined,
  TOnSubmitAsync extends FormAsyncValidateOrFn<TFormData> | undefined = undefined,
  TOnDynamic extends FormValidateOrFn<TFormData> | undefined = undefined,
  TOnDynamicAsync extends FormAsyncValidateOrFn<TFormData> | undefined = undefined,
  TOnServer extends FormAsyncValidateOrFn<TFormData> | undefined = undefined,
  TSubmitMeta = never,
>(
  opts: FormOptions<
    TFormData,
    TOnMount,
    TOnChange,
    TOnChangeAsync,
    TOnBlur,
    TOnBlurAsync,
    TOnSubmit,
    TOnSubmitAsync,
    TOnDynamic,
    TOnDynamicAsync,
    TOnServer,
    TSubmitMeta
  >
): AppFieldExtendedReactFormApi<
  TFormData,
  TOnMount,
  TOnChange,
  TOnChangeAsync,
  TOnBlur,
  TOnBlurAsync,
  TOnSubmit,
  TOnSubmitAsync,
  TOnDynamic,
  TOnDynamicAsync,
  TOnServer,
  TSubmitMeta,
  FieldComponents,
  FormComponents
> {
  return useBaseAppForm(withGlobalBehaviors(opts) as AnyFormOptions) as AppFieldExtendedReactFormApi<
    TFormData,
    TOnMount,
    TOnChange,
    TOnChangeAsync,
    TOnBlur,
    TOnBlurAsync,
    TOnSubmit,
    TOnSubmitAsync,
    TOnDynamic,
    TOnDynamicAsync,
    TOnServer,
    TSubmitMeta,
    FieldComponents,
    FormComponents
  >
}

export { useFieldContext, useFormContext }
