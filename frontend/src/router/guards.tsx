import { Navigate, Outlet } from "react-router"
import { useAuthStore } from "@/store/auth-store"

export const GuestGuard = () => {
  const isAuthenticated = useAuthStore.getState().isAuthenticated
  return isAuthenticated ? <Navigate to={"/"} /> : <Outlet />
}

export const AuthenticatedGuard = () => {
  const isAuthenticated = useAuthStore.getState().isAuthenticated
  return !isAuthenticated ? <Navigate to={"/login"} /> : <Outlet />
}
