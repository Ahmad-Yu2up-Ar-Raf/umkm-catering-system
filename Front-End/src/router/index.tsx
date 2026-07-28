import HomePage from "@/pages/home-page"
import LoginPage from "@/pages/auth/login-page"

import { useAuthStore } from "@/store/auth-store"
import { createBrowserRouter, Outlet, Navigate } from "react-router"
import DashboardPage from "@/pages/admin/dashboard-page"
import ContactPage from "@/pages/contact/contact-page"

const GuestGuard = () => {
  const isAuthenticated = useAuthStore.getState().isAuthenticated
  return isAuthenticated ? <Navigate to={"/dashboard"} /> : <Outlet />
}

const AuthenticatedGuard = () => {
  const isAuthenticated = useAuthStore.getState().isAuthenticated
  return !isAuthenticated ? <Navigate to={"/login"} /> : <Outlet />
}

export const router = createBrowserRouter([
  {
    element: <GuestGuard />,
    children: [
      {
        path: "/",
        element: <HomePage />,
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
])
