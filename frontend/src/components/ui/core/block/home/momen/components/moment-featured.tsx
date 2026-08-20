"use client"

import { useRef } from "react"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { gsap, useGSAP } from "@/components/motion/gsap"
import { cn } from "@/lib/utils"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { AUTO_ADVANCE_MS, type MomentItem } from "../moment-data"

/** Luxury ease — premium Apple-like cubic-bezier (project grammar). */
const LUXURY_EASE = [0.16, 1, 0.3, 1] as unknown as gsap.EaseString

/** Crossfade window for the image blend (s) — incoming/outgoing share it. */
const CROSSFADE = 0.9

/**
 * MomentFeatured — the large top display (exact Tiska replica, token-mapped).
 *
 * Motion (per activeIndex change, via its own useGSAP — mirrors MenuGallery):
 *  - TRUE CROSSFADE: incoming photo fades IN while the outgoing fades OUT over
 *    the same ~CROSSFADE window (no snap — the frames overlap mid-blend).
 *  - KEN-BURNS (REVERSE): the incoming photo starts at scale 1.08 and settles
 *    down to 1.0 over the FULL AUTO_ADVANCE_MS window (ease: none) — the
 *    elegant zoom-out the owner asked for (scale in → scale out).
 *  - Caption (category/title) staggers up with y + opacity, staged behind the
 *    blend; pagination pills are plain CSS (no per-tick animation).
 *  - `prefers-reduced-motion` → active frame only, static.
 *
 * The photos are `opacity-0` in the base class (nothing flashes before GSAP
 * claims the frame, exactly like the menu gallery engine).
 */
export function MomentFeatured({
  items,
  activeIndex,
  onSelect,
  onOpen,
}: {
  items: MomentItem[]
  activeIndex: number
  onSelect: (index: number) => void
  /** Open the global lightbox at this moment. */
  onOpen: (index: number) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const prevIndexRef = useRef(0)
  const reduced = useReducedMotion()

  const active = items[activeIndex]

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return

      const q = gsap.utils.selector(el)
      const photos = q("[data-moment-photo]")
      const captions = q("[data-moment-caption]")
      if (!photos.length) return

      const prevIndex = prevIndexRef.current
      prevIndexRef.current = activeIndex

      if (reduced) {
        // Static: show only the active frame + its caption (no zoom/fade).
        gsap.set(photos, { autoAlpha: 0, scale: 1 })
        gsap.set(photos[activeIndex], { autoAlpha: 1 })
        gsap.set(captions, { autoAlpha: 1, y: 0 })
        return
      }

      // Manual timeline ownership — the outgoing frame MUST keep its inline
      // opacity (set by the previous run) so the crossfade can fade it OUT.
      // `revertOnUpdate: false` keeps those inline styles alive.
      tlRef.current?.kill()
      const incoming = photos[activeIndex]
      const outgoing = photos[prevIndex] as Element | undefined

      const tl = gsap.timeline()

      // INCOMING — fade in over the crossfade window, settling the whole time.
      // Scale OUT: start slightly magnified (1.08) and settle to 1.0.
      tl.fromTo(
        incoming,
        { autoAlpha: 0, scale: 1.08 },
        { autoAlpha: 1, duration: CROSSFADE, ease: "power2.inOut" },
        0
      ).fromTo(
        incoming,
        { scale: 1.08 },
        { scale: 1.0, duration: AUTO_ADVANCE_MS / 1000, ease: "none" },
        0
      )

      // OUTGOING — fades out over the SAME window (concurrent crossfade).
      if (outgoing && prevIndex !== activeIndex) {
        tl.to(
          outgoing,
          {
            autoAlpha: 0,
            scale: 1.06,
            duration: CROSSFADE,
            ease: "power2.inOut",
          },
          0
        )
      }

      // CAPTION — staggered fade-up, staged slightly behind the blend.
      tl.fromTo(
        captions,
        { y: 20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7, ease: LUXURY_EASE, stagger: 0.08 },
        0.12
      )

      tlRef.current = tl
    },
    {
      scope: ref,
      dependencies: [activeIndex, reduced, items.length],
      // Keep the PREVIOUS run's inline styles alive so the outgoing frame can
      // fade out (see timeline docblock above).
      revertOnUpdate: false,
    }
  )

  if (!active) return null // no moments yet — the block renders the skeleton

  return (
    <div
      ref={ref}
      onClick={() => onOpen(activeIndex)}
      className="relative aspect-[3/2] w-full cursor-pointer overflow-hidden rounded-2xl ring-1 ring-border sm:aspect-[2/1] lg:aspect-auto lg:h-[min(50vh,520px)]"
    >
      {/* Stacked photos — only the active one is visible at any time. */}
      {items.map((item, index) => (
        <div
          key={item.id}
          data-moment-photo
          aria-hidden={index !== activeIndex}
          className="absolute inset-0 opacity-0 will-change-transform"
        >
          <MediaItem
            webViewLink={item.imagePath}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      ))}

      {/* Readability scrim — warm brown, limited to the lower half (food stays
          clearly visible above the caption). Token-driven, no raw colors. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-transparent via-foreground/20 to-foreground/85"
      />

      {/* Caption + pagination pills (exact reference structure). */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-6 text-left sm:p-9 md:pb-8">
        <div className="min-w-0">
          <p
            data-moment-caption
            className="text-[10px] tracking-[0.3em] text-accent uppercase"
          >
            {active.category}
          </p>
          <p
            data-moment-caption
            className="mt-2 max-w-[560px] font-heading text-[clamp(20px,3vw,36px)] leading-tight font-light text-background"
          >
            {active.title}
          </p>
        </div>

        {/* Pagination pills — hidden on mobile, clickable to jump. The frame's
            click opens the lightbox; pills must not bubble into it. */}
        <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Lihat ${item.category} — ${item.title}`}
              aria-current={index === activeIndex}
              onClick={(e) => {
                e.stopPropagation()
                onSelect(index)
              }}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                index === activeIndex
                  ? "w-8 bg-accent"
                  : "w-1.5 bg-background/30 hover:bg-background/60"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
