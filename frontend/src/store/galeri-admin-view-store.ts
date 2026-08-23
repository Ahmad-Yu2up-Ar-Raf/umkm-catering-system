import { create } from "zustand"
import { persist } from "zustand/middleware"

export type GaleriAdminViewMode = "table" | "grid"

interface GaleriAdminViewState {
  viewMode: GaleriAdminViewMode
  setViewMode: (mode: GaleriAdminViewMode) => void
}

/**
 * Admin galeri list view preference (Table ⇄ Grid). Persisted to localStorage
 * under `galeri-admin-view-mode` so the choice survives navigation and refresh
 * — mirrors the public catalog's `paket-layout-store` pattern.
 */
export const useGaleriViewStore = create<GaleriAdminViewState>()(
  persist(
    (set) => ({
      viewMode: "table",
      setViewMode: (viewMode) => set({ viewMode }),
    }),
    {
      name: "galeri-admin-view-mode",
      partialize: (state) => ({ viewMode: state.viewMode }),
    }
  )
)