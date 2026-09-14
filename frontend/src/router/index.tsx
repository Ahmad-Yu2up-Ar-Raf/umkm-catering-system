import HomePage from "@/pages/home-page"

import { createBrowserRouter } from "react-router"
import { AuthenticatedGuard, GuestGuard } from "@/router/guards"
import { LayoutWrapper } from "@/components/provider/layout-wrapper"

import LoginBlock from "@/components/ui/core/block/auth/login-block"
import { AppShell } from "@/components/ui/core/layout/dashboard/app-shell"
import {
  AdminSuspense,
  DashboardPage,
  MasterGaleriPage,
  MasterPaketPage,
  MasterPesananPage,
  TestimoniPage,
} from "@/router/admin-pages"
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
            element: (
              <AdminSuspense>
                <DashboardPage />
              </AdminSuspense>
            ),
          },
          {
            path: "paket",
            element: (
              <AdminSuspense>
                <MasterPaketPage />
              </AdminSuspense>
            ),
          },
          {
            path: "galeri",
            element: (
              <AdminSuspense>
                <MasterGaleriPage />
              </AdminSuspense>
            ),
          },
          {
            path: "pesanan",
            element: (
              <AdminSuspense>
                <MasterPesananPage />
              </AdminSuspense>
            ),
          },
          {
            path: "testimoni",
            element: (
              <AdminSuspense>
                <TestimoniPage />
              </AdminSuspense>
            ),
          },
        ],
      },
    ],
  },
])
