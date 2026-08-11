import { create } from "zustand"

/**
 * Catalog chrome gate — the /paket page flips `ended` true when its infinite
 * catalog reaches the absolute end so the global layout may render the CTA
 * band + footer. Defaults to `false` so chrome stays hidden while the catalog
 * is still loading/scrolling. Off-page the flag is ignored (layout only gates
 * on the /paket route).
 */
type CatalogState = {
  ended: boolean
  setEnded: (ended: boolean) => void
}

export const useCatalogStore = create<CatalogState>((set) => ({
  ended: false,
  setEnded: (ended) => set({ ended }),
}))
