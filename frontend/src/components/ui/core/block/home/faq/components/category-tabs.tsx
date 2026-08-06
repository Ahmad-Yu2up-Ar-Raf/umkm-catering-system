"use client"

import { useRef } from "react"

import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { gsap, useGSAP } from "@/components/motion/gsap"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { cn } from "@/lib/utils"
import { LayoutGroup, motion } from "framer-motion"

import type { FaqCategory } from "../faq-data"

/**
 * Tiska motion grammar — the active-line glide.
 *
 * Deliberately a tween, NOT a spring: `ease [0.16, 1, 0.3, 1]` (premium
 * Apple-like ease-out) never overshoots or "wobbles backwards" when the line
 * moves between items. 0.5s is calm and deliberate.
 */
const GLIDE_TWEEN = {
  type: "tween",
  ease: [0.16, 1, 0.3, 1],
  duration: 0.5,
} as const

/**
 * Category description — GSAP entrance when it appears.
 * Silky fade + rise (0.6s power2.out), never a hard show/hide toggle.
 */
function CategoryDescription({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      if (reduced || !ref.current) return
      gsap.fromTo(
        ref.current,
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }
      )
    },
    { scope: ref }
  )

  return (
    <span
      ref={ref}
      className="block text-[12px] font-light text-muted-foreground/80"
    >
      {text}
    </span>
  )
}

/**
 * Desktop category sub-nav — vertical tabs on the left column (md+ only).
 *
 * - Text row is its OWN `relative` flex container (exactly the label's
 *   line-height), so both the hover line (`self-center`) and the active
 *   indicator (`inset-y-0 my-auto`) sit pixel-perfectly centred on the
 *   category name — never on the taller tab body.
 * - Active indicator is a `layoutId` shared element with `initial={false}`:
 *   it GLIDES in real-time between tabs (tween, no fade/scale remount).
 * - Hover line snaps OFF instantly once a tab turns active.
 * - The description slot is a fixed one-line row on EVERY tab, so tab heights
 *   never reflow while the indicator glides (no "jump to bottom" glitch).
 */
export function CategoryTabs({
  categories,
  activeCategory,
  onSelect,
  className,
}: {
  categories: FaqCategory[]
  activeCategory: string
  onSelect: (id: string) => void
  className?: string
}) {
  return (
    <LayoutGroup>
      <div
        className={cn(
          "relative flex w-full flex-col border-b pb-7",
          className
        )}
      >
        {categories.map((cat, i) => {
          const isActive = activeCategory === cat.id
          return (
            <Button
              key={cat.id}
              data-faq-cat
              onClick={() => onSelect(cat.id)}
              variant="ghost"
              aria-pressed={isActive}
              className={cn(
                "group m-0 h-fit w-full flex-col items-start gap-0 rounded-none bg-none p-0 text-left opacity-0 transition-none hover:bg-transparent",
                !isActive && "mb-4",
                isActive && "mb-5"
              )}
            >
              {/* Text row — `relative` so the line is scoped to the label
                  line-height and glides between rows via `layoutId`. */}
              <span className="relative flex w-full items-center">
                {isActive && (
                  <motion.div
                    layoutId="faq-category-active-line"
                    // No entry animation on remount: the shared layoutId
                    // GLIDES the line from the previous tab to this one in
                    // real-time (never a fade/scale open-close).
                    initial={false}
                    transition={GLIDE_TWEEN}
                    className="pointer-events-none absolute inset-y-0 left-0 my-auto h-[70%] w-[1.5px] rounded-full bg-primary"
                  />
                )}

                {/* Hover line — snaps away instantly once the tab is active.
                    `items-center` + `self-center` keep it on the text axis. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-0 w-[1.5px] self-center rounded-full bg-primary/30",
                    !isActive
                      ? "transition-all duration-300 ease-out group-hover:h-4"
                      : "h-0 opacity-0 transition-none group-hover:h-0"
                  )}
                />

                <span
                  className={cn(
                    "mr-2.5 ml-2 font-heading text-[12px] transition-colors duration-300 ease-out",
                    isActive ? "text-primary" : "text-muted-foreground/40"
                  )}
                >
                  {`0${i + 1}`}
                </span>

                <span
                  className={cn(
                    "text-sm text-foreground/80 transition-colors duration-300 ease-out",
                    !isActive && "text-muted-foreground/40"
                  )}
                >
                  {cat.label}
                </span>
              </span>

              {/* Reserved one-line slot — every tab keeps the same height so
                  the indicator glides between stable coordinates. */}
              <span className="block h-[1.2rem] w-full overflow-hidden pl-8">
                {isActive ? (
                  <CategoryDescription text={cat.description} />
                ) : null}
              </span>
            </Button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}
