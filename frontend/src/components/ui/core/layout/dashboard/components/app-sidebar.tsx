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
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "@hugeicons/core-free-icons"
import Logo from "@/components/svg/app-logo-svg"

export function AppSidebar() {
  const isMobile = useIsMobile()
  const { open, openMobile, toggleSidebar } = useSidebar()
  const sidebarOpen = isMobile ? openMobile : open

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="h-17 justify-center">
        <div
          className={cn(
            "flex w-full items-center",
            sidebarOpen ? "justify-between gap-2" : "justify-center"
          )}
        >
          {(sidebarOpen || isMobile) && (
            <SidebarMenuButton asChild>
              <Link to={"/dashboard"}>
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
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
            className={cn(
              "shrink-0 transition-opacity",
              // Hover-revealed on desktop (Sidebar root carries `group`);
              // always visible on touch layouts where hover doesn't exist.
              "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100"
            )}
          >
            <HugeiconsIcon
              icon={sidebarOpen ? PanelLeftCloseIcon : PanelLeftOpenIcon}
              className="size-4"
            />
          </Button>
        </div>
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
