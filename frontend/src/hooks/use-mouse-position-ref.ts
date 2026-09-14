import { useEffect, useRef } from "react"
import type { RefObject } from "react"

/**
 * Tracks the pointer position relative to the target container, normalized
 * to the range [-1, 1] from the container's CENTER.
 *
 * Why center-normalized: the dominant use-case is mouse-parallax where the
 * "rest" position must be the center (zero offset at load). Raw pixels from
 * the top-left corner produced an unpredictable, cursor-position-dependent
 * offset and a visible jump on first mousemove.
 *
 * Starts at (0, 0) — the center — so surfaces are neutral until the first real
 * mouse/touch move.
 */
export const useMousePositionRef = (
  containerRef?: RefObject<HTMLElement | SVGElement>
) => {
  const positionRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    // Neutral rest state = center = no parallax offset.
    positionRef.current = { x: 0, y: 0 }

    // Cached container rect: getBoundingClientRect() forces a synchronous
    // layout read, so it must NEVER run inside a pointer-event handler.
    // The rect is refreshed at most once per frame plus on scroll/resize —
    // handlers below only ever read the cache (no layout thrash at 100+ Hz).
    let cachedRect: DOMRect | null = null
    let rafId = 0
    const readRect = () => {
      rafId = 0
      const node = containerRef?.current
      cachedRect = node ? node.getBoundingClientRect() : null
    }
    const scheduleRectRead = () => {
      if (rafId) return
      rafId = requestAnimationFrame(readRect)
    }

    const updatePosition = (x: number, y: number) => {
      const r = cachedRect
      if (r && r.width > 0 && r.height > 0) {
        positionRef.current = {
          x: (x - r.left - r.width / 2) / (r.width / 2),
          y: (y - r.top - r.height / 2) / (r.height / 2),
        }
      } else {
        positionRef.current = { x: 0, y: 0 }
      }
    }

    const handleMouseMove = (ev: MouseEvent) => updatePosition(ev.clientX, ev.clientY)
    const handleTouchMove = (ev: TouchEvent) => {
      const touch = ev.touches[0]
      if (touch) updatePosition(touch.clientX, touch.clientY)
    }

    readRect()
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchmove", handleTouchMove)
    window.addEventListener("scroll", scheduleRectRead, { passive: true })
    window.addEventListener("resize", scheduleRectRead)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("scroll", scheduleRectRead)
      window.removeEventListener("resize", scheduleRectRead)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [containerRef])

  return positionRef
}