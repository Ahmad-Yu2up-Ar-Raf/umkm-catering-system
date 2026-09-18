import { useEffect } from "react" // 1. Tambahkan import useEffect
import { NavGroup } from "./nav-group"
import { navGroups, navExternal } from "../app-shared"
import { LogOut } from "./log-out"
import { Link, useLocation } from "react-router" // 2. Tambahkan import useLocation
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/fragments/shadcn-ui/tooltip"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
} from "@hugeicons/core-free-icons"
import Logo from "@/components/svg/app-logo-svg"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarGroupContent,
  SidebarMenuItem,
} from "@/components/ui/fragments/shadcn-ui/sidebar"

export function AppSidebar() {
  const isMobile = useIsMobile()
  // 3. Destructure setOpenMobile dari useSidebar
  const { open, openMobile, toggleSidebar, setOpenMobile } = useSidebar()
  const sidebarOpen = isMobile ? openMobile : open

  // 4. Panggil useLocation untuk melacak path saat ini
  const location = useLocation()

  // 5. Efek ajaib untuk menutup sidebar otomatis di mobile saat URL berubah
  useEffect(() => {
    if (isMobile && openMobile) {
      setOpenMobile(false)
    }
  }, [location.pathname, isMobile, setOpenMobile]) // Trigger setiap kali pathname berubah

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="h-17 justify-center">
        <div
          className={cn(
            "relative flex w-full items-center",
            sidebarOpen ? "justify-between gap-2" : "justify-center"
          )}
        >
          {/* Brand Logo */}
          <SidebarMenuButton asChild>
            <Link
              to={"/dashboard"}
              className={cn(
                !sidebarOpen && !isMobile && "group-hover:opacity-0"
              )}
            >
              <div
                className={cn(
                  "flex aspect-square items-center justify-center rounded-md text-white",
                  "size-5"
                )}
              >
                <Logo
                  className={cn(
                    "mr-1 size-full fill-current text-white transition-all duration-300",
                    sidebarOpen ? "scale-[2]" : "scale-[1.8]"
                  )}
                />
              </div>
              {(sidebarOpen || isMobile) && (
                <div className="ml-3 grid flex-1 text-left text-xl">
                  <span className="truncate font-accent text-lg leading-tight font-bold tracking-widest text-accent-foreground italic">
                    Nusantara
                  </span>
                </div>
              )}
            </Link>
          </SidebarMenuButton>
          {!isMobile && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  aria-label={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
                  className={cn(
                    "shrink-0 transition-opacity",
                    "h opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
                    !sidebarOpen && "absolute inset-0 m-auto"
                  )}
                >
                  <HugeiconsIcon
                    icon={sidebarOpen ? PanelLeftCloseIcon : PanelLeftOpenIcon}
                    className="size-4"
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" align="center">
                <span className="flex items-center gap-2">
                  Toggle Sidebar
                  <kbd className="rounded border border-border bg-muted px-1 font-mono text-[10px] text-primary">
                    Ctrl+B
                  </kbd>
                </span>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group, index) => (
          <NavGroup key={`sidebar-group-${index}`} {...group} />
        ))}
        <SidebarGroup className="mt-auto pt-4">
          <SidebarGroupLabel>Akses Cepat</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navExternal.map((item, i) => (
                <SidebarMenuItem key={`nav-external-${i}`}>
                  <SidebarMenuButton tooltip={item.title} asChild>
                    <Link to={item.path} className="gap-4">
                      <HugeiconsIcon
                        strokeWidth={2}
                        icon={item.icon}
                        className="size-4 shrink-0"
                      />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <LogOut />
      </SidebarFooter>
    </Sidebar>
  )
}
