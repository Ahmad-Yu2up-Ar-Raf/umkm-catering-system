import { api } from "@/api/client"

import type { PaketResponse } from "../types/paket-types"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

interface FetchPaketParams {
  search: string
  page: number
  perPage: number
}

export const FetchPaket = ({ search, page, perPage }: FetchPaketParams) => {
  return useQuery({
    // Masukkan search ke dalam queryKey agar TanStack otomatis refetch saat search berubah
    queryKey: ["paket", search, page, perPage],
    queryFn: async () =>
      api
        .get("paket", {
          searchParams: {
            page: page.toString(),
            perPage: perPage.toString(),
            ...(search ? { search } : {}),
          },
        })
        .json<PaketResponse>(),

    // PENTING: Jangan pakai refetchInterval di sini agar tidak spam!
    staleTime: 5000, // Cache data selama 5 detik
    placeholderData: keepPreviousData, // Menjaga UI tabel tetap stabil saat memuat halaman baru
  })
}
