"use client"

import { useState } from "react"
import { Image01Icon } from "@hugeicons/core-free-icons"
import HeaderDashboard from "@/components/ui/fragments/custom-ui/typograhy/header"
import { DataTablePagination } from "@/components/ui/fragments/custom-ui/table/data-table-pagination"
import { useIsMobile } from "@/hooks/use-mobile"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useGaleriList } from "./hooks/use-galeri-query"
import {
  useGaleriBulkDeleteMutation,
  useGaleriBulkUpdateMutation,
  useGaleriDeleteMutation,
} from "./hooks/use-galeri-mutations"
import { useGaleriViewStore } from "@/store/galeri-admin-view-store"
import { DataTableSkeleton } from "@/components/ui/fragments/custom-ui/table/data-table-skeleton"
import { Skeleton } from "@/components/ui/fragments/shadcn-ui/skeleton"
import type { Galeri } from "./types/galeri-types"
import { GaleriToolbar } from "./components/galeri-toolbar"
import { GaleriTable } from "./components/galeri-table"
import { GaleriCardGrid } from "./components/galeri-card-grid"
import { CreateGaleriDrawer } from "./components/create-galeri-drawer"
import { UpdateGaleriDrawer } from "./components/update-galeri-drawer"
import { GaleriDeleteDialog } from "./components/galeri-delete-dialog"
import { GaleriTableActionBar } from "./components/galeri-table-action-bar"
import { DeleteDialog } from "@/components/ui/fragments/custom-ui/dialog/delete-dialog"
import { cn } from "@/lib/utils"

/**
 * Master Galeri — the admin MDM block.
 */
function MasterGaleriBlock() {
  const isMobile = useIsMobile()

  const [searchInput, setSearchInput] = useState("")
  const search = useDebouncedValue(searchInput.trim(), 350)

  const viewMode = useGaleriViewStore((s) => s.viewMode)

  const [kategoriAcara, setKategoriAcara] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("created_at")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const { data, isLoading, isError, isFetching } = useGaleriList({
    search,
    kategoriAcara,
    sortBy,
    sortDir,
    page,
    perPage,
  })

  const items = data?.items ?? []
  const pagination = data?.pagination

  const [createOpen, setCreateOpen] = useState(false)
  const [updateTarget, setUpdateTarget] = useState<Galeri | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Galeri | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)

  const { mutate: deleteGaleri, isPending: isDeleting } =
    useGaleriDeleteMutation()
  const { mutate: bulkUpdate, isPending: isBulkUpdating } = useGaleriBulkUpdateMutation()
  const { mutate: bulkDelete, isPending: isBulkDeleting } = useGaleriBulkDeleteMutation()
  const isAnyBulkPending = isBulkUpdating || isBulkDeleting

  const handleFilterChange = <T,>(setter: (value: T) => void) => {
    return (value: T) => {
      setter(value)
      setPage(1)
    }
  }

  const handleSortChange = (column: string, dir: "asc" | "desc") => {
    setSortBy(column)
    setSortDir(dir)
    setPage(1)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteGaleri(deleteTarget, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  const handleToggle = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleToggleAll = (checked: boolean) => {
    setSelectedIds(checked ? items.map((i) => i.id) : [])
  }

  const handleBulkUpdate = ({ field, value }: { field: "kategori_acara"; value: string }) => {
    if (selectedIds.length === 0) return
    bulkUpdate(
      { ids: selectedIds, field, value },
      { onSuccess: () => setSelectedIds([]) }
    )
  }

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return
    setBulkDeleteConfirmOpen(true)
  }

  const confirmBulkDelete = () => {
    bulkDelete({ ids: selectedIds }, { onSuccess: () => { setSelectedIds([]); setBulkDeleteConfirmOpen(false) } })
  }

  const clearAllFilters = () => {
    setSearchInput("")
    setKategoriAcara([])
    setSortBy("created_at")
    setSortDir("desc")
    setPage(1)
  }

  const hasActiveFilters = searchInput !== "" || kategoriAcara.length > 0

  return (
    <div
      className={cn(
        "flex h-full w-full min-w-0 flex-1 flex-col gap-6 rounded-xl px-4 py-8 sm:px-8 lg:px-10",
        isMobile && "px-3"
      )}
    >
      <HeaderDashboard
        Icon={Image01Icon}
        Title="Daftar Galeri"
        Deskrpsi="Kelola galeri foto acara catering."
      />

      <GaleriToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        kategoriAcara={kategoriAcara}
        onKategoriAcaraChange={handleFilterChange(setKategoriAcara)}
        onClearFilters={clearAllFilters}
        hasActiveFilters={hasActiveFilters}
        onAdd={() => setCreateOpen(true)}
      />

      <div
        className={cn(
          "flex flex-col gap-4 transition-opacity duration-200",
          isFetching && !isLoading && "pointer-events-none opacity-60"
        )}
      >
        {isLoading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-4 w-1/2 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <DataTableSkeleton
                columnCount={6}

                withViewOptions={false}
                withPagination={false}
              />
            </>
          )
        ) : isError ? (
          <div className="rounded-xl border border-border py-12 text-center text-destructive">
            Gagal memuat data dari server. Muat ulang halaman dan coba lagi.
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-border bg-transparent py-16 text-center">
            <p className="text-sm text-muted-foreground">
              Tidak ada galeri ditemukan.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ubah kata kunci pencarian atau filter untuk hasil yang berbeda.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <GaleriCardGrid
            items={items}
            onEdit={setUpdateTarget}
            onDelete={setDeleteTarget}
          />
        ) : (
          <div className="overflow-hidden rounded-xl bg-transparent">
            <GaleriTable
              items={items}
              onEdit={setUpdateTarget}
              onDelete={setDeleteTarget}
              sortBy={sortBy}
              sortDir={sortDir}
              onSortChange={handleSortChange}
              selectedIds={selectedIds}
              onToggle={handleToggle}
              onToggleAll={handleToggleAll}
            />
          </div>
        )}

        {pagination && (
          <DataTablePagination
            pagination={pagination}
            onPageChange={setPage}
            onPerPageChange={(value) => {
              setPerPage(value)
              setPage(1)
            }}
            isLoading={isFetching}
          />
        )}
      </div>

      <CreateGaleriDrawer open={createOpen} onOpenChange={setCreateOpen} />

      {updateTarget && (
        <UpdateGaleriDrawer
          key={updateTarget.id}
          galeri={updateTarget}
          open={!!updateTarget}
          onOpenChange={(open) => {
            if (!open) setUpdateTarget(null)
          }}
        />
      )}

      <GaleriDeleteDialog
        galeri={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        isPending={isDeleting}
        onConfirm={handleDelete}
      />

      {selectedIds.length > 0 && (
        <GaleriTableActionBar
          table={selectedIds}
          setSelected={setSelectedIds}
          onTaskUpdate={handleBulkUpdate}
          onTaskDelete={handleBulkDelete}
          isPending={isAnyBulkPending}
        />
      )}

      <DeleteDialog
        open={bulkDeleteConfirmOpen}
        onOpenChange={setBulkDeleteConfirmOpen}
        title={`Hapus ${selectedIds.length} Galeri?`}
        description={`${selectedIds.length} galeri terpilih akan dihapus permanen.`}
        confirmLabel="Ya, Hapus Semua"
        isPending={isBulkDeleting}
        onConfirm={confirmBulkDelete}
      />
    </div>
  )
}

export default MasterGaleriBlock
