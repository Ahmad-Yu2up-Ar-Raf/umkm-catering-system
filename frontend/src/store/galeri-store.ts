import { create } from "zustand"

/**
 * Gallery chrome gate — the /galeri block flips `ready` true once its query
 * settles so the global layout may render the CTA band + footer (mirrors
 * `useCatalogStore` on /paket). Defaults to false so chrome stays hidden
 * while the gallery skeleton is up. Off-page the flag is ignored.
 */
type GaleriState = {
  ready: boolean
  setReady: (ready: boolean) => void
}

export const useGaleriStore = create<GaleriState>((set) => ({
  ready: false,
  setReady: (ready) => set({ ready }),
}))
