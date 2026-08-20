/**
 * Dropdown options for the two Paket enum columns — values mirror the backend
 * enums exactly (`PaketKategoriEnum` / `KategoriAcaraEnum`).
 */
export const PAKET_KATEGORI_OPTIONS = [
  { value: "Nasi Box", label: "Nasi Box" },
  { value: "Prasmanan", label: "Prasmanan" },
  { value: "Snack", label: "Snack" },
  { value: "Tumpeng", label: "Tumpeng" },
] as const

export const KATEGORI_ACARA_OPTIONS = [
  { value: "Pernikahan", label: "Pernikahan" },
  { value: "Kantor", label: "Kantor" },
  { value: "Ulang Tahun", label: "Ulang Tahun" },
  { value: "Arisan", label: "Arisan" },
  { value: "Umum", label: "Umum" },
] as const
