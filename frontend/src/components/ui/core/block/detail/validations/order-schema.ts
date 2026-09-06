import * as z from "zod"
import { isMatch, isValid, parse, startOfToday } from "date-fns"

/** Package runtime values injected at form-creation time (per-package validation). */
export interface OrderSchemaParams {
  capacity: number | null // null → no upper bound
  minOrder: number // vm.minOrder — mirrors PesananService::memenuhiMinOrder
  addonOptions: string[] // vm.menuExtra ?? []
}

const YYYY_MM_DD = /^\d{4}-\d{2}-\d{2}$/

const createJumlahSchema = (minOrder: number, capacity: number | null) => {
  let s = z
    .number({ message: "Jumlah porsi wajib diisi" })
    .int("Jumlah porsi harus bilangan bulat")
    .min(minOrder, `Minimal ${minOrder} porsi`)
  if (capacity != null && capacity > 0) {
    s = s.max(capacity, `Maksimal ${capacity} porsi`)
  }
  return s
}

export const createOrderSchema = ({
  capacity,
  minOrder,
  addonOptions,
}: OrderSchemaParams) =>
  z.object({
    nama: z.string().trim().min(2, "Nama wajib diisi"),
    no_telepon: z
      .string()
      .trim()
      .min(8, "Nomor telepon wajib diisi")
      .max(20, "Nomor telepon maksimal 20 karakter")
      .regex(/^[0-9+()\-\\s]+$/, "Nomor telepon tidak valid"),
    lokasi_acara: z.string().trim().min(5, "Lokasi acara wajib diisi"),
    tanggal_acara: z
      .string()
      .trim()
      .refine(
        (v) =>
          YYYY_MM_DD.test(v) && isValid(parse(v, "yyyy-MM-dd", new Date())),
        { message: "Tanggal acara tidak valid" }
      )
      .refine(
        (v) => {
          const date = parse(v, "yyyy-MM-dd", new Date())
          return isMatch(v, "yyyy-MM-dd") && date >= startOfToday()
        },
        { message: "Tanggal acara tidak boleh di masa lalu" }
      ),
    jumlah_porsi: createJumlahSchema(minOrder, capacity),
    lauk_pelengkap: z
      .array(z.string())
      .max(addonOptions.length, "Pilihan tidak valid"),
    catatan: z.string().max(500, "Catatan maksimal 500 karakter").trim(),
  })

export type OrderFormValues = z.infer<ReturnType<typeof createOrderSchema>>