import {
  Package01Icon,
  Restaurant01Icon,
  CakeIcon,
  CrownIcon,
  HelpCircleIcon,
} from "@hugeicons/core-free-icons"
import type { ComponentProps } from "react"
import type { HugeiconsIcon } from "@hugeicons/react"

// Gunakan 'as const' object menggantikan enum runtime
export const PaketKategoriEnum = {
  NasiBox: "Nasi Box",
  Prasmanan: "Prasmanan",
  Snack: "Snack",
  Tumpeng: "Tumpeng",
} as const

// Type union: "Nasi Box" | "Prasmanan" | "Snack" | "Tumpeng"
export type PaketKategoriType =
  (typeof PaketKategoriEnum)[keyof typeof PaketKategoriEnum]

export interface PaketKategoriOption {
  value: PaketKategoriType
  label: string
  description: string
  image: string
  icon: ComponentProps<typeof HugeiconsIcon>["icon"]
  badgeColor: string
}

export const PaketKategoriOptions: PaketKategoriOption[] = [
  {
    value: PaketKategoriEnum.NasiBox,
    label: "Nasi Box",
    description:
      "Praktis dan higienis untuk konsumsi harian, rapat, atau acara kantor.",
    image: "/assets/images/categories/nasi-box.png",
    icon: Package01Icon,
    badgeColor: "text-amber-600 bg-amber-500/10 border-amber-500/20",
  },
  {
    value: PaketKategoriEnum.Prasmanan,
    label: "Prasmanan",
    description:
      "Sajian lengkap & mewah prasmanan untuk pernikahan, gathering, dan pesta besar.",
    image: "/assets/images/categories/prasmanan.png",
    icon: Restaurant01Icon,
    badgeColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    value: PaketKategoriEnum.Snack,
    label: "Snack Box",
    description:
      "Aneka kue basah dan jajanan pasar premium untuk coffee break & seminar.",
    image: "/assets/images/categories/snack.png",
    icon: CakeIcon,
    badgeColor: "text-orange-600 bg-orange-500/10 border-orange-500/20",
  },
  {
    value: PaketKategoriEnum.Tumpeng,
    label: "Tumpeng",
    description:
      "Tumpeng megah khas Nusantara untuk perayaan syukuran & momen sakral.",
    image: "/assets/images/categories/tumpeng.png",
    icon: CrownIcon,
    badgeColor: "text-yellow-600 bg-yellow-500/10 border-yellow-500/20",
  },
]

export const DEFAULT_CATEGORY_ICON = HelpCircleIcon
