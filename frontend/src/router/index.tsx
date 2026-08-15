import HomePage from "@/pages/home-page"

import { createBrowserRouter } from "react-router"
import DashboardPage from "@/pages/admin/dashboard-page"
import { AuthenticatedGuard, GuestGuard } from "@/router/guards"
import { LayoutWrapper } from "@/components/provider/layout-wrapper"
import ContactPage from "@/pages/contact-page"
import LoginBlock from "@/components/ui/core/block/auth/login-block"
import PaketPage from "@/pages/paket/paket-page"
import { AppShell } from "@/components/ui/core/layout/dashboard/app-shell"
import GaleryPage from "@/pages/gallery/galery-page"
import GaleriCategoryPage from "@/pages/gallery/galeri-category-page"
import PaketDetail from "@/pages/paket/paket-detail"

export const router = createBrowserRouter([
  {
    element: <GuestGuard />,
    children: [
      {
        path: "/login",
        element: <LoginBlock />,
      },
    ],
  },
  {
    element: <LayoutWrapper />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/kontak",
        element: <ContactPage />,
      },
      {
        path: "/paket",
        children: [
          {
            index: true,
            element: <PaketPage />,
          },
          {
            path: ":id",
            element: <PaketDetail />, // Buat komponen page baru untuk detail poli
          },
        ],
      },
      {
        path: "/galeri",
        children: [
          {
            index: true,
            element: <GaleryPage />,
          },
          {
            path: ":kategori",
            element: <GaleriCategoryPage />,
          },
        ],
      },
    ],
  },
  {
    element: <AuthenticatedGuard />,
    children: [
      {
        path: "/dashboard",
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
        ],
      },
    ],
  },
])
