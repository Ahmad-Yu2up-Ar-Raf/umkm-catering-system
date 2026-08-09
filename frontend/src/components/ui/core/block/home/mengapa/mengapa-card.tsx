"use client"

import { useRef } from "react"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { gsap, useGSAP } from "@/components/motion/gsap"
import type { MengapaMetric } from "./mengapa-data"
import { cn } from "@/lib/utils"

/** id-ID grouping respects the `.` thousands separator ("8.000"); disabled for
 *  plain values like the founding year (the year is never "2.024"). */
function formatCount(value: number, grouping = true): string {
  return value.toLocaleString("id-ID", { useGrouping: grouping })
}

/**
 * MengapaCard — one metric cell of the BORDERLESS 4-column grid.
 *
 *  - Hover: `bg-primary/5` tint + the top hairline grows `scaleX 0 → 100%`
 *    (the only divider — pure interaction, no static borders).
 *  - Index eyebrow (01–04) sits above the count-up number.
 *  - Count-up: GSAP tween 0 → target over ~2s, `power2.out`, fired once the
 *    card scrolls into view; suffix stays static beside the number.
 *  - `prefers-reduced-motion` → final number set immediately (no tween).
 */
export function MengapaCard({
  metric,
  index,
}: {
  metric: MengapaMetric
  index: number
}) {
  const cardRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const el = cardRef.current
      if (!el) return
      const counter = el.querySelector<HTMLElement>("[data-metric-value]")
      if (!counter) return

      if (reduced) {
        counter.textContent = formatCount(metric.value, metric.grouping)
        return
      }

      const state = { n: 0 }
      gsap.to(state, {
        n: metric.value,
        duration: 2,
        ease: "power2.out",
        snap: { n: 1 },
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
        onUpdate: () => {
          counter.textContent = formatCount(
            Math.round(state.n),
            metric.grouping
          )
        },
      })
    },
    {
      scope: cardRef,
      dependencies: [metric.id, metric.value, metric.grouping],
    }
  )

  return (
    <article
      ref={cardRef}
      data-mengapa-card
      className={cn(
        "group relative h-full overflow-hidden px-5 py-7 transition-colors duration-500 hover:bg-primary/5",
        index % 2 != 0 && "bg-primary/5 ",

        // index > 0 && index < 4 && " border-t border-t-primary md:border-0"
      )}
    >
      {/* Animated top hairline — grows from the left on hover (only divider). */}
      <span
        aria-hidden="true"
        className="absolute top-0 left-0 h-px w-full origin-left scale-x-0 bg-primary transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
      />

      {/* Index eyebrow — 01 → 04, quiet. */}
      <p className="mb-4 font-heading text-[13px] tracking-[0.1em] text-primary/70">
        0{index + 1}
      </p>

      {/* Count-up number + static suffix (e.g. "+" / "%"). */}
      <p className="font-heading text-4xl leading-none font-light tracking-[-0.02em] text-primary lg:text-5xl">
        <span data-metric-value>0</span>
        <span aria-hidden="true">{metric.suffix}</span>
      </p>

      <p className="mt-4 text-[11px] tracking-[0.22em] text-foreground uppercase">
        {metric.title}
      </p>
      <p className="mt-3 max-w-[280px] text-sm leading-relaxed text-muted-foreground lg:text-xs">
        {metric.description}
      </p>
    </article>
  )
}
