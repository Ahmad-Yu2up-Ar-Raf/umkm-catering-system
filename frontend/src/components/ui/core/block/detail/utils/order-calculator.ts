import { format, parse } from "date-fns"
import { id as localeID } from "date-fns/locale"

import type { OrderFormValues } from "../validations/order-schema"
import type { DetailViewModel } from "./detail-view-model"

/** Repo convention: Intl formatter, local to the consumer. */
export const formatIDR = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)

export interface OrderCalcInput {
  jumlahPorsi: number
  hargaPerPorsi: number // Number(vm price) — decimal:2 string normalized at the VM
  laukPelengkap: string[]
}

export interface OrderCalcResult {
  baseTotal: number
  hasPrice: boolean
  totalLabel: string // "Rp 440.000" — add-on note rendered by the UI
  addons: string[]
}

/**
 * Deterministic, derived-only calculation. Server still owns the final
 * `total_harga` (`HargaService`); this is a UX-only preview.
 */
export const calculateOrder = ({
  jumlahPorsi,
  hargaPerPorsi,
  laukPelengkap,
}: OrderCalcInput): OrderCalcResult => {
  const baseTotal = jumlahPorsi * hargaPerPorsi
  return {
    baseTotal,
    hasPrice: Number.isFinite(baseTotal) && baseTotal > 0,
    totalLabel: formatIDR(baseTotal),
    addons: laukPelengkap,
  }
}

/**
 * Structured WhatsApp message — mirrors the admin POS input shape so
 * transcribing is copy-paste, not interpretation.
 */
export const buildWaOrderMessage = (
  values: OrderFormValues,
  vm: DetailViewModel,
  totalLabel: string
): string =>
  [
    "Halo Catering Nusantara, saya ingin memesan:",
    `• Paket: ${vm.name}`,
    `• Nama: ${values.nama}`,
    `• Tanggal acara: ${format(
      parse(values.tanggal_acara, "yyyy-MM-dd", new Date()),
      "dd MMMM yyyy",
      { locale: localeID }
    )}`,
    `• Lokasi acara: ${values.lokasi_acara}`,
    `• Jumlah: ${values.jumlah_porsi} porsi`,
    values.lauk_pelengkap.length > 0
      ? `• Lauk pelengkap: ${values.lauk_pelengkap.join(", ")}`
      : null,
    `• Estimasi: ${totalLabel} (belum termasuk biaya tambahan — mohon konfirmasi)`,
    values.catatan ? `• Catatan: ${values.catatan}` : null,
  ]
    .filter(Boolean)
    .join("\n")