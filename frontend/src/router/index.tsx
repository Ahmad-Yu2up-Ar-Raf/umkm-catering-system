import HomePage from "@/pages/home-page"
import LoginPage from "@/pages/auth/login-page"

import { createBrowserRouter } from "react-router"
import DashboardPage from "@/pages/admin/dashboard-page"
import { AuthenticatedGuard, GuestGuard } from "@/router/guards"
import { LayoutWrapper } from "@/components/provider/layout-wrapper"
import ContactPage from "@/pages/contact/contact-page"

export const router = createBrowserRouter([
  {
    element: <LayoutWrapper />,
    children: [
      {
        element: <GuestGuard />,
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
            path: "/login",
            element: <LoginPage />,
          },
        ],
      },
      {
        element: <AuthenticatedGuard />,
        children: [
          {
            path: "/dashboard",
            children: [
              {
                index: true,
                element: <DashboardPage />,
              },
            ],
          },
        ],
      },
    ],
  },
])
