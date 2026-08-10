"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/utils"

import { KATEGORI_PAKET, type KategoriFilter } from "../data/categories"

/**
 * CategoryNav — "Semua · Nasi Box · Prasmanan · Snack · Tumpeng".
 * Adapted from Dapur Solo's `#lunchbox-page-header` (icon facet nav): the
 * ACTIVE item carries the primary underline + a subtle `primary/10` fill,
 * inactive items stay hairline-calm. Clicking calls `onSelect`, which writes
 * `?kategori=` to the URL — this nav never owns filter state.
 * Touch targets are ≥44px (`min-h-11`).
 */
export function CategoryNav({
  active,
  onSelect,
}: {
  active: KategoriFilter
  onSelect: (value: KategoriFilter) => void
}) {
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
              "flex min-h-11 items-center gap-1.5 border-b-2 px-3 text-[11px] uppercase tracking-[0.08em] transition-colors duration-300",
              isActive
                ? "border-primary bg-primary/10 font-semibold text-primary"
                : "border-transparent text-foreground/60 hover:border-border hover:text-foreground"
            )}
          >
            <HugeiconsIcon
              icon={icon}
              className={cn(
                "size-5",
                isActive ? "text-primary" : "text-foreground/50"
              )}
            />
            {label}
          </button>
        )
      })}
    </nav>
  )
}
