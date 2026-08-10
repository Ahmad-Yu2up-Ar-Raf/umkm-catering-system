"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/fragments/shadcn-ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/fragments/shadcn-ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/fragments/shadcn-ui/sidebar"
import { useAuth } from "@/components/ui/core/block/auth/hooks/use-auth"
import { useInitials } from "@/hooks/use-initial"
import { useAuthStore } from "@/store/auth-store"
import { Bell, ChevronUp, LogOut, User } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export function NavUser() {
  const { isMobile } = useSidebar()
  const user = useAuthStore.getState().user
  const initial = useInitials()
  const { handleLogout } = useAuth()
  if (user)
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="mt-2 pl-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="size-8">
                  <AvatarImage alt={user.name} />
                  <AvatarFallback className="text-xs">
                    {initial(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-xs leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate">{user.email}</span>
                </div>
                <HugeiconsIcon icon={ChevronUp} className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="px-2 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-xs">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage alt={user.name} />
                    <AvatarFallback> {initial(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-xs leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem className="group hover:[&_svg]:text-primary">
                  <HugeiconsIcon
                    icon={User}
                    strokeWidth={2}
                    className="group-hover:text-primary"
                  />
                  Account
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <HugeiconsIcon icon={Bell} strokeWidth={2} />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout} variant="destructive">
                <HugeiconsIcon icon={LogOut} strokeWidth={2} />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    )
}
