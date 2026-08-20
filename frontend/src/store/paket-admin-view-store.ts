import { create } from "zustand"
import { persist } from "zustand/middleware"

export type PaketAdminViewMode = "table" | "grid"

interface PaketAdminViewState {
  viewMode: PaketAdminViewMode
  setViewMode: (mode: PaketAdminViewMode) => void
}

/**
 * Admin paket list view preference (Table ⇄ Grid). Persisted to localStorage
 * under `paket-admin-view-mode` so the choice survives navigation and refresh
 * — mirrors the public catalog's `paket-layout-store` pattern.
 */
export const usePaketViewStore = create<PaketAdminViewState>()(
  persist(
    (set) => ({
      viewMode: "table",
      setViewMode: (viewMode) => set({ viewMode }),
    }),
    {
      name: "paket-admin-view-mode",
      partialize: (state) => ({ viewMode: state.viewMode }),
    }
  )
)
