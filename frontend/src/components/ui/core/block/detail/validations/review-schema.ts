import * as z from "zod"

/**
 * Public review submission. Mirrors TestimoniStoreRequest (public):
 * nama/pesanan/rating only. `paket_id` is injected from the page
 * context and `visibility` is forced to private server-side — neither lives
 * in this schema, so the client can never send them.
 */
export const reviewSchema = z.object({
  nama: z.string().trim().min(1, "Nama wajib diisi.").max(255),
  pesanan: z
    .string()
    .trim()
    .min(1, "Pesan wajib diisi.")
    .max(2000, "Pesan maksimal 2000 karakter."),
  acara: z.string().trim().min(1, "Acara wajib diisi.").max(255),
  lokasi: z.string().trim().min(1, "Lokasi wajib diisi.").max(255),
  tanggal_acara: z.string().nullable().optional(),
  rating: z
    .number({ error: "Rating wajib diisi." })
    .int("Rating harus bilangan bulat.")
    .min(1, "Rating minimal 1 bintang.")
    .max(5, "Rating maksimal 5 bintang."),
})

export type ReviewFormValues = z.infer<typeof reviewSchema>
