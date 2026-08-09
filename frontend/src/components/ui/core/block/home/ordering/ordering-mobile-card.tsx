"use client"

import type { OrderStep } from "./ordering-data"

type OrderingMobileCardProps = {
  step: OrderStep
}

/**
 * One mobile ordering step — clean, card-free typography.
 * Transparent background, no borders, no icons: just a precise flex-col stack
 * of index / title / description sitting to the right of the timeline rail.
 */
function OrderingMobileCard({ step }: OrderingMobileCardProps) {
  return (
    <div className="relative flex flex-col">
      <span className="text-sm font-medium tracking-widest text-primary">
        {step.step}
      </span>
      <h3 className="mt-2 font-heading text-xl leading-snug text-foreground">
        {step.title}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {step.description}
      </p>
    </div>
  )
}

export default OrderingMobileCard
