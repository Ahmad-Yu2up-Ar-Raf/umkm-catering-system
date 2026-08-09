import { useAuth } from "@/components/ui/core/block/auth/hooks/use-auth"

import LoginForm from "./components/login-form"
import AuthLayout from "./components/auth-layout"

const LoginBlock = () => {
  const { handleLogin } = useAuth()

  const form = handleLogin()
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <AuthLayout
          title="Selamat Datang!"
          description="Masuk ke akun kamu untuk melanjutkan"
          formType="login"
          loading={isSubmitting}
        >
          <LoginForm form={form} isLoading={isSubmitting} />
        </AuthLayout>
      )}
    </form.Subscribe>
  )
}
export default LoginBlock
