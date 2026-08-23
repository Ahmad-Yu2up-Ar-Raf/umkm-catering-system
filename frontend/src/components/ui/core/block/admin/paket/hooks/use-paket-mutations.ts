import { HTTPError } from "ky"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAppForm } from "@/hooks/use-form"
import { adjustActiveUploads } from "@/store/paket-upload-store"
import {
  cloudinaryTransport,
  toCanonicalCloudinaryUrl,
  purgeCloudinaryImages,
} from "@/lib/cloudinary"
import { api } from "@/api/client"
import type { Paket } from "../../../paket/types/paket-types"
import { paketSchema, type PaketFormValues } from "../validations/paket-schema"
import { toFormDefaults, toPaketPayload, type PaketPayload } from "../utils/paket-form-mapper"

const ADMIN_PAKET_KEY = ["admin", "paket"] as const

export type PaketFormReturnType = ReturnType<typeof usePaketForm>

/**
 * Fire-and-forget orphan sweep: deletes Cloudinary assets that were uploaded
 * during a draft session but never committed (drawer discarded/cancelled).
 * Delegates to the shared lib helper so the dropzone fragment can reuse it.
 */
export function purgeUncommittedPaketImages(urls: string[]): void {
  purgeCloudinaryImages(urls)
}

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

const defaultFormValues = {
  nama_paket: "",
  kategori_paket: null, // Set null secara eksplisit
  kategori_acara: null,
  harga_per_porsi: null, // Set null secara eksplisit
  min_order: null, // Set null secara eksplisit
  kapasitas_produksi: null,
  is_best_seller: false,
  menu_utama: [],
  menu_tambahan: [],
  fasilitas_termasuk: [],
  jenis_kemasan: "",
  catatan_alergen: null,
  deskripsi: "",
  thumbnail: "",
  images: [],
}

/** Create mutation — invalidates admin + public paket queries on success. */
export function usePaketCreateMutation({ onSuccess }: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    // Mutations must resolve exactly once — no silent retry loops that
    // present as an infinite spinner.
    retry: false,
    mutationFn: async (payload: PaketPayload) => {
      const res = await api.post("admin/paket", { json: payload }).json<{ message: string }>()
      return res.message
    },
    onMutate: async () => {
      toast.loading("Menyimpan paket...", { id: "paket-save" })
      await queryClient.cancelQueries({ queryKey: ADMIN_PAKET_KEY })
      const previousPaket = queryClient.getQueryData(ADMIN_PAKET_KEY)
      return { previousPaket }
    },
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PAKET_KEY })
      queryClient.invalidateQueries({ queryKey: ["paket"] })
      toast.success(message || "Paket berhasil ditambahkan.", { id: "paket-save" })
      onSuccess?.()
    },
    onError: async (error, _variables, context) => {
      if (context?.previousPaket) {
        queryClient.setQueryData(ADMIN_PAKET_KEY, context.previousPaket)
      }
      const message = await getErrorMessage(error, "Gagal menambahkan paket. Coba lagi.")
      toast.error(message, { id: "paket-save" })
      console.error("Create paket error:", error)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PAKET_KEY })
    },
  })
}

/** Update mutation — sends the full resolved payload; backend diffs images. */
export function usePaketUpdateMutation({ onSuccess }: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    retry: false,
    mutationFn: async ({ id, ...payload }: PaketPayload & { id: number }) => {
      const res = await api.put(`admin/paket/${id}`, { json: payload }).json<{ message: string }>()
      return res.message
    },
    onMutate: async (updatedPaket) => {
      toast.loading("Memperbarui paket...", { id: "paket-save" })
      await queryClient.cancelQueries({ queryKey: ADMIN_PAKET_KEY })
      const previousPaket = queryClient.getQueryData(ADMIN_PAKET_KEY)

      if (previousPaket) {
        queryClient.setQueryData(ADMIN_PAKET_KEY, (old: { items: Paket[] } | undefined) => {
          if (!old?.items) return old
          return {
            ...old,
            items: old.items.map((item: Paket) =>
              item.id === updatedPaket.id ? { ...item, ...updatedPaket } : item
            )
          }
        })
      }

      return { previousPaket }
    },
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PAKET_KEY })
      queryClient.invalidateQueries({ queryKey: ["paket"] })
      toast.success(message || "Paket berhasil diperbarui.", { id: "paket-save" })
      onSuccess?.()
    },
    onError: async (error, _variables, context) => {
      if (context?.previousPaket) {
        queryClient.setQueryData(ADMIN_PAKET_KEY, context.previousPaket)
      }
      const message = await getErrorMessage(error, "Gagal memperbarui paket. Coba lagi.")
      toast.error(message, { id: "paket-save" })
      console.error("Update paket error:", error)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PAKET_KEY })
    },
  })
}

