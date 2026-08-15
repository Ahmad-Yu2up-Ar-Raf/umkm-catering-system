import type { Paket } from "../../paket/types/paket-types"

export interface PaketDetailResponse {
  status: boolean
  message: string
  data: Paket
}
