import HeaderDashboard from "@/components/ui/fragments/custom-ui/typograhy/header"
import { Dish01FreeIcons, SpoonAndForkFreeIcons } from "@hugeicons/core-free-icons"
import React from "react"

function MasterPaketBlock() {
  return (
    <div className="flex h-full w-full flex-1 flex-col gap-7 rounded-xl px-10 py-8">
      <div className="space-y-3">
        <div className="items-center space-y-7 sm:flex sm:justify-between">
          <HeaderDashboard
            Icon={SpoonAndForkFreeIcons}
            Title="Daftar Paket"
            Deskrpsi="Kelola informasi data paket catering."
          />
        </div>
      </div>
    </div>
  )
}

export default MasterPaketBlock
