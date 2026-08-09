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
import { footerNavLinks, navGroups } from "./app-shared"
 
import AppLogoIcon from "@/components/ui/fragments/svg/logo-app"
import { cn } from "@/lib/utils"
import { Link, useLocation } from "react-router"
import { useIsMobile } from "@/hooks/use-mobile"
import { NavUser } from "./nav-user"

export function AppSidebar() {
  const isMobile = useIsMobile()
  const { open, openMobile } = useSidebar()
  const sidebarOpen = isMobile ? openMobile : open
  const location = useLocation()
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
              <AppLogoIcon
                className={cn(
                  "size-full fill-current text-white transition-all duration-300",
                  sidebarOpen ? "scale-[2]" : "scale-[1.6]"
                )}
              />
            </div>
            <div className="ml-2 grid flex-1 text-left text-xl">
              <span className="mb-0.5 truncate leading-tight font-bold text-primary">
                LiveUp
              </span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        {/* <SidebarGroup>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              tooltip="Quick Create"
            >
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
              <span>New Conversation</span>
            </SidebarMenuButton>
            <Button
              aria-label="Search conversations"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              size="icon"
              variant="outline"
            >
              <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />
              <span className="sr-only">Search conversations</span>
            </Button>
          </SidebarMenuItem>
        </SidebarGroup> */}
        {navGroups.map((group, index) => (
          <NavGroup key={`sidebar-group-${index}`} {...group} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        {/* <LatestChange /> */}
        <SidebarMenu className="mt-2">
          {/* {footerNavLinks.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className="text-muted-foreground"
                isActive={location.pathname == item.path}
                size="sm"
              >
                <Link to={item.path || "/"}>
                  {item.icon && <HugeiconsIcon icon={item.icon} />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))} */}
        </SidebarMenu>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
