import { api } from "@/api/client"
import type {
  DeleteResponse,
  PesananCreatePayload,
  PesananListQueryParams,
  PesananListResponse,
  PesananSingleResponse,
  PesananUpdatePayload,
  PaketSearchOption,
  PaketSearchResponse,
  StrukResponse,
} from "@/components/ui/core/block/admin/pesanan/types/pesanan-types"

const BASE = "admin/pesanan"

/**
 * Manual URLSearchParams so the multi-select status filter serializes as
 * repeated bracketed keys (`status_pesanan[]=pending&status_pesanan[]=…`) —
 * the format Laravel parses into an array. ky's object searchParams would
 * flatten arrays to comma-joined strings.
 */
function buildSearchParams(params: PesananListQueryParams): URLSearchParams {
  const sp = new URLSearchParams({
    page: String(params.page),
    perPage: String(params.perPage),
  })
  for (const status of params.statuses ?? []) sp.append("status_pesanan[]", status)
  if (params.search) sp.set("search", params.search)
  if (params.sortBy) sp.set("sort_by", params.sortBy)
  if (params.sortDir) sp.set("sort_dir", params.sortDir)
  return sp
}

export const pesananService = {
  async list(params: PesananListQueryParams): Promise<PesananListResponse> {
    return api.get(BASE, { searchParams: buildSearchParams(params) }).json<PesananListResponse>()
  },

  async create(payload: PesananCreatePayload): Promise<PesananSingleResponse> {
    return api.post(BASE, { json: payload }).json<PesananSingleResponse>()
  },

  async update(id: number, payload: PesananUpdatePayload): Promise<PesananSingleResponse> {
    return api.put(`${BASE}/${id}`, { json: payload }).json<PesananSingleResponse>()
  },

  async remove(id: number): Promise<DeleteResponse> {
    return api.delete(`${BASE}/${id}`).json<DeleteResponse>()
  },

  async struk(id: number): Promise<StrukResponse> {
    return api.get(`${BASE}/${id}/struk`).json<StrukResponse>()
  },

  /** Lightweight lookup for the POS paket combobox (GET admin/paket/search). */
  async searchPaket(q: string): Promise<PaketSearchOption[]> {
    const res = await api
      .get("admin/paket/search", { searchParams: { q } })
      .json<PaketSearchResponse>()
    return res.data
  },
}
