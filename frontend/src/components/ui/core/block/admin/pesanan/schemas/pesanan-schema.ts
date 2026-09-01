import * as z from "zod"
import { PESANAN_STATUSES, METODE_PEMBAYARAN } from "../types/pesanan-types"

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
  alamat: z
    .string()
    .trim()
    .max(1000, "Alamat maksimal 1000 karakter.")
    .nullish(),
  paket_id: z
    .number({ error: "Pilih paket terlebih dahulu." })
    .int("Paket tidak valid.")
    .positive("Pilih paket terlebih dahulu."),
  jumlah_paket: z
    .number({ error: "Jumlah paket wajib diisi." })
    .int("Jumlah paket harus bilangan bulat.")
    .min(1, "Jumlah paket minimal 1."),
  tanggal_acara: z
    .string({ error: "Tanggal acara wajib diisi." })
    .trim()
    .min(1, "Tanggal acara wajib diisi.")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid (YYYY-MM-DD)."),
  status_pesanan: z
    .enum(PESANAN_STATUSES, {
      error: "Status pesanan wajib dipilih.",
    })
    .nullish(),
  metode_pembayaran: z
    .enum(METODE_PEMBAYARAN, {
      error: "Metode pembayaran wajib dipilih.",
    })
    .nullish(),
  menu_tambahan: z.array(z.string()).nullish(),
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
    .min(0, "Biaya tambahan tidak boleh negatif.")
    .nullish(),
  catatan: z.string().nullish(),
})

export type PesananCreateFormValues = {
  nama_pemesan: string
  no_telepon: string
  alamat?: string | null | undefined
  paket_id: number | null
  jumlah_paket: number | null
  tanggal_acara: string
  status_pesanan?: (typeof PESANAN_STATUSES)[number] | null | undefined
  metode_pembayaran?: (typeof METODE_PEMBAYARAN)[number] | null | undefined
  menu_tambahan?: string[] | null | undefined
  detail_tambahan: string[]
  biaya_tambahan?: number | null | undefined
  catatan?: string | null | undefined
}

/**
 * Mirrors PesananUpdateRequest: sometimes|required enum + sometimes|required date + sometimes|nullable string.
 */
export const pesananUpdateSchema = z.object({
  status_pesanan: z.enum(PESANAN_STATUSES, {
    error: "Status pesanan wajib dipilih.",
  }),
  metode_pembayaran: z
    .enum(METODE_PEMBAYARAN, {
      error: "Metode pembayaran wajib dipilih.",
    })
    .nullish(),
  tanggal_acara: z
    .string({ error: "Tanggal acara wajib diisi." })
    .trim()
    .min(1, "Tanggal acara wajib diisi.")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid (YYYY-MM-DD)."),
  catatan: z.string().nullish(),
})

export type PesananUpdateFormValues = {
  status_pesanan: (typeof PESANAN_STATUSES)[number]
  metode_pembayaran?: (typeof METODE_PEMBAYARAN)[number] | null | undefined
  tanggal_acara: string
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
  const qty = values.jumlah_paket
  if (qty == null) return null

  if (paket.min_order !== null && qty < paket.min_order) {
    return {
      field: "jumlah_paket",
      message: `Minimum pemesanan untuk paket ini adalah ${paket.min_order}.`,
    }
  }
  if (
    paket.kapasitas_produksi !== null &&
    qty > paket.kapasitas_produksi
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
