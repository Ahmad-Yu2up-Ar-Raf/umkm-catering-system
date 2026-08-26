import { HTTPError } from "ky"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { pesananService } from "@/services/pesanan-service"
import type {
  PesananCreatePayload,
  PesananUpdatePayload,
} from "../types/pesanan-types"

const ADMIN_PESANAN_KEY = ["admin", "pesanan"] as const
const STRUK_KEY = ["struk"] as const

/**
 * Extract the most descriptive error text available — backend JSON message
 * first, then HTTP status code, then the raw error. Never silent.
 */
async function getErrorMessage(error: unknown, fallback: string): Promise<string> {
  if (error instanceof HTTPError) {
    const status = error.response.status
    try {
      const body = (await error.response.clone().json()) as { message?: string }
      return body.message ?? `HTTP ${status} — ${fallback}`
    } catch {
      return `HTTP ${status} — ${fallback}`
    }
  }
  if (error instanceof TypeError) {
    // fetch-level failure: network drop, CORS block, aborted connection
    return `Koneksi gagal (${error.message})`
  }
  return error instanceof Error ? error.message : fallback
}

/** Create mutation — server snapshots the price and computes total_harga. */
export function usePesananCreateMutation({ onSuccess }: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    retry: false,
    mutationFn: async (payload: PesananCreatePayload) => {
      const res = await pesananService.create(payload)
      // Return the server-generated nomor_struk for the success toast.
      return res.data.nomor_struk
    },
    onMutate: async () => {
      toast.loading("Menyimpan pesanan...", { id: "pesanan-save" })
      await queryClient.cancelQueries({ queryKey: ADMIN_PESANAN_KEY })
    },
    onSuccess: (nomorStruk) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PESANAN_KEY })
      toast.success(`Pesanan dibuat — struk ${nomorStruk}.`, { id: "pesanan-save" })
      onSuccess?.()
    },
    onError: async (error) => {
      const message = await getErrorMessage(error, "Gagal menyimpan pesanan. Coba lagi.")
      toast.error(message, { id: "pesanan-save" })
      console.error("Create pesanan error:", error)
    },
  })
}

/** Update mutation — status_pesanan/catatan ONLY; financials are immutable. */
export function usePesananUpdateMutation({ onSuccess }: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    retry: false,
    mutationFn: async ({ id, ...payload }: PesananUpdatePayload & { id: number }) => {
      const res = await pesananService.update(id, payload)
      return res.message
    },
    onMutate: async () => {
      toast.loading("Memperbarui pesanan...", { id: "pesanan-save" })
      await queryClient.cancelQueries({ queryKey: ADMIN_PESANAN_KEY })
    },
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PESANAN_KEY })
      queryClient.invalidateQueries({ queryKey: STRUK_KEY })
      toast.success(message || "Pesanan berhasil diperbarui.", { id: "pesanan-save" })
      onSuccess?.()
    },
    onError: async (error) => {
      const message = await getErrorMessage(error, "Gagal memperbarui pesanan. Coba lagi.")
      toast.error(message, { id: "pesanan-save" })
      console.error("Update pesanan error:", error)
    },
  })
}

/** Delete mutation — permanent; invalidates the list + any cached struk payloads. */
export function usePesananDeleteMutation({ onSuccess }: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    retry: false,
    mutationFn: async ({ id }: { id: number }) => {
      const res = await pesananService.remove(id)
      return res.message
    },
    onMutate: async ({ id }) => {
      toast.loading("Menghapus pesanan...", { id: `pesanan-delete-${id}` })
      await queryClient.cancelQueries({ queryKey: ADMIN_PESANAN_KEY })
    },
    onSuccess: (message, { id }) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PESANAN_KEY })
      queryClient.invalidateQueries({ queryKey: STRUK_KEY })
      toast.success(message || "Pesanan berhasil dihapus.", {
        id: `pesanan-delete-${id}`,
      })
      onSuccess?.()
    },
    onError: async (error, { id }) => {
      const message = await getErrorMessage(error, "Gagal menghapus pesanan. Coba lagi.")
      toast.error(message, { id: `pesanan-delete-${id}` })
      console.error("Delete pesanan error:", error)
    },
  })
}
