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
    // If a `#hash` alignment is pending (e.g. cross-route `/#faq`), the
    // homepage's mount effect owns the viewport — DO NOT yank to the top and
    // fight it. Only reset to 0 when there's no hash to land on.
    if (window.location.hash) return

    const resetToTop = () => {
      // Authoritative NATIVE reset first — Lenis reads `window.scrollY` back
      // on its next tick, so even a stopped/locked Lenis can't keep the old
      // page's depth visible.
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      // Sync Lenis's internal state so its RAF loop agrees (writes 0, not a
      // stale position).
      lenis?.scrollTo(0, { immediate: true, force: true })
    }

    // Instant reset — the new route opens at the top, never below the fold.
    resetToTop()

    // Once the new route's layout settles, re-measure every ScrollTrigger and
    // re-assert the top in case a late mount (pin spacer, heavy images)
    // adjusted scroll after the first reset.
    requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      if (window.scrollY !== 0) resetToTop()
    })
  }, [pathname, lenis])

  return null
}
