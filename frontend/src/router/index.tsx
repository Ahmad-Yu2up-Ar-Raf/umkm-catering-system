import HomePage from "@/pages/home-page"

import { createBrowserRouter } from "react-router"
import DashboardPage from "@/pages/admin/dashboard-page"
import { AuthenticatedGuard, GuestGuard } from "@/router/guards"
import { LayoutWrapper } from "@/components/provider/layout-wrapper"
import ContactPage from "@/pages/contact-page"
import LoginBlock from "@/components/ui/core/block/auth/login-block"
import PaketPage from "@/pages/paket-page"
import { AppShell } from "@/components/ui/core/layout/dashboard/app-shell"

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
        element: <PaketPage />,
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
