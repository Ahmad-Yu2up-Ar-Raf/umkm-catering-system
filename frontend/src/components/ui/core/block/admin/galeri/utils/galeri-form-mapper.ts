import type { Galeri } from "../types/galeri-types"
import type { GaleriFormValues, GaleriKategoriValue } from "../validations/galeri-schema"
import { deepEqual } from "@/lib/deep-equal"

export interface GaleriPayload {
  nama_acara: string
  kategori_acara: GaleriKategoriValue
  deskripsi_acara: string | null
  tanggal_acara: string | null
  lokasi: string | null
  jumlah_tamu: number | null
  is_featured: boolean
  thumbnail: string
  images: string[]
}

const FILE_SENTINEL = "__file_upload__"

const normalizeFormValue = (value: unknown): unknown => {
  if (typeof globalThis.File !== "undefined" && value instanceof globalThis.File) {
    return FILE_SENTINEL
  }
  if (Array.isArray(value)) return value.map(normalizeFormValue)
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {}
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        result[key] = normalizeFormValue((value as Record<string, unknown>)[key])
      }
    }
    return result
  }
  return value
}

/** Map a freshly-edited Galeri into form default values. */
export function toFormDefaults(galeri: Galeri): GaleriFormValues {
  return {
    nama_acara: galeri.nama_acara,
    kategori_acara: galeri.kategori_acara as GaleriFormValues["kategori_acara"],
    deskripsi_acara: galeri.deskripsi_acara,
    tanggal_acara: galeri.tanggal_acara,
    lokasi: galeri.lokasi,
    jumlah_tamu: galeri.jumlah_tamu,
    is_featured: galeri.is_featured,
    thumbnail: galeri.thumbnail ?? "",
    images: galeri.images ?? [],
  }
}

/** Compare two form value objects for equality, normalizing File objects to empty strings. */
export function areFormValuesEqual(a: unknown, b: unknown): boolean {
  return deepEqual(normalizeFormValue(a), normalizeFormValue(b))
}

/** Coerce validated form values into the API payload. Any residual `File` entries (upload never resolved) are dropped so the API only ever sees URLs. */
export function toGaleriPayload(value: GaleriFormValues): GaleriPayload {
  const thumb = typeof value.thumbnail === "string" ? value.thumbnail.trim() : ""
  const gallery = (value.images ?? [])
    .filter((img): img is string => typeof img === "string")
    .map((img) => img.trim())
    .filter((img) => img !== "" && img !== thumb)

  return {
    nama_acara: value.nama_acara.trim(),
    kategori_acara: value.kategori_acara,
    deskripsi_acara: value.deskripsi_acara?.trim() || null,
    tanggal_acara: value.tanggal_acara || null,
    lokasi: value.lokasi?.trim() || null,
    jumlah_tamu: value.jumlah_tamu ?? null,
    is_featured: value.is_featured ?? false,
    thumbnail: thumb,
    images: gallery as string[],
  }
}