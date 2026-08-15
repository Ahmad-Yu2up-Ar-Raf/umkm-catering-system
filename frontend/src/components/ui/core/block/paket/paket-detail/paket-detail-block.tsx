import React from "react"
import { FetchPaketDetail } from "../hooks/use-paket-query"

function PaketDetailBlock({ id }: { id: string }) {
  const { data } = FetchPaketDetail(id)

  const paket = data?.data
  return <div className="   min-h-dvh content-center">{paket?.nama_paket}</div>
}

export default PaketDetailBlock
