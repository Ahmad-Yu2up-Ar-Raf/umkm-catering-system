import { FormInput } from "@/components/ui/fragments/custom-ui/form/form-input"
// import { FormRadioGroup } from "@/components/ui/fragments/custom/form/form-radio-group"
// import { FormDateInput } from "@/components/ui/fragments/custom/form/form-date-input"
// import { FormTextArea } from "@/components/ui/fragments/custom/form/form-textarea"
// import { FormCombobox } from "@/components/ui/fragments/custom/form/form-combobox" // 👈 Import ini
import { createFormHook, createFormHookContexts } from "@tanstack/react-form"

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

const { useAppForm } = createFormHook({
  fieldComponents: {
    Input: FormInput,
    // RadioGroup: FormRadioGroup,
    // DateInput: FormDateInput,
    // TextArea: FormTextArea,
    // Combobox: FormCombobox, // 👈 Register ini bro
  },
  formComponents: {},
  fieldContext,
  formContext,
})

export { useAppForm, useFieldContext, useFormContext }
