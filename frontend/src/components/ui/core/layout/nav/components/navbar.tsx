"use client"

import { motion, useMotionValueEvent, useScroll } from "framer-motion"
import { Link, useMatches } from "react-router"
import React, { useRef, useState } from "react"

import type { VariantProps } from "class-variance-authority"

import { buttonVariants } from "@/components/ui/fragments/shadcn-ui/button"

import { cn } from "@/lib/utils"

interface NavbarProps {
  children: React.ReactNode
  className?: string
}

interface NavBodyProps {
  children: React.ReactNode
  className?: string
  visible?: boolean
}

interface NavItemsProps {
  items: Array<{
    name: string
    link: string
  }>
  visible?: boolean
  className?: string
  onItemClick?: () => void
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const matches = useMatches()
  const paths = matches[matches.length - 1]?.id
  const ref = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })
  const [visible, setVisible] = useState<boolean>(false)

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  })

  const { scrollYProgress } = useScroll()
  const [visiblee, setVisiblee] = useState(true)
  const [delay, setDelay] = useState(true)

  // Handle initial visibility when path changes

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

  return (
    <motion.nav
      ref={ref}
      initial={{
        opacity: 1,
        y: -100,
      }}
      animate={{
        y: visiblee ? 0 : -100,
        opacity: visiblee ? 1 : 0,
      }}
      transition={{
        duration: delay ? 0.6 : 0.2,
        delay: delay ? 4 : 0,
      }}
      className={cn(
        "fixed top-7.5 z-40 w-full md:top-7",
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

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        // boxShadow: visible
        //   ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
        //   : "none",
        width: "100%",
        paddingLeft: visible ? "15px" : "3px",
        paddingRight: visible ? "15px" : "3px",
        paddingTop: visible ? "10px" : "3px",
        paddingBottom: visible ? "10px" : "3px",
        // y: visible ? 10 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 190,
        damping: 50,
      }}
      style={{
        minWidth: "650px",
      }}
      className={cn(
        "relative z-60 container mx-auto hidden w-full max-w-4xl flex-row items-center justify-between self-start rounded-full py-2 transition-all duration-300 ease-out lg:flex",
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
            onClick={onItemClick}
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
