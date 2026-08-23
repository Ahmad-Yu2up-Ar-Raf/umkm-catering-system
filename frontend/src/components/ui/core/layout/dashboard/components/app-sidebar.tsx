import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/fragments/shadcn-ui/sidebar"
import { NavGroup } from "./nav-group"
import { navGroups } from "../app-shared"
import { LogOut } from "./log-out"
import { Link } from "react-router"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import AppLogo from "./app-logo"
import Logo from "@/components/svg/app-logo-svg"

export function AppSidebar() {
  const isMobile = useIsMobile()
  const { open, openMobile } = useSidebar()
  const sidebarOpen = isMobile ? openMobile : open

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="h-17 justify-center">
        <SidebarMenuButton asChild>
          <Link to={"/"}>
            <div
              className={cn(
                "flex aspect-square items-center justify-center rounded-md text-white",

                "size-5"
              )}
            >
              <Logo
                className={cn(
                  "size-full mr-1 fill-current text-white transition-all duration-300",
                  sidebarOpen ? "scale-[2]" : "scale-[1.8]"
                )}
              />
            </div>
            <div className="ml-3 grid flex-1 text-left text-xl">
              <span className=" truncate font-accent text-lg leading-tight font-bold tracking-widest text-accent-foreground italic">
                Nusantara
              </span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>
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
