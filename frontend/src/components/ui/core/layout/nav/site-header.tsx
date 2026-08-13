"use client"

import { useEffect, useRef, useState } from "react"
import type { MouseEvent as ReactMouseEvent } from "react"

import { AnimatePresence, motion } from "framer-motion"
import { useLenis } from "lenis/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { OriginButton } from "../../../fragments/custom-ui/button/cta-button"
import { NavbarLogo } from "./app-logo"
import { NavBody, NavItems, Navbar } from "./components/navbar"

import { cn } from "@/lib/utils"
import { scrollToHash } from "@/lib/hash-scroll"

import { Link, useLocation, useNavigate } from "react-router"
import { WhatsappIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const

/** Homepage section anchors (audited ids: hero / profil / cara-pesan /
 *  testimoni / faq / kontak). */
const NAV_ITEMS = [
  { name: "Profil", link: "/#profil" },
  { name: "Paket", link: "/paket" },
  { name: "Testimoni", link: "/#testimoni" },
  { name: "FAQ", link: "/#faq" },
  { name: "Kontak", link: "/kontak" },
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
      size={"default"}
      variant={"outline"}
      className="flex scale-90 items-center justify-center rounded-full border border-primary/20 p-2 transition-colors duration-300"
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
  onClose,
  onNavigate,
  onContact,
  visible,
}: {
  open: boolean
  onToggle: () => void
  onClose: () => void
  onNavigate: (e: ReactMouseEvent<HTMLAnchorElement>, hash: string) => void
  onContact: () => void
  visible?: boolean
}) {
  const glassed = visible || open
  // The whole bar (trigger + drawer) is the "inside" region: any pointer press
  // landing OUTSIDE it, or an Escape keypress, closes the open drawer.
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!barRef.current?.contains(e.target as Node)) onClose()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, onClose])

  return (
    <div
      ref={barRef}
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
            className="absolute top-full right-1 left-1 mt-3 rounded-2xl border border-border/80 bg-background p-4 shadow-sm backdrop-blur-md"
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
                    onClick={(e) => onNavigate(e, item.link)}
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
                  onClick={onContact}
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
  const lenis = useLenis()
  const navigate = useNavigate()
  const location = useLocation()

  /** Owns every `#section` jump — instant, so section links feel like a raw
   *  anchor jump, but routed through Lenis so the pinned #cara-pesan timeline
   *  can't hijack the position.
   *  - same page   → pushState the URL + `scrollToHash` (no React Router
   *    re-render, so the homepage's mount teleport never refires — and no
   *    mid-scroll `ScrollTrigger.refresh()`, so the target coordinates stay
   *    valid).
   *  - other route → navigate back to `/` with the hash; the homepage's mount
   *    effect refreshes ONCE and then teleports once the layout is stable. */
  const jumpToSection = (raw: string) => {
    setMenuOpen(false)
    const section = raw.replace(/^\/+/, "") // "/#faq" → "#faq"
    if (location.pathname === "/") {
      window.history.pushState(null, "", `/${section}`)
      // Pin-safe instant scroll — same code path as the homepage's cross-route
      // landing: Lenis' native resolution + a `ScrollTrigger.update()` sync.
      scrollToHash(section, lenis)
      return
    }
    navigate({ pathname: "/", hash: section })
  }

  /** Intercepts section-anchor clicks (`#faq` OR `/#faq`) so Lenis does the
   *  scrolling instead of React Router's hash-only re-render. Real routes
   *  (`/kontak`) keep their default Link navigation. */
  const handleNavClick = (
    e: ReactMouseEvent<HTMLAnchorElement>,
    hash: string
  ) => {
    // Close the drawer on EVERY click — section anchors AND real page routes
    // like /kontak (the caller below returns before jumpToSection would run).
    setMenuOpen(false)
    if (!hash.startsWith("#") && !hash.startsWith("/#")) return
    e.preventDefault()
    jumpToSection(hash)
  }
  const { pathname } = useLocation()
  const isHomePage = pathname === "/"

  return (
    <Navbar isHomePage={isHomePage} className={cn("", className)}>
      {/* Desktop pill navigation — scroll-triggered, lg+ (unchanged). */}
      <NavBody isHomePage={isHomePage}>
        <NavbarLogo />
        <NavItems items={NAV_ITEMS} onItemClick={handleNavClick} />
        <OriginButton
          intensity={0.8}
          range={120}
          onClick={() => jumpToSection("#kontak")}
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
        onClose={() => setMenuOpen(false)}
        onNavigate={handleNavClick}
        onContact={() => jumpToSection("#kontak")}
      />
    </Navbar>
  )
}
