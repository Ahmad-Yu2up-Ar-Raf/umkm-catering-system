import { HTTPError } from "ky"

import type { Paket } from "@/components/ui/core/block/paket/types/paket-types"
import galeriJson from "../json/galeri-placeholder.json"
import paketJson from "../json/paket-placeholder.json"

/** Wire shape — mirrors `GaleriResource` (backend). */
export interface GaleriFallbackItem {
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

// ponytail: static snapshots previously unimported; single shared module so
// the 4 public hooks reuse one filter/paginate path instead of 4 copies.
export const OFFLINE_PAKETS: Paket[] = (paketJson as { data: Paket[] }).data

export const OFFLINE_GALERI: GaleriFallbackItem[] = (
  galeriJson as { data: GaleriFallbackItem[] }
).data

/** Dev-only warning — silent in production. */
export function warnOffline(scope: string, error: unknown): void {
  if (import.meta.env.DEV) {
    console.warn(
      `[offline-fallback] ${scope}: live API unreachable, using local JSON.`,
      error
    )
  }
}

/**
 * Snapshot covers only a dead backend — never mask live client semantics:
 * 401 keeps the login redirect, 404 keeps the not-found shell, other 4xx
 * keep validation errors. ky throws HTTPError for status codes and
 * TypeError/TimeoutError for dead-network, so: fallback on non-HTTP errors
 * and 5xx only.
 */
export function shouldFallback(error: unknown): boolean {
  if (error instanceof HTTPError) {
    return error.response.status >= 500
  }
  return true
}

/** Distinct `kategori_acara` present in the galeri snapshot (Perayaan-only today). */
export const OFFLINE_GALERI_KATEGORI: string[] = [
  ...new Set(
    OFFLINE_GALERI.map((g) => g.kategori_acara).filter(
      (c): c is string => c !== null
    )
  ),
]

export function filterOfflinePakets(kategori: string, search: string): Paket[] {
  const q = search.trim().toLowerCase()
  return OFFLINE_PAKETS.filter((p) => {
    if (kategori && p.kategori_paket !== kategori) return false
    if (!q) return true
    return `${p.nama_paket} ${p.deskripsi ?? ""}`.toLowerCase().includes(q)
  })
}

export function findOfflinePaket(id: string): Paket | undefined {
  const numeric = Number(id)
  if (!Number.isFinite(numeric)) return undefined
  return OFFLINE_PAKETS.find((p) => p.id === numeric)
}

export function filterOfflineGaleri(kategori: string): GaleriFallbackItem[] {
  if (!kategori) return OFFLINE_GALERI
  return OFFLINE_GALERI.filter((g) => g.kategori_acara === kategori)
}
