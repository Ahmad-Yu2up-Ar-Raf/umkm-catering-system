import * as z from "zod"
import { TESTIMONI_VISIBILITY_VALUES } from "../types/testimoni-types"

/**
 * Mirrors StoreTestimoniRequest exactly: required nama/acara/lokasi
 * (≤255), required pesan text (≤2000), sometimes-enum visibility
 * (defaults to 'private'), required paket_id exists, rating 1–5.
 */
export const testimoniSchema = z.object({
  nama: z.string().trim().min(1, "Nama wajib diisi").max(255),
  pesanan: z
    .string()
    .trim()
    .min(1, "Pesan wajib diisi.")
    .max(2000, "Pesan maksimal 2000 karakter."),
  acara: z.string().trim().min(1, "Acara wajib diisi").max(255),
  lokasi: z.string().trim().min(1, "Lokasi wajib diisi").max(255),
  tanggal_acara: z.string().nullable().optional(),
  visibility: z.enum(TESTIMONI_VISIBILITY_VALUES, {
    error: "Pilih visibilitas testimoni",
  }),
  rating: z
    .number({ error: "Rating wajib diisi." })
    .int("Rating harus bilangan bulat.")
    .min(1, "Rating minimal 1 bintang.")
    .max(5, "Rating maksimal 5 bintang."),
  paket_id: z
    .number({ error: "Pilih paket terlebih dahulu." })
    .int("Paket tidak valid.")
    .positive("Pilih paket terlebih dahulu."),
})

export type TestimoniFormValues = z.infer<typeof testimoniSchema>
