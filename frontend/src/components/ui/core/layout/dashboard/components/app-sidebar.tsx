import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/fragments/shadcn-ui/sidebar"
import { NavGroup } from "./nav-group"
import { navGroups } from "../app-shared"
import { LogOut } from "./log-out"

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarContent>
        {navGroups.map((group, index) => (
          <NavGroup key={`sidebar-group-${index}`} {...group} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <LogOut />
      </SidebarFooter>
    </Sidebar>
  )
}
