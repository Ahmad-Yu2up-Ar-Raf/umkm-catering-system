import { type IconSvgElement } from "@hugeicons/react"
import {
  DashboardCircleIcon,
  ShoppingCart01Icon,
  Calendar01Icon,
  SpoonAndForkIcon,
  Image01Icon,
  UserMultipleIcon,
  Settings01Icon,
  HelpCircleIcon,
  ActivityIcon,
} from "@hugeicons/core-free-icons"

export type SidebarNavItem = {
  title: string
  path: string
  icon: IconSvgElement

  subItems?: SidebarNavItem[]
}

export type SidebarNavGroup = {
  label?: string
  items: SidebarNavItem[]
}

export const navGroups: SidebarNavGroup[] = [
  {
    items: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: DashboardCircleIcon,
      },
    ],
  },
  {
    label: "Transaksi",
    items: [
      {
        title: "Pesanan",
        path: "/dashboard/pesanan",
        icon: ShoppingCart01Icon,
      },
      {
        title: "Jadwal Pengiriman",
        path: "/dashboard/jadwal-pengiriman",
        icon: Calendar01Icon,
      },
    ],
  },
  {
    label: "Manajemen Data",
    items: [
      {
        title: "Master Paket",
        path: "/dashboard/paket",
        icon: SpoonAndForkIcon,
      },
      {
        title: "Master Galeri",
        path: "/dashboard/galeri",
        icon: Image01Icon,
      },
      {
        title: "Pelanggan",
        path: "/dashboard/pelanggan",
        icon: UserMultipleIcon,
      },
    ],
  },
  {
    label: "Pengaturan",
    items: [
      {
        title: "Konfigurasi Web",
        path: "/dashboard/konfigurasi",
        icon: Settings01Icon,
      },
    ],
  },
]

export const footerNavLinks: SidebarNavItem[] = [
  {
    title: "Help Center",
    path: "#/help",
    icon: HelpCircleIcon,
  },
  {
    title: "System status",
    path: "#/status",
    icon: ActivityIcon,
  },
]

export const navLinks: SidebarNavItem[] = [
  ...navGroups.flatMap((group) =>
    group.items.flatMap((item) =>
      item.subItems?.length ? [item, ...item.subItems] : [item]
    )
  ),
  ...footerNavLinks,
]
