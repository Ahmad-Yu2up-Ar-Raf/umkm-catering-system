import { useSyncExternalStore } from "react"

const QUERY = "(prefers-reduced-motion: reduce)"

const subscribe = (callback: () => void) => {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener("change", callback)
  return () => mq.removeEventListener("change", callback)
}

const getSnapshot = () => window.matchMedia(QUERY).matches
const getServerSnapshot = () => false

/**
 * OS `prefers-reduced-motion` gate.
 * Initializes synchronously (no first-paint flash) and tracks live changes.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
