import { useEffect, useState } from "react"

const LAPTOP_BREAKPOINT = 1024

/**
 * Returns true when viewport is >= 1024px (Tailwind `lg`).
 * Client-only, hydration-safe: lazy initializer reads window if available,
 * listener is cleaned up on unmount.
 */
export function useIsLaptop() {
  const [isLaptop, setIsLaptop] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia(`(min-width: ${LAPTOP_BREAKPOINT}px)`).matches
  })

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${LAPTOP_BREAKPOINT}px)`)
    const onChange = () => setIsLaptop(mql.matches)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isLaptop
}
