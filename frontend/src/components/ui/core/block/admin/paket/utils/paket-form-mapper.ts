import type { Paket } from "../../../paket/types/paket-types"
import type { PaketFormValues, KategoriAcaraValue } from "../validations/paket-schema"

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
  jenis_kemasan: string | null
  catatan_alergen: string | null
  deskripsi: string | null
  thumbnail: string
  images: string[]
}

const cleanTags = (items: string[] | null | undefined): string[] | null => {
  const cleaned = (items ?? [])
    .map((item) => item.trim())
    .filter(Boolean)
  return cleaned.length > 0 ? cleaned : null
}

/** Map a freshly-edited Paket into form default values. */
export function toFormDefaults(paket: Paket): PaketFormValues {
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
    jenis_kemasan: paket.jenis_kemasan,
    catatan_alergen: paket.catatan_alergen,
    deskripsi: paket.deskripsi,
    thumbnail: paket.thumbnail ?? "",
    images: paket.images,
  }
}

/**
 * Coerce validated form values into the API payload. Files never reach this
 * point — uploads are handled by the mediadrop fields at selection time, so
 * the payload is a plain URL-string document.
 */
export function toPaketPayload(value: PaketFormValues): PaketPayload {
  return {
    nama_paket: value.nama_paket.trim(),
    kategori_paket: value.kategori_paket,
    kategori_acara: value.kategori_acara ?? null,
    harga_per_porsi: value.harga_per_porsi as number,
    min_order: value.min_order ?? 1,
    kapasitas_produksi: value.kapasitas_produksi ?? null,
    is_best_seller: value.is_best_seller ?? false,
    menu_utama: cleanTags(value.menu_utama) ?? [],
    menu_tambahan: cleanTags(value.menu_tambahan),
    fasilitas_termasuk: cleanTags(value.fasilitas_termasuk),
    jenis_kemasan: value.jenis_kemasan?.trim() || null,
    catatan_alergen: value.catatan_alergen?.trim() || null,
    deskripsi: value.deskripsi?.trim() || null,
    thumbnail: value.thumbnail.trim(),
    images: value.images,
  }
}
