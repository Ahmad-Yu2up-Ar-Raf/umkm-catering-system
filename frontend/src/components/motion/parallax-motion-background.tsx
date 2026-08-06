"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { gsap, ScrollTrigger, useGSAP } from "@/components/motion/gsap"

type ParallaxMotionBackgroundProps = {
  /** Background image URL — served path, e.g. "/assets/images/...". */
  imageUrl: string
  /** Decorative background alt (default "" — backgrounds are aria-hidden). */
  alt?: string
  /** Scrim(s) for legibility — one Tailwind gradient class, or an array that
   *  stacks multiple overlay layers (linear + radial). */
  overlayGradient?: string | string[]
  /** Parallax depth (0 = none). Maps to ±(speed × 20) yPercent, clamped to
   *  the layer's 10% headroom. Default 0.3 → ±6%. */
  parallaxSpeed?: number
  /** Disable the scroll-scrubbed parallax entirely (static backdrop). */
  enableParallax?: boolean
  /** Initial zoom-out reveal: scale 1.15 → 1.0 + fade. Default true. */
  revealScale?: boolean
  /** `"scroll"` (default): plays once when the section scrolls into view.
   *  `"mount"`: plays when the component mounts / `play` flips true — for
   *  preloader-gated heroes, so the reveal never runs behind the curtain. */
  revealTrigger?: "scroll" | "mount"
  /** Gate for `revealTrigger="mount"` (preloader done). While false the layer
   *  stays hidden (scale 1.15, opacity 0); flipping true zooms it out. */
  play?: boolean
  /** ScrollTrigger start for `revealTrigger="scroll"` (default "top 80%"). */
  revealStart?: string
  className?: string
}

/**
 * Reusable luxury motion background for hero-like sections (#hero, #kontak,
 * future CTAs). Self-contained: it clips its own overflow, so parallax travel
 * never leaks document scrollbars regardless of the parent.
 *
 * Layers (all `absolute inset-0`, pointer-events-none, aria-hidden):
 *   1. root clip      — `overflow-hidden` + `-z-10` (behind the section text).
 *   2. parallax layer — `h-[120%] -top-[10%]` (10% vertical headroom each way)
 *                       with `will-change-transform`. GSAP owns BOTH the
 *                       scroll-scrubbed yPercent AND the one-shot zoom reveal
 *                       (they compose cleanly on one transform).
 *   3. overlay scrim  — stacked gradient div(s) above the photo for contrast.
 *
 * Motion (GSAP ScrollTrigger; `prefers-reduced-motion` = static render):
 *   - Parallax: yPercent ±travel scrubbed `scrub: 1` (velocity-smoothed,
 *     buttery — no snapping) over the section's full travel window
 *     (start "top bottom" → end "bottom top"). Travel is clamped inside the
 *     layer's headroom so edges are never exposed.
 *   - Reveal: scale 1.15 → 1.0 + opacity 0 → 1, `power3.out`.
 *
 * Re-measure: a delayed `ScrollTrigger.refresh()` runs after mount (fonts,
 * images, footers settle late). ScrollTriggers created too early measure
 * zero-height / stale bounds — the reveal never fires, the layer stays
 * `opacity: 0`, and the background looks "disappeared". Persistent
 * cross-route hosts (the global #kontak) refresh again on route/preloader
 * changes from their own effect.
 */
export function ParallaxMotionBackground({
  imageUrl,
  alt = "",
  overlayGradient,
  parallaxSpeed = 0.3,
  enableParallax = true,
  revealScale = true,
  revealTrigger = "scroll",
  play = true,
  revealStart = "top 80%",
  className,
}: ParallaxMotionBackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  // Delayed re-measure after mount (see docstring). `reduced` is a stable
  // dependency; host components refresh on route/preloader changes.
  useEffect(() => {
    if (reduced) return
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 100)
    return () => window.clearTimeout(t)
  }, [reduced])

  useGSAP(
    () => {
      if (reduced || !rootRef.current || !layerRef.current) return

      const layer = layerRef.current
      // Layer has 10% headroom above/below → clamp travel strictly inside it.
      const travel = gsap.utils.clamp(1, 9, parallaxSpeed * 20)

      if (enableParallax) {
        gsap.fromTo(
          layer,
          { yPercent: -travel },
          {
            yPercent: travel,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1, // velocity-smoothed scrub — fluid, follows the scroll
            },
          }
        )
      }

      if (revealScale) {
        if (revealTrigger === "scroll") {
          gsap.fromTo(
            layer,
            { scale: 1.15, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 1.2,
              ease: "power3.out",
              scrollTrigger: {
                trigger: rootRef.current,
                start: revealStart,
                once: true,
              },
            }
          )
        } else {
          // "mount" (hero): hold hidden until `play` flips (preloader done),
          // then zoom out — no ScrollTrigger dependency, so it never plays
          // behind the curtain and never depends on a trigger firing.
          if (!play) {
            gsap.set(layer, { scale: 1.15, opacity: 0 })
            return
          }
          gsap.fromTo(
            layer,
            { scale: 1.15, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1.2, ease: "power3.out" }
          )
        }
      }
    },
    {
      scope: rootRef,
      dependencies: [
        play,
        revealScale,
        revealTrigger,
        revealStart,
        enableParallax,
        parallaxSpeed,
      ],
    }
  )

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className
      )}
    >
      <div
        ref={layerRef}
        className="absolute inset-x-0 -top-[10%] h-[120%] will-change-transform"
      >
        <img
          src={imageUrl}
          alt={alt}
          className="h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
      </div>
      {overlayGradient &&
        (Array.isArray(overlayGradient) ? (
          overlayGradient.map((g, i) => (
            <div
              key={i}
              aria-hidden="true"
              className={cn("absolute inset-0", g)}
            />
          ))
        ) : (
          <div
            aria-hidden="true"
            className={cn("absolute inset-0", overlayGradient)}
          />
        ))}
    </div>
  )
}
