import * as z from "zod"

export const PAKET_KATEGORI_VALUES = ["Nasi Box", "Prasmanan", "Snack", "Tumpeng"] as const
export const KATEGORI_ACARA_VALUES = ["Pernikahan", "Kantor", "Ulang Tahun", "Arisan", "Umum"] as const

export const MAX_PAKET_IMAGES = 8

/**
 * Schema for the shared Create/Update Paket form.
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
  thumbnail: z.string().trim().min(1, "Foto utama wajib diisi"),
  images: z
    .array(z.string().trim())
    .max(MAX_PAKET_IMAGES, `Maksimal ${MAX_PAKET_IMAGES} gambar`),
})

export type PaketFormValues = z.infer<typeof paketSchema>
export type PaketKategoriValue = (typeof PAKET_KATEGORI_VALUES)[number]
export type KategoriAcaraValue = (typeof KATEGORI_ACARA_VALUES)[number]
