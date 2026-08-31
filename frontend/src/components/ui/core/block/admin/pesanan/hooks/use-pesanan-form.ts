"use client"

import { useAppForm } from "@/hooks/use-form"
import { usePesananCreateMutation, usePesananUpdateMutation } from "./use-pesanan-mutations"
import {
  pesananCreateSchema,
  type PesananCreateFormValues,
} from "../schemas/pesanan-schema"
import type { Pesanan } from "../types/pesanan-types"

const DEFAULT_CREATE_VALUES: PesananCreateFormValues = {
  nama_pemesan: "",
  no_telepon: "",
  paket_id: null,
  jumlah_paket: 1,
  detail_tambahan: [],
  biaya_tambahan: 0,
  catatan: null,
}

export type PesananFormReturnType = ReturnType<typeof usePesananForm>

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
    paket_id: values.paket_id!,
    jumlah_paket: values.jumlah_paket,
    detail_tambahan: values.detail_tambahan ?? [],
    biaya_tambahan: values.biaya_tambahan ?? 0,
    catatan: values.catatan?.trim() || null,
  }
}

/** Edit drawer defaults derive straight from the PesananResource row. */
export function toFormDefaults(pesanan: Pesanan): PesananCreateFormValues {
  return {
    nama_pemesan: pesanan.nama_pemesan,
    no_telepon: pesanan.no_telepon,
    paket_id: pesanan.paket_id,
    jumlah_paket: pesanan.jumlah_paket,
    detail_tambahan: pesanan.detail_tambahan ?? [],
    biaya_tambahan: Number(pesanan.biaya_tambahan),
    catatan: pesanan.catatan,
  }
}

/**
 * Shared Create/Update form hook for Pesanan.
 * Mirrors usePaketForm exactly — single hook handles both create & update.
 */
export function usePesananForm({
  pesanan,
  onSuccessCallback,
}: {
  pesanan?: Pesanan
  onSuccessCallback?: () => void
} = {}) {
  const pesananId = pesanan?.id
  const { mutateAsync: createPesanan } = usePesananCreateMutation({ onSuccess: onSuccessCallback })
  const { mutateAsync: updatePesanan } = usePesananUpdateMutation({ onSuccess: onSuccessCallback })

  return useAppForm({
    validators: {
      onChange: pesananCreateSchema,
      onSubmit: pesananCreateSchema,
    },
    defaultValues: pesanan ? toFormDefaults(pesanan) : DEFAULT_CREATE_VALUES,
    onSubmit: async ({ value }) => {
      const payload = toPesananCreatePayload(value as PesananCreateFormValues)
      if (pesananId) {
        await updatePesanan({ id: pesananId, ...payload })
      } else {
        await createPesanan(payload)
      }
    },
  })
}