"use client"

import { useEffect } from "react"

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
 * GlobalImageModal — the single, global fullscreen image lightbox
 * (architectural blueprint §4.3). Tiska-inspired editorial spec:
 *
 * - Ink-dark backdrop (`bg-zinc-950/92` + `backdrop-blur-sm`).
 * - Clean rounded image (`rounded-xl`), NO heavy drop shadows.
 * - Caption BELOW the figure, strictly TWO lines, centered: gold accent
 *   category eyebrow + event title. No description, no position counter —
 *   the image owns the space.
 * - Next/Prev swap with a coordinated FADE + BLUR on both the image AND the
 *   caption (`AnimatePresence mode="wait"`, 0.3s calm tween — no jelly).
 * - Controls are strictly Shadcn `Button` (glass, rounded-full).
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
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau gambar"
          className="fixed inset-0 z-[9999] flex cursor-zoom-out flex-col items-center justify-center bg-zinc-950/92 px-4 backdrop-blur-sm"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 8 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 8 }}
            transition={slide}
            className="flex w-full max-w-[min(90dvw,1100px)] flex-col items-center gap-5"
          >
            {/* Image — rounded, keyed slide swap, capped height. */}
            <div className="relative aspect-[16/9] max-h-[66svh] w-full overflow-hidden rounded-xl">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={item.src}
                  initial={blurVariant}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={blurVariant}
                  transition={slide}
                  className="absolute inset-0"
                >
                  <MediaItem
                    webViewLink={item.src}
                    className="h-full w-full"
                    imageClassName="object-contain"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Caption — strictly TWO centered lines below the figure. */}
            <div className="flex flex-col items-center gap-1 text-center">
              {item.category && (
                <motion.p
                  key={`cat-${item.src}`}
                  initial={blurVariant}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={blurVariant}
                  transition={slide}
                  className="text-[10.5px] uppercase tracking-[0.28em] text-amber-400"
                >
                  {item.category}
                </motion.p>
              )}
              {item.title && (
                <motion.p
                  key={`title-${item.src}`}
                  initial={blurVariant}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={blurVariant}
                  transition={slide}
                  className="text-[14px] text-zinc-300"
                >
                  {item.title}
                </motion.p>
              )}
            </div>
          </motion.div>

          {/* Close — top-right of the viewport. */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Tutup"
            onClick={close}
            className="absolute top-4 right-4 z-10 size-11 rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md hover:border-amber-400/70 hover:bg-black/60"
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
                className="absolute top-1/2 left-3 z-10 size-11 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md hover:border-amber-400/70 hover:bg-black/60 md:left-6"
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
                className="absolute top-1/2 right-3 z-10 size-11 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md hover:border-amber-400/70 hover:bg-black/60 md:right-6"
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
