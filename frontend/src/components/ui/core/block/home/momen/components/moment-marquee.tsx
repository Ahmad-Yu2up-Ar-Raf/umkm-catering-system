"use client"

import { motion, type Variants } from "framer-motion"

import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { MOMENT_ITEMS } from "../moment-data"

/** Luxury ease — premium Apple-like cubic-bezier (project grammar). */
const LUXURY_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

/** Tile reveal — the strip's tiles stagger in as the FINAL reveal step.
 *  Hidden state is transform/opacity only (compositor-friendly). */
const TILE_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: LUXURY_EASE },
  },
}

/**
 * MomentMarquee — infinite horizontal thumbnail strip under the featured card
 * (exact reference structure, token-mapped).
 *
 * - Track: the item list is rendered TWICE so `translateX(-50%)` loops
 *   seamlessly (`--animate-marquee`). Each card carries its own `mr-3`.
 * - Left/right gradient fade via `[mask-image:linear-gradient(90deg,…)]`.
 * - Continuously scrolls — deliberately does NOT pause on hover.
 * - Reveal: ONE parent in-view trigger drives `staggerChildren` across the
 *   tiles (a single observer — no per-tile scroll listeners), so the marquee
 *   appears as the last choreography step, cheaply (one-shot opacity/y).
 * - `prefers-reduced-motion` → single static list, no loop, no animation.
 */
export function MomentMarquee({
  activeIndex,
  onSelect,
}: {
  activeIndex: number
  onSelect: (index: number) => void
}) {
  const reduced = useReducedMotion()
  const loop = !reduced
  const items = loop ? [...MOMENT_ITEMS, ...MOMENT_ITEMS] : MOMENT_ITEMS

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        hidden: {},
        visible: { transition: { delayChildren: 0.2, staggerChildren: 0.05 } },
      }}
      className="mt-3 overflow-hidden py-2 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]"
    >
      <div className={cn("flex w-max", loop && "animate-marquee")}>
        {items.map((item, i) => {
          const realIndex = i % MOMENT_ITEMS.length
          const isActive = realIndex === activeIndex
          return (
            <motion.button
              key={`${item.id}-${i}`}
              type="button"
              variants={TILE_VARIANTS}
              aria-label={`${item.category} — ${item.title}`}
              aria-pressed={isActive}
              onClick={() => onSelect(realIndex)}
              className={cn(
                "group/card relative mr-3 aspect-[4/3] w-[170px] shrink-0 overflow-hidden rounded-2xl ring-1 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:shadow-xl hover:ring-primary/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:w-[190px]",
                isActive ? "ring-primary/60" : "ring-border"
              )}
            >
              <MediaItem
                webViewLink={item.imagePath}
                className="absolute inset-0 h-full w-full object-cover"
                imageClassName="transition-transform duration-[900ms] ease-out group-hover/card:scale-110"
              />

              {/* Scrim — warm brown, caption area only. */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-b from-transparent via-foreground/40 to-foreground/90"
              />

              <div className="absolute inset-x-0 bottom-0 p-3.5 text-left">
                <p className="text-[9px] tracking-[0.22em] text-accent uppercase">
                  {item.category}
                </p>
                <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug font-light text-background">
                  {item.title}
                </p>
              </div>

              {/* Expand glyph — decorative (aria-hidden), hover-reveal only. */}
              <span
                aria-hidden="true"
                className="absolute top-2.5 right-2.5 grid size-6 place-items-center rounded-full border border-background/30 bg-foreground/40 text-[11px] text-background/85 opacity-0 backdrop-blur-sm transition-opacity duration-500 group-hover/card:opacity-100"
              >
                ⤢
              </span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
