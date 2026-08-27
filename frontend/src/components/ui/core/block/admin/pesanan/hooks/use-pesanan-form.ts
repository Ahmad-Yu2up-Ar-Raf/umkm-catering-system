import { useAppForm } from "@/hooks/use-form"
import {
  pesananCreateSchema,
  validateAgainstPaket,
  type PesananCreateFormValues,
} from "../schemas/pesanan-schema"

const EMPTY: PesananCreateFormValues = {
  nama_pemesan: "",
  no_telepon: "",
  paket_id: Number.NaN,
  jumlah_paket: 1,
  detail_tambahan: [],
  biaya_tambahan: 0,
  catatan: null,
}

export type PesananCreateDrawerFormApi = ReturnType<typeof usePesananCreateForm>

/** Raw form values → wire payload. No image/file logic in this domain. */
export function toPesananCreatePayload(
  values: PesananCreateFormValues
): {
  nama_pemesan: string
  no_telepon: string
  paket_id: number
  jumlah_paket: number
  detail_tambahan: string[]
  biaya_tambahan: number
  catatan: string | null
} {
  return {
    nama_pemesan: values.nama_pemesan.trim(),
    no_telepon: values.no_telepon.trim(),
    paket_id: values.paket_id,
    jumlah_paket: values.jumlah_paket,
    detail_tambahan: values.detail_tambahan ?? [],
    biaya_tambahan: values.biaya_tambahan ?? 0,
    catatan: values.catatan?.trim() || null,
  }
}

export function usePesananCreateForm(options: {
  onSuccessCallback: () => void
}) {
  return useAppForm({
    defaultValues: EMPTY,
    validators: { onSubmit: pesananCreateSchema },
    onSubmit: async ({ value: _value, formApi }) => {
      void formApi
      void validateAgainstPaket
      options.onSuccessCallback()
    },
  })
}

/** Edit drawer defaults derive straight from the PesananResource row. */
export function toFormDefaults(pesanan: {
  status_pesanan: string
  catatan: string | null
}): { status_pesanan: string; catatan: string | null } {
  return {
    status_pesanan: pesanan.status_pesanan,
    catatan: pesanan.catatan,
  }
}