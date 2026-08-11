import { useCallback } from "react"
import { useSearchParams } from "react-router"

import type { GalleryCategoryId } from "../types/gallery-types"

/**
 * The gallery's filter state IS the URL — `?kategori=…`.
 * Deep-linkable, back/forward aware, every write goes through
 * `setSearchParams` (functional updater + `preventScrollReset`) so React
 * Router owns navigation and scroll behaviour. Mirrors the /paket catalog
 * hook exactly (spec §3.3).
 */
export function useGalleryParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const kategori = (searchParams.get("kategori") ?? "") as GalleryCategoryId

  const setKategori = useCallback(
    (value: GalleryCategoryId) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (value) next.set("kategori", value)
          else next.delete("kategori")
          return next
        },
        { preventScrollReset: true }
      )
    },
    [setSearchParams]
  )

  return { kategori, setKategori }
}
