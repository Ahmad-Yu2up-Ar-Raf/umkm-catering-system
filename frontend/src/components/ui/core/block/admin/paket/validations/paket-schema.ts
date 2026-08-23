import * as z from "zod"

export const PAKET_KATEGORI_VALUES = ["Nasi Box", "Prasmanan", "Snack", "Tumpeng"] as const
export const KATEGORI_ACARA_VALUES = ["Pernikahan", "Kantor", "Ulang Tahun", "Arisan", "Umum"] as const

export const MAX_PAKET_IMAGES = 8

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
    { message: "Foto utama wajib diisi" }
  )

/**
 * Schema for the shared Create/Update Paket form.
 * Allows File objects during upload; the dropzone folds resolved Cloudinary
 * URLs back into the field, so the API payload always carries URL strings.
 */
export const paketSchema = z.object({
  nama_paket: z.string().trim().min(1, "Nama paket wajib diisi"),
  kategori_paket: z.enum(PAKET_KATEGORI_VALUES, {
    message: "Pilih kategori paket",
  }),
  kategori_acara: z.enum(KATEGORI_ACARA_VALUES, {
    message: "Kategori acara tidak valid",
  }).nullable().optional(),
  harga_per_porsi: z
    .number({ message: "Harga per porsi wajib diisi" })
    .min(1000, "Harga minimal Rp 1.000"),
  min_order: z
    .number({ message: "Min. order wajib diisi" })
    .int("Harus bilangan bulat")
    .min(1, "Minimal 1"),
  kapasitas_produksi: z
    .number()
    .int("Harus bilangan bulat")
    .min(1, "Minimal 1")
    .nullable()
    .optional(),
  is_best_seller: z.boolean().optional(),
  menu_utama: z
    .array(z.string().trim().min(1, "Item menu tidak boleh kosong"))
    .min(1, "Minimal 1 menu utama"),
  menu_tambahan: z.array(z.string().trim().min(1, "Item tidak boleh kosong")).optional(),
  fasilitas_termasuk: z.array(z.string().trim().min(1, "Item tidak boleh kosong")).optional(),
  jenis_kemasan: z.string().trim().min(1, "Jenis kemasan wajib diisi").max(255),
  catatan_alergen: z.string().trim().nullable().optional(),
  deskripsi: z.string().trim().min(1, "Deskripsi wajib diisi"),
  thumbnail: requiredThumbnail,
  images: z.array(fileOrUrl).max(MAX_PAKET_IMAGES, `Maksimal ${MAX_PAKET_IMAGES} gambar`).optional(),
})

export type PaketFormValues = z.infer<typeof paketSchema>
export type PaketKategoriValue = (typeof PAKET_KATEGORI_VALUES)[number]
export type KategoriAcaraValue = (typeof KATEGORI_ACARA_VALUES)[number]
