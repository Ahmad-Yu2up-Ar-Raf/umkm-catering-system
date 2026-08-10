import {
  BoxIcon,
  ChefHatIcon,
  DonutIcon,
  LayoutGridIcon,
  PyramidIcon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

/**
 * Category labels mirror `PaketKategoriEnum` in the backend (plus the
 * "Semua" no-filter entry). Single source for the category nav — the nav
 * NEVER derives categories from fetched rows, the enum is fixed.
 * Icon names verified present in `@hugeicons/core-free-icons` v4.2.3.
 */

export type KategoriFilter =
  | ""
  | "Nasi Box"
  | "Prasmanan"
  | "Snack"
  | "Tumpeng"

export interface PaketCategory {
  /** URL `kategori` value; "" = "Semua" (filter omitted from the request). */
  value: KategoriFilter
  label: string
  icon: IconSvgElement
}

export const KATEGORI_PAKET: PaketCategory[] = [
  { value: "", label: "Semua", icon: LayoutGridIcon },
  { value: "Nasi Box", label: "Nasi Box", icon: BoxIcon },
  { value: "Prasmanan", label: "Prasmanan", icon: ChefHatIcon },
  { value: "Snack", label: "Snack", icon: DonutIcon },
  { value: "Tumpeng", label: "Tumpeng", icon: PyramidIcon },
]
