"use client"

import * as React from "react"
import { useStore } from "@tanstack/react-store"
import { HugeiconsIcon } from "@hugeicons/react"
import { StarIcon } from "@hugeicons/core-free-icons"
import { useFieldContext } from "@/hooks/use-form"
import { FormBase, type FormControlProps } from "./form-base"
import { playRatingTone } from "@/lib/audio-feedback"
import { cn } from "@/lib/utils"

/**
 * Tier palette for the SELECTED value — low scores read warm/alert,
 * high scores read fresh/success. Unselected stars stay muted.
 */
function tierClasses(value: number): string {
  if (value <= 2) return "fill-rose-400 text-rose-400"
  if (value === 3) return "fill-amber-400 text-amber-400"
  return "fill-emerald-400 text-emerald-400"
}

// ============================================
// INTERACTIVE STAR RATING INPUT (controlled)
// ============================================

interface StarRatingInputProps {
  id?: string
  value: number
  onChange: (value: number) => void
  max?: number
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  isInvalid?: boolean
  ariaInvalid?: boolean | "true" | "false"
}

const sizeMap = {
  sm: "size-5",
  md: "size-7",
  lg: "size-9",
} as const

const gapMap = {
  sm: "gap-1",
  md: "gap-1.5",
  lg: "gap-2",
} as const

function StarRatingInput({
  id,
  value,
  onChange,
  max = 5,
  size = "lg",
  disabled = false,
  isInvalid = false,
  ariaInvalid = false,
}: StarRatingInputProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null)
  const groupRef = React.useRef<HTMLDivElement>(null)

  const focusStar = (starValue: number) => {
    groupRef.current
      ?.querySelector<HTMLButtonElement>(`[data-star="${starValue}"]`)
      ?.focus()
  }

  const select = (starValue: number) => {
    if (disabled) return
    // User gesture: safe for autoplay policies; pitch follows the score.
    playRatingTone(starValue)
    onChange(starValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent, starValue: number) => {
    if (disabled) return

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      select(starValue)
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault()
      const next = Math.min(max, (value || 0) + 1)
      select(next)
      focusStar(next)
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault()
      const next = Math.max(1, (value || 0) - 1)
      select(next)
      focusStar(next)
    } else if (e.key === "Home") {
      e.preventDefault()
      select(1)
      focusStar(1)
    } else if (e.key === "End") {
      e.preventDefault()
      select(max)
      focusStar(max)
    }
  }

  // Roving tabindex: only the selected star (else the first) is tabbable.
  const tabbableStar = value >= 1 && value <= max ? value : 1

  return (
    <div
      ref={groupRef}
      id={id}
      role="radiogroup"
      aria-label="Rating"
      aria-invalid={ariaInvalid}
      className={cn("flex items-center", gapMap[size])}
      onMouseLeave={() => setHoverValue(null)}
    >
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1
        const filled = (hoverValue ?? value) >= starValue
        const isSelected = value === starValue

        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            data-star={starValue}
            aria-checked={isSelected}
            aria-label={`${starValue} dari ${max} bintang`}
            disabled={disabled}
            tabIndex={disabled ? -1 : tabbableStar === starValue ? 0 : -1}
            className={cn(
              "rounded-xl transition-transform duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              !disabled && "cursor-pointer hover:scale-110 active:scale-95",
              disabled && "cursor-not-allowed opacity-50"
            )}
            onMouseEnter={() => {
              if (!disabled) setHoverValue(starValue)
            }}
            onFocus={() => {
              if (!disabled) setHoverValue(starValue)
            }}
            onBlur={() => setHoverValue(null)}
            onClick={() => select(starValue)}
            onKeyDown={(e) => handleKeyDown(e, starValue)}
          >
            <HugeiconsIcon
              icon={StarIcon}
              className={cn(
                sizeMap[size],
                "transition-colors duration-200",
                filled
                  ? tierClasses(hoverValue ?? value)
                  : "fill-transparent text-muted-foreground/40",
                isInvalid && !filled && "text-destructive/40"
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

// ============================================
// FORM RATING (TanStack Form field fragment)
// ============================================

interface FormRatingProps
  extends Omit<
    FormControlProps,
    "type" | "maxLength" | "inputMode" | "placeholder" | "LeftIcon" | "min" | "max"
  > {
  /** Number of stars. Distinct from the native min/max input bounds. */
  max?: number
  size?: "sm" | "md" | "lg"
}

export function FormRating({ max = 5, size = "lg", ...props }: FormRatingProps) {
  const field = useFieldContext<number>()

  const isSubmitting = useStore(
    field.form.baseStore,
    (state) => state.isSubmitting
  )
  const submissionAttempts = useStore(
    field.form.baseStore,
    (state) => state.submissionAttempts
  )
  const errors = useStore(field.store, (state) => state.meta.errors)
  const value = useStore(field.store, (state) => state.value) ?? 0

  const isInvalid = errors.length > 0 && submissionAttempts > 0

  return (
    <FormBase {...props}>
      <div className="flex flex-col gap-3">
        <StarRatingInput
          id={field.name}
          value={value}
          onChange={(next) => {
            field.handleChange(next)
            field.handleBlur()
          }}
          max={max}
          size={size}
          disabled={isSubmitting}
          isInvalid={isInvalid}
          ariaInvalid={isInvalid}
        />
        {value > 0 && (
          <span className="text-sm font-medium text-muted-foreground">
            {getRatingLabel(value)}
          </span>
        )}
      </div>
    </FormBase>
  )
}

// ============================================
// HELPER
// ============================================

function getRatingLabel(rating: number): string {
  switch (rating) {
    case 1:
      return "Sangat buruk"
    case 2:
      return "Buruk"
    case 3:
      return "Cukup"
    case 4:
      return "Bagus"
    case 5:
      return "Sangat bagus"
    default:
      return ""
  }
}

// Standalone controlled input for use outside forms.
export { StarRatingInput }
