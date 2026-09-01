"use client"

import React, { useState, useMemo } from "react"
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
import { Spinner } from "@/components/ui/fragments/shadcn-ui/spinner"

export interface ComboboxOption {
  label: string
  value: string | number
}

interface FormComboboxProps extends Omit<
  FormControlProps,
  "type" | "maxLength" | "inputMode"
> {
  options: ComboboxOption[]
  /** Disable portal to prevent focus trap inside Dialog/Drawer */
  disablePortal?: boolean
  /** Show loading spinner and disable trigger while options are fetching */
  isLoading?: boolean
}

export function FormCombobox(props: FormComboboxProps) {
  const field = useFieldContext<string | number | null | undefined>()
  const [isFocused, setIsFocused] = useState(false)
  const [search, setSearch] = useState("")
  const [hasSearched, setHasSearched] = useState(false)

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
  const hasValue =
    value !== undefined && value !== null && value !== "" && value !== -1
  const isInvalid = hasErrors && submissionAttempts > 0
  const isValid = hasValue && !hasErrors
  const isDisabled = isSubmitting || !!props.isLoading

  const containerStateClass = isInvalid
    ? "border-destructive bg-destructive/8 text-destructive"
    : isValid
      ? "border-primary bg-primary/5"
      : isFocused
        ? "border-primary bg-primary/5"
        : "border-border bg-transparent"

  // Filter ditangani secara lokal & reaktif tanpa mengganggu state utama
  const filteredOptions = useMemo(() => {
    if (!search.trim()) return props.options
    return props.options.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    )
  }, [props.options, search])

  // Only show empty state after user has actually searched and found nothing
  const showEmptyState = hasSearched && filteredOptions.length === 0
  const selectedLabel =
    value !== null &&
    value !== undefined &&
    value !== "" &&
    value !== -1
      ? props.options.find((opt) => String(opt.value) === String(value))?.label
      : undefined

  return (
    <FormBase {...props}>
      <div
        className={cn(
          "relative flex h-12 w-full items-center overflow-hidden rounded-2xl border border-border/4 transition-all duration-300 ease-in-out",
          containerStateClass,
          isDisabled && "pointer-events-none opacity-50",
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
          value={
            value !== undefined &&
            value !== null &&
            value !== "" &&
            value !== -1
              ? String(value)
              : undefined
          }
          onValueChange={(val) => {
            if (!val) {
              field.handleChange(null as unknown as string | number | null)
              return
            }

            const selectedOption = props.options.find(
              (opt) => String(opt.value) === val
            )

            field.handleChange(
              (selectedOption?.value ?? null) as unknown as
                | string
                | number
                | null
            )
          }}
          onOpenChange={(open) => {
            setIsFocused(open)
            if (!open) {
              setSearch("")
              setHasSearched(false)
            }
          }}
          disabled={isDisabled}
        >
          <ComboboxTrigger
            className={cn(
              "flex h-full w-full items-center justify-between border-0 bg-transparent px-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50",
              props.LeftIcon ? "pl-12" : "pl-4",
              hasValue ? "text-primary" : "text-muted-foreground",
              isInvalid && "text-destructive",
              props.isLoading && "[&>svg:not([data-slot=spinner])]:hidden"
            )}
            disabled={isDisabled}
          >
            <ComboboxValue placeholder={props.placeholder}>
              {selectedLabel ?? (
                <span className="text-muted-foreground">
                  {props.placeholder ?? "Pilih paket..."}
                </span>
              )}
            </ComboboxValue>
            {props.isLoading ? (
              <Spinner className="size-4 shrink-0 text-muted-foreground" />
            ) : null}
          </ComboboxTrigger>

          <ComboboxContent
            className="z-100 w-full p-2"
            disablePortal={props.disablePortal}
          >
            <ComboboxInput
              showTrigger={false}
              placeholder="Cari..."
              className="mx-2 my-2"
              value={search}
              autoFocus
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const newSearch = e.target.value
                setSearch(newSearch)
                setHasSearched(true)
              }}
            />
            {showEmptyState && (
              <ComboboxEmpty>Pencarian tidak ditemukan.</ComboboxEmpty>
            )}
            <ComboboxList className="max-h-60 overflow-y-auto">
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