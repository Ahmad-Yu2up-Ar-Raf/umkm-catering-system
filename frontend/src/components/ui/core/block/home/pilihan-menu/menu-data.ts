/**
 * Pilihan Menu — presentation view-model for the homepage's Top-N packages.
 *
 * The static dummy catalogue is gone: rows now come from `GET /paket` (see
 * `useBestSellerPakets`) mapped through `toMenuChoice`. All strings here are
 * presentation-ready (zero-padded index, IDR-formatted price, min-order label)
 * so the components stay dumb renderers.
 */

import type { Paket } from "@/components/ui/core/block/paket/types/paket-types"

export interface MenuChoice {
  /** Stable package id (used for the /kontak?paket= fallback query). */
  id: string
  /** Zero-padded index shown as the row numeral, e.g. "01". */
  index: string
  /** Package display name. */
  title: string
  /** Short, honest one-line description. */
  description: string
  /** Cover image — Cloudinary URL or fallback asset path. */
  imagePath: string
  /** Fallback contact route until the real /menu page ships. */
  href: string
  /** IDR-formatted per-portion price, e.g. "Rp 22.000". */
  priceText: string
  /** Minimum order label, e.g. "Min. 50 porsi". */
  minOrderText: string
  /** Optional marketing badge, e.g. "Best Seller". */
  badge?: string
}

export const AUTO_ADVANCE_MS = 6000

const PACKET_QUERY = (id: number) => `/kontak?paket=${id}`

/** Format a decimal:2 wire price ("22000.00") as "Rp 22.000". */
export function formatIDR(value: string): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value))
}

/** Normalize a `Paket` into the menu's presentation `MenuChoice`. */
export function toMenuChoice(paket: Paket, index: number): MenuChoice {
  return {
    id: String(paket.id),
    index: String(index + 1).padStart(2, "0"),
    title: paket.nama_paket,
    description:
      paket.deskripsi ?? paket.menu_utama.slice(0, 2).join(" · ") ?? "",
    imagePath: paket.thumbnail ?? paket.images[0] ?? "",
    href: PACKET_QUERY(paket.id),
    priceText: formatIDR(paket.harga_per_porsi),
    minOrderText: `Min. ${paket.min_order} porsi`,
    badge: paket.is_best_seller ? "Best Seller" : undefined,
  }
}
