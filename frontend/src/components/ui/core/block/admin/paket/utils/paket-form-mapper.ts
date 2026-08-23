import type { Paket } from "../../../paket/types/paket-types"
import type { PaketFormValues, KategoriAcaraValue } from "../validations/paket-schema"
import { deepEqual } from "@/lib/deep-equal"

export interface PaketPayload {
  nama_paket: string
  kategori_paket: Paket["kategori_paket"]
  kategori_acara: KategoriAcaraValue | null
  harga_per_porsi: number
  min_order: number
  kapasitas_produksi: number | null
  is_best_seller: boolean
  menu_utama: string[]
  menu_tambahan: string[] | null
  fasilitas_termasuk: string[] | null
  jenis_kemasan: string
  catatan_alergen: string | null
  deskripsi: string
  thumbnail: string
  images: string[]
}

const cleanTags = (items: string[] | null | undefined): string[] | null => {
  const cleaned = (items ?? [])
    .map((item) => item.trim())
    .filter(Boolean)
  return cleaned.length > 0 ? cleaned : null
}

/**
 * Files are collapsed to a distinctive sentinel (NOT "") so that
 * "default empty" vs "freshly dropped file" compares as CHANGED — this is
 * what makes the discard-changes dialog fire for image-only edits.
 */
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

/** Map a freshly-edited Paket into form default values. */
export function toFormDefaults(paket: Paket): PaketFormValues {
  // Filter out thumbnail from gallery images to prevent duplication
  const galleryImages = (paket.images ?? []).filter((img) => img !== paket.thumbnail)

  return {
    nama_paket: paket.nama_paket,
    kategori_paket: paket.kategori_paket as PaketFormValues["kategori_paket"],
    kategori_acara: (paket.kategori_acara ?? null) as KategoriAcaraValue | null,
    harga_per_porsi: Number(paket.harga_per_porsi),
    min_order: paket.min_order,
    kapasitas_produksi: paket.kapasitas_produksi,
    is_best_seller: paket.is_best_seller,
    menu_utama: paket.menu_utama,
    menu_tambahan: paket.menu_tambahan ?? [],
    fasilitas_termasuk: paket.fasilitas_termasuk ?? [],
    jenis_kemasan: paket.jenis_kemasan ?? "",
    catatan_alergen: paket.catatan_alergen,
    deskripsi: paket.deskripsi ?? "",
    thumbnail: paket.thumbnail ?? "",
    images: galleryImages,
  }
}

/**
 * Compare two form value objects for equality, normalizing File objects to empty strings.
 */
export function areFormValuesEqual(a: unknown, b: unknown): boolean {
  return deepEqual(normalizeFormValue(a), normalizeFormValue(b))
}

/**
 * Coerce validated form values into the API payload. Any residual `File`
 * entries (upload never resolved) are dropped so the API only ever sees URLs.
 */
export function toPaketPayload(value: PaketFormValues): PaketPayload {
  const thumb = typeof value.thumbnail === "string" ? value.thumbnail.trim() : ""
  // Ensure thumbnail is excluded from images gallery
  const gallery = (value.images ?? [])
    .filter((img): img is string => typeof img === "string")
    .map((img) => img.trim())
    .filter((img) => img !== "" && img !== thumb)

  return {
    nama_paket: value.nama_paket.trim(),
    kategori_paket: value.kategori_paket,
    kategori_acara: value.kategori_acara ?? null,
    harga_per_porsi: value.harga_per_porsi,
    min_order: value.min_order ?? 1,
    kapasitas_produksi: value.kapasitas_produksi ?? null,
    is_best_seller: value.is_best_seller ?? false,
    menu_utama: cleanTags(value.menu_utama) ?? [],
    menu_tambahan: cleanTags(value.menu_tambahan),
    fasilitas_termasuk: cleanTags(value.fasilitas_termasuk),
    jenis_kemasan: value.jenis_kemasan.trim(),
    catatan_alergen: value.catatan_alergen?.trim() || null,
    deskripsi: value.deskripsi.trim(),
    thumbnail: thumb,
    images: gallery as string[],
  }
}
