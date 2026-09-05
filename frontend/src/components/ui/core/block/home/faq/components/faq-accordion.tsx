"use client"

import { useState } from "react"

import { Accordion as AccordionPrimitive } from "radix-ui"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/fragments/shadcn-ui/accordion"
import { Separator } from "@/components/ui/fragments/shadcn-ui/separator"
import { cn } from "@/lib/utils"
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"

import type { FaqItem } from "../faq-data"

/** Premium content open/close — height eases, opacity fades (no snaps). */
const CONTENT_TRANSITION = {
  height: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  opacity: { duration: 0.35, ease: "easeOut" },
} as const

/** Inline `**bold**` / `*italic*` — the italic accent is the brand serif. */
function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          )
        }
        if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) {
          return (
            <em key={i} className="font-accent text-primary italic">
              {part.slice(1, -1)}
            </em>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

/**
 * Editorial rich-text FAQ answer (Tiska #faq standard):
 *  - paragraphs with `space-y-3` breathing
 *  - `- item` lines → unordered list with a `primary` dot
 *  - `1. item` lines → ordered list with `primary` numerals
 *  - `**bold**` and `*italic*` inline accents
 */
function RichText({ text }: { text: string }) {
  const blocks: Array<{ type: "p" | "ul" | "ol"; items: string[] }> = []
  for (const raw of text.split("\n")) {
    const line = raw.trim()
    if (!line) continue
    const ul = /^[-•]\s+(.*)$/.exec(line)
    const ol = /^(\d+)[.)]\s+(.*)$/.exec(line)
    if (ul) {
      const last = blocks[blocks.length - 1]
      if (last?.type === "ul") last.items.push(ul[1])
      else blocks.push({ type: "ul", items: [ul[1]] })
    } else if (ol) {
      const last = blocks[blocks.length - 1]
      if (last?.type === "ol") last.items.push(ol[2])
      else blocks.push({ type: "ol", items: [ol[2]] })
    } else {
      blocks.push({ type: "p", items: [line] })
    }
  }

  return (
    <div className="space-y-3 text-sm sm:text-base">
      {blocks.map((block, bi) => {
        if (block.type === "ul") {
          return (
            <ul key={bi} className="space-y-1.5">
              {block.items.map((item, ii) => (
                <li key={ii} className="flex gap-2.5">
                  <span
                    aria-hidden="true"
                    className="mt-[0.55em] size-[5px] shrink-0 rounded-full bg-primary"
                  />
                  <span>
                    <InlineText text={item} />
                  </span>
                </li>
              ))}
            </ul>
          )
        }
        if (block.type === "ol") {
          return (
            <ol key={bi} className="space-y-1.5">
              {block.items.map((item, ii) => (
                /* `items-baseline` aligns the number's baseline with the FIRST
                   line of the adjacent text — exact typographic alignment, no
                   magic offsets (equivalent to items-start + a manual push-down,
                   but correct at any font size / line-height). */
                <li key={ii} className="flex items-baseline gap-2.5">
                  <span className="font-heading text-[11px] text-primary">
                    {String(ii + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <InlineText text={item} />
                  </span>
                </li>
              ))}
            </ol>
          )
        }
        return (
          <p key={bi}>
            <InlineText text={block.items[0]} />
          </p>
        )
      })}
    </div>
  )
}

/**
 * Plus/Minus trigger icon — the vertical bar rotates 90° into a minus.
 * Long, buttery easing so the icon never snaps.
 */
function PlusMinusIcon({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="relative mt-1 ml-4 size-4 shrink-0 text-primary"
    >
      <span className="absolute top-1/2 left-0 h-[1.5px] w-full -translate-y-1/2 rounded-full bg-current" />
      <span
        className={cn(
          "absolute top-0 left-1/2 h-full w-[1.5px] -translate-x-1/2 rounded-full bg-current",
          "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open && "rotate-90"
        )}
      />
    </span>
  )
}

/**
 * Collapsible content with smooth open AND close — "The Padding Trap" fix.
 *
 * The animation wrapper is PADDING-FREE: a bare `motion.div` (overflow hidden)
 * that only tweens `height 0 ↔ auto` and `opacity`. All padding lives on an
 * INNER wrapper, so when the element sits at `height: 0` it truly occupies
 * zero pixels — no leftover padding causing the closing "jlep" snap before
 * Radix unmounts it. Radix content stays mounted via `forceMount` and Framer
 * fully owns the exit tween (Radix's CSS variable is never used for height).
 *
 * `prefers-reduced-motion` is honoured by the section-level
 * `MotionConfig reducedMotion="user"` → instant, static toggle.
 */
function AnimatedContent({
  open,
  children,
}: {
  open: boolean
  children: React.ReactNode
}) {
  return (
    <AccordionPrimitive.Content forceMount className="overflow-hidden">
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={CONTENT_TRANSITION}
            style={{ overflow: "hidden" }}
          >
            {/* INNER WRAPPER — the only place padding is allowed. */}
            <div className="px-4 pt-5 pb-4 font-sans text-sm leading-relaxed text-muted-foreground/70 md:pr-30">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AccordionPrimitive.Content>
  )
}

/**
 * FAQ accordion list (shadcn Accordion as the base).
 *
 * Active indicator: a VERTICAL line scoped STRICTLY to the trigger row — it
 * lives inside the `relative` wrapper that contains only the AccordionTrigger,
 * so its bounds equal the question title height (never the expanded content).
 *
 * Motion lifecycle of the line (layoutId shared element, `LayoutGroup`):
 *  - ACTIVE → ACTIVE switch (FAQ A → FAQ B): PURE GLIDE. The entering line
 *    mounts with `initial={false}` so only the layout projection morphs the
 *    geometry A→B; the leaving line just fades (exit = opacity) because the
 *    morph owns the hand-off. No scaleY "grow" fights the glide.
 *  - FIRST OPEN (no FAQ was open): the line grows from the vertical center
 *    (`initial={{ scaleY: 0 }}`), a height-expansion reveal.
 *  - TRUE CLOSE (user closes the only-open FAQ): the line shrinks back to 0.
 *  The grow/shrink only ever runs when there is NOT a sibling awaiting a
 *  morph, so the seamless `layoutId` glide is never broken.
 *
 * Category switches are handled by the parent (staggered reveal over the
 * `[data-faq-item]` + `[data-faq-final-sep]` markers).
 */

/** Previous committed `openItem` — lets the entering line know whether it is
 *  mounting as an active→active switch (a sibling was open → pure layoutId
 *  glide, no entrance) or a true first open (grow from nothing).
 *
 *  Uses React's sanctioned "adjust state during render" pattern (compare the
 *  incoming prop to the previous state inside the render, set when changed) —
 *  no ref reads during render (lint `react-hooks/refs`) and no setState in
 *  effects (lint `react-hooks/set-state-in-effect`). */
function usePreviousOpen(openItem: string | undefined): string | undefined {
  const [previous, setPrevious] = useState<string | undefined>(undefined)
  const [seen, setSeen] = useState<string | undefined>(openItem)
  if (seen !== openItem) {
    setPrevious(seen)
    setSeen(openItem)
  }
  return previous
}

/** Exit is branch-aware via the AnimatePresence `custom` (variant function):
 *  - "switch": another item took over → REMOVE INSTANTLY (duration 0). The
 *    entering line's layoutId morph owns the hand-off; any linger here is what
 *    produced the ghost/duplicate + downward-stretch artifact.
 *  - "close": the FAQ is fully closed → shrink down, elegant. */
const LINE_VARIANTS = {
  exit: (mode: string) =>
    mode === "switch"
      ? { opacity: 0, transition: { duration: 0 } }
      : { scaleY: 0, opacity: 0 },
}

export function FaqAccordion({
  items,
  openItem,
  onOpenChange,
}: {
  items: FaqItem[]
  openItem: string | undefined
  onOpenChange: (value: string | undefined) => void
}) {
  const prevOpen = usePreviousOpen(openItem)
  // Current intent for any exiting line: user switched to another item, or
  // fully closed the section. Pushed to every item's AnimatePresence below.
  const exitMode = openItem ? "switch" : "close"

  return (
    <LayoutGroup>
      <div className="relative px-6 md:px-0">
        <Separator data-faq-sep className="m-0 bg-border/60" />
        <Accordion
          value={openItem}
          onValueChange={onOpenChange}
          collapsible
          type="single"
          className="w-full border-0 bg-transparent p-0"
        >
          {items.map((item) => {
            const isOpen = openItem === item.id
            return (
              <AccordionItem
                key={item.id}
                value={item.id}
                data-faq-item
                className="group relative border-b-0 py-5.5"
              >
                {/* Relative wrapper = the trigger row ONLY. The indicator is
                    absolutely scoped to this box, never to the content. */}
                <div className="relative">
                  <AccordionTrigger className="group/accordion-trigger px-4 font-sans   hover:no-underline **:data-[slot=accordion-trigger-icon]:hidden text-base">
                    <span
                      className={cn(
                        "flex-1 text-foreground/90 transition-all duration-300 ease-out group-hover:translate-x-2"
                      )}
                    >
                      {item.title}
                    </span>
                    <PlusMinusIcon open={isOpen} />
                  </AccordionTrigger>

                  {/* Real-time line: layoutId morph on switch, grow on first
                      open, shrink on close — see the docstring above. */}
                  <AnimatePresence custom={exitMode}>
                    {isOpen && (
                      <motion.div
                        layoutId="accordion-active-line"
                        variants={LINE_VARIANTS}
                        initial={
                          // First-ever open: grow from 0. Any switch: mount at
                          // full so ONLY the layout morph runs (pure glide).
                          prevOpen === undefined
                            ? { scaleY: 0, opacity: 0 }
                            : false
                        }
                        animate={{ scaleY: 1, opacity: 1 }}
                        exit="exit"
                        transition={{
                          layout: {
                            duration: 0.5,
                            ease: [0.16, 1, 0.3, 1],
                          },
                          scaleY: {
                            duration: 0.35,
                            ease: [0.16, 1, 0.3, 1],
                          },
                          opacity: { duration: 0.25, ease: "easeOut" },
                        }}
                        style={{ transformOrigin: "center" }}
                        className="pointer-events-none absolute inset-y-0 left-0 w-[1.5px] rounded-full bg-primary"
                      />
                    )}
                  </AnimatePresence>
                </div>

                <AnimatedContent open={isOpen}>
                  <RichText text={item.content} />
                </AnimatedContent>
              </AccordionItem>
            )
          })}
        </Accordion>
        <Separator data-faq-final-sep className="m-0 bg-border/60" />
      </div>
    </LayoutGroup>
  )
}
