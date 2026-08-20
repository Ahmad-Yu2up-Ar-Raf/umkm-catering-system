"use client"

import { Input } from "@/components/ui/fragments/shadcn-ui/input"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/fragments/shadcn-ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  FilterIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import { PAKET_KATEGORI_OPTIONS, KATEGORI_ACARA_OPTIONS } from "../config/paket-enum-options"
import { PaketViewToggle } from "./paket-view-toggle"

const ALL = "all"

interface PaketToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  onSearchClear: () => void
  kategoriPaket: string
  onKategoriPaketChange: (value: string) => void
  kategoriAcara: string
  onKategoriAcaraChange: (value: string) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
  onAdd: () => void
}

export function PaketToolbar({
  search,
  onSearchChange,
  onSearchClear,
  kategoriPaket,
  onKategoriPaketChange,
  kategoriAcara,
  onKategoriAcaraChange,
  onClearFilters,
  hasActiveFilters,
  onAdd,
}: PaketToolbarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <Input
          leftIcon={Search01Icon}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={onSearchClear}
          clearable
          placeholder="Cari nama paket..."
          aria-label="Cari paket"
          className="w-full xl:max-w-xs"
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:flex">
          <Select
            value={kategoriPaket || ALL}
            onValueChange={(value) => onKategoriPaketChange(value === ALL ? "" : value)}
          >
            <SelectTrigger className="w-full xl:w-44" aria-label="Filter kategori paket">
              <SelectValue placeholder="Kategori Paket" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Semua Kategori</SelectItem>
              {PAKET_KATEGORI_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={kategoriAcara || ALL}
            onValueChange={(value) => onKategoriAcaraChange(value === ALL ? "" : value)}
          >
            <SelectTrigger className="w-full xl:w-44" aria-label="Filter kategori acara">
              <SelectValue placeholder="Kategori Acara" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Semua Acara</SelectItem>
              {KATEGORI_ACARA_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-fit text-muted-foreground"
              onClick={onClearFilters}
            >
              <HugeiconsIcon icon={FilterIcon} className="size-4" />
              Bersihkan Filter
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3 xl:ml-auto xl:pl-3">
          <PaketViewToggle />
          <Button className="w-fit" onClick={onAdd}>
            <HugeiconsIcon icon={Add01Icon} className="size-4" />
            Tambah Paket
          </Button>
        </div>
      </div>
    </div>
  )
}
