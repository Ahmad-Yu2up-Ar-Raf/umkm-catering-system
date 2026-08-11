"use client"

import { useEffect, useState } from "react"

import { Search01Icon } from "@hugeicons/core-free-icons"
import { Input } from "@/components/ui/fragments/shadcn-ui/input"

/** Debounce pause before a keystroke is committed to the URL (?search=). */
const DEBOUNCE_MS = 300

/**
 * SearchBar — minimalist pill search with strict one-way data flow: the local
 * `value` is the ONLY source of truth for the input. Typing updates it
 * instantly, then a 300ms debounce commits it to the URL via
 * `onSearchChange` (→ `?search=`).
 *
 * The URL is NEVER mirrored back into the input while it is focused — so a
 * self-originated debounced commit (or any navigation) can't clobber live
 * typing, and trailing spaces are preserved. Re-sync only happens when the
 * input is NOT focused (explicit external resets / back-forward) via a
 * render-time adjustment, per React's derived-state pattern.
 */
export function SearchBar({
  search,
  onSearchChange,
}: {
  search: string
  onSearchChange: (term: string) => void
}) {
  const [value, setValue] = useState(search)
  const [focused, setFocused] = useState(false)
  const [prevSearch, setPrevSearch] = useState(search)

  // Local typing → debounced URL write. Skipped while already in sync, so a
  // trailing space never schedules a redundant re-commit.
  useEffect(() => {
    if (value.trim() === search) return
    const id = window.setTimeout(() => onSearchChange(value), DEBOUNCE_MS)
    return () => window.clearTimeout(id)
  }, [value, search, onSearchChange])

  // Render-time adjustment (React's derived-state pattern): fires only when
  // the URL actually changed AND the input is NOT focused — mid-typing
  // commits land while focused, so they never re-write the field.
  if (prevSearch !== search) {
    setPrevSearch(search)
    if (!focused && value !== search) setValue(search)
  }

  return (
    <Input
      variant="ghost"
      leftIcon={Search01Icon}
      clearable
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder="Cari paket…"
      aria-label="Cari paket"
      className="h-9 w-full rounded-full border-border bg-muted/40"
    />
  )
}
