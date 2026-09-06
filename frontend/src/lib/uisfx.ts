"use client"

// @ts-expect-error — uisfx types resolve after pnpm install completes
import { createUISFX, type UISFXPlayer } from "uisfx"

// ponytail: singleton + preference persistence per docs/uisfx-guide.md §prefs
const PREF_KEY = "catering:sound"

let _ui: UISFXPlayer | null = null
let _unlockPromise: Promise<void> | null = null

export function getUISFX(): UISFXPlayer {
  if (typeof window === "undefined") {
    // SSR guard — return a no-op stub that satisfies isEnabled/play
    return {
      play: () => null,
      isEnabled: () => false,
      setEnabled: () => {},
      setVolume: () => {},
      getVolume: () => 0,
      stopAll: () => {},
      destroy: async () => {},
      unlock: async () => {},
    } as unknown as UISFXPlayer
  }
  if (_ui) return _ui
  _ui = createUISFX({
    pack: "minimal",
    volume: 0.7,
    preferences: { key: PREF_KEY },
  })
  return _ui
}

/** Call from a trusted click/keydown handler, once per session. */
export async function unlockUISFX(): Promise<void> {
  if (typeof window === "undefined") return
  if (_unlockPromise) return _unlockPromise
  _unlockPromise = getUISFX()
    .unlock()
    .catch(() => {}) as Promise<void>
  return _unlockPromise
}

export async function destroyUISFX(): Promise<void> {
  if (_ui) {
    try {
      await _ui.destroy()
    } catch {
      // ignore
    }
    _ui = null
    _unlockPromise = null
  }
}
