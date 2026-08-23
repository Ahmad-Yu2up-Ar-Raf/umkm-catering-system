import { HTTPError } from "ky"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAppForm } from "@/hooks/use-form"
import { adjustActiveGaleriUploads } from "@/store/galeri-upload-store"
import {
  toCanonicalCloudinaryUrl,
  purgeCloudinaryImages,
  createCloudinaryTransportForFolder,
} from "@/lib/cloudinary"
import { api } from "@/api/client"
import type { Galeri } from "../types/galeri-types"
import { galeriSchema, type GaleriFormValues } from "../validations/galeri-schema"
import { toFormDefaults, toGaleriPayload, type GaleriPayload } from "../utils/galeri-form-mapper"

const ADMIN_GALERI_KEY = ["admin", "galeri"] as const

export type GaleriFormReturnType = ReturnType<typeof useGaleriForm>

/**
 * Fire-and-forget orphan sweep: deletes Cloudinary assets that were uploaded
 * during a draft session but never committed (drawer discarded/cancelled).
 * Delegates to the shared lib helper so the dropzone fragment can reuse it.
 */
export function purgeUncommittedGaleriImages(urls: string[]): void {
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
  nama_acara: "",
  kategori_acara: "Lainnya" as const,
  deskripsi_acara: null,
  tanggal_acara: null,
  lokasi: null,
  jumlah_tamu: null,
  is_featured: false,
  thumbnail: "",
  images: [] as string[],
}

/** Create mutation — invalidates admin + public galeri queries on success. */
export function useGaleriCreateMutation({ onSuccess }: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    retry: false,
    mutationFn: async (payload: GaleriPayload) => {
      const res = await api.post("admin/galeri", { json: payload }).json<{ message: string }>()
      return res.message
    },
    onMutate: async () => {
      toast.loading("Menyimpan galeri...", { id: "galeri-save" })
      await queryClient.cancelQueries({ queryKey: ADMIN_GALERI_KEY })
      const previousGaleri = queryClient.getQueryData(ADMIN_GALERI_KEY)
      return { previousGaleri }
    },
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_GALERI_KEY })
      queryClient.invalidateQueries({ queryKey: ["galeri"] })
      toast.success(message || "Galeri berhasil ditambahkan.", { id: "galeri-save" })
      onSuccess?.()
    },
    onError: async (error, _variables, context) => {
      if (context?.previousGaleri) {
        queryClient.setQueryData(ADMIN_GALERI_KEY, context.previousGaleri)
      }
      const message = await getErrorMessage(error, "Gagal menambahkan galeri. Coba lagi.")
      toast.error(message, { id: "galeri-save" })
      console.error("Create galeri error:", error)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_GALERI_KEY })
    },
  })
}

/** Update mutation — sends the full resolved payload; backend diffs images. */
export function useGaleriUpdateMutation({ onSuccess }: { onSuccess?: () => void } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    retry: false,
    mutationFn: async ({ id, ...payload }: GaleriPayload & { id: number }) => {
      const res = await api.put(`admin/galeri/${id}`, { json: payload }).json<{ message: string }>()
      return res.message
    },
    onMutate: async (updatedGaleri) => {
      toast.loading("Memperbarui galeri...", { id: "galeri-save" })
      await queryClient.cancelQueries({ queryKey: ADMIN_GALERI_KEY })
      const previousGaleri = queryClient.getQueryData(ADMIN_GALERI_KEY)

      if (previousGaleri) {
        queryClient.setQueryData(ADMIN_GALERI_KEY, (old: { items: Galeri[] } | undefined) => {
          if (!old?.items) return old
          return {
            ...old,
            items: old.items.map((item: Galeri) =>
              item.id === updatedGaleri.id ? { ...item, ...updatedGaleri } : item
            )
          }
        })
      }

      return { previousGaleri }
    },
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_GALERI_KEY })
      queryClient.invalidateQueries({ queryKey: ["galeri"] })
      toast.success(message || "Galeri berhasil diperbarui.", { id: "galeri-save" })
      onSuccess?.()
    },
    onError: async (error, _variables, context) => {
      if (context?.previousGaleri) {
        queryClient.setQueryData(ADMIN_GALERI_KEY, context.previousGaleri)
      }
      const message = await getErrorMessage(error, "Gagal memperbarui galeri. Coba lagi.")
      toast.error(message, { id: "galeri-save" })
      console.error("Update galeri error:", error)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_GALERI_KEY })
    },
  })
}

