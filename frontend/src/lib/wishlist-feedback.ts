"use client"

import { playDelete, playSuccess } from "@/lib/audio-feedback"
import { unlockUISFX } from "@/lib/uisfx"
import { useSavedPaketStore } from "@/store/saved-paket-store"

/**
 * Wishlist toggle with sound confirmation — persisted state + exactly one
 * sound cue per interaction (per `docs/uisfx-guide.md`: cue names describe
 * the outcome, never stacked; sound reinforces the visible fill +
 * `aria-pressed`, never replaces them). No toast by design (removed per
 * testing feedback — the heart fill is the visual confirmation).
 *
 * `unlockUISFX` runs inside this trusted click handler (once per session, per
 * `lib/uisfx.ts`) — the first toggle may stay silent until unlock resolves,
 * every later one is audible. All audio paths are no-op safe.
 */
export function toggleSavedWithFeedback(id: number) {
  const wasSaved = useSavedPaketStore.getState().savedIds.includes(id)
  void unlockUISFX()
  useSavedPaketStore.getState().toggleSave(id)
  if (wasSaved) {
    playDelete()
  } else {
    playSuccess()
  }
}
