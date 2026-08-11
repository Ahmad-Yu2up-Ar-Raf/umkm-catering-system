"use client"

import { motion, useMotionValueEvent, useScroll } from "framer-motion"
import { Link, useMatches } from "react-router"
import React, { useEffect, useState } from "react"

import type { VariantProps } from "class-variance-authority"

import { buttonVariants } from "@/components/ui/fragments/shadcn-ui/button"

import { cn } from "@/lib/utils"

interface NavbarProps {
  children: React.ReactNode
  className?: string
  isPaketPage: boolean
}

interface NavBodyProps {
  children: React.ReactNode
  className?: string
  visible?: boolean
  isPaketPage: boolean
}

interface NavItemsProps {
  items: Array<{
    name: string
    link: string
  }>
  visible?: boolean
  className?: string
  onItemClick?: (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => void
}

/**
 * lg and up — the exact boundary this layout uses to switch the MobileBar
 * (`lg:hidden`) and the desktop pill (`lg:flex`). Hide-on-scroll only applies
 * at/above lg; below it the header must stay pinned at y:0. Mirrors
 * `useIsMobile`'s shape but at the 1024px breakpoint.
 */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches
  )
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)")
    const onChange = () => setIsDesktop(mql.matches)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])
  return isDesktop
}

export const Navbar = ({ children, className, isPaketPage }: NavbarProps) => {
  // Hide-on-scroll + glass signals, both from the WINDOW scroll position.
  // A target-scoped `useScroll({ target: ref })` dies on route change: the
  // `motion.nav` that owns `ref` only renders on the non-paket branch, so the
  // hook's one-shot ref-resolution gives up while the ref is detached and
  // never re-attaches when it hydrates later — `visible` stays false forever
  // and the glass/padding never appears. Window scroll works on every route
  // and survives the branch unmount/remount (this is the same mechanism that
  // already drives the hide-on-scroll `visiblee` signal).
  const isDesktop = useIsDesktop()
  const { scrollY, scrollYProgress } = useScroll()
  const [visible, setVisible] = useState<boolean>(
    () => typeof window !== "undefined" && window.scrollY > 100
  )
  const [visiblee, setVisiblee] = useState(true)
  const [delay, setDelay] = useState(true)

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 100)
  })

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    // Check if current is not undefined and is a number
    if (typeof current === "number") {
      const direction = current - scrollYProgress.getPrevious()!
      setDelay(false)

      if (direction < 0) {
        setVisiblee(true)
      } else {
        setVisiblee(false)
      }
    }
  })

  if (!isPaketPage)
    return (
      <nav
        className={cn(
          "relative top-3 z-40 w-full bg-background px-4 transition-all duration-300 ease-out md:top-4 md:px-6",

          // paths != '/' && visible == false ? '   ' : ' sticky',
          className
        )}
      >
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(
                child as React.ReactElement<{ visible?: boolean }>,
                { visible }
              )
            : child
        )}
      </nav>
    )
  return (
    <motion.nav
      initial={{
        opacity: 1,
        y: -100,
      }}
      animate={{
        // Below lg the header is always pinned (no hide-on-scroll). At lg+ it
        // slides out on scroll-down (`visiblee=false`) and returns on scroll-up.
        y: isDesktop ? (visiblee ? 0 : -100) : 0,
        opacity: isDesktop ? (visiblee ? 1 : 0) : 1,
      }}
      transition={{
        duration: delay ? 0.6 : 0.2,
        delay: delay ? 2 : 0,
      }}
      className={cn(
        "fixed top-3 z-40 w-full transition-all duration-300 ease-out md:top-4 ",
        !visible ? "pt-2" : "mt-0",
        // paths != '/' && visible == false ? '   ' : ' sticky',
        className
      )}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible }
            )
          : child
      )}
    </motion.nav>
  )
}

export const NavBody = ({
  children,
  className,
  visible,
  isPaketPage,
}: NavBodyProps) => {
  if (!isPaketPage)
    return (
      <div
        className={cn(
          "relative z-60 mx-auto hidden w-full max-w-5xl flex-row items-center justify-between self-start rounded-full px-3 py-2 transition-all duration-300 ease-out lg:flex",

          className
        )}
      >
        {children}
      </div>
    )

  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        // boxShadow: visible
        //   ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
        //   : "none",
        width: "100%",
        paddingLeft: visible ? "20px" : "3px",
        paddingRight: visible ? "20px" : "3px",
        paddingTop: visible ? "12px" : "3px",
        paddingBottom: visible ? "12px" : "3px",
        // y: visible ? 10 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 190,
        damping: 50,
      }}
      style={{
        minWidth: "650px",
        // padding: "0px"
      }}
      className={cn(
        "relative z-60 container mx-auto hidden w-full max-w-[60rem] flex-row items-center justify-between self-start rounded-full py-2 transition-all duration-300 ease-out lg:flex",
        visible && "border bg-background/80",
        className
      )}
    >
      {children}
    </motion.div>
  )
}

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null)
  const matches = useMatches()
  const paths = matches[matches.length - 1]?.id
  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "pointer-events-none absolute inset-0 hidden flex-1 flex-row items-center justify-center p-0 px-0 text-xs font-medium text-zinc-600 transition duration-200 hover:text-zinc-800 lg:flex",
        className
      )}
    >
      {items.map((item, idx) => {
        const isActive = item.link == paths
        return (
          <Link
            onMouseEnter={() => setHovered(idx)}
            onClick={(e) => onItemClick?.(e, item.link)}
            className={cn(
              "cursor-target pointer-events-auto relative px-4 py-2 text-accent-foreground",
              isActive && ""
            )}
            key={`link-${idx}`}
            to={item.link}
          >
            {(hovered === idx || isActive) && (
              <motion.div
                layoutId="hovered"
                className="absolute inset-0 h-full w-full rounded-xl bg-header"
              />
            )}
            <span className="relative z-20 text-xs">{item.name}</span>
          </Link>
        )
      })}
    </motion.div>
  )
}

export const NavbarButton = ({
  href,
  children,
  className,
  variant = "default",
  ...props
}: {
  href?: string

  children: React.ReactNode
  className?: string
} & VariantProps<typeof buttonVariants>) => {
  return (
    <Link
      to={href || "/"}
      className={cn(
        buttonVariants({ variant: variant, size: props.size }),
        "cursor-target cursor-target z-50 text-xs",
        className
      )}
      // {...props}
    >
      {children}
    </Link>
  )
}
