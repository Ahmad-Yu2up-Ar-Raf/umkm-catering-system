"use client"

import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SquareIcon,
  DashboardSquare01Icon,
  Menu01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

export type LayoutMode = "horizontal" | "grid-2" | "grid-3"

interface CatalogLayoutToggleProps {
  current: LayoutMode
  onChange: (mode: LayoutMode) => void
}

/** Luxe tween — matches the shared easing family (2px 'magnet' feel). */
const LUXE_EASE = [0.16, 1, 0.3, 1] as const

const MODES: { mode: LayoutMode; icon: typeof Menu01Icon; label: string }[] = [
  { mode: "horizontal", icon: Menu01Icon, label: "1 kolom" },

  { mode: "grid-3", icon: DashboardSquare01Icon, label: "3 kolom" },
]

/**
 * CatalogLayoutToggle — pill-shaped 1/2/3-column switcher with a Framer
 * `layoutId` sliding active background (same grammar as `category-nav`).
 */
export function CatalogLayoutToggle({
  current,
  onChange,
}: CatalogLayoutToggleProps) {
  return (
    <div
      role="group"
      aria-label="Tampilan katalog"
      className="flex items-center gap-0.5 rounded-full border border-border bg-background/70 p-1"
    >
      {MODES.map(({ mode, icon: Icon, label }) => {
        const active = mode === current
        return (
          <button
            key={mode}
            type="button"
            aria-label={label}
            aria-pressed={active}
            onClick={() => onChange(mode)}
            className={cn(
              "relative flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors duration-300 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary",
              active && "text-primary"
            )}
          >
            {active && (
              <motion.span
                layoutId="activeLayoutMode"
                transition={{ type: "tween", ease: LUXE_EASE, duration: 0.45 }}
                className="absolute inset-0 rounded-full bg-accent"
              />
            )}
            <HugeiconsIcon icon={Icon} className="relative z-10 size-4" />
          </button>
        )
      })}
    </div>
  )
}
