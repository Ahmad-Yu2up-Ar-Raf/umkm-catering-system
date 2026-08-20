import { HTTPError } from "ky"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAppForm } from "@/hooks/use-form"
import { api } from "@/api/client"
import type { Paket } from "../../../paket/types/paket-types"
import { paketSchema } from "../validations/paket-schema"
import { toFormDefaults, toPaketPayload, type PaketPayload } from "../utils/paket-form-mapper"

const ADMIN_PAKET_KEY = ["admin", "paket"] as const

export type PaketFormReturnType = ReturnType<typeof usePaketForm>

async function getErrorMessage(error: unknown, fallback: string): Promise<string> {
  if (error instanceof HTTPError) {
    try {
      const body = (await error.response.clone().json()) as { message?: string }
      return body.message ?? fallback
    } catch {
      return fallback
    }
  }
  return error instanceof Error ? error.message : fallback
}

const defaultFormValues = {
  nama_paket: "",
  kategori_paket: "Nasi Box" as const,
  kategori_acara: null,
  harga_per_porsi: undefined,
  min_order: 1,
  kapasitas_produksi: undefined,
  is_best_seller: false,
  menu_utama: [] as string[],
  menu_tambahan: [] as string[],
  fasilitas_termasuk: [] as string[],
  jenis_kemasan: null,
  catatan_alergen: null,
  deskripsi: null,
  thumbnail: "",
  images: [] as string[],
}

/** Create mutation — invalidates admin + public paket queries on success. */
export function usePaketCreateMutation({ onSuccess }: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: PaketPayload) => {
      const res = await api.post("admin/paket", { json: payload }).json<{ message: string }>()
      return res.message
    },
    onMutate: () => toast.loading("Menyimpan paket...", { id: "paket-save" }),
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PAKET_KEY })
      queryClient.invalidateQueries({ queryKey: ["paket"] })
      toast.success(message || "Paket berhasil ditambahkan.", { id: "paket-save" })
      onSuccess?.()
    },
    onError: async (error) => {
      const message = await getErrorMessage(error, "Gagal menambahkan paket. Coba lagi.")
      toast.error(message, { id: "paket-save" })
      console.error("Create paket error:", error)
    },
  })
}

/** Update mutation — sends the full resolved payload; backend diffs images. */
export function usePaketUpdateMutation({ onSuccess }: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...payload }: PaketPayload & { id: number }) => {
      const res = await api.put(`admin/paket/${id}`, { json: payload }).json<{ message: string }>()
      return res.message
    },
    onMutate: () => toast.loading("Memperbarui paket...", { id: "paket-save" }),
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PAKET_KEY })
      queryClient.invalidateQueries({ queryKey: ["paket"] })
      toast.success(message || "Paket berhasil diperbarui.", { id: "paket-save" })
      onSuccess?.()
    },
    onError: async (error) => {
      const message = await getErrorMessage(error, "Gagal memperbarui paket. Coba lagi.")
      toast.error(message, { id: "paket-save" })
      console.error("Update paket error:", error)
    },
  })
}

/** Delete mutation — guarded client-side as well (pesanan_count > 0 blocks). */
export function usePaketDeleteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (paket: Paket) => {
      const res = await api.delete(`admin/paket/${paket.id}`).json<{ message: string }>()
      return { paket, message: res.message }
    },
    onMutate: () => toast.loading("Menghapus paket...", { id: "paket-delete" }),
    onSuccess: ({ paket, message }) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PAKET_KEY })
      queryClient.invalidateQueries({ queryKey: ["paket"] })
      toast.success(message || `Paket “${paket.nama_paket}” dihapus.`, { id: "paket-delete" })
    },
    onError: async (error) => {
      const message = await getErrorMessage(error, "Gagal menghapus paket. Coba lagi.")
      toast.error(message, { id: "paket-delete" })
      console.error("Delete paket error:", error)
    },
  })
}

/**
 * Shared Create/Update form. Files are already uploaded at selection time by
 * the mediadrop fields, so submit is purely synchronous JSON — the mutation
 * can fire immediately and its toast lands right away.
 */
export function usePaketForm({
  paket,
  onSuccessCallback,
}: {
  paket?: Paket
  onSuccessCallback?: () => void
} = {}) {
  const paketId = paket?.id
  const { mutateAsync: createPaket } = usePaketCreateMutation({ onSuccess: onSuccessCallback })
  const { mutateAsync: updatePaket } = usePaketUpdateMutation({ onSuccess: onSuccessCallback })

  return useAppForm({
    validators: {
      onChange: paketSchema,
      onSubmit: paketSchema,
    },
    defaultValues: paket ? toFormDefaults(paket) : defaultFormValues,
    onSubmit: async ({ value }) => {
      const payload = toPaketPayload(value)
      if (paketId) {
        await updatePaket({ id: paketId, ...payload })
      } else {
        await createPaket(payload)
      }
    },
  })
}
