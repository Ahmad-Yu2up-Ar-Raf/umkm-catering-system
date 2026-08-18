import type { IconSvgElement } from "@hugeicons/react"
import type { Paket } from "../../paket/types/paket-types"
import {
  getCategoryColor,
  getCategoryIcon,
  getCategoryLabel,
} from "../../paket/utils/paket-kategori-utils.ts"

/** Generic brand placeholder — only used when a package truly has no photos.
 *  Treated as a neutral brand surface, never as the package's own photo. */
export const DETAIL_FALLBACK_IMAGE =
  "/assets/images/banners/hero-banner-tumpeng.png"

/** Repository formatting convention (see `paket-card.tsx`). */
const formatIDR = (value: string | number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value))

export interface DetailMetaRow {
  /** Stable key for icon mapping in the UI: "event" | "packaging" | "capacity". */
  key: "event" | "packaging" | "capacity"
  label: string
  value: string
}

export interface DetailViewModel {
  id: number
  name: string
  categoryLabel: string
  categoryIcon: IconSvgElement
  categoryColor: string
  bestSeller: boolean
  priceLabel: string
  hasPrice: boolean
  minOrderLabel: string | null
  metaRows: DetailMetaRow[]
  description: string | null
  menuMain: string[]
  menuExtra: string[] | null
  facilities: string[] | null
  allergenNote: string | null
  gallery: string[]
  hasGallery: boolean
  waMessage: string
  /** RAW numeric values for the order modal (formatted labels exist above). */
  minOrder: number
  capacity: number | null
  hargaPerPorsi: number
}

/**
 * THE single transformation layer: API payload → presentation view model.
 * All formatting, dedup and fallback decisions live here — JSX stays
 * declarative and business logic never leaks into components.
 */
export function toDetailViewModel(paket: Paket): DetailViewModel {
  const price = Number(paket.harga_per_porsi)
  const hasPrice = Number.isFinite(price) && price > 0
  const priceLabel = hasPrice ? formatIDR(price) : "—"

  const minOrderLabel =
    paket.min_order > 1 ? `Min. ${paket.min_order} porsi` : null

  const metaRows: DetailMetaRow[] = []
  if (paket.kategori_acara)
    metaRows.push({ key: "event", label: "Acara", value: paket.kategori_acara })
  if (paket.jenis_kemasan)
    metaRows.push({ key: "packaging", label: "Kemasan", value: paket.jenis_kemasan })
  if (paket.kapasitas_produksi != null && paket.kapasitas_produksi > 0)
    metaRows.push({
      key: "capacity",
      label: "Kapasitas produksi",
      value: `${paket.kapasitas_produksi} porsi`,
    })

  // thumbnail is usually images[0] → dedupe into a single scope.
  const gallery = [
    ...new Set(
      [paket.thumbnail, ...(paket.images ?? [])].filter(
        (src): src is string => Boolean(src)
      )
    ),
  ]

  return {
    id: paket.id,
    name: paket.nama_paket,
    categoryLabel: getCategoryLabel(paket.kategori_paket),
    categoryIcon: getCategoryIcon(paket.kategori_paket),
    categoryColor: getCategoryColor(paket.kategori_paket),
    bestSeller: paket.is_best_seller,
    priceLabel,
    hasPrice,
    minOrderLabel,
    metaRows,
    description: paket.deskripsi,
    menuMain: paket.menu_utama,
    menuExtra: paket.menu_tambahan,
    facilities: paket.fasilitas_termasuk,
    allergenNote: paket.catatan_alergen,
    gallery,
    hasGallery: gallery.length > 0,
    waMessage: `Halo Catering Nusantara, saya ingin memesan paket ${paket.nama_paket} (${priceLabel}/porsi, min. ${paket.min_order} porsi). Mohon info ketersediaannya.`,
    minOrder: paket.min_order,
    capacity: paket.kapasitas_produksi,
    hargaPerPorsi: Number(paket.harga_per_porsi),
  }
}
