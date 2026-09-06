"use client"

import { useAuthStore } from "@/store/auth-store"

// Client-only singleton — never instantiate during SSR.
// Uses Pusher protocol over Laravel Reverb.

// ponytail: EchoInstance is any until laravel-echo types resolve after pnpm install
type EchoInstance = any

let _echo: EchoInstance | null = null
let _pusherLoaded = false

async function ensurePusher(): Promise<void> {
  if (_pusherLoaded || typeof window === "undefined") return
  // @ts-ignore — pusher-js types available after install
  const Pusher = (await import("pusher-js")).default
  // Echo expects window.Pusher
  ;(window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher
  _pusherLoaded = true
}

export async function getEcho(): Promise<EchoInstance | null> {
  if (typeof window === "undefined") return null
  if (_echo) return _echo

  const key = import.meta.env.VITE_REVERB_APP_KEY as string | undefined
  const host = import.meta.env.VITE_REVERB_HOST as string | undefined
  const port = import.meta.env.VITE_REVERB_PORT as string | undefined
  const scheme = import.meta.env.VITE_REVERB_SCHEME as string | undefined

  // Reverb not configured — graceful no-op (log driver fallback)
  if (!key || !host) return null

  await ensurePusher()

  // @ts-ignore — laravel-echo types available after install
  const Echo = (await import("laravel-echo")).default
  const token = useAuthStore.getState().token

  // Derive backend origin from VITE_API_URL (strip /api/v1) for /broadcasting/auth
  const apiUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://127.0.0.1:8000/api/v1/"
  const broadcastAuthEndpoint = `${apiUrl.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "")}/broadcasting/auth`

  // LAN fix: if Reverb host is 127.0.0.1 but frontend is served from 192.168.x.x, use window hostname
  const effectiveHost =
    host === "127.0.0.1" && typeof window !== "undefined" && window.location.hostname !== "127.0.0.1" && window.location.hostname !== "localhost"
      ? window.location.hostname
      : host

  _echo = new Echo({
    broadcaster: "reverb",
    key,
    wsHost: effectiveHost,
    wsPort: port ? Number(port) : 8080,
    wssPort: port ? Number(port) : 8080,
    forceTLS: scheme === "https",
    enabledTransports: ["ws", "wss"],
    withCredentials: true,
    auth: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
    authEndpoint: broadcastAuthEndpoint,
    // Reverb uses Pusher protocol — disable stats and enable activity timeout
    disableStats: true,
    enableLogging: false,
  } as unknown as ConstructorParameters<typeof Echo>[0])

  return _echo
}

export function getEchoSync(): EchoInstance | null {
  return _echo
}

export function destroyEcho(): void {
  if (_echo) {
    try {
      _echo.disconnect()
    } catch {
      // ignore
    }
    _echo = null
  }
}
