import { useCallback } from "react"
import { useSearchParams } from "react-router"

/**
 * The catalog's filter state IS the URL — `?kategori_paket[]=…&kategori_acara[]=…&search=…`.
 * Deep-linkable, back/forward aware, and every write goes through
 * `setSearchParams` so React Router owns navigation and scroll behaviour.
 * Supports both bracketed multi-value (`kategori_paket[]=A`) and legacy
 * single (`kategori_paket=A` / `kategori=A`) for backward compatibility.
 *
 * `page` is intentionally NOT in the URL: the infinite-query cursor derives
 * from the server's `meta.pagination` (see `use-paket-query.ts`), and scroll
 * depth on back/forward is restored from the per-filter React Query cache.
 */

function readArrayParam(searchParams: URLSearchParams, key: string): string[] {
  // Prefer bracketed form; fall back to legacy single key and historic `kategori`
  const bracketed = searchParams.getAll(`${key}[]`)
  if (bracketed.length > 0) return bracketed
  const single = searchParams.get(key)
  if (single) return [single]
  // Historic alias: `?kategori=Nasi Box` (pre-multi-select)
  if (key === "kategori_paket") {
    const legacy = searchParams.get("kategori")
    if (legacy) return [legacy]
  }
  return []
}

export function useCatalogParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const kategoriPaket = readArrayParam(searchParams, "kategori_paket")
  const kategoriAcara = readArrayParam(searchParams, "kategori_acara")
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

  const setKategoriPaket = useCallback(
    (values: string[]) => {
      commit((params) => {
        params.delete("kategori_paket[]")
        params.delete("kategori_paket")
        params.delete("kategori")
        for (const v of values) params.append("kategori_paket[]", v)
      })
    },
    [commit]
  )

  const setKategoriAcara = useCallback(
    (values: string[]) => {
      commit((params) => {
        params.delete("kategori_acara[]")
        params.delete("kategori_acara")
        for (const v of values) params.append("kategori_acara[]", v)
      })
    },
    [commit]
  )

  // Immediate commit — debouncing lives in the SearchBar (single layer), so a
  // pause only fires one request. Reset also clears the URL instantly.
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

  // Backward compat alias: single-value `kategori` → first element
  const kategori = kategoriPaket[0] ?? ""
  const setKategori = useCallback(
    (value: string) => {
      setKategoriPaket(value ? [value] : [])
    },
    [setKategoriPaket]
  )

  return {
    kategoriPaket,
    kategoriAcara,
    search,
    setKategoriPaket,
    setKategoriAcara,
    setSearch,
    // deprecated single-value aliases
    kategori,
    setKategori,
  }
}
