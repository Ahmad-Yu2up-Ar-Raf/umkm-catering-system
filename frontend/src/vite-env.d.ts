/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_API_URL: string
  readonly VITE_BUSINESS_NUMBER: string
  /** PostHog US Cloud. Optional — analytics no-ops when absent. */
  readonly VITE_POSTHOG_KEY?: string
  readonly VITE_POSTHOG_HOST?: string
  /** GA4 measurement ID. Optional — gtag never injects when absent. */
  readonly VITE_GA_ID?: string
  /** Canonical site origin (og:url, sitemap). Falls back to prod domain. */
  readonly VITE_SITE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
