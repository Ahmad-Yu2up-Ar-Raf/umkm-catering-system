import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/fragments/shadcn-ui/sidebar"
import { NavGroup } from "./nav-group"
import { navGroups } from "../app-shared"

import { cn } from "@/lib/utils"
import { Link, useLocation } from "react-router"
import { useIsMobile } from "@/hooks/use-mobile"
import { NavUser } from "./nav-user"
import Logo from "@/components/svg/app-logo-svg"

export function AppSidebar() {
  const isMobile = useIsMobile()
  const { open, openMobile } = useSidebar()
  const sidebarOpen = isMobile ? openMobile : open
  const location = useLocation()
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="h-17 justify-center">
        <SidebarMenuButton asChild className=" hover:bg-transparent">
          <Link to={"/"}>
            <div
              className={cn(
                "flex aspect-square items-center justify-center rounded-md text-white",

                "size-5"
              )}
            >
              <Logo
                className={cn(
                  "size-full fill-current text-white transition-all duration-300",
                  sidebarOpen ? "scale-[3]" : "scale-[2.25]"
                )}
              />
            </div>
            <div className="ml-3 grid flex-1 text-left text-xl">
              <span className="mb-0.5 truncate font-accent text-xl leading-tight font-bold tracking-widest text-primary italic">
                Nusantara
              </span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        {/* {navGroups.map((group, index) => (
          <NavGroup key={`sidebar-group-${index}`} {...group} />
        ))} */}
      </SidebarContent>
      <SidebarFooter>
        {/* <LatestChange /> */}

        {/* <NavUser /> */}
      </SidebarFooter>
    </Sidebar>
  )
}
