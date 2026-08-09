import { loginSchema } from "@/components/ui/core/block/auth/validations/login-schema"
import { useAppForm } from "@/hooks/use-form"
import { api } from "@/api/client"
import type { AuthResponse } from "@/types/auth-type"
import { toast } from "sonner"
import { useNavigate } from "react-router"
import { setLogin, setLogout } from "@/store/auth-store"
import { useQueryClient } from "@tanstack/react-query"

export type useAuthType = ReturnType<typeof useAuth>
export type loginReturnType = ReturnType<useAuthType["handleLogin"]>

export const useAuth = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const handleLogin = () => {
    return useAppForm({
      validators: {
        onSubmit: loginSchema,
      },
      defaultValues: {
        email: "",
        password: "",
      },
      onSubmit: async ({ value: data }) => {
        const login = api
          .post("auth/login", { json: data })
          .json<AuthResponse>()

        toast.promise(login, {
          success: (data) => {
            setLogin(data)
            navigate("/dashboard")
            return `Welcome back ${data.user.name}`
          },
          error: (err) => {
            return err.message || "Login gagal!"
          },
          loading: "Loading...",
        })

        await login
      },
    })
  }

  const handleLogout = () => {
    const logoutAction = async () => {
      queryClient.clear()

      const response = await api.post("auth/logout")

      setLogout()

      if (!response.ok) {
        throw new Error("Failed to logout")
      }

      navigate("/login")
      return response
    }

    return toast.promise(logoutAction(), {
      loading: "Log Out...",
      success: "Log Out Berhasil!",
      error: (err) => {
        return err.message || "Log Out Gagal!"
      },
    })
  }
  return {
    handleLogin,
    handleLogout,
  }
}
