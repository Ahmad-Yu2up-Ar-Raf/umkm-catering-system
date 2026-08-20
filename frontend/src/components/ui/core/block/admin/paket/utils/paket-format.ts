/**
 * Rupiah formatting — `harga_per_porsi` arrives as a `decimal:2` string from
 * the API, so it must be Number()-ed first (see block/paket paket-card).
 */
export const formatIDR = (value: string | number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value))
