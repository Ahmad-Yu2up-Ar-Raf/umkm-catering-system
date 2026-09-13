import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SavedPaketState {
  /** Saved package IDs — lightweight UI state only, never server data. */
  savedIds: number[]
  toggleSave: (id: number) => void
  clearSaved: () => void
}

/**
 * Saved-packages wishlist for the public catalog.
 *
 * `persist` saves `savedIds` to localStorage under `saved-paket-ids`, so the
 * user's wishlist survives route changes AND full page refreshes.
 *
 * Hydration: same shape as `usePaketLayoutStore` — client-only Vite SPA (no
 * SSR), and zustand rehydrates synchronously for sync storages, so components
 * read the persisted value on first render. Full `Paket` objects stay in the
 * React Query cache; only IDs live here (see `frontend/docs/architecture.md`
 * §3 — server data NEVER in Zustand).
 */
export const useSavedPaketStore = create<SavedPaketState>()(
  persist(
    (set) => ({
      savedIds: [],
      toggleSave: (id) =>
        set((state) => ({
          savedIds: state.savedIds.includes(id)
            ? state.savedIds.filter((saved) => saved !== id)
            : [...state.savedIds, id],
        })),
      clearSaved: () => set({ savedIds: [] }),
    }),
    {
      name: "saved-paket-ids",
      // Persist only the IDs — actions are recreated fresh per session.
      partialize: (state) => ({ savedIds: state.savedIds }),
    }
  )
)
