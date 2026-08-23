"use client"

import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  GridViewIcon,
  Menu01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import {
  useGaleriViewStore,
  type GaleriAdminViewMode,
} from "@/store/galeri-admin-view-store"

/** Luxe tween — shared easing family with the catalog toggle (2px magnet feel). */
const LUXE_EASE = [0.16, 1, 0.3, 1] as const

const MODES: { mode: GaleriAdminViewMode; icon: typeof Menu01Icon; label: string }[] = [
  { mode: "table", icon: Menu01Icon, label: "Tabel" },
  { mode: "grid", icon: GridViewIcon, label: "Grid" },
]

/** Admin galeri view switcher — reads/writes the persisted `galeri-admin-view-store`. */
export function GaleriViewToggle() {
  const viewMode = useGaleriViewStore((s) => s.viewMode)
  const setViewMode = useGaleriViewStore((s) => s.setViewMode)

  return (
    <div
      role="group"
      aria-label="Tampilan daftar galeri"
      className="flex items-center gap-0.5 rounded-full border border-border bg-background/70 p-1"
    >
      {MODES.map(({ mode, icon: Icon, label }) => {
        const active = mode === viewMode
        return (
          <button
            key={mode}
            type="button"
            aria-label={label}
            aria-pressed={active}
            onClick={() => setViewMode(mode)}
            className={cn(
              "relative flex h-8 items-center gap-1.5 rounded-full px-3 text-xs text-muted-foreground transition-colors duration-300 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary",
              active && "text-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId="galeri-admin-view-mode"
                transition={{ type: "tween", ease: LUXE_EASE, duration: 0.45 }}
                className="absolute inset-0 rounded-full bg-accent"
              />
            )}
            <HugeiconsIcon icon={Icon} className="relative z-10 size-4" />
            <span className="relative z-10 hidden sm:inline">{label}</span>
          </button>
        )
      })}
    </div>
  )
}