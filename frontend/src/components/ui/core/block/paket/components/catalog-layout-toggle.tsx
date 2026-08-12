"use client"

import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  SquareIcon,
  DashboardSquare01Icon,
  Menu01Icon
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

export type LayoutMode = "horizontal" | "grid-2" | "grid-3"

interface CatalogLayoutToggleProps {
  current: LayoutMode
  onChange: (mode: LayoutMode) => void
}

export function CatalogLayoutToggle({ current, onChange }: CatalogLayoutToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border p-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange("horizontal")}
        className={cn(
          "size-8 rounded-md transition-colors",
          current === "horizontal" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <HugeiconsIcon icon={Menu01Icon} className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange("grid-2")}
        className={cn(
          "size-8 rounded-md transition-colors",
          current === "grid-2" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <HugeiconsIcon icon={DashboardSquare01Icon} className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange("grid-3")}
        className={cn(
          "size-8 rounded-md transition-colors",
          current === "grid-3" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <HugeiconsIcon icon={SquareIcon} className="size-4" />
      </Button>
    </div>
  )
}
