import type { AuthResponse, User } from "@/types/auth-type"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface authStoreType {
  token: string | null
  user: User | null
  isAuthenticated: boolean
}

export const useAuthStore = create<authStoreType>()(
  persist(
    (_set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
    }),
    {
      name: "auth-store",
    }
  )
)

export const setLogin = (Data: AuthResponse) =>
  useAuthStore.setState({
    ...Data,
    isAuthenticated: true,
  })

export const setLogout = () =>
  useAuthStore.setState(useAuthStore.getInitialState())
