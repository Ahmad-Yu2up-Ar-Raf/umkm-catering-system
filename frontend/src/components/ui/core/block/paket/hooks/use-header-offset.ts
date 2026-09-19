import { useEffect, useState } from "react"

/**
 * Height of the global SiteHeader, measured at mount (the catalog page mounts
 * at scroll 0) and on resize. The sticky filter bar pins itself directly
 * below the chrome via `style={{ top }}` instead of hard-coding 56px like the
 * Dapur Solo reference — our header height varies by breakpoint.
 */
export function useHeaderOffset() {
  const [top, setTop] = useState(0)

  useEffect(() => {
    // Mobile-report item: resize reads are rAF-throttled — rapid resize snaps
    // collapse into one measure per frame instead of one forced reflow each.
    // Reads stay batched (single getBoundingClientRect, no interleaved write).
    let raf = 0
    const measure = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const header = document.querySelector("header")
        setTop(header?.getBoundingClientRect().height ?? 0)
      })
    }
    measure()
    window.addEventListener("resize", measure, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", measure)
    }
  }, [])

  return top
}
