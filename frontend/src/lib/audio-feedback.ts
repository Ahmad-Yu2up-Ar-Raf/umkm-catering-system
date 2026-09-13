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

/**
 * Pitch-varied rating tone (WebAudio oscillator, no assets).
 * 1★ low/warm → 5★ bright/chime (C-major pentatonic climb).
 * Gesture-triggered only (autoplay-safe), SSR-safe, never throws.
 */
const RATING_FREQS = [329.63, 392.0, 440.0, 523.25, 659.25]

let _audioCtx: AudioContext | null = null

export function playRatingTone(rating: number) {
  try {
    if (typeof window === "undefined") return
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!Ctx) return
    _audioCtx ??= new Ctx()
    if (_audioCtx.state === "suspended") void _audioCtx.resume()

    const freq = RATING_FREQS[Math.min(5, Math.max(1, Math.round(rating))) - 1]
    const now = _audioCtx.currentTime
    const osc = _audioCtx.createOscillator()
    const gain = _audioCtx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(freq, now)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)
    osc.connect(gain)
    gain.connect(_audioCtx.destination)
    osc.start(now)
    osc.stop(now + 0.4)
  } catch {
    // never throw — audio is enhancement only
  }
}
