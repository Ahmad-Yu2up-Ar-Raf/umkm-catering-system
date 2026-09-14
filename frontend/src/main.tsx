import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/provider/theme-provider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
)

// Deferred analytics pre-warm — dynamic import keeps posthog-js out of the
// initial bundle; initPosthog() itself no-ops without VITE_POSTHOG_KEY.
// First-navigation pageviews don't depend on this (capturePageview self-inits).
if (typeof window !== "undefined") {
  const idle =
    typeof window.requestIdleCallback === "function"
      ? window.requestIdleCallback.bind(window)
      : (cb: () => void) => window.setTimeout(cb, 1)
  idle(() => {
    void import("@/lib/posthog").then((m) => m.initPosthog())
  })
}
