"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, Delete02Icon, Wallet02Icon } from "@hugeicons/core-free-icons"
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
import { STATUS_FILTER_OPTIONS, METODE_PEMBAYARAN_FILTER_OPTIONS } from "../constants/pesanan-enum-options"

interface PesananTableActionBarProps {
  table: number[]
  setSelected: (value: React.SetStateAction<number[]>) => void
  onTaskDelete: () => void
  isPending: boolean
  onTaskUpdate: ({ field, value }: { field: "status_pesanan" | "metode_pembayaran"; value: string }) => void
}

export function PesananTableActionBar({
  setSelected,
  onTaskUpdate,
  table,
  isPending,
  onTaskDelete,
}: PesananTableActionBarProps) {
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
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="z-[9999]">
            {STATUS_FILTER_OPTIONS.map((status) => (
              <DropdownMenuItem
                key={status.value}
                onSelect={() => onTaskUpdate({ field: "status_pesanan", value: status.value })}
                className="capitalize"
              >
                {status.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              disabled={isPending}
              className="size-7 border border-secondary bg-secondary/50 text-accent-foreground hover:bg-secondary/70 [&>svg]:size-3.5"
            >
              <HugeiconsIcon icon={Wallet02Icon} className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="z-[9999]">
            {METODE_PEMBAYARAN_FILTER_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onSelect={() => onTaskUpdate({ field: "metode_pembayaran", value: opt.value })}
                className="capitalize"
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DataTableActionBarAction size="icon" tooltip="Delete pesanan" isPending={isPending} onClick={onTaskDelete}>
          <HugeiconsIcon icon={Delete02Icon} className="size-4" />
        </DataTableActionBarAction>
      </div>
    </DataTableActionBar>
  )
}
