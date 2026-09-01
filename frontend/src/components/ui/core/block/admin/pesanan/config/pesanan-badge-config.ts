import {
  Clock01Icon,
  Tick02Icon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  Wallet01Icon,
  CreditCardIcon,
  QrCodeIcon,
  HelpCircleIcon,
} from "@hugeicons/core-free-icons"
import type { ComponentProps } from "react"
import type { HugeiconsIcon } from "@hugeicons/react"

// Backend enums (verify: backend/app/Enums/*)
export const StatusPesananEnum = {
  Pending: "pending",
  Confirmed: "confirmed",
  Completed: "completed",
  Cancelled: "cancelled",
} as const

export type StatusPesananType = (typeof StatusPesananEnum)[keyof typeof StatusPesananEnum]

export const MetodePembayaranEnum = {
  Cash: "cash",
  Transfer: "transfer",
  Qris: "qris",
} as const

export type MetodePembayaranType = (typeof MetodePembayaranEnum)[keyof typeof MetodePembayaranEnum]

export interface BadgeOption {
  value: string
  label: string
  icon: ComponentProps<typeof HugeiconsIcon>["icon"]
  badgeColor: string
}

// Status: 4 real values + fallback
export const StatusPesananOptions: BadgeOption[] = [
  {
    value: StatusPesananEnum.Pending,
    label: "Pending",
    icon: Clock01Icon,
    badgeColor: "text-amber-600 bg-amber-500/10 border-amber-500/20",
  },
  {
    value: StatusPesananEnum.Confirmed,
    label: "Dikonfirmasi",
    icon: CheckmarkCircle02Icon,
    badgeColor: "text-blue-600 bg-blue-500/10 border-blue-500/20",
  },
  {
    value: StatusPesananEnum.Completed,
    label: "Selesai",
    icon: Tick02Icon,
    badgeColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    value: StatusPesananEnum.Cancelled,
    label: "Dibatalkan",
    icon: CancelCircleIcon,
    badgeColor: "text-rose-600 bg-rose-500/10 border-rose-500/20",
  },
]

// Metode: 3 values — directives mapping: cash emerald, transfer blue, qris violet
export const MetodePembayaranOptions: BadgeOption[] = [
  {
    value: MetodePembayaranEnum.Cash,
    label: "Tunai",
    icon: Wallet01Icon,
    badgeColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    value: MetodePembayaranEnum.Transfer,
    label: "Transfer Bank",
    icon: CreditCardIcon,
    badgeColor: "text-sky-600 bg-sky-500/10 border-sky-500/20",
  },
  {
    value: MetodePembayaranEnum.Qris,
    label: "QRIS",
    icon: QrCodeIcon,
    badgeColor: "text-violet-600 bg-violet-500/10 border-violet-500/20",
  },
]

export const DEFAULT_STATUS_ICON = HelpCircleIcon
export const DEFAULT_METODE_ICON = HelpCircleIcon
export const DEFAULT_BADGE_COLOR = "text-muted-foreground bg-muted border-border"
