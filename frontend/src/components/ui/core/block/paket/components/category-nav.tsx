"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

import { KATEGORI_PAKET, type KategoriFilter } from "../data/categories"

/**
 * Tiska motion grammar — the pill glide. Deliberately a tween (never a
 * spring): `ease [0.16, 1, 0.3, 1]` never overshoots or "wobbles backwards"
 * when the pill moves between tabs. 0.5s is calm and deliberate.
 */
const GLIDE_TWEEN = {
  type: "tween",
  ease: [0.16, 1, 0.3, 1],
  duration: 0.5,
} as const

/**
 * CategoryNav — "Semua · Nasi Box · Prasmanan · Snack · Tumpeng".
 * Adapted from Dapur Solo's `#lunchbox-page-header` (icon facet nav): the
 * ACTIVE item is a sliding pill — a `layoutId` shared element that GLIDES in
 * real-time to the clicked tab (initial={false} → pure projection morph, no
 * fade/scale remount), same grammar as the FAQ category line. Inactive items
 * stay hairline-calm. Clicking calls `onSelect`, which writes `?kategori=` to
 * the URL — this nav never owns filter state. Touch targets are ≥44px
 * (`min-h-11`).
 */
export function CategoryNav({
  active,
  onSelect,
}: {
  active: KategoriFilter
  onSelect: (value: KategoriFilter) => void
}) {
  const reduced = useReducedMotion()

  return (
    <nav
      aria-label="Kategori paket"
      className="flex flex-wrap items-center justify-center gap-1 md:justify-start"
    >
      {KATEGORI_PAKET.map(({ value, label, icon }) => {
        const isActive = active === value
        return (
          <button
            key={value || "__all__"}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(value)}
            className={cn(
              "relative flex min-h-11 items-center gap-1.5 px-3 text-[11px] uppercase tracking-[0.08em] transition-colors duration-300",
              isActive
                ? "font-semibold text-primary"
                : "text-foreground/60 hover:text-foreground"
            )}
          >
            {/* Sliding active pill — `layoutId` shared element, glides between
                tabs on click. Disabled (snap) under `prefers-reduced-motion`. */}
            {isActive && (
              <motion.div
                layoutId="paket-category-active"
                initial={false}
                transition={reduced ? { duration: 0 } : GLIDE_TWEEN}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full bg-primary/10"
              />
            )}

            {/* z-10 keeps icon + label above the absolutely-positioned pill. */}
            <HugeiconsIcon
              icon={icon}
              className={cn(
                "relative z-10 size-5",
                isActive ? "text-primary" : "text-foreground/50"
              )}
            />
            <span className="relative z-10">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
