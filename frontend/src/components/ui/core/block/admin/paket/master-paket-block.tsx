"use client"

import { useState } from "react"
import { toast } from "sonner"
import { SpoonAndForkIcon } from "@hugeicons/core-free-icons"
import HeaderDashboard from "@/components/ui/fragments/custom-ui/typograhy/header"
import { Spinner } from "@/components/ui/fragments/shadcn-ui/spinner"
import { DataTablePagination } from "@/components/ui/fragments/custom-ui/table/data-table-pagination"
import { useIsMobile } from "@/hooks/use-mobile"
import { useDebouncedValue } from "./hooks/use-debounced-value"
import { usePaketList } from "./hooks/use-paket-query"
import { usePaketDeleteMutation } from "./hooks/use-paket-mutations"
import { usePaketViewStore } from "@/store/paket-admin-view-store"
import type { Paket } from "../../paket/types/paket-types"
import { PaketToolbar } from "./components/paket-toolbar"
import { PaketTable } from "./components/paket-table"
import { PaketCardGrid } from "./components/paket-card-grid"
import { CreatePaketDrawer } from "./components/create-paket-drawer"
import { UpdatePaketDrawer } from "./components/update-paket-drawer"
import { PaketDeleteDialog } from "./components/paket-delete-dialog"
import { cn } from "@/lib/utils"

/**
 * Master Paket — the admin MDM block. Owns UI state only (search, filters,
 * pagination, drawers, delete target); all server data flows through
 * `usePaketList` + the mutation hooks (React Query + Ky).
 */
function MasterPaketBlock() {
  const isMobile = useIsMobile()

  const [searchInput, setSearchInput] = useState("")
  const search = useDebouncedValue(searchInput.trim(), 350)

  const viewMode = usePaketViewStore((s) => s.viewMode)

  const [kategoriPaket, setKategoriPaket] = useState("")
  const [kategoriAcara, setKategoriAcara] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const { data, isLoading, isError, isFetching } = usePaketList({
    search,
    kategoriPaket,
    kategoriAcara,
    page,
    perPage,
  })

  const items = data?.items ?? []
  const pagination = data?.pagination

  const [createOpen, setCreateOpen] = useState(false)
  const [updateTarget, setUpdateTarget] = useState<Paket | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Paket | null>(null)

  const { mutate: deletePaket, isPending: isDeleting } = usePaketDeleteMutation()

  const handleFilterChange = (setter: (value: string) => void) => {
    return (value: string) => {
      setter(value)
      setPage(1)
    }
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    if (deleteTarget.pesanan_count > 0) {
      toast.error("Paket tidak dapat dihapus — masih memiliki pesanan terkait.")
      setDeleteTarget(null)
      return
    }
    deletePaket(deleteTarget, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  const clearAllFilters = () => {
    setSearchInput("")
    setKategoriPaket("")
    setKategoriAcara("")
    setPage(1)
  }

  const hasActiveFilters =
    searchInput !== "" || kategoriPaket !== "" || kategoriAcara !== ""

  return (
    <div
      className={cn(
        "flex h-full w-full flex-1 flex-col gap-6 rounded-xl px-4 py-8 sm:px-8 lg:px-10",
        isMobile && "px-3"
      )}
    >
      <HeaderDashboard
        Icon={SpoonAndForkIcon}
        Title="Daftar Paket"
        Deskrpsi="Kelola informasi data paket catering."
      />

      <PaketToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        onSearchClear={() => {
          setSearchInput("")
          setPage(1)
        }}
        kategoriPaket={kategoriPaket}
        onKategoriPaketChange={handleFilterChange(setKategoriPaket)}
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
          <div className="flex w-full justify-center py-20">
            <Spinner className="size-8 text-primary" />
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-border bg-card py-12 text-center text-destructive">
            Gagal memuat data dari server. Muat ulang halaman dan coba lagi.
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-border bg-card py-16 text-center">
            <p className="text-sm text-muted-foreground">
              Tidak ada paket ditemukan.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ubah kata kunci pencarian atau filter untuk hasil yang berbeda.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <PaketCardGrid
            items={items}
            onEdit={setUpdateTarget}
            onDelete={setDeleteTarget}
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <PaketTable
              items={items}
              onEdit={setUpdateTarget}
              onDelete={setDeleteTarget}
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

      <CreatePaketDrawer open={createOpen} onOpenChange={setCreateOpen} />

      {updateTarget && (
        <UpdatePaketDrawer
          key={updateTarget.id}
          paket={updateTarget}
          open={!!updateTarget}
          onOpenChange={(open) => {
            if (!open) setUpdateTarget(null)
          }}
        />
      )}

      <PaketDeleteDialog
        paket={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        isPending={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default MasterPaketBlock
