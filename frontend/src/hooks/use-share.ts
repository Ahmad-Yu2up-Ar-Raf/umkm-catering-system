"use client"

import { useCallback, useState } from "react"

import { canNativeShare, type SharePayload } from "@/lib/share"

type ShareResult = "shared" | "cancelled" | "fallback"

/**
 * One entry point for sharing a payload:
 *
 * - Native path: when `navigator.canShare` accepts the payload, call the OS
 *   share sheet. A user dismissal (AbortError) is swallowed; any other
 *   failure falls through to the dialog.
 * - Fallback path: when the Web Share API is unavailable (most desktop
 *   browsers), hands the payload to `ShareDialog` via state.
 */
export function useShare() {
  const [isOpen, setIsOpen] = useState(false)
  const [payload, setPayload] = useState<SharePayload | null>(null)

  const share = useCallback(async (data: SharePayload): Promise<ShareResult> => {
    if (canNativeShare(data)) {
      try {
        await navigator.share({
          title: data.title,
          text: data.text,
          url: data.url,
        })
        return "shared"
      } catch (error) {
        // User dismissed the sheet — not a failure worth reporting.
        if (error instanceof DOMException && error.name === "AbortError") {
          return "cancelled"
        }
        // Any other rejection → fall through to the fallback dialog.
      }
    }
    setPayload(data)
    setIsOpen(true)
    return "fallback"
  }, [])

  const close = useCallback(() => setIsOpen(false), [])

  return { isOpen, payload, share, close }
}

export type { SharePayload, ShareResult }
