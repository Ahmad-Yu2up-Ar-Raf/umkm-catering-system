import { useCallback } from "react"
import { useSearchParams } from "react-router"

import type { KategoriFilter } from "../data/categories"

/**
 * The catalog's filter state IS the URL — `?kategori=…&search=…`.
 * Deep-linkable, back/forward aware, and every write goes through
 * `setSearchParams` so React Router owns navigation and scroll behaviour.
 *
 * `page` is intentionally NOT in the URL: the infinite-query cursor derives
 * from the server's `meta.pagination` (see `use-paket-query.ts`), and scroll
 * depth on back/forward is restored from the per-filter React Query cache.
 */
export function useCatalogParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const kategori = (searchParams.get("kategori") ?? "") as KategoriFilter
  const search = searchParams.get("search") ?? ""

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

  return { kategori, search, setKategori, setSearch }
}
