import { useEffect } from "react"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/fragments/shadcn-ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"
import { Outlet } from "react-router"
import { useRealtimePesanan, usePartyPresence } from "./use-realtime-pesanan"
import { unlockUISFX } from "@/lib/uisfx"

export function AppShell() {
  // Global real-time: Reverb broadcast → invalidate + toast + sound
  useRealtimePesanan()
  // Edge presence: PartyKit admin-presence room (no-op if VITE_PARTYKIT_HOST unset)
  usePartyPresence()

  // Unlock Web Audio from first trusted gesture (per uisfx guide)
  useEffect(() => {
    const unlock = () => {
      void unlockUISFX()
      window.removeEventListener("click", unlock)
      window.removeEventListener("keydown", unlock)
    }
    window.addEventListener("click", unlock, { once: true })
    window.addEventListener("keydown", unlock, { once: true })
    return () => {
      window.removeEventListener("click", unlock)
      window.removeEventListener("keydown", unlock)
    }
  }, [])

  return (
    <div className="overflow-hidden">
      <SidebarProvider className="relative h-svh">
        <AppSidebar />
        <SidebarInset className="flex min-w-0 flex-1 flex-col overflow-hidden md:peer-data-[variant=inset]:ml-0">
          <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
