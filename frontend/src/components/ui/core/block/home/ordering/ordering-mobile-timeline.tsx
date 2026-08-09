"use client"

import { LazyMotion, domAnimation, m } from "framer-motion"

import { ORDER_STEPS } from "./ordering-data"
import OrderingMobileCard from "./ordering-mobile-card"

/**
 * Mobile-only (< md) rendering of #cara-pesan — a quiet, elegant left-rail
 * timeline. A single continuous hairline runs the full column on the left;
 * each step seats a dot on it and sets typography to the right. No SVG, no
 * infinite stroke animation — calm by construction. Content reveals on scroll
 * (`whileInView`); reduced motion is gated by the parent block's
 * `MotionConfig reducedMotion="user"`.
 */
function OrderingMobileTimeline() {
  return (
    <LazyMotion features={domAnimation}>
      <div className="relative pl-8 md:pl-10">
        {/* Hairline rail — from just above the first dot down to the last step. */}
        <div
          aria-hidden="true"
          className="absolute top-2 bottom-0 left-[7px] w-px bg-border md:left-[11px]"
        />
        {ORDER_STEPS.map((step) => (
          <m.div
            key={step.id}
            className="relative mb-12 last:mb-0"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            {/* Node dot, seated on the hairline. */}
            <span
              aria-hidden="true"
              className="absolute -left-7.75 top-1.5 size-3 rounded-full border-2 border-background  bg-primary"
            />
            <OrderingMobileCard step={step} />
          </m.div>
        ))}
      </div>
    </LazyMotion>
  )
}

export default OrderingMobileTimeline
