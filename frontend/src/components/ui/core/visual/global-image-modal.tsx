"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"

import {
  ArrowLeft02Icon,
  ArrowRight02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AnimatePresence, motion } from "framer-motion"

import { useReducedMotion } from "@/hooks/use-reduced-motion"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { useImageModalStore } from "@/store/image-modal-store"

/** Premium slide ease — smooth in/out, zero bounce. */
const SLIDE_EASE: [number, number, number, number] = [0.25, 1, 0.5, 1]
const SLIDE_DURATION = 0.3

/**
 * LARGEST-FIT box for the current image, with a bounded micro-grow.
 *
 * The lightbox must BOTH grow the photo to the maximum that fits the available
 * stage AND make the rounded frame hug the actual rendered image (not the
 * whole viewport). CSS `w-fit`/`w-auto` alone cannot do both reliably (the
 * shrink-to-fit cascade locks the image near its intrinsic size). So we
 * compute it deterministically:
 *
 *   scale = min(availW / naturalW, availH / naturalH)
 *
 * using the image's measured natural dimensions and the real available stage
 * size (container width ≤ max-w-5xl, viewport height minus safe areas).
 *
 * Two micro-polish rules:
 * - GROWTH (1.05) slightly enlarges the fitting budget (≈5% more presence),
 *   but the FINAL box is always clamped to the true available bounds — the
 *   image can never cross max-w-5xl, overflow the viewport, or collide with
 *   the caption/controls.
 * - Dimensions are FLOORED to integer pixels so the ring/rounded frame meets
 *   the rendered bitmap on an exact pixel boundary — no sub-pixel strip
 *   between image and frame on large screens.
 */
const FIT_GROWTH = 1.05

function useImageFit() {
  const stageRef = useRef<HTMLDivElement>(null)
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null)

  // Available stage box (measured once opened + on resize).
  const [avail, setAvail] = useState({ w: 0, h: 0 })

  const remeasure = useCallback(() => {
    const el = stageRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cs = window.getComputedStyle(el)
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
    const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
    // Available = stage content box, capped at the project container width.
    const maxW = Math.min(rect.width - padX, 64 * 16) // max-w-5xl = 64rem
    setAvail({ w: Math.max(maxW, 0), h: Math.max(rect.height - padY, 0) })
  }, [])

  useLayoutEffect(() => {
    remeasure()
    window.addEventListener("resize", remeasure)
    return () => window.removeEventListener("resize", remeasure)
  }, [remeasure])

  const resetNatural = useCallback(() => setNatural(null), [])

  let box: { w: number; h: number } | null = null
  if (natural && avail.w > 0 && avail.h > 0) {
    // Slightly enlarged budget (bounded by real clamps below).
    const budgetW = avail.w * FIT_GROWTH
    const budgetH = avail.h * FIT_GROWTH
    const scale = Math.min(budgetW / natural.w, budgetH / natural.h)
    // Hard clamps: image never exceeds the TRUE available stage.
    box = {
      w: Math.floor(Math.min(avail.w, natural.w * scale)),
      h: Math.floor(Math.min(avail.h, natural.h * scale)),
    }
  }

  return { stageRef, box, natural, setNatural, resetNatural }
}

/**
 * Viewport-bottom caption band — the image and its text share the modal but
 * never the same space. The image gets almost the full viewport; the caption
 * lives in its own bottom layer, above the backdrop, below the controls.
 */
function Caption({
  category,
  title,
  src,
}: {
  category?: string
  title?: string
  src: string
}) {
  const reduced = useReducedMotion()
  const blurVariant = reduced
    ? { opacity: 0 }
    : { opacity: 0, filter: "blur(6px)" }
  const slide = reduced
    ? { duration: 0 }
    : { duration: SLIDE_DURATION, ease: SLIDE_EASE }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 z-[60] flex flex-col items-center gap-1 px-6 text-center [text-shadow:0_2px_14px_rgba(0,0,0,0.7)]">
      {category && (
        <motion.p
          key={`cat-${src}`}
          initial={blurVariant}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={blurVariant}
          transition={slide}
          className="text-[10.5px] tracking-[0.28em] text-amber-400 uppercase"
        >
          {category}
        </motion.p>
      )}
      {title && (
        <motion.p
          key={`title-${src}`}
          initial={blurVariant}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={blurVariant}
          transition={slide}
          className="text-[14px] text-zinc-300"
        >
          {title}
        </motion.p>
      )}
    </div>
  )
}

/**
 * GlobalImageModal — the single, global fullscreen image lightbox.
 *
 * Stacking: rendered at the App root (outside LayoutWrapper), the modal MUST
 * outrank the site chrome. SiteBorder sits at `z-99` (its fixed inset-0
 * layer), so the modal root is `z-[100]` — one clean step above it, not an
 * escalation war. Inside, layers are relative: caption `z-[60]`, controls
 * `z-[70]`.
 *
 * Layering (bottom → top):
 *  1. Ink-dark backdrop (`bg-zinc-950/92` + `backdrop-blur-sm`) — the modal
 *     root itself, `z-[100]` (above all site chrome incl. SiteBorder).
 *  2. IMAGE — centered, `object-contain`, maximized viewport (large screens
 *     up to 1200px wide / 80svh tall), natural aspect ratio preserved, framed
 *     with `rounded-xl` + a soft ring. NOT forced into a fixed ratio.
 *  3. Caption — viewport-attached bottom layer (eyebrow + title), never over
 *     the image.
 *  4. Controls — close (top-right), prev/next (edge-centered).
 *
 * Next/Prev swap with a coordinated FADE + BLUR on both the image AND the
 * caption (`AnimatePresence mode="wait"`, 0.3s calm tween — no jelly).
 * Controls are strictly Shadcn `Button` (glass, rounded-full).
 *
 * Interaction: click overlay closes, ESC closes, ←/→ navigate, body scroll
 * locks while open. `prefers-reduced-motion` → opacity-only.
 */
