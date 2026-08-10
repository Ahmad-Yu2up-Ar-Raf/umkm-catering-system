"use client"

import { useEffect, useState } from "react"

import { Search01Icon } from "@hugeicons/core-free-icons"
import { Input } from "@/components/ui/fragments/shadcn-ui/input"

/** Debounce pause before a keystroke is committed to the URL (?search=). */
const DEBOUNCE_MS = 300

/**
 * SearchBar — minimalist pill search. Owns the instant typing value locally;
 * the URL is the source of truth, so every change is debounced into
 * `onSearchChange` (→ `?search=`).
 *
 * The URL → input mirror uses React's "adjust state during render" pattern
 * instead of an effect: when `search` changes externally (back/forward,
 * Reset filter) the input re-syncs during render — and never re-writes the
 * stale local value back into the URL.
 */
export function SearchBar({
  search,
  onSearchChange,
}: {
  search: string
  onSearchChange: (term: string) => void
}) {
  const [value, setValue] = useState(search)
  const [prevSearch, setPrevSearch] = useState(search)

  if (prevSearch !== search) {
    setPrevSearch(search)
    setValue(search)
  }

  // Local typing → debounced URL write (skipped while already in sync).
  useEffect(() => {
    if (value === search) return
    const id = window.setTimeout(() => onSearchChange(value), DEBOUNCE_MS)
    return () => window.clearTimeout(id)
  }, [value, search, onSearchChange])

  return (
    <Input
      variant="ghost"
      leftIcon={Search01Icon}
      clearable
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Cari paket…"
      aria-label="Cari paket"
      className="h-9 w-full rounded-full border-border bg-muted/40"
    />
  )
}
