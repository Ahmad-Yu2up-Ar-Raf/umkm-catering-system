import { useInfiniteQuery, useQuery } from "@tanstack/react-query"

import { api } from "@/api/client"
import {
  filterOfflineGaleri,
  OFFLINE_GALERI,
  shouldFallback,
  warnOffline,
} from "@/api/offline-fallback"
import type {
  GalleryItem,
  GalleryItemCategory,
} from "@/components/ui/core/block/galeri/types/gallery-types"
import { GALLERY_CATEGORIES } from "@/components/ui/core/block/galeri/galeri-data"

/** Wire shape — mirrors `GaleriResource` (backend). */
interface GaleriApiItem {
  id: number
  nama_acara: string
  kategori_acara: string | null
  deskripsi_acara: string | null
  gambar_acara: string
  tanggal_acara: string | null
  lokasi: string | null
  jumlah_tamu: number | null
  is_featured: boolean
}

/** Pagination metadata from the API (`GaleriController@respondWithPagination`). */
interface GaleriPagination {
  total: number
  currentPage: number
  perPage: number
  lastPage: number
  hasMore: boolean
}

interface GaleriListResponse {
  status: boolean
  message: string
  data: GaleriApiItem[]
  meta: { filters: unknown; pagination: GaleriPagination }
}

interface GaleriPage {
  items: GalleryItem[]
  pagination: GaleriPagination
}

/** Pages per category-filtered request (infinite scroll); Semua uses 500. */
const GALERI_PER_PAGE = 8

/** Preview cards per category on the storefront rail; no full dataset here. */
const PREVIEW_PER_PAGE = 8

/** Normalize `GaleriResource` → presentation `GalleryItem` (NULL → Lainnya). */
function toGalleryItem(raw: GaleriApiItem): GalleryItem {
  return {
    id: String(raw.id),
    category: (raw.kategori_acara ?? "Lainnya") as GalleryItemCategory,
    nama_acara: raw.nama_acara,
    deskripsi_acara: raw.deskripsi_acara ?? undefined,
    gambar_acara: raw.gambar_acara,
    meta: {
      tanggal: raw.tanggal_acara?.slice(0, 10) ?? undefined,
      venue: raw.lokasi ?? undefined,
      jumlahTamu: raw.jumlah_tamu ?? undefined,
    },
    is_featured: raw.is_featured,
  }
}

/**
 * Remembers which category keys were served from the offline snapshot, so
 * the category page can narrow its tab bar while the backend is down.
 * Written in queryFn (event), read during render after settle — the query's
 * own state change already triggers that render, so no subscription needed.
 */
const galeriFallbackServed = new Set<string>()

export function didServeGaleriFallback(kategori: string): boolean {
  return galeriFallbackServed.has(kategori)
}

/**
 * Gallery query — `useInfiniteQuery` over `GET /api/v1/galeri`.
 * - Category filtering is SERVER-SIDE (`?kategori_acara=`) and lives in the
 *   queryKey, so a filter change refetches that key automatically.
 * - Deliberately NO `keepPreviousData`: a category switch resets to a
 *   fresh loading skeleton instead of flashing stale items.
 * - `enabled:false` for an unknown slug — no request, category page renders
 *   its not-found state without an empty API hit.
 */
export function useGaleriQuery({
  kategori,
  enabled = true,
}: {
  kategori: string
  enabled?: boolean
}) {
  const perPage = GALERI_PER_PAGE

  return useInfiniteQuery({
    queryKey: ["galeri", kategori, perPage],
    enabled,

    queryFn: async ({ pageParam }): Promise<GaleriPage> => {
      try {
        const res = await api
          .get("galeri", {
            searchParams: {
              page: String(pageParam),
              perPage: String(perPage),
              ...(kategori ? { kategori_acara: kategori } : {}),
            },
          })
          .json<GaleriListResponse>()

        galeriFallbackServed.delete(kategori)
        return {
          items: res.data.map(toGalleryItem),
          pagination: res.meta.pagination,
        }
      } catch (error) {
        if (!shouldFallback(error)) throw error
        warnOffline("useGaleriQuery", error)
        galeriFallbackServed.add(kategori)
        // ponytail: empty array = honest empty state for categories with no
        // snapshot coverage (snapshot is Perayaan-only), not an error.
        const all = filterOfflineGaleri(kategori)
        const page = Number(pageParam)
        const slice = all.slice((page - 1) * perPage, page * perPage)
        return {
          items: slice.map(toGalleryItem),
          pagination: {
            total: all.length,
            currentPage: page,
            perPage,
            lastPage: Math.max(1, Math.ceil(all.length / perPage)),
            hasMore: page * perPage < all.length,
          },
        }
      }
    },

    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage
      return pagination.hasMore ? pagination.currentPage + 1 : undefined
    },

    staleTime: 1000 * 60 * 5,
    // ponytail: fallback is in queryFn's catch — no retry before it runs.
    retry: false,
  })
}

