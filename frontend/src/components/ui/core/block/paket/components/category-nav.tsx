"use client"

import { HugeiconsIcon } from "@hugeicons/react"
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

export function CategoryNav({
  active,
  onSelect,
}: {
  active: KategoriFilter
  onSelect: (value: KategoriFilter) => void
}) {
  const reduced = useReducedMotion()

  return (
    <nav aria-label="Kategori paket" className="w-full min-w-0">
      <Carousel
        opts={{
          align: "start",
          dragFree: true, // Memastikan scroll terasa natural/smooth saat di-swipe
        }}
        className="w-full"
      >
        <CarouselContent className="ml-2">
          {KATEGORI_PAKET.map(({ value, label, icon }) => {
            const isActive = active === value
            return (
              <CarouselItem
                key={value || "__all__"}
                className="basis-auto pl-2"
              >
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onSelect(value)}
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
