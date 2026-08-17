/**
 * Package sharing helpers — pure, dependency-free.
 *
 * Pattern: Web Share API first (mobile/native), Shadcn Dialog fallback on
 * desktop via the URL builders below. No share library is required.
 */

export interface SharePayload {
  title: string
  text?: string
  url: string
}

/** True when the runtime exposes the Web Share API at all. */
export const isWebShareSupported = () =>
  typeof navigator !== "undefined" && "share" in navigator

/**
 * Feature detection per MDN: `canShare()` tells us whether THIS payload
 * (title/text/url) is acceptable to the current OS share sheet. Files are
 * intentionally not used — we share a canonical package URL.
 */
export const canNativeShare = (payload: SharePayload): boolean => {
  if (!isWebShareSupported()) return false
  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean
  }
  if (typeof nav.canShare === "function") {
    try {
      return nav.canShare({
        title: payload.title,
        text: payload.text,
        url: payload.url,
      })
    } catch {
      // Some engines throw for exotic payloads — default to attempting share.
      return true
    }
  }
  return true
}

/**
 * Clipboard copy, best-effort:
 * 1. async Clipboard API (secure contexts),
 * 2. legacy `execCommand("copy")` fallback for older/insecure contexts.
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through to the legacy path
  }
  return legacyCopy(text)
}

function legacyCopy(text: string): boolean {
  try {
    const textarea = document.createElement("textarea")
    textarea.value = text
    textarea.setAttribute("readonly", "")
    textarea.style.position = "fixed"
    textarea.style.opacity = "0"
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand("copy")
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}

/** Desktop fallback share-target deep links (open in a new tab). */
export const shareUrlFor = {
  whatsapp: ({ title, url }: SharePayload) =>
    `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
  telegram: ({ title, url }: SharePayload) =>
    `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  twitter: ({ title, url }: SharePayload) =>
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title
    )}&url=${encodeURIComponent(url)}`,
  facebook: ({ url }: SharePayload) =>
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
}
