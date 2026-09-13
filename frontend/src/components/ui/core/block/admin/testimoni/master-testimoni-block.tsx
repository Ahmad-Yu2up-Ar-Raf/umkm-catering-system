"use client"

import { useState } from "react"
import { Message01Icon } from "@hugeicons/core-free-icons"
import HeaderDashboard from "@/components/ui/fragments/custom-ui/typograhy/header"
import { DataTablePagination } from "@/components/ui/fragments/custom-ui/table/data-table-pagination"
import { useIsMobile } from "@/hooks/use-mobile"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useTestimoniList } from "./hooks/use-testimoni-query"
import {
  useTestimoniBulkDeleteMutation,
  useTestimoniBulkUpdateMutation,
  useTestimoniDeleteMutation,
} from "./hooks/use-testimoni-mutations"
import { DataTableSkeleton } from "@/components/ui/fragments/custom-ui/table/data-table-skeleton"
import type { Testimoni } from "./types/testimoni-types"
import { TestimoniToolbar } from "./components/testimoni-toolbar"
import { TestimoniTable } from "./components/testimoni-table"
import { CreateTestimoniDrawer } from "./components/create-testimoni-drawer"
import { UpdateTestimoniDrawer } from "./components/update-testimoni-drawer"
import { TestimoniDeleteDialog } from "./components/testimoni-delete-dialog"
import { TestimoniTableActionBar } from "./components/testimoni-table-action-bar"
import { DeleteDialog } from "@/components/ui/fragments/custom-ui/dialog/delete-dialog"
import { cn } from "@/lib/utils"

/**
 * Master Testimoni — the admin MDM block.
 * Table-only (no grid view), bulk-delete only (no bulk-update whitelist).
 */
function MasterTestimoniBlock() {
  const isMobile = useIsMobile()

  const [searchInput, setSearchInput] = useState("")
  const search = useDebouncedValue(searchInput.trim(), 350)

  const [visibility, setVisibility] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("created_at")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const { data, isLoading, isError, isFetching } = useTestimoniList({
    search,
    visibility,
    sortBy,
    sortDir,
    page,
    perPage,
  })

  const items = data?.items ?? []
  const pagination = data?.pagination

  const [createOpen, setCreateOpen] = useState(false)
  const [updateTarget, setUpdateTarget] = useState<Testimoni | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Testimoni | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)

  const { mutate: deleteTestimoni, isPending: isDeleting } =
    useTestimoniDeleteMutation()
  const { mutate: bulkDelete, isPending: isBulkDeleting } =
    useTestimoniBulkDeleteMutation()
  const { mutate: bulkUpdate, isPending: isBulkUpdating } =
    useTestimoniBulkUpdateMutation()
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
    deleteTestimoni(deleteTarget, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  const handleToggle = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleToggleAll = (checked: boolean) => {
    setSelectedIds(checked ? items.map((i) => i.id) : [])
  }

  const handleBulkUpdate = ({ field, value }: { field: "visibility"; value: string }) => {
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
    setVisibility([])
    setSortBy("created_at")
    setSortDir("desc")
    setPage(1)
  }

  const hasActiveFilters = searchInput !== "" || visibility.length > 0

  return (
    <div
      className={cn(
        "flex h-full w-full min-w-0 flex-1 flex-col gap-6 rounded-xl px-4 py-8 sm:px-8 lg:px-10",
        isMobile && "px-3"
      )}
    >
      <HeaderDashboard
        Icon={Message01Icon}
        Title="Daftar Testimoni"
        Deskrpsi="Kelola testimoni pelanggan catering."
      />

      <TestimoniToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        visibility={visibility}
        onVisibilityChange={handleFilterChange(setVisibility)}
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
          <DataTableSkeleton
            columnCount={7}
            withViewOptions={false}
            withPagination={false}
          />
        ) : isError ? (
          <div className="rounded-xl border border-border py-12 text-center text-destructive">
            Gagal memuat data dari server. Muat ulang halaman dan coba lagi.
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-border bg-transparent py-16 text-center">
            <p className="text-sm text-muted-foreground">
              Tidak ada testimoni ditemukan.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ubah kata kunci pencarian atau filter untuk hasil yang berbeda.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-transparent">
            <TestimoniTable
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
            visibleCount={items.length}
            unit="testimoni"
          />
        )}
      </div>

      <CreateTestimoniDrawer open={createOpen} onOpenChange={setCreateOpen} />

      {updateTarget && (
        <UpdateTestimoniDrawer
          key={updateTarget.id}
          testimoni={updateTarget}
          open={!!updateTarget}
          onOpenChange={(open) => {
            if (!open) setUpdateTarget(null)
          }}
        />
      )}

      <TestimoniDeleteDialog
        testimoni={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        isPending={isDeleting}
        onConfirm={handleDelete}
      />

      {selectedIds.length > 0 && (
        <TestimoniTableActionBar
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
        title={`Hapus ${selectedIds.length} Testimoni?`}
        description={`${selectedIds.length} testimoni terpilih akan dihapus permanen.`}
        confirmLabel="Ya, Hapus Semua"
        isPending={isBulkDeleting}
        onConfirm={confirmBulkDelete}
      />
    </div>
  )
}

export default MasterTestimoniBlock
