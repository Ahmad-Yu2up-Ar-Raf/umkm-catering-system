import { create } from "zustand"
import { persist } from "zustand/middleware"

/** Catalog view modes — single source of truth for the type (toggle / grid /
 *  card all import from here instead of redeclaring it). */
export type PaketLayoutMode = "horizontal" | "grid-3"

interface PaketLayoutState {
  layoutMode: PaketLayoutMode
  setLayoutMode: (mode: PaketLayoutMode) => void
  toggleLayoutMode: () => void
}

/**
 * Catalog layout preference for the /paket page (1-kolom vs 3-kolom).
 *
 * `persist` saves `layoutMode` to localStorage under `paket-layout-mode`, so
 * the user's choice survives route changes AND full page refreshes — the
 * behavior that local component state could never provide.
 *
 * Hydration: this is a client-only Vite SPA (no SSR), and zustand rehydrates
 * synchronously at store creation for sync storages like localStorage — every
 * component therefore reads the persisted value from its very first render:
 * no default-mode flash, and no React hydration-mismatch warnings are
 * possible. If `localStorage` is unavailable (privacy mode), `persist` falls
 * back to the in-memory default `"horizontal"` instead of throwing.
 */
export const usePaketLayoutStore = create<PaketLayoutState>()(
  persist(
    (set, get) => ({
      layoutMode: "grid-3",
      setLayoutMode: (layoutMode) => set({ layoutMode }),
      toggleLayoutMode: () =>
        set({
          layoutMode:
            get().layoutMode === "horizontal" ? "grid-3" : "horizontal",
        }),
    }),
    {
      name: "paket-layout-mode",
      // Persist only the preference — actions are recreated fresh per session.
      partialize: (state) => ({ layoutMode: state.layoutMode }),
    }
  )
)
