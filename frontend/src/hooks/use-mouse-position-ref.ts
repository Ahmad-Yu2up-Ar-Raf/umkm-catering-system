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

    const updatePosition = (x: number, y: number) => {
      const currentNode = containerRef?.current
      if (currentNode) {
        const r = currentNode.getBoundingClientRect()
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

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchmove", handleTouchMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchmove", handleTouchMove)
    }
  }, [containerRef])

  return positionRef
}