"use client"

import { useAppForm } from "@/hooks/use-form"
import { usePesananCreateMutation, usePesananUpdateMutation } from "./use-pesanan-mutations"
import {
  pesananCreateSchema,
  type PesananCreateFormValues,
} from "../schemas/pesanan-schema"
import type { Pesanan } from "../types/pesanan-types"

export type PesananFormReturnType = ReturnType<typeof usePesananForm>
export type PesananCreateDrawerFormApi = ReturnType<typeof useAppForm>

/** Raw form values → wire payload. No image/file logic in this domain. */
export function toPesananCreatePayload(
  values: PesananCreateFormValues
): {
  nama_pemesan: string
  no_telepon: string
  alamat: string | null
  paket_id: number
  jumlah_paket: number
  tanggal_acara: string
  status_pesanan?: PesananCreateFormValues["status_pesanan"]
  menu_tambahan: string[]
  detail_tambahan: string[]
  biaya_tambahan: number | null
  catatan: string | null
} {
  return {
    nama_pemesan: values.nama_pemesan.trim(),
    no_telepon: values.no_telepon.trim(),
    alamat: values.alamat?.trim() || null,
    paket_id: values.paket_id!,
    jumlah_paket: values.jumlah_paket!,
    tanggal_acara: values.tanggal_acara,
    ...(values.status_pesanan ? { status_pesanan: values.status_pesanan } : {}),
    ...(values.metode_pembayaran ? { metode_pembayaran: values.metode_pembayaran } : {}),
    menu_tambahan: values.menu_tambahan ?? [],
    detail_tambahan: values.detail_tambahan ?? [],
    biaya_tambahan: values.biaya_tambahan ?? null,
    catatan: values.catatan?.trim() || null,
  }
}

/** Edit drawer defaults derive straight from the PesananResource row. */
export function toFormDefaults(pesanan: Pesanan): PesananCreateFormValues {
  return {
    nama_pemesan: pesanan.nama_pemesan,
    no_telepon: pesanan.no_telepon,
    alamat: pesanan.alamat ?? null,
    paket_id: pesanan.paket_id,
    jumlah_paket: pesanan.jumlah_paket,
    tanggal_acara: pesanan.tanggal_acara ?? "",
    status_pesanan: pesanan.status_pesanan ?? null,
    metode_pembayaran: (pesanan as unknown as { metode_pembayaran?: PesananCreateFormValues["metode_pembayaran"] }).metode_pembayaran ?? null,
    menu_tambahan: pesanan.menu_tambahan ?? [],
    detail_tambahan: pesanan.detail_tambahan ?? [],
    biaya_tambahan: pesanan.biaya_tambahan != null ? Number(pesanan.biaya_tambahan) : null,
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
    defaultValues: pesanan
      ? toFormDefaults(pesanan)
      : {
          nama_pemesan: "",
          no_telepon: "",
          alamat: null as string | null,
          paket_id: null as number | null,
          jumlah_paket: null as number | null,
          tanggal_acara: "",
          status_pesanan: null as unknown as (typeof import("../types/pesanan-types").PESANAN_STATUSES)[number] | null,
          metode_pembayaran: null as unknown as PesananCreateFormValues["metode_pembayaran"],
          menu_tambahan: [] as string[],
          detail_tambahan: [],
          biaya_tambahan: null as number | null,
          catatan: null as string | null,
        },
    onSubmit: async ({ value }) => {
      const payload = toPesananCreatePayload(value)
      if (pesananId) {
        await updatePesanan({ id: pesananId, ...payload })
      } else {
        await createPesanan(payload)
      }
    },
  })
}