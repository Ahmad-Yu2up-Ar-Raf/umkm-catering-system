import { create } from "zustand"

/**
 * Global preloader chrome gate.
 *
 * One boolean drives the whole page chrome (SiteHeader + SiteFooter) so the
 * preloader is the ONLY thing rendered while it plays — the footer can never
 * flash or render before the Hero, because the layout wrapper simply does not
 * mount it until `done` is true.
 *
 * Lifecycle:
 *  - `done` defaults to `true` (pages without a preloader just render).
 *  - The home page calls `setDone(false)` when a preloader begins.
 *  - The home page calls `setDone(true)` (via `onComplete`) when the curtain's
 *    exit reaches 100% — at which point the hero + chrome mount together.
 */
type PreloaderState = {
  done: boolean
  setDone: (done: boolean) => void
}

export const usePreloaderStore = create<PreloaderState>((set) => ({
  done: true,
  setDone: (done) => set({ done }),
}))