"use client"

import { useState } from "react"

import { AnimatePresence, motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { OriginButton } from "../../../fragments/custom-ui/button/cta-button"
import { NavbarLogo } from "./app-logo"
import { NavBody, NavItems, Navbar } from "./components/navbar"

import { cn } from "@/lib/utils"

import { Link } from "react-router"
import { WhatsappIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const

const NAV_ITEMS = [
  { name: "Beranda", link: "/" },
  { name: "Paket Katering", link: "/paket" },
  { name: "Tentang Kami", link: "/tentang-kami" },
  { name: "Cara Pemesanan", link: "/cara-pemesanan" },
  { name: "FAQ", link: "/faq" },
]

/**
 * Mobile hamburger — three thin (2px) lines with tight spacing that morph
 * into an X with a soft premium ease. Small (size-9) and elegant.
 */
function HamburgerButton({
  open,
  onClick,
}: {
  open: boolean
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      aria-label={open ? "Tutup menu" : "Buka menu"}
      aria-expanded={open}
        size={"icon"}
      variant={"outline"}
      className="flex p-2 scale-80  items-center justify-center rounded-full border   border-primary/20   transition-colors duration-300 "
    >
      <span
        className="relative flex h-3 w-5 flex-col justify-between"
        aria-hidden="true"
      >
        <motion.span
          className="h-[2px] w-full rounded-full bg-primary"
          animate={open ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.35, ease: LUXURY_EASE }}
        />
        <motion.span
          className="h-[2px] w-full rounded-full bg-primary"
          animate={open ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.2, ease: LUXURY_EASE }}
        />
        <motion.span
          className="h-[2px] w-full rounded-full bg-primary"
          animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.35, ease: LUXURY_EASE }}
        />
      </span>
    </Button>
  )
}

/**
 * Mobile header bar (< lg) — brand left, animated hamburger right, plus a
 * blur-revealed dropdown menu. Glassmorphism background syncs to the same
 * scroll signal as the desktop pill (`visible`) OR is forced on while the
 * menu is open.
 */
function MobileBar({
  open,
  onToggle,
  onNavigate,
  visible,
}: {
  open: boolean
  onToggle: () => void
  onNavigate: () => void
  visible?: boolean
}) {
  const glassed = visible || open

  return (
    <div
      className={cn(
        "relative container mx-auto flex items-center justify-between gap-3 px-2 py-2 transition-all duration-300 lg:hidden",
        glassed &&
          "rounded-full border border-border/80 bg-background/80 backdrop-blur-md"
      )}
    >
      <NavbarLogo />
      <HamburgerButton open={open} onClick={onToggle} />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
            transition={{ duration: 0.35, ease: LUXURY_EASE }}
            className="absolute top-full right-2 left-2 mt-3 rounded-2xl border border-border/80 bg-background p-4 shadow-sm backdrop-blur-md"
          >
            <ul className="flex flex-col gap-1">
              {NAV_ITEMS.map((item, i) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: 0.4,
                    ease: LUXURY_EASE,
                    delay: 0.06 + i * 0.05,
                  }}
                >
                  <Link
                    to={item.link}
                    onClick={onNavigate}
                    className="block rounded-lg px-4 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </motion.li>
              ))}
              <motion.li
                className="mt-2"
                initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.4,
                  ease: LUXURY_EASE,
                  delay: 0.06 + NAV_ITEMS.length * 0.05,
                }}
              >
                <OriginButton
                  intensity={0.8}
                  range={120}
                  onClick={onNavigate}
                  className="w-full text-[12px] tracking-widest uppercase"
                >
                  Kontak
                  <HugeiconsIcon
                    icon={WhatsappIcon}
                    className="size-4 fill-none transition-transform duration-700 ease-out group-hover:translate-x-1"
                  />
                </OriginButton>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function SiteHeader({ className }: { className?: string }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <Navbar className={cn("", className)}>
      {/* Desktop pill navigation — scroll-triggered, lg+ (unchanged). */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={NAV_ITEMS} />
        <OriginButton
          intensity={0.8}
          range={120}
          className="group h-fit px-5 py-3 text-[12px] tracking-widest uppercase"
        >
          Kontak
          <HugeiconsIcon
            icon={WhatsappIcon}
            className="stroke-primtext-primary z-[9] size-4 fill-none transition-all duration-[800ms] ease-out group-hover:stroke-white"
          />
        </OriginButton>
      </NavBody>

      {/* Mobile — brand left, animated hamburger right (< lg). */}
      <MobileBar
        open={menuOpen}
        onToggle={() => setMenuOpen((o) => !o)}
        onNavigate={() => setMenuOpen(false)}
      />
    </Navbar>
  )
}
