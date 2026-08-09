"use client"

import { motion } from "framer-motion"

import { MENGAPA_METRICS } from "./mengapa-data"
import { MengapaCard } from "./mengapa-card"

/**
 * MengapaGrid — restores the grid's top & bottom hairlines:
 *  - Static `border-y border-border` on the wrapper; on `max-lg` the border
 *    color switches to `primary` (mobile-only brand tint, per spec).
 *  - Animated reveal: Framer `motion.span` lines sweep the full width
 *    0% → 100% (left-to-right, once) over the top and bottom edges.
 *  - `MotionConfig reducedMotion="user"` (set at the block level) renders
 *    the lines at full width instantly for reduced-motion users.
 */
export function MengapaGrid() {
  return (
    <div className="relative border-y border-border max-lg:border-primary">
      {/* Animated top border — sweeps left → right across the full width. */}
      <motion.span
        aria-hidden="true"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0 left-0 h-px w-full origin-left bg-primary md:bg-border/20"
      />

      {/* Animated bottom border — sweeps left → right across the full width. */}
      <motion.span
        aria-hidden="true"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-0 left-0 h-px w-full origin-left bg-primary md:bg-border/20"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {MENGAPA_METRICS.map((metric, index) => (
          <MengapaCard key={metric.id} metric={metric} index={index} />
        ))}
      </div>
    </div>
  )
}
