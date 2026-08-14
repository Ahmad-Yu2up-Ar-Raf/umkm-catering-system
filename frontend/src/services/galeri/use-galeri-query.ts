import { useInfiniteQuery, useQuery } from "@tanstack/react-query"

import { api } from "@/api/client"
import type {
  GalleryItem,
  GalleryItemCategory,
} from "@/components/ui/core/block/galeri/types/gallery-types"

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

const GALERI_PER_PAGE = 8

/** Normalize `GaleriResource` → presentation `GalleryItem` (NULL → Lainnya). */
function toGalleryItem(raw: GaleriApiItem): GalleryItem {
  return {
    id: String(raw.id),
    category: (raw.kategori_acara ?? "Lainnya") as GalleryItemCategory,
    nama_acara: raw.nama_acara,
    deskripsi_acara: raw.deskripsi_acara ?? undefined,
    gambar_acara: raw.gambar_acara,
    meta: {
      tanggal: raw.tanggal_acara ?? undefined,
      venue: raw.lokasi ?? undefined,
      jumlahTamu: raw.jumlah_tamu ?? undefined,
    },
    is_featured: raw.is_featured,
  }
}

/**
 * Gallery query — `useInfiniteQuery` over `GET /api/v1/galeri`.
 * - The page cursor derives from the server's `meta.pagination.hasMore`.
 * - Category filtering is SERVER-SIDE (`?kategori_acara=`) and lives in the
 *   queryKey, so a filter change refetches that key automatically.
 * - Deliberately NO `keepPreviousData`: a fast category switch resets to a
 *   fresh loading skeleton instead of flashing stale items.
 */
export function useGaleriQuery({ kategori }: { kategori: string }) {
  return useInfiniteQuery({
    queryKey: ["galeri", kategori, GALERI_PER_PAGE],

    queryFn: async ({ pageParam }): Promise<GaleriPage> => {
      const res = await api
        .get("galeri", {
          searchParams: {
            page: String(pageParam),
            perPage: String(GALERI_PER_PAGE),
            ...(kategori ? { kategori_acara: kategori } : {}),
          },
        })
        .json<GaleriListResponse>()

      return {
        items: res.data.map(toGalleryItem),
        pagination: res.meta.pagination,
      }
    },

    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage
      return pagination.hasMore ? pagination.currentPage + 1 : undefined
    },

    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Featured signature set — a dedicated small query (`?featured=1`,
 * `perPage=100`) so the hero band is stable and independent of the paginated
 * category browsing below it.
 */
export function useGaleriFeaturedQuery() {
  return useQuery({
    queryKey: ["galeri", "featured"],
    queryFn: async (): Promise<GalleryItem[]> => {
      const res = await api
        .get("galeri", {
          searchParams: { perPage: "100", featured: "1" },
        })
        .json<GaleriListResponse>()

      return res.data.map(toGalleryItem)
    },
    staleTime: 1000 * 60 * 5,
  })
}
