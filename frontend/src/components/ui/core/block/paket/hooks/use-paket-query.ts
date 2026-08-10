import { api } from "@/api/client"

import type { AntrianResponse } from "../types/antrian-type"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

interface FetchAntrianParams {
  search: string
  page: number
  perPage: number
}

export const FetchAntrian = ({ search, page, perPage }: FetchAntrianParams) => {
  return useQuery({
    // Masukkan search ke dalam queryKey agar TanStack otomatis refetch saat search berubah
    queryKey: ["antrian", search, page, perPage],
    queryFn: async () =>
      api
        .get("antrian", {
          searchParams: {
            page: page.toString(),
            perPage: perPage.toString(),
            ...(search ? { search } : {}),
          },
        })
        .json<AntrianResponse>(),

    // PENTING: Jangan pakai refetchInterval di sini agar tidak spam!
    staleTime: 5000, // Cache data selama 5 detik
    placeholderData: keepPreviousData, // Menjaga UI tabel tetap stabil saat memuat halaman baru
  })
}
