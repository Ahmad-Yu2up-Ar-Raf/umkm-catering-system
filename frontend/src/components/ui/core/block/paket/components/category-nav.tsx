"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { HeartIcon } from "@hugeicons/core-free-icons"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

import { KATEGORI_PAKET, type KategoriFilter } from "../data/categories"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/fragments/shadcn-ui/carousel"

const GLIDE_TWEEN = {
  type: "tween",
  ease: [0.16, 1, 0.3, 1],
  duration: 0.5,
} as const

/** Sentinel value for the static "Tersimpan" entry — never written to the
 *  `?kategori=` URL param (that stays a server enum); the saved view lives in
 *  `?saved=1` via `useCatalogParams`. The hook enforces single-select (both
 *  params are never set together), so at most one pill below is ever active. */
const SAVED_ENTRY_VALUE = "__saved__" as const

export function CategoryNav({
  active,
  onSelect,
  savedActive,
  savedCount,
  onToggleSaved,
}: {
  active: KategoriFilter
  onSelect: (value: KategoriFilter) => void
  /** Whether the `?saved=1` filter is on. */
  savedActive: boolean
  /** Total wishlisted packages (persisted store length). */
  savedCount: number
  onToggleSaved: (value: boolean) => void
}) {
  const reduced = useReducedMotion()

  // "Tersimpan" sits at index 1, right after "Semua", reusing the exact pill
  // markup + active styling of the category entries.
  const entries = [
    KATEGORI_PAKET[0],
    {
      value: SAVED_ENTRY_VALUE,
      label: savedCount > 0 ? `Tersimpan (${savedCount})` : "Tersimpan",
      icon: HeartIcon,
    },
    ...KATEGORI_PAKET.slice(1),
  ]

  return (
    <nav aria-label="Kategori paket" className="w-full min-w-0">
      <Carousel
        opts={{
          align: "start",
          dragFree: true, // Memastikan scroll terasa natural/smooth saat di-swipe
        }}
        className="w-full"
      >
        <CarouselContent className="ml-2 md:ml-0">
          {entries.map(({ value, label, icon }) => {
            const isSavedEntry = value === SAVED_ENTRY_VALUE
            // `!savedActive` guard: a hand-crafted combined URL
            // (`?kategori=X&saved=1`, unreachable via UI) still shows exactly
            // one pill — the saved one wins.
            const isActive = isSavedEntry
              ? savedActive
              : active === value && !savedActive
            return (
              <CarouselItem
                key={value || "__all__"}
                className="basis-auto pl-2"
              >
                <button
                  type="button"
                  aria-pressed={isActive}
                  aria-label={
                    isSavedEntry
                      ? savedActive
                        ? "Tampilkan semua paket"
                        : "Tampilkan paket tersimpan"
                      : undefined
                  }
                  onClick={() =>
                    isSavedEntry ? onToggleSaved(!savedActive) : onSelect(value)
                  }
                  className={cn(
                    "relative flex min-h-11 items-center gap-1.5 px-3 text-[11px] tracking-[0.08em] uppercase transition-colors duration-300",
                    isActive
                      ? "font-semibold text-primary"
                      : "text-foreground/60 hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="paket-category-active"
                      initial={false}
                      transition={reduced ? { duration: 0 } : GLIDE_TWEEN}
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-full bg-primary/10"
                    />
                  )}

                  <HugeiconsIcon
                    icon={icon}
                    className={cn(
                      "relative z-10 size-5 shrink-0",
                      isActive ? "text-primary" : "text-foreground/50"
                    )}
                  />
                  {/* whitespace-nowrap mencegah teks turun ke baris baru */}
                  <span className="relative z-10 whitespace-nowrap">
                    {label}
                  </span>
                </button>
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>
    </nav>
  )
}
