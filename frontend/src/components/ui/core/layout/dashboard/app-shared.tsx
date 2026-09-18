import { type IconSvgElement } from "@hugeicons/react"
import {
  DashboardCircleIcon,
  Message01Icon,
  ShoppingCart01Icon,
  SpoonAndForkIcon,
  Image01Icon,
  HelpCircleIcon,
  ActivityIcon,
  Store,
  Home,
  UserIcon,
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
        title: "Master Testimoni",
        path: "/dashboard/testimoni",
        icon: Message01Icon,
      },
    ],
  },
]

export const navExternal: SidebarNavItem[] = [
  {
    title: "Halaman Utama",
    path: "/",
    icon: Home,
  },
  {
    title: "Galeri",
    path: "/galeri",
    icon: Image01Icon,
  },
  {
    title: "Paket",
    path: "/paket",
    icon: Store,
  },
  {
    title: "Testimoni",
    path: "/#testimoni",
    icon: Message01Icon,
  },
  {
    title: "Profil",
    path: "/#profil",
    icon: UserIcon,
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
  ...navExternal,
  ...footerNavLinks,
]
