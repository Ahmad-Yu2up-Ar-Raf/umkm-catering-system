import PaketDetailBlock from "@/components/ui/core/block/detail/detail-block"
import { Navigate, useParams } from "react-router"

function PaketDetail() {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return <Navigate to={"/paket"} />
  }
  return <PaketDetailBlock id={id} />
}

export default PaketDetail
