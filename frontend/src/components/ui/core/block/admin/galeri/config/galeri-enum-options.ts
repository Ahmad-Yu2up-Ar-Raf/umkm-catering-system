/**
 * Dropdown options for the Galeri enum column — values mirror the backend
 * enum exactly (`GaleriKategoriEnum`).
 */
export const GALERI_KATEGORI_OPTIONS = [
  { value: "Pernikahan", label: "Pernikahan" },
  { value: "Korporat", label: "Korporat" },
  { value: "Tumpeng & Syukuran", label: "Tumpeng & Syukuran" },
  { value: "Perayaan", label: "Perayaan" },
  { value: "Hampers", label: "Hampers" },
  { value: "Di Balik Dapur", label: "Di Balik Dapur" },
  { value: "Lainnya", label: "Lainnya" },
] as const

export type GaleriKategoriValue = (typeof GALERI_KATEGORI_OPTIONS)[number]["value"]