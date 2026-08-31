"use client"

import { useState } from "react"
import { SpoonAndForkIcon } from "@hugeicons/core-free-icons"
import HeaderDashboard from "@/components/ui/fragments/custom-ui/typograhy/header"
import { DataTablePagination } from "@/components/ui/fragments/custom-ui/table/data-table-pagination"
import { useIsMobile } from "@/hooks/use-mobile"
import { useDebouncedValue } from "../paket/hooks/use-debounced-value"
import { usePesananList } from "./hooks/use-pesanan-query"
import { usePesananDeleteMutation } from "./hooks/use-pesanan-mutations"
import { useStruk } from "./hooks/use-struk-query"
import { DataTableSkeleton } from "@/components/ui/fragments/custom-ui/table/data-table-skeleton"
import type {
  Pesanan,
  PesananSortColumn,
  StatusPesanan,
} from "./types/pesanan-types"
import { PesananToolbar } from "./components/pesanan-toolbar"
import { PesananTable } from "./components/pesanan-table"
import { CreatePesananDrawer } from "./components/create-pesanan-drawer"
import { UpdatePesananDrawer } from "./components/update-pesanan-drawer"
import { PesananDeleteDialog } from "./components/pesanan-delete-dialog"
import { InvoicePreviewDialog } from "@/components/pdf/invoice-preview-dialog"
import { cn } from "@/lib/utils"

/**
 * Master Pesanan — the admin MDM block.
 */
function MasterPesananBlock() {
  const isMobile = useIsMobile()

  const [searchInput, setSearchInput] = useState("")
  const search = useDebouncedValue(searchInput.trim(), 350)

  const [statuses, setStatuses] = useState<StatusPesanan[]>([])
  const [sortBy, setSortBy] = useState<PesananSortColumn>("created_at")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const { data, isLoading, isError, isFetching } = usePesananList({
    statuses,
    search,
    sortBy,
    sortDir,
    page,
    perPage,
  })

  const items = data?.items ?? []
  const pagination = data?.pagination

  const [createOpen, setCreateOpen] = useState(false)
  const [updateTarget, setUpdateTarget] = useState<Pesanan | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Pesanan | null>(null)
  const [strukTarget, setStrukTarget] = useState<Pesanan | null>(null)

  const { mutate: deletePesanan, isPending: isDeleting } =
    usePesananDeleteMutation()

  const handleFilterChange = <T,>(setter: (value: T) => void) => {
    return (value: T) => {
      setter(value)
      setPage(1)
    }
  }

  const handleSortChange = (column: string, dir: "asc" | "desc") => {
    setSortBy(column as PesananSortColumn)
    setSortDir(dir)
    setPage(1)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deletePesanan(deleteTarget, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  const handleStruk = (pesanan: Pesanan) => {
    setStrukTarget(pesanan)
  }

  const clearAllFilters = () => {
    setSearchInput("")
    setStatuses([])
    setSortBy("created_at")
    setSortDir("desc")
    setPage(1)
  }

  const hasActiveFilters = searchInput !== "" || statuses.length > 0

  const { data: strukData, isLoading: strukLoading } = useStruk(
    strukTarget?.id ?? null
  )

  const strukDialog = strukTarget ? (
    <InvoicePreviewDialog
      data={strukData!}
      open={!!strukTarget}
      onOpenChange={(next: boolean) => {
        if (!next) setStrukTarget(null)
      }}
      isLoading={strukLoading}
    />
  ) : null

  return (
    <div
      className={cn(
        "flex h-full w-full min-w-0 flex-1 flex-col gap-6 rounded-xl px-4 py-8 sm:px-8 lg:px-10",
        isMobile && "px-3"
      )}
    >
      <HeaderDashboard
        Icon={SpoonAndForkIcon}
        Title="Daftar Pesanan"
        Deskrpsi="Kelola data pesanan catering — buat, edit, hapus, cetak struk."
      />

      <PesananToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        statuses={statuses}
        onStatusesChange={handleFilterChange(
          setStatuses as (value: string[]) => void
        )}
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
          <>
            <DataTableSkeleton
              columnCount={8}
              rowCount={50}
              withViewOptions={false}
              withPagination={false}
            />
          </>
        ) : isError ? (
          <div className="rounded-xl border border-border py-12 text-center text-destructive">
            Gagal memuat data dari server. Muat ulang halaman dan coba lagi.
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-border bg-transparent py-16 text-center">
            <p className="text-sm text-muted-foreground">
              Tidak ada pesanan ditemukan.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ubah kata kunci pencarian atau filter untuk hasil yang berbeda.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-transparent">
            <PesananTable
              items={items}
              onEdit={setUpdateTarget}
              onDelete={setDeleteTarget}
              onStruk={handleStruk}
              sortBy={sortBy}
              sortDir={sortDir}
              onSortChange={handleSortChange}
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

      <CreatePesananDrawer open={createOpen} onOpenChange={setCreateOpen} />

      {updateTarget && (
        <UpdatePesananDrawer
          key={updateTarget.id}
          pesanan={updateTarget}
          open={!!updateTarget}
          onOpenChange={(next: boolean) => {
            if (!next) setUpdateTarget(null)
          }}
        />
      )}

      <PesananDeleteDialog
        pesanan={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(next: boolean) => {
          if (!next) setDeleteTarget(null)
        }}
        isPending={isDeleting}
        onConfirm={handleDelete}
      />

      {strukDialog}
    </div>
  )
}

export default MasterPesananBlock
