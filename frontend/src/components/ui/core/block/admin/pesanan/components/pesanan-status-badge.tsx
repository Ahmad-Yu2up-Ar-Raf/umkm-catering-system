"use client"

import { cva } from "class-variance-authority"
import type { StatusPesanan } from "../types/pesanan-types"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        pending: "bg-warning/15 text-warning border border-warning/30",
        confirmed: "bg-primary/15 text-primary border border-primary/30",
        completed: "bg-success/15 text-success border border-success/30",
        cancelled: "bg-destructive/15 text-destructive border border-destructive/30",
      },
    } as const,
    defaultVariants: {
      variant: "pending",
    },
  }
)

export function PesananStatusBadge({
  status,
  className,
  ...props
}: {
  status: StatusPesanan
  className?: string
} & Omit<React.HTMLAttributes<HTMLSpanElement>, "className">) {
  const labels: Record<StatusPesanan, string> = {
    pending: "Pending",
    confirmed: "Dikonfirmasi",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  }

  return (
    <span
      className={badgeVariants({ variant: status, className })}
      {...props}
    >
      {labels[status]}
    </span>
  )
}