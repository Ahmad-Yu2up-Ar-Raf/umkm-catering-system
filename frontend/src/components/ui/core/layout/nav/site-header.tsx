import { HugeiconsIcon } from "@hugeicons/react"
import { OriginButton } from "../../../fragments/custom-ui/button/cta-button"
import { NavbarLogo } from "./app-logo"
import { NavBody, NavItems, Navbar } from "./components/navbar"

import { cn } from "@/lib/utils"
import {
  WhatsappBusinessFreeIcons,
  WhatsappIcon,
} from "@hugeicons/core-free-icons"

export function SiteHeader({ className }: { className?: string }) {
  const navItems = [
    {
      name: "Artikel",
      link: "/artikel/",
    },

    {
      name: "Destinasi",
      link: "/destinasi/",
    },
    {
      name: "Peringkat",
      link: "/destinasi/leaderboard/",
    },
    {
      name: "Game",
      link: "/game",
    },
  ]

  return (
    <Navbar className={cn("", className)}>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        <OriginButton
          intensity={0.8} // opsional, defaultnya 0.6
          range={120} // opsional, defaultnya 100
          className="group h-fit px-5 py-3 text-[12px] tracking-widest uppercase"
        >
          Kontak
          <HugeiconsIcon
            icon={WhatsappIcon}
            className="stroke-primtext-primary z-[9] size-4 fill-none transition-all duration-[800ms] ease-out group-hover:stroke-white"
          />
        </OriginButton>
        {/* <AvatarMenu user={session?.user as User} isHomePage /> */}
      </NavBody>
    </Navbar>
  )
}
