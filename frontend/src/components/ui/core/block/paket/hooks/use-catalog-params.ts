import { useCallback, useEffect, useRef } from "react"
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
      // Functional updater → always sees the latest params, so a debounced
      // write can never clobber a category change that landed mid-debounce.
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

  // 300ms debounce so every keystroke never fires a request. The SearchBar
  // keeps instant local typing; the URL — and therefore the query refetch —
  // waits for the pause.
  const debounceRef = useRef<number | null>(null)

  const setSearch = useCallback(
    (term: string) => {
      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current)
      }
      debounceRef.current = window.setTimeout(() => {
        commit((params) => {
          const value = term.trim()
          if (value) params.set("search", value)
          else params.delete("search")
        })
      }, 300)
    },
    [commit]
  )

  // Flush any pending debounce when the hook consumer unmounts.
  useEffect(
    () => () => {
      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current)
      }
    },
    []
  )

  return { kategori, search, setKategori, setSearch }
}
