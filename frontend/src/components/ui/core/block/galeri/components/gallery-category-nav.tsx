"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

import { GALLERY_CATEGORIES } from "../galeri-data"

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
 * GalleryCategoryNav — "Semua · Pernikahan · Korporat · …".
 * Slug-driven category pivot inside `/galeri/:kategori` or the storefront's
 * rail jump. The ACTIVE item is a sliding pill — a `layoutId` shared element
 * that GLIDES in real-time to the clicked tab (`initial={false}` → pure
 * projection morph). Inactive items stay hairline-calm. Clicking calls
 * `onSelect` with the target SLUG ("" = `/galeri` storefront); this nav
 * never owns route state. Touch targets are ≥44px (`min-h-11`).
 */
export function GalleryCategoryNav({
  activeSlug,
  onSelect,
}: {
  activeSlug: string
  onSelect: (slug: string) => void
}) {
  const reduced = useReducedMotion()

  return (
    <nav
      aria-label="Kategori galeri"
      className="no-scrollbar justify-between m-auto flex min-w-0 flex-nowrap items-center gap-3 overflow-x-auto"
    >
      {GALLERY_CATEGORIES.map(({ slug, label, icon }) => {
        const isActive = activeSlug === slug
        return (
          <button
            key={slug || "__all__"}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(slug)}
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
                layoutId="galeri-category-active"
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
