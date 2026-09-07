"use client"

import { getUISFX } from "@/lib/uisfx"

/**
 * Centralized audio feedback — maps semantic actions to uisfx cues.
 * All play calls are non-blocking, safe for autoplay policies, and no-ops until unlock.
 * Uses `minimal` pack (dry, precise) per docs/uisfx-guide.md.
 */

function safePlay(cue: Parameters<ReturnType<typeof getUISFX>["play"]>[0]) {
  try {
    const ui = getUISFX()
    if (!ui.isEnabled()) return
    // ui.play returns null if not unlocked or throttled — safe to ignore
    void ui.play(cue)
  } catch {
    // never throw — audio is enhancement only
  }
}

export function playSuccess() {
  safePlay("success")
}

export function playDelete() {
  safePlay("delete")
}

export function playError() {
  safePlay("error")
}

export function playDownload() {
  // uisfx has no "download" cue — use "complete" for multi-step process end
  safePlay("complete")
}

export function playNotification() {
  safePlay("notification")
}
