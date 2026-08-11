"use client"

import { useRef } from "react"

import { motion, useScroll, useSpring, useTransform } from "framer-motion"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { cn } from "@/lib/utils"

interface ScrollRotatingVisualProps {
  imageSrc: string
  alt: string
  /** Positioning/size of the visual's square box (e.g. `size-[280px]`). */
  className?: string
  /** Degrees of rotation across the element's full scroll travel. */
  rotate?: number
}

/**
 * ScrollRotatingVisual — a reusable hero object that rotates with scroll.
 *
 * Framer Motion pipeline: `useScroll` (target = this element) → `useTransform`
 * maps the element's viewport travel to `rotate` degrees → `useSpring` smooths
 * it, so the spin scrubs to the wheel with a premium glide, never a hard snap.
 * Rotation is around the element's own center.
 *
 * `prefers-reduced-motion` → static (no rotation at all).
 *
 * The box is a 1:1 square (`size-*`); sizing/placement come in via `className`,
 * callers own any wrapper. Image treatment (object-contain + drop-shadow) is
 * fixed — it is the brand hero-object look.
 */
export function ScrollRotatingVisual({
  imageSrc,
  alt,
  className,
  rotate = 45,
}: ScrollRotatingVisualProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const rotationRaw = useTransform(scrollYProgress, [0, 1], [0, rotate])
  const rotation = useSpring(rotationRaw, {
    stiffness: 90,
    damping: 25,
    mass: 0.5,
  })

  return (
    <motion.div
      ref={ref}
      style={{ rotate: reduced ? 0 : rotation, transformOrigin: "center" }}
      className={cn("relative", className)}
    >
      <img
        src={imageSrc}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-contain drop-shadow-xl md:scale-110"
      />
    </motion.div>
  )
}