/** Delete mutation — guarded client-side as well (pesanan_count > 0 blocks). */
export function usePaketDeleteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    retry: false,
    mutationFn: async (paket: Paket) => {
      console.info("[paket-delete] request", { id: paket.id, name: paket.nama_paket })
      try {
        const res = await api.delete(`admin/paket/${paket.id}`).json<{ message: string }>()
        console.info("[paket-delete] success", { id: paket.id, message: res.message })
        return { paket, message: res.message }
      } catch (err) {
        console.error("[paket-delete] network/http error caught in mutationFn:", err)
        if (err instanceof HTTPError) {
          try {
            const errorBody = await err.response.json()
            console.error("[paket-delete] error response body:", errorBody)
          } catch (bodyErr) {
            console.error("[paket-delete] failed to parse error response body as json:", bodyErr)
          }
        }
        throw err
      }
    },
    onMutate: async (deletedPaket) => {
      toast.loading("Menghapus paket...", { id: "paket-delete" })
      await queryClient.cancelQueries({ queryKey: ADMIN_PAKET_KEY })
      const previousPaket = queryClient.getQueryData(ADMIN_PAKET_KEY)

      if (previousPaket) {
        queryClient.setQueryData(ADMIN_PAKET_KEY, (old: { items: Paket[] } | undefined) => {
          if (!old?.items) return old
          return {
            ...old,
            items: old.items.filter((item: Paket) => item.id !== deletedPaket.id)
          }
        })
      }

      return { previousPaket }
    },
    onSuccess: ({ paket, message }) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PAKET_KEY })
      queryClient.invalidateQueries({ queryKey: ["paket"] })
      toast.success(message || `Paket “${paket.nama_paket}” dihapus.`, { id: "paket-delete" })
    },
    onError: async (error, deletedPaket, context) => {
      console.error("[paket-delete] onError triggered with error:", error)
      if (error instanceof HTTPError && error.response.status === 404) {
        console.warn("[paket-delete] already gone server-side", { id: deletedPaket.id })
        queryClient.invalidateQueries({ queryKey: ADMIN_PAKET_KEY })
        toast.success(`Paket “${deletedPaket.nama_paket}” sudah terhapus.`, { id: "paket-delete" })
        return
      }
      const message = await getErrorMessage(error, "Gagal menghapus paket. Coba lagi.")
      console.error("[paket-delete] failed resolved message:", message, { id: deletedPaket.id }, error)
      toast.error(message, { id: "paket-delete" })
      if (context?.previousPaket) {
        queryClient.setQueryData(ADMIN_PAKET_KEY, context.previousPaket)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PAKET_KEY })
    },
  })
}

/**
 * Upload one deferred `File` to Cloudinary and return its canonical URL.
 * Bumps the shared upload counter so the footer shows "Mengunggah gambar…"
 * while submit-phase uploads run.
 */
async function uploadDeferredImage(file: File): Promise<string> {
  adjustActiveUploads(1)
  try {
    const wrapper = { file } as Parameters<typeof cloudinaryTransport.upload>[0]
    const { response } = await cloudinaryTransport.upload(wrapper, {
      onProgress: () => {},
      signal: new AbortController().signal,
    })
    return toCanonicalCloudinaryUrl(
      response as {
        public_id?: string
        version?: string | number
        format?: string
        secure_url?: string
      }
    )
  } finally {
    adjustActiveUploads(-1)
  }
}

/**
 * Resolve every pending `File` (thumbnail + gallery together) to Cloudinary
 * URLs — fully parallel so N images upload concurrently.
 */
async function resolveUploads(value: PaketFormValues): Promise<PaketFormValues> {
  const jobs: Array<Promise<string | File>> = []

  if (value.thumbnail && typeof value.thumbnail !== "string") {
    jobs.push(uploadDeferredImage(value.thumbnail))
  } else if (value.thumbnail) {
    jobs.push(Promise.resolve(value.thumbnail))
  }

  const imageJobs = (value.images ?? []).map((img) =>
    typeof img === "string" ? Promise.resolve(img) : uploadDeferredImage(img)
  )

  const [thumbnail, ...rest] = await Promise.all([...jobs, ...imageJobs])

  return { ...value, thumbnail, images: rest as string[] }
}

/**
 * Shared Create/Update form. Images are held as raw `File` objects while the
 * user edits (local previews only — ZERO network traffic), then uploaded to
 * Cloudinary here during submit. Cancelling a draft or removing a tile never
 * leaves remote garbage: nothing was ever uploaded.
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
      // EAGER feedback: the loading toast must land before any network work
      // starts. The mutations reuse this id, so it later flips to
      // success/error without a second delayed appearance.
      toast.loading("Membangun paket...", { id: "paket-save" })
      const resolved = await resolveUploads(value)
      const payload = toPaketPayload(resolved)
      if (paketId) {
        await updatePaket({ id: paketId, ...payload })
      } else {
        await createPaket(payload)
      }
    },
  })
}
