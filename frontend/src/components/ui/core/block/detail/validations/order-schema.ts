import * as z from "zod"
import { isMatch, isValid, parse, startOfToday } from "date-fns"

/** Package runtime values injected at form-creation time (per-package validation). */
export interface OrderSchemaParams {
  capacity: number | null // null → no upper bound
  addonOptions: string[] // vm.menuExtra ?? []
}

const YYYY_MM_DD = /^\d{4}-\d{2}-\d{2}$/

const jumlahPorsiBase = z
  .number({ message: "Jumlah porsi wajib diisi" })
  .int("Jumlah porsi harus bilangan bulat")
  .min(1, "Minimal 1 porsi")

export const createOrderSchema = ({
  capacity,
  addonOptions,
}: OrderSchemaParams) =>
  z.object({
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
    // Strict min of 1; production capacity bound applied only when the
    // package declares one (null/0 → unlimited on the public inquiry form).
    jumlah_porsi:
      capacity != null && capacity > 0
        ? jumlahPorsiBase.max(capacity, `Maksimal ${capacity} porsi`)
        : jumlahPorsiBase,
    lauk_pelengkap: z
      .array(z.string())
      .max(addonOptions.length, "Pilihan tidak valid"),
    catatan: z.string().max(500, "Catatan maksimal 500 karakter").trim(),
  })

export type OrderFormValues = z.infer<ReturnType<typeof createOrderSchema>>