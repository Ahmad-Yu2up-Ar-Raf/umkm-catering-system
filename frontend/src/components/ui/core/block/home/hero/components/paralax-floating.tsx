"use client"

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
} from "react"
import { useAnimationFrame } from "framer-motion"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { useMousePositionRef } from "@/hooks/use-mouse-position-ref"
import { useIsMobile } from "@/hooks/use-mobile"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { gsap, useGSAP } from "@/components/motion/gsap"

interface FloatingContextType {
  registerElement: (id: string, element: HTMLDivElement, depth: number) => void
  unregisterElement: (id: string) => void
}

const FloatingContext = createContext<FloatingContextType | null>(null)

interface FloatingProps {
  children: ReactNode
  className?: string
  sensitivity?: number
  easingFactor?: number
  /** Parent hero master timeline — this child injects its entry reveal into it
   *  (proper React connection, no string selectors from the parent). */
  timeline?: gsap.core.Timeline | null
}

const Floating = ({
  children,
  className,
  sensitivity = 1,
  easingFactor = 0.05,
  timeline,
  ...props
}: FloatingProps) => {
  const containerRef = useRef<HTMLDivElement | null>(
    null
  ) as React.MutableRefObject<HTMLDivElement>
  const elementsMap = useRef(
    new Map<
      string,
      {
        element: HTMLDivElement
        depth: number
        currentPosition: { x: number; y: number }
      }
    >()
  )
  const mousePositionRef = useMousePositionRef(containerRef)
  const isMobile = useIsMobile()
  const reduced = useReducedMotion()

  const registerElement = useCallback(
    (id: string, element: HTMLDivElement, depth: number) => {
      elementsMap.current.set(id, {
        element,
        depth,
        // Start at the center (neutral) so there is no load-time offset or jump.
        currentPosition: { x: 0, y: 0 },
      })
    },
    []
  )

  const unregisterElement = useCallback((id: string) => {
    elementsMap.current.delete(id)
  }, [])

  // Mouse/touch parallax — desktop only (no hover on touch devices). The ENTRY
  // reveal is injected into the hero master timeline below.
  useAnimationFrame(() => {
    if (!containerRef.current || isMobile) return

    elementsMap.current.forEach((data) => {
      // Center-normalized pointer [-1, 1] × depth × sensitivity → small px range.
      const strength = data.depth * sensitivity * 34

      const newTargetX = mousePositionRef.current.x * strength
      const newTargetY = mousePositionRef.current.y * strength

      const dx = newTargetX - data.currentPosition.x
      const dy = newTargetY - data.currentPosition.y

      // Ease toward the target — never a hard jump, including the first move.
      data.currentPosition.x += dx * easingFactor
      data.currentPosition.y += dy * easingFactor

      data.element.style.transform = `translate3d(${data.currentPosition.x}px, ${data.currentPosition.y}px, 0)`
    })
  })

  const collectCards = (): HTMLElement[] =>
    Array.from(elementsMap.current.values())
      .map((d) => d.element.firstElementChild as HTMLElement | null)
      .filter((el): el is HTMLElement => Boolean(el))

  // Hold the cards invisible (autoAlpha = opacity + visibility) until the hero
  // master timeline releases them — no flash between preloader exit and reveal.
  useGSAP(
    () => {
      if (reduced) return
      const cards = collectCards()
      if (cards.length) gsap.set(cards, { autoAlpha: 0 })
    },
    { scope: containerRef }
  )

  // Inject the entry reveal into the parent master timeline at position 4.5 —
  // after the CTA finishes (~3.3s) plus the ~1.2s Step-C gap. Runs on every
  // viewport — no matchMedia gate.
  useGSAP(
    () => {
      if (!timeline || reduced || !containerRef.current) return
      const cards = collectCards()
      if (!cards.length) return

      // Suspend the hover transition so GSAP's y-tween isn't rubber-banded.
      cards.forEach((card) => {
        card.style.transition = "none"
      })

      timeline.fromTo(
        cards,
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          clearProps: "transform",
          onComplete: () => {
            cards.forEach((card) => card.style.removeProperty("transition"))
          },
        },
        1
      )
    },
    { scope: containerRef, dependencies: [timeline] }
  )

  return (
    <FloatingContext.Provider value={{ registerElement, unregisterElement }}>
      <div
        ref={containerRef}
        className={cn("absolute top-0 left-0 h-full w-full", className)}
        {...props}
      >
        {children}
      </div>
    </FloatingContext.Provider>
  )
}

export default Floating

interface FloatingElementProps {
  children: ReactNode
  className?: string
  depth?: number
}

export const FloatingElement = ({
  children,
  className,
  depth = 1,
}: FloatingElementProps) => {
  const elementRef = useRef<HTMLDivElement>(null)
  // useId is stable + unique per instance (pure — replaces Math.random, which
  // trips react-hooks/purity and changes every render).
  const idRef = useRef(useId())
  const context = useContext(FloatingContext)

  // Layout effect (child layout effects run before the parent's), so the
  // elements are registered deterministically — no dependency on effect order.
  useLayoutEffect(() => {
    if (!elementRef.current || !context) return

    const id = idRef.current
    const nonNullDepth = depth ?? 0.01

    context.registerElement(id, elementRef.current, nonNullDepth)
    return () => context.unregisterElement(id)
  }, [depth, context])

  return (
    <div
      ref={elementRef}
      className={cn("cursor-target absolute will-change-transform", className)}
    >
      {children}
    </div>
  )
}
