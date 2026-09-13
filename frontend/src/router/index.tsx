import HomePage from "@/pages/home-page"

import { createBrowserRouter } from "react-router"
import DashboardPage from "@/pages/admin/dashboard-page"
import { AuthenticatedGuard, GuestGuard } from "@/router/guards"
import { LayoutWrapper } from "@/components/provider/layout-wrapper"

import LoginBlock from "@/components/ui/core/block/auth/login-block"
import { AppShell } from "@/components/ui/core/layout/dashboard/app-shell"
import MasterPaketPage from "@/pages/admin/master-paket-page"
import MasterGaleriPage from "@/pages/admin/master-galeri-page"
import MasterPesananPage from "@/pages/admin/master-pesanan-page"
import TestimoniPage from "@/pages/admin/testimoni-page"
import {
  PublicGaleriCategoryPage,
  PublicGaleryPage,
  PublicPaketDetail,
  PublicPaketPage,
} from "@/router/public-routes"

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
        path: "/paket",
        children: [
          {
            index: true,
            element: <PublicPaketPage />,
          },
          {
            path: ":id",
            element: <PublicPaketDetail />, // Buat komponen page baru untuk detail poli
          },
        ],
      },
      {
        path: "/galeri",
        children: [
          {
            index: true,
            element: <PublicGaleryPage />,
          },
          {
            path: ":kategori",
            element: <PublicGaleriCategoryPage />,
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
          {
            path: "paket",
            element: <MasterPaketPage />,
          },
          {
            path: "galeri",
            element: <MasterGaleriPage />,
          },
          {
            path: "pesanan",
            element: <MasterPesananPage />,
          },
          {
            path: "testimoni",
            element: <TestimoniPage />,
          },
        ],
      },
    ],
  },
])
