"use client"

import { cva } from "class-variance-authority"
import { HugeiconsIcon } from "@hugeicons/react"
import { EyeIcon, EyeOffIcon } from "@hugeicons/core-free-icons"
import { TESTIMONI_VISIBILITY_LABELS } from "../config/testimoni-visibility-options"
import type { TestimoniVisibility } from "../types/testimoni-types"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        public: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 ",
        private: "border-amber-500/30 bg-amber-500/10 text-amber-700  ",
      },
    } as const,
    defaultVariants: {
      variant: "private",
    },
  }
)

const BADGE_ICONS = {
  public: EyeIcon,
  private: EyeOffIcon,
} as const

export function TestimoniStatusBadge({
  visibility,
  className,
}: {
  visibility: TestimoniVisibility | string | null | undefined
  className?: string
}) {
  const variant: TestimoniVisibility =
    visibility === "public" ? "public" : "private"

  return (
    <span className={cn(badgeVariants({ variant }), className)}>
      <HugeiconsIcon icon={BADGE_ICONS[variant]} className="size-3.5" />
      {TESTIMONI_VISIBILITY_LABELS[variant]}
    </span>
  )
}
