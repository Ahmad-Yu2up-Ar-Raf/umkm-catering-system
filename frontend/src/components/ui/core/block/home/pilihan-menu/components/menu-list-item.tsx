"use client"

import { cn } from "@/lib/utils"
import type { MenuChoice } from "../menu-data"

/**
 * MenuListItem — one tab row (exact DOM replica of the reference):
 * a block button with index numeral, title, arrow + a GSAP-driven progress
 * hairline that fills over the auto-advance window while active.
 *
 * - Separators are 1px, `border-border/40` — visible but never heavy.
 * - Active ↔ inactive switches crossfade via long eased CSS transitions.
 * - The ACTIVE state's "progress" lives in the GSAP `data-menu-progress`
 *   hairline (scaleX 0→1 over 6s, driven by the block scheduler).
 * - Titles truncate to a single line (one-line guarantee at every width).
 */
export function MenuListItem({
  item,
  isActive,
  onSelect,
}: {
  item: MenuChoice
  isActive: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onSelect}
      id={`menu-tab-${item.id}`}
      data-menu-item
      className="group relative block w-full border-b-[1px] border-border text-left first:border-t-[1px] first:border-border/40"
    >
      <span className="flex items-center gap-4 py-[12px] md:gap-6 md:py-[15px]">
        <span
          className={cn(
            "shrink-0 font-heading text-[11px] tracking-[0.1em] transition-all duration-500 ease-in-out md:text-[12px]",
            isActive
              ? "text-primary"
              : "text-primary/40 group-hover:text-primary/70"
          )}
        >
          {item.index}
        </span>
        <span
          className={cn(
            "min-w-0 flex-1 truncate font-heading text-xl leading-[1.2] font-light transition-all duration-500 ease-in-out md:text-2xl lg:text-3xl",
            isActive
              ? "text-primary"
              : "text-foreground/60 group-hover:text-foreground"
          )}
        >
          {item.title}
        </span>
        <span
          aria-hidden="true"
          className={cn(
            "shrink-0 text-[14px] text-primary transition-all duration-500 ease-in-out",
            isActive ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
          )}
        >
          →
        </span>
      </span>

      {/* Progress hairline — tweened by the block's scheduler. */}
      {isActive && (
        <span
          aria-hidden="true"
          data-menu-progress
          className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-primary"
        />
      )}
    </button>
  )
}
