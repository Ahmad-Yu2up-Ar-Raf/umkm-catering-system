import * as z from "zod"
import { PESANAN_STATUSES } from "../types/pesanan-types"

/**
 * Mirrors PesananStoreRequest exactly:
 * required|string|max:255 / required|string|max:20 / required|integer|exists /
 * required|integer|min:1 / nullable|array of string max:255 / nullable|numeric|min:0 /
 * nullable|string.
 *
 * Server-only fields (total_harga, nomor_struk, harga_paket_satuan) are
 * deliberately ABSENT — sending them would violate AGENTS.md §3.
 *
 * zod v4 error API (`{ error }`) covers both missing and wrong-typed values.
 */
export const pesananCreateSchema = z.object({
  nama_pemesan: z
    .string({ error: "Nama pemesan wajib diisi." })
    .trim()
    .min(1, "Nama pemesan wajib diisi.")
    .max(255, "Nama pemesan maksimal 255 karakter."),
  no_telepon: z
    .string({ error: "Nomor telepon wajib diisi." })
    .trim()
    .min(1, "Nomor telepon wajib diisi.")
    .max(20, "Nomor telepon maksimal 20 karakter."),
  paket_id: z
    .number({ error: "Pilih paket terlebih dahulu." })
    .int("Paket tidak valid.")
    .positive("Pilih paket terlebih dahulu."),
  jumlah_paket: z
    .number({ error: "Jumlah paket wajib diisi." })
    .int("Jumlah paket harus bilangan bulat.")
    .min(1, "Jumlah paket minimal 1."),
  detail_tambahan: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(255, "Item tambahan maksimal 255 karakter.")
    )
    .max(50, "Maksimal 50 item tambahan."),
  biaya_tambahan: z
    .number({ error: "Biaya tambahan harus angka." })
    .min(0, "Biaya tambahan tidak boleh negatif."),
  catatan: z.string().nullish(),
})

export type PesananCreateFormValues = {
  nama_pemesan: string
  no_telepon: string
  paket_id: number
  jumlah_paket: number
  detail_tambahan: string[]
  biaya_tambahan: number
  catatan?: string | null | undefined
}

/**
 * Mirrors PesananUpdateRequest: sometimes|required enum + sometimes|nullable string.
 */
export const pesananUpdateSchema = z.object({
  status_pesanan: z.enum(PESANAN_STATUSES, {
    error: "Status pesanan wajib dipilih.",
  }),
  catatan: z.string().nullish(),
})

export type PesananUpdateFormValues = {
  status_pesanan: (typeof PESANAN_STATUSES)[number]
  catatan?: string | null | undefined
}

/**
 * Submit-time business guards mirroring HargaService (min_order, capacity).
 * These live OUTSIDE the Zod schema because they depend on the selected
 * paket record; invoked from the form's onSubmit before mutation dispatch.
 */
export interface JumlahViolation {
  field: "jumlah_paket"
  message: string
}

export function validateAgainstPaket(
  values: Pick<PesananCreateFormValues, "jumlah_paket">,
  paket: Pick<PaketLike, "min_order" | "kapasitas_produksi"> | null
): JumlahViolation | null {
  if (!paket) return null

  if (paket.min_order !== null && values.jumlah_paket < paket.min_order) {
    return {
      field: "jumlah_paket",
      message: `Minimum pemesanan untuk paket ini adalah ${paket.min_order}.`,
    }
  }
  if (
    paket.kapasitas_produksi !== null &&
    values.jumlah_paket > paket.kapasitas_produksi
  ) {
    return {
      field: "jumlah_paket",
      message: `Kapasitas produksi paket ini maksimal ${paket.kapasitas_produksi}.`,
    }
  }
  return null
}

/** Structural subset any paket source must expose for the guards above. */
interface PaketLike {
  min_order: number | null
  kapasitas_produksi: number | null
}
