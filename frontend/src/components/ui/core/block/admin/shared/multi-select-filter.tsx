"use client"

import { useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/fragments/shadcn-ui/popover"
import { Checkbox } from "@/components/ui/fragments/shadcn-ui/checkbox"
import { Badge } from "@/components/ui/fragments/shadcn-ui/badge"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  CancelCircleIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

export interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectFilterProps {
  options: readonly MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder: string
  isLoading?: boolean
  ariaLabel?: string
  className?: string
}

const MAX_VISIBLE_BADGES = 2

/**
 * MultiSelectFilter — reusable enum-column filter that accepts an array of
 * selected values. Trigger shows the selected items as badges (capped with
 * "+N"), popover lists checkbox rows. Styling mirrors the toolbar's pill
 * selects: rounded-full, text-xs, primary active state.
 */
export function MultiSelectFilter({
  options,
  value,
  onChange,
  placeholder,
  isLoading = false,
  ariaLabel,
  className,
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false)

  const selectedLabels = value
    .map((v) => options.find((o) => o.value === v)?.label ?? v)
    .filter(Boolean)

  const isActive = value.length > 0

  const toggle = (optionValue: string) => {
    onChange(
      value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue]
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          disabled={isLoading}
          className={cn(
            "h-9 w-full justify-start gap-1.5 rounded-full border-border px-3 text-xs font-normal xl:w-auto xl:min-w-44 bg-transparent",
            isActive && "border-primary bg-primary/5 text-primary",
            className
          )}
        >
          {isLoading ? (
            <HugeiconsIcon icon={Loading03Icon} className="size-3.5 animate-spin" />
          ) : isActive ? (
            <>
              {selectedLabels.slice(0, MAX_VISIBLE_BADGES).map((label) => (
                <Badge
                  key={label}
                  variant="secondary"
                  className="rounded-full px-2 py-0 text-[11px] font-medium"
                >
                  {label}
                </Badge>
              ))}
              {selectedLabels.length > MAX_VISIBLE_BADGES && (
                <span className="text-[11px] font-medium">
                  +{selectedLabels.length - MAX_VISIBLE_BADGES}
                </span>
              )}
            </>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className={cn("ml-auto size-3.5 shrink-0 opacity-60", open && "rotate-180")}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-56 p-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="max-h-64 overflow-y-auto">
          {options.map((option) => {
            const checked = value.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={checked}
                onClick={() => toggle(option.value)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted/60",
                  checked && "bg-primary/5"
                )}
              >
                <Checkbox checked={checked} className="pointer-events-none size-3.5" />
                <span className="flex-1">{option.label}</span>
              </button>
            )
          })}
        </div>

        {isActive && (
          <div className="border-t border-border p-1 pt-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-full justify-center gap-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onChange([])}
            >
              <HugeiconsIcon icon={CancelCircleIcon} className="size-3.5" />
              Bersihkan
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
