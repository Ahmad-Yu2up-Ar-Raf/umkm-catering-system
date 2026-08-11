import { useQuery } from "@tanstack/react-query"

import { GALLERY_ITEMS } from "@/components/ui/core/block/galeri/galeri-data"
import type { GalleryItem } from "@/components/ui/core/block/galeri/types/gallery-types"

/**
 * Gallery query seam (spec §4.4 / Phase 5).
 *
 * v1 serves the STATIC dataset through React Query so the block already has
 * the loading/error/refetch plumbing, and the swap is a one-function change:
 * when the backend `kategori_acara` contract lands, replace `queryFn` with a
 * Ky call (`api.get("galeri").json<...>()`) + normalize `GaleriResource` →
 * `GalleryItem` (camelCase service mapping) and drop `initialData`.
 * `staleTime: Infinity` + `initialData` → synchronous, no skeleton flash.
 */
export function useGaleriQuery() {
  return useQuery({
    queryKey: ["galeri"],
    queryFn: async (): Promise<GalleryItem[]> => GALLERY_ITEMS,
    initialData: GALLERY_ITEMS,
    staleTime: Infinity,
  })
}
