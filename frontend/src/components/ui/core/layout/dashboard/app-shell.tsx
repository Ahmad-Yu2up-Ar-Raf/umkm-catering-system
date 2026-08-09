import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/fragments/shadcn-ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { Outlet } from "react-router"

export function AppShell() {
  return (
    <div className="overflow-hidden">
      <SidebarProvider className="relative h-svh">
        <AppSidebar />
        <SidebarInset className="md:peer-data-[variant=inset]:ml-0">
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

