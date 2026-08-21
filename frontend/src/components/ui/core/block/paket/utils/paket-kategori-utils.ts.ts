import {
  PaketKategoriOptions,
  DEFAULT_CATEGORY_ICON,
  type PaketKategoriType,
} from "../config/paket-kategori-enum"
import {
  FavouriteIcon,
  Building01Icon,
  CakeIcon,
  UserGroupIcon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons"

export function getCategoryIcon(category: PaketKategoriType | string) {
  const found = PaketKategoriOptions.find((item) => item.value === category)
  return found?.icon || DEFAULT_CATEGORY_ICON
}

export function getCategoryLabel(category: PaketKategoriType | string): string {
  const found = PaketKategoriOptions.find((item) => item.value === category)
  return found?.label || category || "Kategori Lainnya"
}

export function getCategoryColor(category: PaketKategoriType | string): string {
  const found = PaketKategoriOptions.find((item) => item.value === category)
  return found?.badgeColor || "text-muted-foreground bg-muted border-border"
}

export function getAcaraIcon(acara: string | null | undefined) {
  switch (acara) {
    case "Pernikahan":
      return FavouriteIcon
    case "Kantor":
      return Building01Icon
    case "Ulang Tahun":
      return CakeIcon
    case "Arisan":
      return UserGroupIcon
    case "Umum":
    default:
      return Calendar01Icon
  }
}

export function getAcaraColor(acara: string | null | undefined): string {
  switch (acara) {
    case "Pernikahan":
      return "text-pink-600 bg-pink-500/10 border-pink-500/20"
    case "Kantor":
      return "text-blue-600 bg-blue-500/10 border-blue-500/20"
    case "Ulang Tahun":
      return "text-purple-600 bg-purple-500/10 border-purple-500/20"
    case "Arisan":
      return "text-teal-600 bg-teal-500/10 border-teal-500/20"
    case "Umum":
    default:
      return "text-slate-600 bg-slate-500/10 border-slate-500/20"
  }
}
