"use client"

import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Edit01Icon, Delete01Icon, EyeIcon } from "@hugeicons/core-free-icons"
import { PaketCard } from "@/components/ui/core/block/paket/components/paket-card"
import { usePaketDeleteMutation } from "../hooks/use-paket-mutations"
import type { Paket } from "../../../paket/types/paket-types"

interface PaketCardGridProps {
  items: Paket[]
  onEdit: (paket: Paket) => void
  onDelete: (paket: Paket) => void
}

/**
 * Admin card grid — reuses the official storefront PaketCard component
 * with admin actions overlaid.
 */
export function PaketCardGrid({ items, onEdit, onDelete }: PaketCardGridProps) {
  const { isPending: isDeleting, variables: deleteVariables } = usePaketDeleteMutation()

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {items.map((paket) => {
        const isThisDeleting = isDeleting && deleteVariables?.id === paket.id

        return (
          <div key={paket.id} className="relative flex flex-col">
            <PaketCard
              paket={paket}
              layoutMode="grid-3"
              showSalesCount
              adminActions={
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => window.open(`/paket/${paket.id}`, "_blank")}
                  >
                    <HugeiconsIcon icon={EyeIcon} className="size-3.5" />
                    Lihat
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => onEdit(paket)}
                  >
                    <HugeiconsIcon icon={Edit01Icon} className="size-3.5" />
                    Ubah
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs text-destructive hover:text-destructive"
                    onClick={() => onDelete(paket)}
                    disabled={paket.pesanan_count > 0 || isThisDeleting}
                  >
                    <HugeiconsIcon icon={Delete01Icon} className="size-3.5" />
                    Hapus
                  </Button>
                </>
              }
            />
          </div>
        )
      })}
    </div>
  )
}
