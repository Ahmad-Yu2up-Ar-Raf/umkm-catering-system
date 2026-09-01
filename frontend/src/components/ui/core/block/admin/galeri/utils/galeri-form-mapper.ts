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
  gambar_acara: string
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

/** Map Galeri into form defaults — single canonical image field. */
export function toFormDefaults(galeri: Galeri): GaleriFormValues {
  return {
    nama_acara: galeri.nama_acara,
    kategori_acara: galeri.kategori_acara as GaleriFormValues["kategori_acara"],
    deskripsi_acara: galeri.deskripsi_acara,
    tanggal_acara: galeri.tanggal_acara,
    lokasi: galeri.lokasi,
    jumlah_tamu: galeri.jumlah_tamu,
    is_featured: galeri.is_featured,
    gambar_acara: galeri.gambar_acara ?? "",
  }
}

/** Compare two form value objects for equality, normalizing File objects to empty strings. */
export function areFormValuesEqual(a: unknown, b: unknown): boolean {
  return deepEqual(normalizeFormValue(a), normalizeFormValue(b))
}

/** Coerce validated form values into API payload — single gambar_acara string. */
export function toGaleriPayload(value: GaleriFormValues): GaleriPayload {
  const img = typeof value.gambar_acara === "string" ? value.gambar_acara.trim() : ""
  // If still a File (should have been resolved in useGaleriForm), drop it
  const final = typeof value.gambar_acara === "string" ? img : ""

  return {
    nama_acara: value.nama_acara.trim(),
    kategori_acara: value.kategori_acara,
    deskripsi_acara: value.deskripsi_acara?.trim() || null,
    tanggal_acara: value.tanggal_acara || null,
    lokasi: value.lokasi?.trim() || null,
    jumlah_tamu: value.jumlah_tamu ?? null,
    is_featured: value.is_featured ?? false,
    gambar_acara: final,
  }
}