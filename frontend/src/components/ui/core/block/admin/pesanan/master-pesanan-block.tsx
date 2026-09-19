"use client"

import { useEffect, useState } from "react"
import { ShoppingCart01Icon } from "@hugeicons/core-free-icons"
import HeaderDashboard from "@/components/ui/fragments/custom-ui/typograhy/header"
import { DataTablePagination } from "@/components/ui/fragments/custom-ui/table/data-table-pagination"
import { FloatingActionMenu } from "@/components/ui/fragments/custom-ui/floating-action-menu"
import { useIsMobile } from "@/hooks/use-mobile"
import { useDebouncedValue } from "../paket/hooks/use-debounced-value"
import { usePesananList } from "./hooks/use-pesanan-query"
import {
  usePesananBulkDeleteMutation,
  usePesananBulkUpdateMutation,
  usePesananDeleteMutation,
} from "./hooks/use-pesanan-mutations"
import { DataTableSkeleton } from "@/components/ui/fragments/custom-ui/table/data-table-skeleton"
import type {
  MetodePembayaran,
  Pesanan,
  PesananSortColumn,
  StatusPesanan,
} from "./types/pesanan-types"
import { PesananToolbar } from "./components/pesanan-toolbar"
import { PesananTable } from "./components/pesanan-table"
import { CreatePesananDrawer } from "./components/create-pesanan-drawer"
import { UpdatePesananDrawer } from "./components/update-pesanan-drawer"
import { PesananDeleteDialog } from "./components/pesanan-delete-dialog"
import { DeleteDialog } from "@/components/ui/fragments/custom-ui/dialog/delete-dialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { playDownload, playError } from "@/lib/audio-feedback"
import { pesananService } from "@/services/pesanan-service"
import { useExportExcel } from "@/hooks/use-export-excel"
import {
  downloadStrukPdf,
  previewStrukInNewTab,
  warmInvoiceEngine,
} from "@/components/pdf/invoice-pdf"
import { PesananTableActionBar } from "./components/pesanan-table-action-bar"

/**
 * Master Pesanan — the admin MDM block.
 */
