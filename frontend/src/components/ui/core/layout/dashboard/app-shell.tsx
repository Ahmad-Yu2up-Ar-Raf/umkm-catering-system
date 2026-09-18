import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/fragments/shadcn-ui/sidebar"
import { AppSidebar } from "./components/app-sidebar" // Pastikan import sesuai dengan path kamu
import { AppSidebarHeader } from "./components/app-sidebar-header"
import { Outlet } from "react-router"
import { useSeo } from "@/hooks/use-seo"

export function AppShell() {
  // Admin surface: never indexable (robots.txt disallows /dashboard too).
  useSeo({ title: "Dashboard", noindex: true })

  return (
    <div className="overflow-hidden">
      <SidebarProvider className="relative h-svh">
        <AppSidebar />

        {/* Konten Utama */}
        <SidebarInset className="flex min-w-0 flex-1 flex-col overflow-hidden md:peer-data-[variant=inset]:ml-0">
          {/* Header Mobile Sticky - Akan ter-hide otomatis di Desktop karena ada class md:hidden */}
          <AppSidebarHeader />

          {/* Wrapper Konten Outlet - Tambahkan padding p-4 agar konten tidak terlalu mepet layar */}
          <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-3 md:p-0">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
