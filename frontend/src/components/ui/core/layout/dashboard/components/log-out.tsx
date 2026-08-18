"use client"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/fragments/shadcn-ui/sidebar"
import { useAuth } from "@/components/ui/core/block/auth/hooks/use-auth"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout01Icon } from "@hugeicons/core-free-icons"

export function LogOut() {
  const { handleLogout } = useAuth()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip="Log Out"
          onClick={handleLogout}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
          <span>Log Out</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
