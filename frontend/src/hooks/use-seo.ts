import { useEffect } from "react"

/** Canonical origin — override per-env via VITE_SITE_URL (see .env.example). */
const BASE_URL =
  import.meta.env.VITE_SITE_URL ?? "https://cateringnusantara.vercel.app"

const SITE_NAME = "Catering Nusantara"

/** Global title separator — vertical pipe, per SEO convention. */
const TITLE_SEPARATOR = " | "

export interface SeoOptions {
  /** Page-specific title — the hook appends `| Catering Nusantara`. */
  title: string
  description?: string
  /** Route path, e.g. "/paket/12". Defaults to "/". */
  path?: string
  /** Share image (absolute URL or site-relative) — og:image + twitter:image. */
  image?: string
  /** Auth/admin surfaces: emits `noindex, nofollow` instead of `index, follow`. */
  noindex?: boolean
}

/**
 * Core head writer — shared by `useSeo` (per-page) and `RouteSeoResolver`
 * (per-route defaults). Always updates <title>, OG/Twitter titles, canonical
 * and og:url; description is overwritten when provided; image only when given.
 */
export function applySeo({
  title,
  description,
  path = "/",
  image,
  noindex = false,
}: SeoOptions) {
  const fullTitle = `${title}${TITLE_SEPARATOR}${SITE_NAME}`
  const url = `${BASE_URL}${path}`

  document.title = fullTitle
  ensureMeta(
    'meta[name="robots"]',
    "name",
    "robots",
    noindex ? "noindex, nofollow" : "index, follow"
  )

  if (description) {
    ensureMeta('meta[name="description"]', "name", "description", description)
    ensureMeta(
      'meta[property="og:description"]',
      "property",
      "og:description",
      description
    )
    ensureMeta(
      'meta[name="twitter:description"]',
      "name",
      "twitter:description",
      description
    )
  }

  ensureMeta('meta[property="og:title"]', "property", "og:title", fullTitle)
  ensureMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle)
  ensureCanonical(url)
  ensureMeta('meta[property="og:url"]', "property", "og:url", url)

  if (image) {
    const src = image.startsWith("http") ? image : `${BASE_URL}${image}`
    ensureMeta('meta[property="og:image"]', "property", "og:image", src)
    ensureMeta('meta[name="twitter:image"]', "name", "twitter:image", src)
  }
}

/**
 * Per-page SEO updater for the Vite SPA. Mounted pages call it on mount/route
 * change; `RouteSeoResolver` (rendered earlier in the tree) clears stale tags
 * from the previous route first, so the head always reflects the CURRENT page.
 */
export function useSeo(options: SeoOptions) {
  const { title, description, path, image, noindex } = options

  useEffect(() => {
    applySeo({ title, description, path, image, noindex })
  }, [title, description, path, image, noindex])
}

function ensureMeta(
  selector: string,
  identityAttr: string,
  identityValue: string,
  content: string
) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement("meta")
    el.setAttribute(identityAttr, identityValue)
    document.head.appendChild(el)
  }
  el.setAttribute("content", content)
}

function ensureCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement("link")
    el.setAttribute("rel", "canonical")
    document.head.appendChild(el)
  }
  el.setAttribute("href", href)
}