export function GlobalImageModal() {
  const reduced = useReducedMotion()

  const isOpen = useImageModalStore((s) => s.isOpen)
  const items = useImageModalStore((s) => s.items)
  const index = useImageModalStore((s) => s.index)
  const close = useImageModalStore((s) => s.close)
  const next = useImageModalStore((s) => s.next)
  const prev = useImageModalStore((s) => s.prev)

  const item = items[index]

  const { stageRef, box, setNatural, resetNatural } = useImageFit()

  // Reset measured natural size whenever the active image changes — the next
  // frame sizes itself from ITS OWN dimensions once loaded.
  useEffect(() => {
    resetNatural()
  }, [item?.src, resetNatural])

  // Body scroll lock + keyboard (ESC / ← / →) while open.
  useEffect(() => {
    if (!isOpen) return

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
      if (e.key === "ArrowRight") {
        e.preventDefault()
        next()
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        prev()
      }
    }
    window.addEventListener("keydown", onKey)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener("keydown", onKey)
    }
  }, [isOpen, close, next, prev])

  const slide = reduced
    ? { duration: 0 }
    : { duration: SLIDE_DURATION, ease: SLIDE_EASE }

  // Coordinated fade + blur for both the image and the caption lines.
  const blurVariant = reduced
    ? { opacity: 0 }
    : { opacity: 0, filter: "blur(6px)" }

  return (
    <AnimatePresence>
      {isOpen && item && (
        <motion.div
          key="global-image-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau gambar"
          className="fixed inset-0 z-[100] flex flex-col bg-zinc-950/92 backdrop-blur-sm"
        >
          {/* Close is owned by THIS backdrop layer ONLY — content and the
              prev/next controls sit ABOVE it, so their clicks structurally
              cannot bubble into a close. The image region stops propagation
              so clicking the photo does nothing. */}
          <div
            onClick={close}
            aria-hidden="true"
            className="absolute inset-0"
          />

          {/* Image — centered, framed, dominant. Clicking the photo does
              nothing; clicking anywhere outside it (on the backdrop sibling)
              closes the modal.
              Geometry (per project design system):
              1. STAGE — flex-1 fills the modal viewport and centers its
                 child both axes (this is where vertical centering lives).
              2. IMAGE BOX — largest-fit computed from the measured natural
                 dimensions vs the available stage (container ≤ max-w-5xl,
                 viewport height minus safe areas). The frame is sized EXACTLY
                 to the rendered image → no letterbox, no distortion, no
                 oversized empty frame. Before dimensions are known the frame
                 holds a wide rectangle (pre-load placeholder, still visible). */}
          <div
            ref={stageRef}
            onClick={close}
            className="relative z-10 flex min-h-0 flex-1 w-full items-center justify-center px-4 py-14 sm:px-8 sm:py-16"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={item.src}
                initial={blurVariant}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={blurVariant}
                transition={slide}
                onClick={(e) => e.stopPropagation()}
                className="flex  max-w-full items-center justify-center"
              >
                <div
                  style={
                    box
                      ? { width: `${box.w}px`, height: `${box.h}px` }
                      : { width: "min(100%, 42rem)", height: "min(60vh, 32rem)" }
                  }
                  className="relative overflow-hidden rounded-xl ring-1 ring-white/10 shadow-2xl"
                >
                  <MediaItem
                    webViewLink={item.src}
                    className="relative size-full overflow-hidden"
                    imageClassName="block size-full object-contain"
                    objectFit="contain"
                    unstyled
                    onImageLoaded={(w, h) => setNatural({ w, h })}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Caption — viewport-bottom layer, never overlapping the image. */}
          <Caption category={item.category} title={item.title} src={item.src} />

          {/* Close — top-right of the viewport. */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Tutup"
            onClick={close}
            className="absolute top-4 right-4 z-[70] size-11 rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md hover:border-amber-400/70 hover:bg-black/60 hover:text-amber-400"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
          </Button>

          {/* Prev / Next — edge-centered, glass pills. */}
          {items.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sebelumnya"
                onClick={(e) => {
                  e.stopPropagation()
                  prev()
                }}
                className="absolute top-1/2 left-3 z-[70] size-11 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md hover:border-amber-400/70   hover:bg-black/60 hover:text-amber-400 md:left-6"
              >
                <HugeiconsIcon icon={ArrowLeft02Icon} className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Berikutnya"
                onClick={(e) => {
                  e.stopPropagation()
                  next()
                }}
                className="absolute top-1/2 right-3 z-[70] size-11 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md hover:border-amber-400/70 hover:bg-black/60 hover:text-amber-400 md:right-6"
              >
                <HugeiconsIcon icon={ArrowRight02Icon} className="size-5" />
              </Button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default GlobalImageModal
