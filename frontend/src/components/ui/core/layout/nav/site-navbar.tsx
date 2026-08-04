"use client"
import { Link, useMatches } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { motion, useMotionValueEvent, useScroll } from "framer-motion"
import { useState } from "react"
import { NavbarLogo } from "./app-logo"
import { useIsMobile } from "@/hooks/use-mobile"

import { cn } from "@/lib/utils"
import {
  Button,
  buttonVariants,
} from "@/components/ui/fragments/shadcn-ui/button"

function SiteNavbar() {
  const { scrollYProgress } = useScroll()
  const [visiblee, setVisiblee] = useState(true)

  // Handle initial visibility when path changes

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    // Check if current is not undefined and is a number
    if (typeof current === "number") {
      const direction = current - scrollYProgress.getPrevious()!

      if (direction < 0) {
        setVisiblee(true)
      } else {
        setVisiblee(false)
      }
    }
  })

  const matches = useMatches()
  const paths = matches[matches.length - 1]?.routeId
  const isActive = paths !== "/" && paths !== "/game"
  const isActiveFixed = paths == "/destinasi/$destinasiId/" || paths == "/auth/"

  return (
    <nav
      className={cn(
        "top-0 z-40 w-full rounded-b-2xl bg-transparent",
        isActiveFixed ? "absolute" : "relative",

        paths == "/destinasi/$destinasiId/" &&
          "bg-blend-difference mix-blend-difference"
      )}
    >
      <header
        className={cn(
          "top-1 mx-auto flex w-full max-w-[53rem] items-center justify-start px-5 pt-2 pb-1 text-center md:rounded-b-none md:border-b md:px-0 md:py-1.5"
        )}
      >
        <Button
          variant={"link"}
          onClick={() => window.history.back()}
          size={"icon"}
          className={cn(
            "group flex w-fit items-center gap-2 py-2 text-base transition-colors md:flex",
            paths == "/destinasi/$destinasiId/" && "text-accent"
          )}
        >
          <ArrowLeft className="size-5 transition-all duration-300 ease-out group-hover:-translate-x-1 group-hover:transform" />
          <span className="md:sr-only">Kembali</span>
        </Button>
      </header>
    </nav>
  )
  if (isActive)
    return (
      <motion.nav
        animate={{
          y: visiblee ? 0 : -100,
          opacity: visiblee ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
          delay: 0,
        }}
        className={cn("top-0 z-50 w-full", isActiveFixed ? "fixed" : "sticky")}
      >
        {/* <div className="absolute h-50 inset-0 bg-linear-to-t from-background/0 via-background/0 to-background     " /> */}

        <header
          className={cn(
            "top-2 mx-auto flex w-full max-w-[53rem] items-center justify-center px-5 pt-6 pb-3 text-center md:justify-between md:rounded-b-none md:px-0 md:py-1.5"
          )}
        >
          <div
            className={cn(
              "absolute left-5.5 z-50 flex w-fit justify-between bg-none backdrop-blur md:relative md:left-0"
            )}
          >
            <Button
              variant={"ghost"}
              onClick={() => window.history.back()}
              size={"icon"}
              className={cn(
                "group flex w-fit items-center gap-2 bg-none py-2 text-base transition-colors md:flex"
              )}
            >
              <ArrowLeft className="size-5 transition-all duration-300 ease-out group-hover:-translate-x-1 group-hover:transform" />
              <span className="md:sr-only">Kembali</span>
            </Button>
          </div>

          <div className="">
            <div className="flex items-center justify-center gap-3 text-2xl">
              <NavbarLogo />
            </div>
          </div>
          <div className="z-50">
            {/* <AvatarMenu user={session?.user as User} /> */}
          </div>
        </header>
      </motion.nav>
    )
}

export default SiteNavbar
