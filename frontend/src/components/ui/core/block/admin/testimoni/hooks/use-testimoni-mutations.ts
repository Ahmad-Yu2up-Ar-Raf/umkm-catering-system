import { HTTPError } from "ky"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { playDelete, playError, playSuccess } from "@/lib/audio-feedback"
import { useAppForm } from "@/hooks/use-form"
import { api } from "@/api/client"
import type { Testimoni } from "../types/testimoni-types"
import { testimoniSchema, type TestimoniFormValues } from "../validations/testimoni-schema"
import { toFormDefaults, toTestimoniPayload, type TestimoniPayload } from "../utils/testimoni-form-mapper"

const ADMIN_TESTIMONI_KEY = ["admin", "testimoni"] as const

export type TestimoniFormReturnType = ReturnType<typeof useTestimoniForm>

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
    return `Koneksi gagal (${error.message})`
  }
  return error instanceof Error ? error.message : fallback
}

const defaultFormValues: TestimoniFormValues = {
  nama: "",
  pesanan: "",
  acara: "",
  lokasi: "",
  tanggal_acara: null,
  visibility: "private",
  rating: 5,
  paket_id: null as unknown as number,
}

/** Create mutation — invalidates the admin testimoni list on success. */
export function useTestimoniCreateMutation({ onSuccess }: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    retry: false,
    mutationFn: async (payload: TestimoniPayload) => {
      const res = await api.post("admin/testimoni", { json: payload }).json<{ message: string }>()
      return res.message
    },
    onMutate: async () => {
      toast.loading("Menyimpan testimoni...", { id: "testimoni-save" })
      await queryClient.cancelQueries({ queryKey: ADMIN_TESTIMONI_KEY })
      const previousTestimoni = queryClient.getQueryData(ADMIN_TESTIMONI_KEY)
      return { previousTestimoni }
    },
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_TESTIMONI_KEY })
      toast.success(message || "Testimoni berhasil ditambahkan.", { id: "testimoni-save" })
      playSuccess()
      onSuccess?.()
    },
    onError: async (error, _variables, context) => {
      if (context?.previousTestimoni) {
        queryClient.setQueryData(ADMIN_TESTIMONI_KEY, context.previousTestimoni)
      }
      const message = await getErrorMessage(error, "Gagal menambahkan testimoni. Coba lagi.")
      toast.error(message, { id: "testimoni-save" })
      playError()
      console.error("Create testimoni error:", error)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_TESTIMONI_KEY })
    },
  })
}

/** Update mutation — sends the full resolved payload; backend purges removed URLs. */
export function useTestimoniUpdateMutation({ onSuccess }: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    retry: false,
    mutationFn: async ({ id, ...payload }: TestimoniPayload & { id: number }) => {
      const res = await api.put(`admin/testimoni/${id}`, { json: payload }).json<{ message: string }>()
      return res.message
    },
    onMutate: async (updatedTestimoni) => {
      toast.loading("Memperbarui testimoni...", { id: "testimoni-save" })
      await queryClient.cancelQueries({ queryKey: ADMIN_TESTIMONI_KEY })
      const previousTestimoni = queryClient.getQueryData(ADMIN_TESTIMONI_KEY)

      if (previousTestimoni) {
        queryClient.setQueryData(ADMIN_TESTIMONI_KEY, (old: { items: Testimoni[] } | undefined) => {
          if (!old?.items) return old
          return {
            ...old,
            items: old.items.map((item: Testimoni) =>
              item.id === updatedTestimoni.id ? { ...item, ...updatedTestimoni } : item
            ),
          }
        })
      }

      return { previousTestimoni }
    },
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_TESTIMONI_KEY })
      toast.success(message || "Testimoni berhasil diperbarui.", { id: "testimoni-save" })
      playSuccess()
      onSuccess?.()
    },
    onError: async (error, _variables, context) => {
      if (context?.previousTestimoni) {
        queryClient.setQueryData(ADMIN_TESTIMONI_KEY, context.previousTestimoni)
      }
      const message = await getErrorMessage(error, "Gagal memperbarui testimoni. Coba lagi.")
      toast.error(message, { id: "testimoni-save" })
      playError()
      console.error("Update testimoni error:", error)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_TESTIMONI_KEY })
    },
  })
}

