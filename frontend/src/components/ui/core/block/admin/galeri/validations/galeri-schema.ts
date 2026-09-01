import * as z from "zod"

export const GALERI_KATEGORI_VALUES = [
  "Pernikahan",
  "Korporat",
  "Tumpeng & Syukuran",
  "Perayaan",
  "Hampers",
  "Di Balik Dapur",
  "Lainnya",
] as const

const isFile = (value: unknown): value is File =>
  typeof globalThis.File !== "undefined" && value instanceof globalThis.File

const isHttpUrl = (value: string): boolean =>
  /^https?:\/\/\S+$/i.test(value.trim())

const requiredImage = z
  .union([z.custom<File>((v) => isFile(v), { message: "File tidak valid" }), z.string()])
  .refine(
    (value) => isFile(value) || isHttpUrl(value),
    { message: "Gambar acara wajib diisi" }
  )

export const galeriSchema = z.object({
  nama_acara: z.string().trim().min(1, "Nama acara wajib diisi"),
  kategori_acara: z.enum(GALERI_KATEGORI_VALUES, {
    message: "Pilih kategori acara",
  }),
  deskripsi_acara: z.string().trim().nullable().optional(),
  tanggal_acara: z.string().nullable().optional(),
  lokasi: z.string().trim().max(255).nullable().optional(),
  jumlah_tamu: z.number().int().min(0, "Minimal 0 tamu").nullable().optional(),
  is_featured: z.boolean().optional(),
  gambar_acara: requiredImage,
})

export type GaleriFormValues = z.infer<typeof galeriSchema>
export type GaleriKategoriValue = (typeof GALERI_KATEGORI_VALUES)[number]