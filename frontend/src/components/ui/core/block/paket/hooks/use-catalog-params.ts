import { useCallback } from "react"
import { useSearchParams } from "react-router"

import type { KategoriFilter } from "../data/categories"

/**
 * The catalog's filter state IS the URL — `?kategori=…&search=…&saved=1`.
 * Deep-linkable, back/forward aware, and every write goes through
 * `setSearchParams` so React Router owns navigation and scroll behaviour.
 *
 * `kategori` and `saved` form ONE mutually exclusive single-select group in
 * the UI (see `CategoryNav`): selecting a category removes `saved`, selecting
 * "Tersimpan" removes `kategori`, and "Semua" removes both. They stay separate
 * URL params (server enum vs local-only wishlist IDs), but the setters below
 * enforce that both are never set at the same time. `search` stays orthogonal
 * to both.
 *
 * `page` is intentionally NOT in the URL: the infinite-query cursor derives
 * from the server's `meta.pagination` (see `use-paket-query.ts`), and scroll
 * depth on back/forward is restored from the per-filter React Query cache.
 */
export function useCatalogParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const kategori = (searchParams.get("kategori") ?? "") as KategoriFilter
  const search = searchParams.get("search") ?? ""
  const savedOnly = searchParams.get("saved") === "1"

  const commit = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          mutate(next)
          return next
        },
        { preventScrollReset: true }
      )
    },
    [setSearchParams]
  )

  const setKategori = useCallback(
    (value: KategoriFilter) => {
      commit((params) => {
        if (value) params.set("kategori", value)
        else params.delete("kategori")
        // Single-select group: a category (or "Semua") always exits the
        // saved view.
        params.delete("saved")
      })
    },
    [commit]
  )

  const setSearch = useCallback(
    (term: string) => {
      commit((params) => {
        const value = term.trim()
        if (value) params.set("search", value)
        else params.delete("search")
      })
    },
    [commit]
  )

  const setSavedOnly = useCallback(
    (value: boolean) => {
      commit((params) => {
        if (value) {
          params.set("saved", "1")
          // Single-select group: entering the saved view clears any category.
          // Exiting just drops `saved` (kategori is always "" while saved).
          params.delete("kategori")
        } else params.delete("saved")
      })
    },
    [commit]
  )

  return { kategori, search, savedOnly, setKategori, setSearch, setSavedOnly }
}
