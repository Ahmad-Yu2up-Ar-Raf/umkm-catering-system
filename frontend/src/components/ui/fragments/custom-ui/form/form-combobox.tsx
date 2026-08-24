"use client"

import React, { useState } from "react"
import { useStore } from "@tanstack/react-store"
import { useFieldContext } from "@/hooks/use-form"
import { FormBase, type FormControlProps } from "./form-base"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/utils"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/fragments/shadcn-ui/combobox"

export interface ComboboxOption {
  label: string
  value: string | number
}

interface FormComboboxProps extends Omit<
  FormControlProps,
  "type" | "maxLength" | "inputMode"
> {
  options: ComboboxOption[]
}

export function FormCombobox(props: FormComboboxProps) {
  const field = useFieldContext<string | number | undefined>()
  const [isFocused, setIsFocused] = useState(false)
  const [search, setSearch] = useState("")

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

  const hasErrors = errors.length > 0
  const hasValue = value !== undefined && value !== ""
  const isInvalid = hasErrors && submissionAttempts > 0
  const isValid = hasValue && !hasErrors

  const containerStateClass = isInvalid
    ? "border-b-destructive bg-destructive/5 text-destructive"
    : isValid
      ? "border-b-primary bg-primary/5"
      : isFocused
        ? "border-b-primary bg-primary/5"
        : "border-border bg-card"

  // Filter ditangani secara lokal & reaktif tanpa mengganggu state utama
  const filteredOptions = props.options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <FormBase {...props}>
      <div
        className={cn(
          "relative flex h-14 w-full flex-col justify-center overflow-hidden border-b transition-all duration-300 ease-in-out",
          containerStateClass,
          isSubmitting && "pointer-events-none opacity-50",
          props.className
        )}
      >
        {props.LeftIcon && (
          <div
            className={cn(
              "absolute left-3 z-10 flex items-center justify-center transition-colors [&_svg]:size-5",
              isInvalid ? "text-destructive" : "text-primary"
            )}
          >
            <HugeiconsIcon icon={props.LeftIcon} />
          </div>
        )}

        <Combobox
          value={value !== undefined ? String(value) : undefined}
          onValueChange={(val) => {
            if (!val) {
              field.handleChange(undefined)
              return
            }

            const selectedOption = props.options.find(
              (opt) => String(opt.value) === val
            )

            field.handleChange(selectedOption?.value)
          }}
          onOpenChange={(open) => {
            setIsFocused(open)
            if (!open) setSearch("")
          }}
          disabled={isSubmitting}
        >
          <ComboboxTrigger
            className={cn(
              "flex h-full w-full items-center justify-between border-none bg-transparent px-4 text-sm outline-none",
              props.LeftIcon ? "pl-16" : "pl-4",

              value ? "text-primary" : "text-muted-foreground",

              isInvalid && "text-destructive"
            )}
          >
            <ComboboxValue placeholder={props.placeholder}>
              {props.options.find((opt) => opt.value === value)?.label}
            </ComboboxValue>
          </ComboboxTrigger>

          <ComboboxContent className="z-100 w-full p-2">
            <ComboboxInput
              showTrigger={false}
              placeholder="Cari..."
              className="mx-2 my-2"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
            />
            <ComboboxEmpty>Pencarian tidak ditemukan.</ComboboxEmpty>
            <ComboboxList>
              {filteredOptions.map((item) => (
                <ComboboxItem key={item.value} value={String(item.value)}>
                  {item.label}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </FormBase>
  )
}
