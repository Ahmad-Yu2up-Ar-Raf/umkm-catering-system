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
import { cn } from "@/lib/utils"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { Skeleton } from "@/components/ui/fragments/shadcn-ui/skeleton"
import { Spinner } from "@/components/ui/fragments/shadcn-ui/spinner"
import { useImageModalStore } from "@/store/image-modal-store"

/** Premium slide ease — smooth in/out, zero bounce. */
const SLIDE_EASE: [number, number, number, number] = [0.25, 1, 0.5, 1]
const SLIDE_DURATION = 0.3

/**
 * LARGEST-FIT box for the current image.
 *
 * The lightbox must grow the photo to the maximum that fits the available
 * stage WHILE the rounded frame hugs the actual rendered image (not the whole
 * viewport). CSS `w-fit`/`w-auto` alone cannot do both (the shrink-to-fit
 * cascade locks the image near its intrinsic size), so we compute it:
 *
 *   scale = min(availW / naturalW, availH / naturalH)
 *
 * and derive HEIGHT from the floored WIDTH using the image's own ratio. That
 * keeps the frame's aspect ratio EXACTLY equal to the photo's, so
 * `object-contain` fills the frame edge-to-edge — no sub-pixel letterbox, no
 * visible seam between the ring and the image.
 *
 * Available size is the REAL stage content box with two explicit bounds:
 *  - WIDTH is capped at `max-w-5xl` (64rem) — matching the project's content
 *    container — so a photo can never grow "infinitely" on wide screens.
 *  - HEIGHT already excludes the modal's vertical padding; the bottom padding
 *    is deliberately sized to RESERVE the caption/eyebrow band at the bottom
 *    of the stage, so a tall image can never slide underneath the text.
 */
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
    const maxW = Math.min(rect.width - padX, 64 * 16) // max-w-5xl = 64rem
    setAvail({
      w: Math.max(maxW, 0),
      h: Math.max(rect.height - padY, 0),
    })
  }, [])

  useLayoutEffect(() => {
    remeasure()
    window.addEventListener("resize", remeasure)
    return () => window.removeEventListener("resize", remeasure)
  }, [remeasure])

  const resetNatural = useCallback(() => setNatural(null), [])

  let box: { w: number; h: number } | null = null
  if (natural && avail.w > 0 && avail.h > 0) {
    const scale = Math.min(avail.w / natural.w, avail.h / natural.h)
    let w = Math.max(1, Math.floor(natural.w * scale))
    let h = Math.max(1, Math.round(w * (natural.h / natural.w)))
    // If the rounded height would overflow the stage, clamp height and derive
    // width back from it — the frame always fits AND keeps the photo's ratio.
    if (h > Math.floor(avail.h)) {
      h = Math.max(1, Math.floor(avail.h))
      w = Math.max(1, Math.round(h * (natural.w / natural.h)))
    }
    box = { w, h }
  }

  return { stageRef, box, natural, setNatural, resetNatural, remeasure }
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
 *  2. IMAGE — centered, `object-contain`, fitted within the available stage
 *     (width capped at `max-w-5xl`, bottom padding reserves the caption band
 *     so text is never obscured), natural aspect ratio preserved, framed with
 *     `rounded-xl` + a soft ring only when its dimensions are known.
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

  const { stageRef, box, setNatural, resetNatural, remeasure } = useImageFit()

  // THE sizing gate: `useImageFit` measures the stage with a layout effect
  // that can only run while the modal is MOUNTED. The modal is always mounted
  // (App root) but closed → on first mount the stage ref is null and avail
  // stays 0×0. Re-measure whenever the modal becomes visible OR the active
  // image changes, so `box` is actually computed and the frame hugs the photo
  // (without this the loader would stick forever — box never becomes truthy).
  useLayoutEffect(() => {
    if (isOpen && item) remeasure()
  }, [isOpen, item, remeasure])

  // Per-image error state (render-time reset, React's "adjust state from
  // previous render" pattern) — a failed image shows an error note instead of
  // an infinite skeleton; navigating resets it.
  const srcKey = item?.src
  const [prevSrcKey, setPrevSrcKey] = useState(srcKey)
  const [hasError, setHasError] = useState(false)
  if (prevSrcKey !== srcKey) {
    setPrevSrcKey(srcKey)
    setHasError(false)
  }

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
                 dimensions vs the available stage (viewport minus the modal's
                 bottom caption band and other padding; width capped at
                 `max-w-5xl`). The frame is sized EXACTLY to the rendered
                 image → no letterbox, no distortion, no oversized empty
                 frame, and the ring hugs the photo. Before dimensions are
                 known the frame is a fixed 4:3 placeholder (no ring yet) with
                 a skeleton + spinner — never a collapsed sliver. */}
          <div
            ref={stageRef}
            onClick={close}
            className="relative z-10 flex min-h-0 flex-1 w-full items-center justify-center px-3 pt-10 pb-24 sm:px-6 sm:pt-12 sm:pb-28"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={item.src}
                initial={blurVariant}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={blurVariant}
                transition={slide}
                onClick={(e) => e.stopPropagation()}
                className="flex w-full max-w-full items-center justify-center"
              >
                <div
                  style={
                    box
                      ? { width: `${box.w}px`, height: `${box.h}px` }
                      : { width: "min(100%, 48rem)", aspectRatio: "4 / 3" }
                  }
                  className={cn(
                    "relative max-w-full overflow-hidden rounded-xl shadow-2xl",
                    box && "ring-1 ring-white/10"
                  )}
                >
                  <MediaItem
                    webViewLink={item.src}
                    className="relative size-full overflow-hidden"
                    imageClassName="block size-full object-contain"
                    objectFit="contain"
                    layout="fullWidth"
                    unstyled
                    sizes="90vw"
                    loading={false}
                    onError={() => setHasError(true)}
                    onImageLoaded={(w, h) => setNatural({ w, h })}
                  />
                  {/* Deliberate loading surface: frame (and ring) stay put with
                      a skeleton + spinner until the photo is decoded and its
                      natural ratio is measured (`box` becomes non-null). Then
                      it UNMOUNTS immediately — it can never overlay the loaded
                      image. The slide itself fades in via its blur motion. */}
                  {!box && !hasError && (
                    <div
                      role="status"
                      aria-label="Memuat gambar"
                      className="absolute inset-0 z-10"
                    >
                      <span className="sr-only">Memuat gambar</span>
                      <Skeleton className="absolute inset-0 h-full w-full rounded-none bg-white/10" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Spinner className="h-11 w-11 rounded-xl text-amber-400" />
                      </div>
                    </div>
                  )}
                  {/* Image failed — honest error surface instead of a spinner
                      that never resolves. */}
                  {hasError && (
                    <div
                      role="alert"
                      className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/80 px-6 text-center"
                    >
                      <p className="text-sm text-zinc-300">
                        Gambar gagal dimuat.
                      </p>
                    </div>
                  )}
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
            className="absolute top-4 right-4 z-[80] flex size-12 touch-manipulation select-none items-center justify-center rounded-full border border-white/20 bg-black/40 p-0 text-white backdrop-blur-md transition-colors duration-300 pointer-events-auto hover:border-amber-400/70 hover:bg-black/60 hover:text-amber-400 focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:outline-none"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              className="pointer-events-none size-5"
            />
          </Button>

          {/* Prev / Next — edge-centered, glass pills.
              EVENT ARCHITECTURE:
              - `onPointerDown` (NOT onClick): a `click` event is only
                synthesized when pointerdown AND pointerup hit the same node.
                Pressing instantly on modal open, or while the image swap /
                skeleton `box` flip re-renders beneath, can break that pairing
                and swallow the click — requiring double-taps. `onPointerDown`
                fires the moment of contact, so the FIRST press always works
                and rapid-fire presses never get eaten.
              - `e.preventDefault()` keeps the press from triggering focus,
                drag, scroll or a synthesized click afterwards.
              - `e.stopPropagation()` + being SIBLINGS of the image stage
                (never inside its AnimatePresence/motion.div) means navigation
                can never bubble into the backdrop close, and the buttons stay
                in a static DOM while only the framed image transitions.
              - Hitbox: `size-12` (48px) pill, icon `pointer-events-none`, so
                the whole visual surface is one reliable press target. */}
          {items.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sebelumnya"
                onPointerDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  prev()
                }}
                className="absolute top-1/2 left-3 z-[80] flex size-12 -translate-y-1/2 touch-manipulation select-none items-center justify-center rounded-full border border-white/20 bg-black/40 p-0 text-white backdrop-blur-md transition-colors duration-300 pointer-events-auto hover:border-amber-400/70 hover:bg-black/60 hover:text-amber-400 focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:outline-none md:left-6"
              >
                <HugeiconsIcon
                  icon={ArrowLeft02Icon}
                  className="pointer-events-none size-5"
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Berikutnya"
                onPointerDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  next()
                }}
                className="absolute top-1/2 right-3 z-[80] flex size-12 -translate-y-1/2 touch-manipulation select-none items-center justify-center rounded-full border border-white/20 bg-black/40 p-0 text-white backdrop-blur-md transition-colors duration-300 pointer-events-auto hover:border-amber-400/70 hover:bg-black/60 hover:text-amber-400 focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:outline-none md:right-6"
              >
                <HugeiconsIcon
                  icon={ArrowRight02Icon}
                  className="pointer-events-none size-5"
                />
              </Button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default GlobalImageModal
