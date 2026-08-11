import {
  PaketKategoriOptions,
  DEFAULT_CATEGORY_ICON,
  type PaketKategoriType,
} from "../config/paket-kategori-enum"

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
