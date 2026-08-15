import { create } from "zustand"

/**
 * Detail chrome gate — the /paket/:id block flips `ready` true once its
 * query settles so the global layout may render the CTA band + footer
 * (mirrors `useCatalogStore` on /paket and `useGaleriStore` on /galeri).
 * Defaults to false so chrome stays hidden while the detail skeleton is up.
 *
 * Reset semantics (contract §16.3): the block resets `ready` to false on
 * every id change (route-aware), so a stale `ready` from a previous paket
 * NEVER flashes CTA/Footer under the next paket's loading state. Off-page the
 * flag is ignored — the layout only consults it on /paket/:id paths.
 */
type DetailState = {
  ready: boolean
  setReady: (ready: boolean) => void
}

export const useDetailStore = create<DetailState>((set) => ({
  ready: false,
  setReady: (ready) => set({ ready }),
}))
