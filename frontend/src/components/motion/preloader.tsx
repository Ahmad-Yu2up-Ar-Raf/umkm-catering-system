import { useRef } from "react"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { gsap, useGSAP } from "@/components/motion/gsap"

/**
 * Full-screen curtain preloader (design.md §10.1 #6, HOMEPAGE_BUILD §5).
 * The only full-screen effect on the landing surface; cream overlay slides
 * up (translateY 0 → -100%). Skipped entirely under `prefers-reduced-motion`.
 */
export function Preloader() {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reduced) return
      gsap.to(ref.current, {
        yPercent: -100,
        duration: 1.0,
        ease: "expo.inOut",
      })
    },
    { scope: ref },
  )

  if (reduced) return null

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] bg-background"
    />
  )
}
