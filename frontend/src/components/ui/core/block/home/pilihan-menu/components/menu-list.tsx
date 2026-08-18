"use client"

import { cn } from "@/lib/utils"
import { MENU_CHOICES } from "../menu-data"
import { MenuListItem } from "./menu-list-item"

/**
 * MenuList — the interactive tab column (md:order-1 / col-span-7).
 * Owns the arrow-key navigation; each row's click bubbles up via onSelect.
 */
export function MenuList({
  activeIndex,
  onSelect,
}: {
  activeIndex: number
  onSelect: (index: number) => void
}) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return
    event.preventDefault()

    const dir = event.key === "ArrowDown" ? 1 : -1
    const next = (activeIndex + dir + MENU_CHOICES.length) % MENU_CHOICES.length
    // Move focus to the newly selected tab for predictable keyboard UX.
    const target = document.getElementById(`menu-tab-${MENU_CHOICES[next].id}`)
    onSelect(next)
    target?.focus()
  }

  return (
    <div
      role="group"
      aria-label="Daftar paket menu"
      onKeyDown={handleKeyDown}
      className={cn("flex flex-col gap-2 ")}
    >
      {MENU_CHOICES.map((item, index) => (
        <MenuListItem
          key={item.id}
          item={item}
          isActive={index === activeIndex}
          onSelect={() => onSelect(index)}
        />
      ))}
    </div>
  )
}
