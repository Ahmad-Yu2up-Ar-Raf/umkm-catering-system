import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/fragments/shadcn-ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/fragments/shadcn-ui/sidebar"
import type { SidebarNavGroup } from "../app-shared"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { Link, useLocation } from "react-router"
import { cn } from "@/lib/utils"

export function NavGroup({ label, items }: SidebarNavGroup) {
  const location = useLocation()
  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            asChild
            className="group/collapsible"
            defaultOpen={
              location.pathname !== item.path ||
              item.subItems?.some((i) => location.pathname !== i.path)
            }
            key={item.title}
          >
            <SidebarMenuItem>
              {item.subItems?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      isActive={location.pathname == item.path}
                    >
                      {item.icon && <HugeiconsIcon icon={item.icon} />}
                      <span>{item.title}</span>
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        strokeWidth={2}
                        className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.subItems?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={location.pathname == item.path}
                          >
                            <Link to={subItem.path || "/"}>
                              {item.icon && <HugeiconsIcon icon={item.icon} />}
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : (
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname == item.path}
                >
                  <Link to={item.path || "/"}>
                    {item.icon && (
                      <HugeiconsIcon
                        strokeWidth={2}
                        className={cn(
                          location.pathname == item.path && "text-primary"
                        )}
                        icon={item.icon}
                      />
                    )}
                    <span className="text-sm">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
