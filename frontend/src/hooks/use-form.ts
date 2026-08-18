import { FormInput } from "@/components/ui/fragments/custom-ui/form/form-input"
import { FormTextArea } from "@/components/ui/fragments/custom-ui/form/form-textarea"
import { FormDateInput } from "@/components/ui/fragments/custom-ui/form/form-date-input"
import { FormCheckboxGroup } from "@/components/ui/fragments/custom-ui/form/form-checkbox-group"
import { createFormHook, createFormHookContexts } from "@tanstack/react-form"

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

const { useAppForm } = createFormHook({
  fieldComponents: {
    Input: FormInput,
    TextArea: FormTextArea,
    DateInput: FormDateInput,
    CheckboxGroup: FormCheckboxGroup,
  },
  formComponents: {},
  fieldContext,
  formContext,
})

export { useAppForm, useFieldContext, useFormContext }
