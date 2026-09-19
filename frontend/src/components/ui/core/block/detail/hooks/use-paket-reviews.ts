import { HTTPError } from "ky"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAppForm } from "@/hooks/use-form"
import { api } from "@/api/client"
import { shouldFallback, warnOffline } from "@/api/offline-fallback"
import { reviewSchema, type ReviewFormValues } from "../validations/review-schema"

export interface PaketReview {
  id: number
  nama: string
  pesanan: string
  acara: string
  lokasi: string
  visibility: "public" | "private"
  rating: number
  paket_id: number
  tanggal_acara: string | null
  created_at: string
  updated_at: string
}

interface PaketReviewsResponse {
  status: boolean
  message: string
  data: PaketReview[]
}

const reviewsKey = (paketId: number) => ["paket", "reviews", paketId] as const

/**
 * Public reviews for one package (`GET /testimoni/paket/{id}` — no auth).
 * Server returns strictly `visibility = public`, newest first.
 *
 * Offline contract: `null` = backend unreachable (caller hides the section
 * entirely — no skeleton, no empty shell); `[]` = live but no reviews yet.
 */
export function usePaketReviews(paketId: number, enabled = true) {
  return useQuery({
    queryKey: reviewsKey(paketId),
    enabled,
    queryFn: async (): Promise<PaketReview[] | null> => {
      try {
        const res = await api
          .get(`testimoni/paket/${paketId}`, { timeout: 8000 })
          .json<PaketReviewsResponse>()
        return res.data
      } catch (error) {
        if (!shouldFallback(error)) throw error
        warnOffline(`usePaketReviews(${paketId})`, error)
        return null
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    retry: false,
  })
}

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

export type ReviewFormReturnType = ReturnType<typeof useReviewForm>

/**
 * Anonymous review form. `paket_id` comes from the page context and
 * `visibility` is forced to private server-side — the form never sees
 * either field.
 */
export function useReviewForm({
  paketId,
  onSuccessCallback,
}: {
  paketId: number
  onSuccessCallback?: () => void
}) {
  const queryClient = useQueryClient()

  const { mutateAsync: submitReview } = useMutation({
    retry: false,
    mutationFn: async (payload: {
      nama: string
      pesanan: string
      acara: string
      lokasi: string
      tanggal_acara: string | null
      rating: number
      paket_id: number
    }) => {
      const res = await api
        .post("testimoni", { json: payload })
        .json<{ message: string }>()
      return res.message
    },
    onMutate: () => {
      toast.loading("Mengirim ulasan...", { id: "review-save" })
    },
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: reviewsKey(paketId) })
      toast.success(message || "Terima kasih! Ulasan Anda menunggu moderasi admin.", {
        id: "review-save",
      })
      onSuccessCallback?.()
    },
    onError: async (error) => {
      const message = await getErrorMessage(error, "Gagal mengirim ulasan. Coba lagi.")
      toast.error(message, { id: "review-save" })
      console.error("Submit review error:", error)
    },
  })

  const defaultValues: ReviewFormValues = {
    nama: "",
    pesanan: "",
    acara: "",
    lokasi: "",
    tanggal_acara: null,
    rating: 5,
  }

  return useAppForm({
    validators: {
      onChange: reviewSchema,
      onSubmit: reviewSchema,
    },
    defaultValues,
    onSubmit: async ({ value }) => {
      await submitReview({
        nama: value.nama.trim(),
        pesanan: value.pesanan.trim(),
        acara: value.acara.trim(),
        lokasi: value.lokasi.trim(),
        tanggal_acara: value.tanggal_acara || null,
        rating: value.rating,
        paket_id: paketId,
      })
    },
  })
}
