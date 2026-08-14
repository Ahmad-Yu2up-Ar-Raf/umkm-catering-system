import PaketDetailBlock from "@/components/ui/core/block/paket/paket-detail/paket-detail-block"
import React from "react"
import { Navigate, useParams } from "react-router"

function PaketDetail() {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return <Navigate to={"/paket"} />
  }
  return <PaketDetailBlock id={id} />
}

export default PaketDetail
