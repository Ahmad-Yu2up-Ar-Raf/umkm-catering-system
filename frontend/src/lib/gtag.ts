declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

let injected = false

/**
 * Deferred GA4 SPA pageview. No-op until VITE_GA_ID exists (property pending),
 * then injects gtag.js once (async, post-hydration) and sends page_path hits
 * per route. Consent defaults to denied; full CMP is post-launch scope.
 */
export function pageviewGA(path: string) {
  const id = import.meta.env.VITE_GA_ID
  if (!id || typeof document === "undefined") return
  if (!injected) {
    injected = true
    window.dataLayer = window.dataLayer ?? []
    window.gtag = (...args: unknown[]) => {
      window.dataLayer?.push(args)
    }
    const s = document.createElement("script")
    s.async = true
    s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
    document.head.appendChild(s)
    window.gtag("js", new Date())
    window.gtag("consent", "default", { analytics_storage: "denied" })
  }
  window.gtag?.("config", id, { page_path: path })
}