/** Delete mutation. */
export function useTestimoniDeleteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    retry: false,
    mutationFn: async (testimoni: Testimoni) => {
      const res = await api.delete(`admin/testimoni/${testimoni.id}`).json<{ message: string }>()
      return { testimoni, message: res.message }
    },
    onMutate: async (deletedTestimoni) => {
      toast.loading("Menghapus testimoni...", { id: "testimoni-delete" })
      await queryClient.cancelQueries({ queryKey: ADMIN_TESTIMONI_KEY })
      const previousTestimoni = queryClient.getQueryData(ADMIN_TESTIMONI_KEY)

      if (previousTestimoni) {
        queryClient.setQueryData(ADMIN_TESTIMONI_KEY, (old: { items: Testimoni[] } | undefined) => {
          if (!old?.items) return old
          return {
            ...old,
            items: old.items.filter((item: Testimoni) => item.id !== deletedTestimoni.id),
          }
        })
      }

      return { previousTestimoni }
    },
    onSuccess: ({ testimoni, message }) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_TESTIMONI_KEY })
      toast.success(message || `Testimoni “${testimoni.nama}” dihapus.`, { id: "testimoni-delete" })
      playDelete()
    },
    onError: async (error, deletedTestimoni, context) => {
      if (error instanceof HTTPError && error.response.status === 404) {
        queryClient.invalidateQueries({ queryKey: ADMIN_TESTIMONI_KEY })
        toast.success(`Testimoni “${deletedTestimoni.nama}” sudah terhapus.`, { id: "testimoni-delete" })
        playDelete()
        return
      }
      const message = await getErrorMessage(error, "Gagal menghapus testimoni. Coba lagi.")
      toast.error(message, { id: "testimoni-delete" })
      playError()
      if (context?.previousTestimoni) {
        queryClient.setQueryData(ADMIN_TESTIMONI_KEY, context.previousTestimoni)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_TESTIMONI_KEY })
    },
  })
}

/** Bulk update — single whitelisted field (`visibility`) for many testimoni IDs. */
export function useTestimoniBulkUpdateMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    retry: false,
    mutationFn: async (payload: { ids: number[]; field: string; value: string }) => {
      const res = await api.post("admin/testimoni/bulk-update", { json: payload }).json<{ message: string }>()
      return res.message
    },
    onMutate: async () => {
      toast.loading("Memperbarui testimoni...", { id: "testimoni-bulk-update" })
      await queryClient.cancelQueries({ queryKey: ADMIN_TESTIMONI_KEY })
    },
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_TESTIMONI_KEY })
      toast.success(message || "Testimoni berhasil diperbarui.", { id: "testimoni-bulk-update" })
      playSuccess()
    },
    onError: async (error) => {
      const message = await getErrorMessage(error, "Gagal memperbarui testimoni. Coba lagi.")
      toast.error(message, { id: "testimoni-bulk-update" })
      playError()
      console.error("Bulk update testimoni error:", error)
    },
  })
}

/** Bulk delete — many testimoni IDs. */
export function useTestimoniBulkDeleteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    retry: false,
    mutationFn: async (payload: { ids: number[] }) => {
      const res = await api.post("admin/testimoni/bulk-delete", { json: payload }).json<{ message: string }>()
      return res.message
    },
    onMutate: async () => {
      toast.loading("Menghapus testimoni...", { id: "testimoni-bulk-delete" })
      await queryClient.cancelQueries({ queryKey: ADMIN_TESTIMONI_KEY })
    },
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_TESTIMONI_KEY })
      toast.success(message || "Testimoni berhasil dihapus.", { id: "testimoni-bulk-delete" })
      playDelete()
    },
    onError: async (error) => {
      const message = await getErrorMessage(error, "Gagal menghapus testimoni. Coba lagi.")
      toast.error(message, { id: "testimoni-bulk-delete" })
      playError()
      console.error("Bulk delete testimoni error:", error)
    },
  })
}

/**
 * Shared Create/Update form. Text-only payloads go straight to the API —
 * no media pipeline since review photos were removed product-wide.
 */
export function useTestimoniForm({
  testimoni,
  onSuccessCallback,
}: {
  testimoni?: Testimoni
  onSuccessCallback?: () => void
} = {}) {
  const testimoniId = testimoni?.id
  const { mutateAsync: createTestimoni } = useTestimoniCreateMutation({ onSuccess: onSuccessCallback })
  const { mutateAsync: updateTestimoni } = useTestimoniUpdateMutation({ onSuccess: onSuccessCallback })

  return useAppForm({
    validators: {
      onChange: testimoniSchema,
      onSubmit: testimoniSchema,
    },
    defaultValues: testimoni ? toFormDefaults(testimoni) : defaultFormValues,
    onSubmit: async ({ value }) => {
      const payload = toTestimoniPayload(value)
      if (testimoniId) {
        await updateTestimoni({ id: testimoniId, ...payload })
      } else {
        await createTestimoni(payload)
      }
    },
  })
}
