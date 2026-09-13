import type { Testimoni } from "../types/testimoni-types"
import type { TestimoniFormValues } from "../validations/testimoni-schema"
import { deepEqual } from "@/lib/deep-equal"

export interface TestimoniPayload {
  nama: string
  pesanan: string
  acara: string
  lokasi: string
  tanggal_acara: string | null
  visibility: TestimoniFormValues["visibility"]
  rating: number
  paket_id: number
}

const FILE_SENTINEL = "__file_upload__"

const normalizeFormValue = (value: unknown): unknown => {
  if (typeof globalThis.File !== "undefined" && value instanceof globalThis.File) {
    return FILE_SENTINEL
  }
  if (Array.isArray(value)) return value.map(normalizeFormValue)
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {}
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        result[key] = normalizeFormValue((value as Record<string, unknown>)[key])
      }
    }
    return result
  }
  return value
}

/** Map Testimoni row into form defaults. */
export function toFormDefaults(testimoni: Testimoni): TestimoniFormValues {
  return {
    nama: testimoni.nama,
    pesanan: testimoni.pesanan,
    acara: testimoni.acara,
    lokasi: testimoni.lokasi,
    visibility: testimoni.visibility ?? "private",
    rating: testimoni.rating ?? 5,
    tanggal_acara: testimoni.tanggal_acara ?? null,
    paket_id: testimoni.paket_id,
  }
}

/** Compare two form value objects for equality, normalizing Files to a sentinel. */
export function areFormValuesEqual(a: unknown, b: unknown): boolean {
  return deepEqual(normalizeFormValue(a), normalizeFormValue(b))
}

/** Coerce validated form values into API payload. */
export function toTestimoniPayload(value: TestimoniFormValues): TestimoniPayload {
  return {
    nama: value.nama.trim(),
    pesanan: value.pesanan.trim(),
    acara: value.acara.trim(),
    lokasi: value.lokasi.trim(),
    visibility: value.visibility,
    rating: value.rating,
    tanggal_acara: value.tanggal_acara || null,
    paket_id: value.paket_id,
  }
}
