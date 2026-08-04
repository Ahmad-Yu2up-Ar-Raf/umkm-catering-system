import ReactLenis from "lenis/react"
import SiteFooter from "../ui/core/layout/nav/site-footer"
import SiteBorder from "../ui/core/layout/nav/site-border"
import { SiteHeader } from "../ui/core/layout/nav/site-header"
import { Outlet } from "react-router"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

export function LayoutWrapper() {
  const isMobile = useIsMobile()

  return (
    <ReactLenis root>
      {!isMobile && <SiteBorder />}
      {/* <SiteHeader /> */}
      {/* Add padding-bottom on mobile to account for fixed navbar */}
      <div
        className={cn("relative w-full overflow-hidden md:overflow-visible")}
      >
        <div
          className={cn(
            "relative mx-auto flex h-full w-full flex-col content-center gap-10 overflow-x-hidden sm:gap-8 md:overflow-visible lg:gap-25"
          )}
        >
          <Outlet />
          <div className="pointer-events-none fixed inset-0 top-0 h-50 bg-linear-to-t from-background/0 via-background/0 to-background" />
        </div>
      </div>
      {/* Footer only shows when shouldShowFooter is true */}
      <SiteFooter />
    </ReactLenis>
  )
}
