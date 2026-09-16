import { setLogout, useAuthStore } from "@/store/auth-store"
import ky from "ky"

const RAW_BASE =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1/"

// ponytail: `php artisan serve` is plain HTTP — an https:// localhost/LAN URL
// sends TLS to a non-TLS socket ("Unsupported SSL request"). Downgrade only
// loopback/LAN hosts; public hosts (production) always keep their scheme.
const BASE_API = RAW_BASE.replace(
  /^https:(?=\/\/(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|31)\.))/,
  "http:",
)

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
