import { setLogout, useAuthStore } from "@/store/auth-store"
import ky from "ky"

const BASE_API =
  import.meta.env.VITE_API_URL ?? "http://172.16.0.116:8000/api/v1/"

export const api = ky.create({
  baseUrl: BASE_API,

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
