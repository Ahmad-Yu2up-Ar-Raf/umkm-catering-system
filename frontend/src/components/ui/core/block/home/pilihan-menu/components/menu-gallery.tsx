"use client"

import { useRef } from "react"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { gsap, useGSAP } from "@/components/motion/gsap"
import { cn } from "@/lib/utils"
import { AUTO_ADVANCE_MS, type MenuChoice } from "../menu-data"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"

/** Luxury ease — premium Apple-like cubic-bezier (matches the project grammar). */
const LUXURY_EASE = [0.16, 1, 0.3, 1] as unknown as gsap.EaseString

/** Crossfade window for the image blend (s) — outgoing/incoming share it. */
const CROSSFADE = 0.9

/**
 * MenuGallery — the right visual display (md:order-2 / col-span-5).
 *
 * Motion (per activeIndex change, via its own useGSAP):
 *  - TRUE CROSSFADE: the incoming photo fades IN while the outgoing photo
 *    fades OUT, both over ~CROSSFADE seconds, at the same timeline origin.
 *    No snap — the two frames overlap in the middle of the blend.
 *  - KEN-BURNS CONCURRENT: the incoming photo zooms 1.04 → 1.12 over the full
 *    AUTO_ADVANCE_MS window (ease: none) — it never pauses; the crossfade
 *    merely starts on top of the same running zoom.
 *  - Caption (index / title / desc / link) staggers up with y + opacity.
 *  - `prefers-reduced-motion` → only the active frame is shown, static.
 *
 * Every photo wrapper is `opacity-0` in the base class so nothing flashes
 * before GSAP claims the frame.
 */
export function MenuGallery({
  items,
  activeIndex,
}: {
  items: MenuChoice[]
  activeIndex: number
}) {
  const galleryRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const prevIndexRef = useRef(0)
  const reduced = useReducedMotion()

  const active = items[activeIndex]

  useGSAP(
    () => {
      const el = galleryRef.current
      if (!el) return

      const q = gsap.utils.selector(el)
      const photos = q("[data-menu-photo]")
      const captionItems = q("[data-menu-caption-item]")
      if (!photos.length) return

      const prevIndex = prevIndexRef.current
      prevIndexRef.current = activeIndex

      if (reduced) {
        // Static: show only the active frame and its caption (no zoom, no fade).
        gsap.set(photos, { autoAlpha: 0, scale: 1 })
        gsap.set(photos[activeIndex], { autoAlpha: 1 })
        gsap.set(captionItems, { autoAlpha: 1, y: 0 })
        return
      }

      // Manual timeline ownership — the outgoing frame MUST keep its inline
      // opacity (set by the previous run) so the crossfade can fade it OUT.
      // useGSAP's default auto-revert would wipe those inline styles first and
      // the "fade" would be invisible. `revertOnUpdate: false` + kill=cleanup.
      tlRef.current?.kill()
      const incoming = photos[activeIndex]
      const outgoing = photos[prevIndex] as Element | undefined

      const tl = gsap.timeline()

      // INCOMING — fade in over the crossfade window, zooming the whole time.
      tl.fromTo(
        incoming,
        { autoAlpha: 0, scale: 1.04 },
        { autoAlpha: 1, duration: CROSSFADE, ease: "power2.inOut" },
        0
      ).fromTo(
        incoming,
        { scale: 1.04 },
        {
          scale: 1.12,
          duration: AUTO_ADVANCE_MS / 1000,
          ease: "none",
        },
        0
      )

      // OUTGOING — fade out over the SAME window (concurrent crossfade).
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
        captionItems,
        { y: 20, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          ease: LUXURY_EASE,
          stagger: 0.08,
        },
        0.12
      )

      tlRef.current = tl
    },
    {
      scope: galleryRef,
      dependencies: [activeIndex, reduced, items.length],
      // Important: keep the PREVIOUS run's inline styles alive so the outgoing
      // frame can fade out (see timeline docblock above).
      revertOnUpdate: false,
    }
  )

  if (!active) return null // no packages yet — the block renders the skeleton

  return (
    <div
      ref={galleryRef}
      className="relative h-[48vh] lg:pl-20 min-h-[320px] w-full overflow-hidden rounded-2xl md:h-full md:rounded-3xl"
    >
      {/* Stacked photos — only the active one is visible at any time. */}
      {items.map((item, index) => (
        <div
          key={item.id}
          data-menu-photo
          aria-hidden={index !== activeIndex}
          className="absolute inset-0 opacity-0 will-change-transform"
        >
          <MediaItem
            webViewLink={item.imagePath}

            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      ))}

      {/* Readability scrim — DARK but limited to the bottom third so the food
          stays clearly visible above the caption. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-foreground to-transparent"
      />

      {/* Caption — light text on the dark scrim (readable, premium).
          Mobile sizes are deliberately small so title/description sit on ONE
          natural line; desktop steps up hard (title 3xl→4xl, desc lg→xl,
          pill CTA with real padding). */}
      <div
        data-menu-caption
        className="absolute inset-x-6 bottom-5 md:inset-x-7 md:bottom-7"
      >
        <p
          data-menu-caption-item
          className="inline-flex items-center gap-2 truncate text-[10px] tracking-[0.28em] text-accent uppercase md:text-[12px]"
        >
          <span>{active.index} — Menu Pilihan</span>
          {active.badge && (
            <span className="rounded-full bg-primary/25 px-2 py-0.5 font-medium tracking-[0.14em] text-background">
              {active.badge}
            </span>
          )}
        </p>
        <h3
          data-menu-caption-item
          className="mt-1.5 truncate font-heading text-base leading-tight font-semibold text-background md:mt-2 md:text-2xl"
        >
          {active.title}
        </h3>
        <p
          data-menu-caption-item
          className="mt-0.5 max-w-[300px] truncate text-[11px] leading-snug text-background/85 md:mt-1.5 md:max-w-[440px] md:text-sm"
        >
          {active.description}
        </p>
        <p
          data-menu-caption-item
          className="mt-0.5 truncate text-[11px] font-medium text-accent/90 md:mt-1.5 md:text-sm"
        >
          {active.priceText} <span className="text-background/60">·</span>{" "}
          <span className="text-background/85">{active.minOrderText}</span>
        </p>
        <a
          data-menu-caption-item
          href={active.href}
          className="group mt-2.5 inline-flex items-center gap-2 rounded-full text-[10.5px] tracking-[0.2em] text-accent uppercase transition-colors duration-300 md:mt-4 md:gap-2.5"
        >
          Jelajahi Paket
          <span
            aria-hidden="true"
            className={cn(
              "transition-transform duration-300 group-hover:translate-x-1"
            )}
          >
            →
          </span>
        </a>
      </div>
    </div>
  )
}
