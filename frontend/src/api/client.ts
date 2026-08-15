import { setLogout, useAuthStore } from "@/store/auth-store"
import ky from "ky"

const BASE_API =
  import.meta.env.VITE_API_URL ?? "http://172.16.0.116:8000/api/v1/"

export const api = ky.create({
  baseUrl: BASE_API,

  // Dev backend is a single-threaded `php artisan serve` + Neon serverless;
  // every request takes ~5s and requests SERIALIZE server-side. ky's 10s
  // default kills the tail of any parallel batch (the storefront's 7
  // category previews + featured → only the first survives). 30s gives a
  // serialized batch room without hiding real failures.
  timeout: 30000,

  hooks: {
    beforeRequest: [
      ({ request }) => {
        const Token = useAuthStore.getState().token

        if (Token) {
          request.headers.set("Authorization", `Bearer ${Token}`)
        }
      },
    ],
    afterResponse: [
      ({ response }) => {
        if (response.status == 401) {
          setLogout()
          window.location.href = "/login"
        }
      },
    ],
  },
})
