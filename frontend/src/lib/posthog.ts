import posthog from "posthog-js"

let initialized = false

/**
 * Env-gated PostHog init (US Cloud). No-op when VITE_POSTHOG_KEY is absent,
 * so local/dev builds without analytics env never phone home and never throw.
 * Call it from a deferred dynamic import — never on the critical path.
 */
export function initPosthog() {
  if (initialized || typeof window === "undefined") return
  const key = import.meta.env.VITE_POSTHOG_KEY
  if (!key) return
  initialized = true
  posthog.init(key, {
    api_host: import.meta.env.VITE_POSTHOG_HOST ?? "https://us.i.posthog.com",
    autocapture: true,
    // SPA drives pageviews manually (capturePageview) to avoid double-count.
    capture_pageview: false,
    capture_pageleave: true,
    persistence: "localStorage",
  })
}

/**
 * Manual SPA pageview. Self-initializing: safe to call before initPosthog()
 * (first navigation wins even if the idle-callback init hasn't run yet).
 */
export function capturePageview(path: string) {
  initPosthog()
  if (!initialized) return
  posthog.capture("$pageview", { $current_url: window.location.href, path })
}
