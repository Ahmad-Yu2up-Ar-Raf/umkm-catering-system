import { useEffect } from "react"

/** Placeholder domain — swap at go-live (docs/seo/README.md). */
const BASE_URL = "https://cateringnusantara.id"

interface SeoOptions {
  /** Full <title> for the route, e.g. "Nasi Box Bogor | Catering Nusantara". */
  title: string
  description?: string
  /** Route path, e.g. "/menu/nasi-box". Defaults to "/". */
  path?: string
}

/**
 * Lightweight, 0-dependency per-route SEO updater for the Vite SPA.
 * Swaps <title>, meta description, Open Graph/Twitter titles and the
 * canonical/og:url when a route mounts. Static baseline lives in index.html.
 */
export function useSeo({ title, description, path = "/" }: SeoOptions) {
  useEffect(() => {
    document.title = title
    const url = `${BASE_URL}${path}`

    if (description) {
      ensureMeta('meta[name="description"]', "name", "description", description)
      ensureMeta('meta[property="og:description"]', "property", "og:description", description)
      ensureMeta('meta[name="twitter:description"]', "name", "twitter:description", description)
    }
    ensureMeta('meta[property="og:title"]', "property", "og:title", title)
    ensureMeta('meta[name="twitter:title"]', "name", "twitter:title", title)
    ensureCanonical(url)
    ensureMeta('meta[property="og:url"]', "property", "og:url", url)
  }, [title, description, path])
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
