import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/fragments/shadcn-ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"
import { Outlet } from "react-router"
import { useSeo } from "@/hooks/use-seo"

export function AppShell() {
  // Admin surface: never indexable (robots.txt disallows /dashboard too).
  useSeo({ title: "Dashboard", noindex: true })
  return (
    <div className="overflow-hidden">
      <SidebarProvider className="relative h-svh">
        <AppSidebar />
        {/* Tambahkan min-w-0 dan overflow-hidden di sini 👇 */}
        <SidebarInset className="flex min-w-0 flex-1 flex-col overflow-hidden md:peer-data-[variant=inset]:ml-0">
          <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