function MasterPesananBlock() {
  const isMobile = useIsMobile()

  // Pre-warm the PDF engine (fonts, Takumi chunk, logo) so the first
  // preview/download click only pays for the struk fetch + render.
  useEffect(() => {
    warmInvoiceEngine()
  }, [])

  const [searchInput, setSearchInput] = useState("")
  const search = useDebouncedValue(searchInput.trim(), 350)

  const [statuses, setStatuses] = useState<StatusPesanan[]>([])
  const [metodePembayaran, setMetodePembayaran] = useState<MetodePembayaran[]>(
    []
  )
  const [sortBy, setSortBy] = useState<PesananSortColumn>("created_at")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const { data, isLoading, isError, isFetching } = usePesananList({
    statuses,
    metodePembayaran,
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
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)

  const { mutate: deletePesanan, isPending: isDeleting } =
    usePesananDeleteMutation()
  const { mutate: bulkUpdate, isPending: isBulkUpdating } = usePesananBulkUpdateMutation()
  const { mutate: bulkDelete, isPending: isBulkDeleting } = usePesananBulkDeleteMutation()
  const isAnyBulkPending = isBulkUpdating || isBulkDeleting

  const { isExporting, run: runExport } = useExportExcel({
    filename: `pesanan-export-${new Date().toISOString().slice(0, 10)}.xlsx`,
    asyncModule: "pesanan",
    fetchBlob: (p) =>
      pesananService.exportBlob({
        statuses: (p.status_pesanan as StatusPesanan[]) ?? [],
        metodePembayaran: (p.metode_pembayaran as MetodePembayaran[]) ?? [],
        search: (p.search as string) ?? "",
        sortBy: (p.sort_by as PesananSortColumn) ?? sortBy,
        sortDir: (p.sort_dir as "asc" | "desc") ?? sortDir,
      }),
  })

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
    deletePesanan(
      { id: deleteTarget.id },
      {
        onSuccess: () => setDeleteTarget(null),
      }
    )
  }

  const handleToggle = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleToggleAll = (checked: boolean) => {
    setSelectedIds(checked ? items.map((i) => i.id) : [])
  }

  const handleBulkUpdate = ({ field, value }: { field: "status_pesanan" | "metode_pembayaran"; value: string }) => {
    if (selectedIds.length === 0) return
    bulkUpdate(
      { ids: selectedIds, field, value },
      {
        onSuccess: () => setSelectedIds([]),
      }
    )
  }

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return
    setBulkDeleteConfirmOpen(true)
  }

  const confirmBulkDelete = () => {
    bulkDelete(
      { ids: selectedIds },
      {
        onSuccess: () => {
          setSelectedIds([])
          setBulkDeleteConfirmOpen(false)
        },
      }
    )
  }

  const handleStruk = async (pesanan: Pesanan) => {
    const toastId = `preview-${pesanan.id}`
    toast.loading("Menyiapkan pratinjau...", { id: toastId })
    try {
      const res = await pesananService.struk(pesanan.id)
      await previewStrukInNewTab(res.data)
      toast.dismiss(toastId)
    } catch (e) {
      console.error("Gagal generate PDF:", e)
      toast.error("Gagal menyiapkan pratinjau.", { id: toastId })
      playError()
    }
  }

  const handleDownload = async (pesanan: Pesanan) => {
    const toastId = `download-${pesanan.id}`
    toast.loading("Menyiapkan download...", { id: toastId })
    try {
      const res = await pesananService.struk(pesanan.id)
      await downloadStrukPdf(res.data, pesanan.id)
      toast.success("Download berhasil", { id: toastId })
      playDownload()
    } catch (e) {
      console.error("Gagal generate PDF:", e)
      toast.error("Gagal generate PDF.", { id: toastId })
      playError()
    }
  }

  const clearAllFilters = () => {
    setSearchInput("")
    setStatuses([])
    setMetodePembayaran([])
    setSortBy("created_at")
    setSortDir("desc")
    setPage(1)
  }

  const hasActiveFilters =
    searchInput !== "" || statuses.length > 0 || metodePembayaran.length > 0

  return (
    <div
      className={cn(
        "flex h-full w-full min-w-0 flex-1 flex-col gap-6 rounded-xl px-4 py-8 sm:px-8 lg:px-10",
        isMobile && "px-3"
      )}
    >
      <HeaderDashboard
        Icon={ShoppingCart01Icon}
        Title="Daftar Pesanan"
        Deskrpsi="Kelola data pesanan catering — buat, edit, hapus, unduh invoice."
      />

      <PesananToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        statuses={statuses}
        onStatusesChange={handleFilterChange(
          setStatuses as (value: string[]) => void
        )}
        metodePembayaran={metodePembayaran}
        onMetodePembayaranChange={handleFilterChange(
          setMetodePembayaran as (value: string[]) => void
        )}
        onClearFilters={clearAllFilters}
        hasActiveFilters={hasActiveFilters}
        onAdd={() => setCreateOpen(true)}
        onExport={() =>
          runExport({
            status_pesanan: statuses,
            metode_pembayaran: metodePembayaran,
            search,
            sort_by: sortBy,
            sort_dir: sortDir,
          })
        }
        isExporting={isExporting}
      />

      <FloatingActionMenu
        onCreate={() => setCreateOpen(true)}
        label="Tambah Pesanan"
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
              onDownload={handleDownload}
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
            unit="pesanan"
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

      {selectedIds.length > 0 && (
        <PesananTableActionBar
          table={selectedIds}
          setSelected={setSelectedIds}
          onTaskUpdate={handleBulkUpdate}
          onTaskDelete={handleBulkDelete}
          isPending={isAnyBulkPending}
        />
      )}

      {/* Bulk delete confirmation */}
      <DeleteDialog
        open={bulkDeleteConfirmOpen}
        onOpenChange={setBulkDeleteConfirmOpen}
        title={`Hapus ${selectedIds.length} Pesanan?`}
        description={`${selectedIds.length} pesanan terpilih akan dihapus permanen. Aksi ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus Semua"
        isPending={isBulkDeleting}
        onConfirm={confirmBulkDelete}
      />
    </div>
  )
}

export default MasterPesananBlock