/**
 * Storefront data — ONE request, all records (`perPage=500`).
 *
 * WHY single-query instead of N parallel `useQueries`: the dev backend is a
 * single-threaded `php artisan serve` against Neon serverless, where every
 * request takes ~5s and requests SERIALIZE server-side. Firing 8 parallel
 * queries (7 categories + featured) meant only the FIRST (pernikahan) beat
 * ky's timeout — the rest returned empty and featured (dispatched last)
 * came up missing too. With a single request the whole storefront loads in
 * one round-trip, and per-category previews are grouped from the real
 * payload — no per-category query to lose.
 *
 * The preview per category = first PREVIEW_PER_PAGE items of its group;
 * totals stay truthful because the group count reflects the full response.
 */
export function useGaleriPreviews() {
  const query = useQuery({
    queryKey: ["galeri", "storefront", "all"],
    staleTime: 1000 * 60 * 5,
    retry: false,
    queryFn: async (): Promise<GalleryItem[]> => {
      try {
        const res = await api
          .get("galeri", {
            searchParams: { page: "1", perPage: "500" },
          })
          .json<GaleriListResponse>()
        return res.data.map(toGalleryItem)
      } catch (error) {
        if (!shouldFallback(error)) throw error
        warnOffline("useGaleriPreviews", error)
        return OFFLINE_GALERI.map(toGalleryItem)
      }
    },
  })

  const categories = GALLERY_CATEGORIES.filter((c) => c.id !== "")
  const all = query.data ?? []
  const groups = new Map<string, GalleryItem[]>()
  for (const item of all) {
    const list = groups.get(item.category) ?? []
    list.push(item)
    groups.set(item.category, list)
  }

  // Featured — derived from the SAME single payload (is_featured flags ship
  // in GaleriResource), so the storefront is exactly ONE request. Never
  // coupled to a category: it's the union of all flagged items.
  const featured = all.filter((item) => item.is_featured).slice(0, 7)

  const results = categories.map((category) => {
    const items = groups.get(category.id) ?? []
    return {
      data:
        items.length > 0
          ? {
              items: items.slice(0, PREVIEW_PER_PAGE),
              pagination: {
                total: items.length,
                currentPage: 1,
                perPage: PREVIEW_PER_PAGE,
                lastPage: 1,
                hasMore: false,
              },
            }
          : undefined,
      isLoading: query.isLoading,
      isError: query.isError,
    }
  })

  return {
    categories,
    results,
    featured,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}

/**
 * Featured signature set — bundled into `useGaleriPreviews` (single storefront
 * request). Kept exported for callers that want the raw featured filter
 * (`?featured=1&perPage=100`) independently.
 */
export function useGaleriFeaturedQuery() {
  return useQuery({
    queryKey: ["galeri", "featured"],
    queryFn: async (): Promise<GalleryItem[]> => {
      try {
        const res = await api
          .get("galeri", {
            searchParams: { perPage: "100", featured: "1" },
          })
          .json<GaleriListResponse>()

        return res.data.map(toGalleryItem)
      } catch (error) {
        if (!shouldFallback(error)) throw error
        warnOffline("useGaleriFeaturedQuery", error)
        return OFFLINE_GALERI.filter((g) => g.is_featured).map(toGalleryItem)
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
}
