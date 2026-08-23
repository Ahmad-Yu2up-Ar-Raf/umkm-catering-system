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

export const MAX_GALERI_IMAGES = 10

const isFile = (value: unknown): value is File =>
  typeof globalThis.File !== "undefined" && value instanceof globalThis.File

const isHttpUrl = (value: string): boolean =>
  /^https?:\/\/\S+$/i.test(value.trim())

/**
 * A gallery/thumbnail entry is valid when it is either an in-flight `File`
 * (upload still running — submit is blocked upstream) or a canonical
 * http(s) Cloudinary URL. Empty strings and blob:/data: URLs are rejected.
 */
const fileOrUrl = z
  .union([z.custom<File>((v) => isFile(v), { message: "File tidak valid" }), z.string()])
  .refine(
    (value) => isFile(value) || isHttpUrl(value),
    { message: "URL gambar tidak valid" }
  )

/** Thumbnail is required: File or http(s) URL, never empty. */
const requiredThumbnail = z
  .union([z.custom<File>((v) => isFile(v), { message: "File tidak valid" }), z.string()])
  .refine(
    (value) => isFile(value) || isHttpUrl(value),
    { message: "Thumbnail wajib diisi" }
  )

/**
 * Schema for the shared Create/Update Galeri form.
 * Allows File objects during upload; the dropzone folds resolved Cloudinary
 * URLs back into the field, so the API payload always carries URL strings.
 */
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
  thumbnail: requiredThumbnail,
  images: z.array(fileOrUrl).max(MAX_GALERI_IMAGES, `Maksimal ${MAX_GALERI_IMAGES} gambar`).optional(),
})

export type GaleriFormValues = z.infer<typeof galeriSchema>
export type GaleriKategoriValue = (typeof GALERI_KATEGORI_VALUES)[number]