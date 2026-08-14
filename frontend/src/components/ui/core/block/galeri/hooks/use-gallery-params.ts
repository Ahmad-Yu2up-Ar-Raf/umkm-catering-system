import { useCallback } from "react"
import { useSearchParams } from "react-router"

import type { GalleryCategoryId } from "../types/gallery-types"

/**
 * The gallery's filter state IS the URL — `?kategori_acara=…` (raw
 * `GaleriKategoriEnum` value, "" = Semua). Deep-linkable, back/forward
 * aware, every write goes through `setSearchParams` (functional updater +
 * `preventScrollReset`). Mirrors the /paket catalog hook.
 */
export function useGalleryParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const kategori = (searchParams.get("kategori_acara") ?? "") as GalleryCategoryId

  const setKategori = useCallback(
    (value: GalleryCategoryId) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (value) next.set("kategori_acara", value)
          else next.delete("kategori_acara")
          return next
        },
        { preventScrollReset: true }
      )
    },
    [setSearchParams]
  )

  return { kategori, setKategori }
}
