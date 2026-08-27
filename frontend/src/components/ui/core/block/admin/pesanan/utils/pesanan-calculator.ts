/**
 * UX-ONLY live calculation for the POS drawer.
 * Mirrors HargaService::totalHarga so the cashier sees what the server will compute.
 * The authoritative total is ALWAYS the server's response (AGENTS.md §3 — never trust frontend numbers financially).
 */
export interface OrderPreview {
  subtotal: number
  biayaTambahan: number
  total: number
}

export function calculateOrder(
  jumlahPaket: number,
  hargaSatuan: number,
  biayaTambahan: number
): OrderPreview {
  const subtotal = jumlahPaket * hargaSatuan
  return { subtotal, biayaTambahan, total: subtotal + biayaTambahan }
}

/**
 * Rupiah formatting — decimal strings from the API must be Number()-ed first.
 */
export const formatRupiah = (value: string | number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value))