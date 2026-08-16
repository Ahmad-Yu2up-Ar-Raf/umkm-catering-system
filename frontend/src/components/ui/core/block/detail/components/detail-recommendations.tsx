"use client"

import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { Skeleton } from "@/components/ui/fragments/shadcn-ui/skeleton"
import { PaketCard } from "@/components/ui/core/block/paket/components/paket-card"

import { useRelatedPaketQuery } from "../hooks/use-related-paket"

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const

interface DetailRecommendationsProps {
  currentId: number
  className?: string
}

/** Grid skeleton — mirrors the exact PaketGrid (grid-3) card footprint. */
function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="min-h-[16em] w-full rounded-2xl md:min-h-[20em]" />
          <div className="flex flex-col gap-3 py-2">
            <Skeleton className="h-6 w-1/3 rounded-full" />
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="pt-4">
              <Skeleton className="h-6 w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Rekomendasi Paket — a full-width 3-item grid at the bottom of the detail
 * page. Mixes categories freely (always enough items); mirrors the responsive
 * grid + card footprint of `paket-grid.tsx`. Cards use the vertical
 * (`grid-2`) PaketCard variant.
 */
export function DetailRecommendations({
  currentId,
  className,
}: DetailRecommendationsProps) {
  const reduced = useReducedMotion()
  const query = useRelatedPaketQuery()

  const related = (query.data ?? [])
    .filter((paket) => paket.id !== currentId)
    .slice(0, 3)

  if (!query.isLoading && related.length === 0) return null

  return (
    <motion.section
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: LUXURY_EASE }}
      aria-labelledby="rekomendasi-heading"
      className={cn("flex w-full flex-col gap-10", className)}
    >
      <div className="flex flex-col gap-3">
        <p className="text-gold-deep flex items-center gap-3.5 text-[11px] font-normal tracking-[0.28em] uppercase">
          <div aria-hidden="true" className="h-px w-10 bg-primary" />
          <span className="text-primary">Rekomendasi</span>
        </p>
        <h2
          id="rekomendasi-heading"
          className="font-heading text-[clamp(24px,3vw,34px)] leading-tight tracking-[-0.01em] text-foreground"
        >
          Paket lain yang mungkin{" "}
          <span className="font-accent text-primary italic">Anda</span> sukai
        </h2>
      </div>

      {query.isLoading ? (
        <GridSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((paket) => (
            <PaketCard key={paket.id} paket={paket} layoutMode="grid-3" />
          ))}
        </div>
      )}
    </motion.section>
  )
}
