"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon, Image01Icon } from "@hugeicons/core-free-icons"
import * as React from "react"
import {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
} from "@/components/ui/fragments/custom-ui/table/data-table-action-bar"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/fragments/shadcn-ui/dropdown-menu"
import { Separator } from "@/components/ui/fragments/shadcn-ui/separator"
import { GALERI_KATEGORI_OPTIONS } from "../config/galeri-enum-options"

interface GaleriTableActionBarProps {
  table: number[]
  setSelected: (value: React.SetStateAction<number[]>) => void
  onTaskDelete: () => void
  isPending: boolean
  onTaskUpdate: ({ field, value }: { field: "kategori_acara"; value: string }) => void
}

export function GaleriTableActionBar({
  setSelected,
  onTaskUpdate,
  table,
  isPending,
  onTaskDelete,
}: GaleriTableActionBarProps) {
  return (
    <DataTableActionBar setSelected={setSelected} table={table} visible={table.length > 0}>
      <DataTableActionBarSelection table={table} setSelected={setSelected} />
      <Separator orientation="vertical" className="hidden data-[orientation=vertical]:h-5 sm:block" />
      <div className="flex items-center gap-1.5 text-accent-foreground">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              disabled={isPending}
              className="size-7 border border-secondary bg-secondary/50 text-accent-foreground hover:bg-secondary/70 [&>svg]:size-3.5"
            >
              <HugeiconsIcon icon={Image01Icon} className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="z-[9999]">
            {GALERI_KATEGORI_OPTIONS.map((opt) => (
              <DropdownMenuItem key={opt.value} onSelect={() => onTaskUpdate({ field: "kategori_acara", value: opt.value })} className="capitalize">
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DataTableActionBarAction size="icon" tooltip="Delete galeri" isPending={isPending} onClick={onTaskDelete}>
          <HugeiconsIcon icon={Delete02Icon} className="size-4" />
        </DataTableActionBarAction>
      </div>
    </DataTableActionBar>
  )
}
