"use client"

import { useEffect } from "react"

import { useLenis } from "lenis/react"
import { useLocation } from "react-router"

import { ScrollTrigger } from "@/components/motion/gsap"

/**
 * Global scroll restoration for the Lenis-powered SPA.
 *
 * On a full page/route change the DOM swaps without a browser refresh, so the
 * native scrollbar — and more importantly Lenis's internal scroll offset —
 * keeps the OLD page's position, leaving the next route stuck at the bottom.
 *
 * This component listens to the route `pathname` and, on change, forces Lenis
 * to INSTANTLY reset to 0 (`immediate: true`) so its internal state stays in
 * sync with the native scroll. Only the `pathname` is watched — in-page
 * `#hash` navigation (nav anchors) intentionally does NOT trigger a reset;
 * those are handled by the header's own smooth-scroll interceptor.
 *
 * Placement: once inside `<ReactLenis>` AND inside the router (the root
 * `LayoutWrapper`, which renders the `<Outlet />` for every route) — the only
 * spot that satisfies both `useLenis()` and `useLocation()` globally.
 */
export function ScrollToTop() {
  const { pathname } = useLocation()
  const lenis = useLenis()

  useEffect(() => {
    // Re-measure every ScrollTrigger once the new route's layout settles, so
    // nothing is pinned/measured against stale coordinates.
    requestAnimationFrame(() => ScrollTrigger.refresh())

    // If a `#hash` alignment is pending (e.g. cross-route `/#faq`), the
    // homepage's mount effect owns the viewport — DO NOT yank to the top and
    // fight it. Only reset to 0 when there's no hash to land on.
    if (window.location.hash) return

    if (lenis) {
      // Force Lenis to the very top, skipping any smooth animation — its
      // internal scroll and the native scroll both land at 0 together.
      lenis.scrollTo(0, { immediate: true, force: true })
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, lenis])

  return null
}
