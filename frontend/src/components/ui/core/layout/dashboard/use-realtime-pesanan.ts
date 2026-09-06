"use client"

import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { getEcho } from "@/lib/echo"
import { getUISFX } from "@/lib/uisfx"

interface PesananBroadcastPayload {
  id: number
  nomor_struk: string
  nama_pemesan: string
  paket?: { nama_paket: string } | null
  // other fields from PesananResource are available but not needed for toast
}

const ADMIN_PESANAN_KEY = ["admin", "pesanan"] as const

export function useRealtimePesanan() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const lastSeenRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let channel: unknown = null
    let echo: unknown = null

    async function subscribe() {
      const e = await getEcho()
      if (cancelled || !e) return
      echo = e
      // @ts-ignore — Echo private channel typed as any until install resolves
      const ch = e.private("admin.pesanan")
      channel = ch

      const handler = (payload: PesananBroadcastPayload) => {
        const key = String(payload.id)
        if (lastSeenRef.current === key) return
        lastSeenRef.current = key

        // 1) Invalidate — MasterPesananPage (any page/perPage) refetches once
        void queryClient.invalidateQueries({ queryKey: ADMIN_PESANAN_KEY })

        // 2) Global toast (Sonner top-center, visible on any /dashboard/*)
        toast.info(`Pesanan baru — ${payload.nama_pemesan}`, {
          description: `${payload.paket?.nama_paket ?? "Paket"} • Struk ${payload.nomor_struk}`,
          action: {
            label: "Lihat",
            onClick: () => navigate("/dashboard/pesanan"),
          },
          duration: 6000,
        })

        // 3) Audio — one cue, suppressed until unlocked, never queued stale
        try {
          const ui = getUISFX()
          // isEnabled respects preferences + mute toggle
          if (ui.isEnabled()) {
            void ui.play("notification")
          }
        } catch {
          // audio is enhancement only
        }
      }

      // Reverb broadcasts as `pesanan.created` (broadcastAs) — Echo prefixes with dot
      // @ts-ignore — channel.listen typed loosely until echo types resolve
      ch.listen(".pesanan.created", handler)
      // Fallback for case where broadcastAs prefix differs
      // @ts-ignore
      ch.listen("PesananCreated", handler)
    }

    void subscribe()

    return () => {
      cancelled = true
      try {
        if (channel) {
          // @ts-ignore
          channel.stopListening(".pesanan.created")
          // @ts-ignore
          channel.stopListening("PesananCreated")
        }
        // Leave channel but keep Echo singleton for next mount (StrictMode)
        if (echo) {
          // @ts-ignore
          echo.leave("admin.pesanan")
        }
      } catch {
        // ignore cleanup errors
      }
    }
  }, [queryClient, navigate])
}

export function usePartyPresence() {
  const lastPartySeenRef = useRef<string | null>(null)

  useEffect(() => {
    const rawHost = import.meta.env.VITE_PARTYKIT_HOST as string | undefined
    if (!rawHost || typeof window === "undefined") return
    // LAN fix: if host is 127.0.0.1 but frontend is on LAN IP, use window hostname
    const host =
      rawHost.startsWith("127.0.0.1") && window.location.hostname !== "127.0.0.1" && window.location.hostname !== "localhost"
        ? `${window.location.hostname}:1999`
        : rawHost

    let socket: any | null = null
    let cancelled = false

    async function connect() {
      // @ts-ignore — partysocket types after install
      const PartySocket = (await import("partysocket")).default
      if (cancelled) return
      const party = new PartySocket({
        host,
        room: "admin-presence",
        // optional: party: "main" matches partykit.json main
      })
      socket = party as unknown as typeof socket

      party.addEventListener("message", (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data as string) as { type?: string; adminId?: string }
          if (data.type === "presence:sync" || data.type === "presence:join") {
            const k = String(data.adminId ?? "")
            if (lastPartySeenRef.current === k) return
            lastPartySeenRef.current = k
            // Presence is passive in Phase 1 — no toast, just keeps room warm
            // Future: render avatars / live count in AppSidebar
          }
        } catch {
          // ignore
        }
      })

      // Announce self (optional — uses auth-store user if available)
      try {
        const { useAuthStore } = await import("@/store/auth-store")
        const user = useAuthStore.getState().user
        party.send(
          JSON.stringify({
            type: "presence:join",
            adminId: String(user?.id ?? party.id ?? "anon"),
            name: String((user as unknown as { name?: string })?.name ?? "Admin"),
          })
        )
      } catch {
        // ignore
      }
    }

    void connect()

    return () => {
      cancelled = true
      try {
        socket?.close()
      } catch {
        // ignore
      }
    }
  }, [])
}
