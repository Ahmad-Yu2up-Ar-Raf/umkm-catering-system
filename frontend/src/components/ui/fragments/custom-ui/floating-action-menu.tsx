"use client"

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { cn } from "@/lib/utils"

interface FloatingActionMenuProps {
  onCreate: () => void
  label?: string
  icon?: IconSvgElement
  className?: string
}

/**
 * Mobile-only direct Create FAB. Tapping it opens the Create drawer
 * immediately (no intermediate menu). Desktop uses toolbar buttons;
 * Export lives in the toolbar.
 */
export function FloatingActionMenu({
  onCreate,
  label = "Tambah",
  icon = Add01Icon,
  className,
}: FloatingActionMenuProps) {
  return (
    <div className={cn("fixed right-4 bottom-6 z-50 md:hidden", className)}>
      <Button
        type="button"
        aria-label={label}
        onClick={onCreate}
        className="size-12 rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:bg-primary/90 active:scale-95"
      >
        <HugeiconsIcon icon={icon} className="size-6" />
      </Button>
    </div>
  )
}