/** Delete mutation. */
export function useGaleriDeleteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    retry: false,
    mutationFn: async (galeri: Galeri) => {
      console.info("[galeri-delete] request", { id: galeri.id, name: galeri.nama_acara })
      try {
        const res = await api.delete(`admin/galeri/${galeri.id}`).json<{ message: string }>()
        console.info("[galeri-delete] success", { id: galeri.id, message: res.message })
        return { galeri, message: res.message }
      } catch (err) {
        console.error("[galeri-delete] network/http error caught in mutationFn:", err)
        if (err instanceof HTTPError) {
          try {
            const errorBody = await err.response.json()
            console.error("[galeri-delete] error response body:", errorBody)
          } catch (bodyErr) {
            console.error("[galeri-delete] failed to parse error response body as json:", bodyErr)
          }
        }
        throw err
      }
    },
    onMutate: async (deletedGaleri) => {
      toast.loading("Menghapus galeri...", { id: "galeri-delete" })
      await queryClient.cancelQueries({ queryKey: ADMIN_GALERI_KEY })
      const previousGaleri = queryClient.getQueryData(ADMIN_GALERI_KEY)

      if (previousGaleri) {
        queryClient.setQueryData(ADMIN_GALERI_KEY, (old: { items: Galeri[] } | undefined) => {
          if (!old?.items) return old
          return {
            ...old,
            items: old.items.filter((item: Galeri) => item.id !== deletedGaleri.id)
          }
        })
      }

      return { previousGaleri }
    },
    onSuccess: ({ galeri, message }) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_GALERI_KEY })
      queryClient.invalidateQueries({ queryKey: ["galeri"] })
      toast.success(message || `Galeri “${galeri.nama_acara}” dihapus.`, { id: "galeri-delete" })
    },
    onError: async (error, deletedGaleri, context) => {
      console.error("[galeri-delete] onError triggered with error:", error)
      if (error instanceof HTTPError && error.response.status === 404) {
        console.warn("[galeri-delete] already gone server-side", { id: deletedGaleri.id })
        queryClient.invalidateQueries({ queryKey: ADMIN_GALERI_KEY })
        toast.success(`Galeri “${deletedGaleri.nama_acara}” sudah terhapus.`, { id: "galeri-delete" })
        return
      }
      const message = await getErrorMessage(error, "Gagal menghapus galeri. Coba lagi.")
      console.error("[galeri-delete] failed resolved message:", message, { id: deletedGaleri.id }, error)
      toast.error(message, { id: "galeri-delete" })
      if (context?.previousGaleri) {
        queryClient.setQueryData(ADMIN_GALERI_KEY, context.previousGaleri)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_GALERI_KEY })
    },
  })
}

/**
 * Upload one deferred `File` to Cloudinary and return its canonical URL.
 * Bumps the shared upload counter so the footer shows "Mengunggah gambar…"
 * while submit-phase uploads run.
 */
async function uploadDeferredImage(file: File, folder: string): Promise<string> {
  adjustActiveGaleriUploads(1)
  try {
    const transport = createCloudinaryTransportForFolder(folder)
    const wrapper = { file } as Parameters<typeof transport.upload>[0]
    const { response } = await transport.upload(wrapper, {
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
    adjustActiveGaleriUploads(-1)
  }
}

/**
 * Resolve every pending `File` (thumbnail + gallery together) to Cloudinary
 * URLs — fully parallel so N images upload concurrently.
 * Uses dynamic folder based on kategori_acara.
 */
async function resolveUploads(value: GaleriFormValues): Promise<GaleriFormValues> {
  const kategori = value.kategori_acara
  const normalized = kategori.toLowerCase().replace(/\s+/g, "-").replace("&", "")
  const valid = ["korporat", "pernikahan", "tumpeng-syukuran", "perayaan", "hampers", "di-balik-dapur"]
  const folder = `catering-nusantara/galeri/${valid.includes(normalized) ? normalized : "lainnya"}`

  const jobs: Array<Promise<string | File>> = []

  if (value.thumbnail && typeof value.thumbnail !== "string") {
    jobs.push(uploadDeferredImage(value.thumbnail, folder))
  } else if (value.thumbnail) {
    jobs.push(Promise.resolve(value.thumbnail))
  }

  const imageJobs = (value.images ?? []).map((img) =>
    typeof img === "string" ? Promise.resolve(img) : uploadDeferredImage(img, folder)
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
export function useGaleriForm({
  galeri,
  onSuccessCallback,
}: {
  galeri?: Galeri
  onSuccessCallback?: () => void
} = {}) {
  const galeriId = galeri?.id
  const { mutateAsync: createGaleri } = useGaleriCreateMutation({ onSuccess: onSuccessCallback })
  const { mutateAsync: updateGaleri } = useGaleriUpdateMutation({ onSuccess: onSuccessCallback })

  return useAppForm({
    validators: {
      onChange: galeriSchema,
      onSubmit: galeriSchema,
    },
    defaultValues: galeri ? toFormDefaults(galeri) : defaultFormValues,
    onSubmit: async ({ value }) => {
      toast.loading("Membangun galeri...", { id: "galeri-save" })
      const resolved = await resolveUploads(value)
      const payload = toGaleriPayload(resolved)
      if (galeriId) {
        await updateGaleri({ id: galeriId, ...payload })
      } else {
        await createGaleri(payload)
      }
    },
  })
}