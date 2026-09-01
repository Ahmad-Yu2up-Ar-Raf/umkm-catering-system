"use client"

import React, { Suspense, useState } from "react"
import { ShoppingCart01Icon } from "@hugeicons/core-free-icons"
import HeaderDashboard from "@/components/ui/fragments/custom-ui/typograhy/header"
import { DataTablePagination } from "@/components/ui/fragments/custom-ui/table/data-table-pagination"
import { useIsMobile } from "@/hooks/use-mobile"
import { useDebouncedValue } from "../paket/hooks/use-debounced-value"
import { usePesananList } from "./hooks/use-pesanan-query"
import { usePesananDeleteMutation } from "./hooks/use-pesanan-mutations"
import { useStruk } from "./hooks/use-struk-query"
import { DataTableSkeleton } from "@/components/ui/fragments/custom-ui/table/data-table-skeleton"
import { Skeleton } from "@/components/ui/fragments/shadcn-ui/skeleton"
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
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { pesananService } from "@/services/pesanan-service"
import { InvoicePesananDocument } from "@/components/pdf/invoice-pesanan-document"
import {
  buildInvoiceRenderOptions,
  loadInvoiceFonts,
} from "@/components/pdf/invoice-render-config"

const InvoicePreviewDialog = React.lazy(() =>
  import("@/components/pdf/invoice-preview-dialog").then((m) => ({
    default: m.InvoicePreviewDialog,
  }))
)

/**
 * Master Pesanan — the admin MDM block.
 */
function MasterPesananBlock() {
  const isMobile = useIsMobile()

  const [searchInput, setSearchInput] = useState("")
  const search = useDebouncedValue(searchInput.trim(), 350)

  const [statuses, setStatuses] = useState<StatusPesanan[]>([])
  const [metodePembayaran, setMetodePembayaran] = useState<MetodePembayaran[]>([])
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

  const handleDownload = async (pesanan: Pesanan) => {
    const toastId = `download-${pesanan.id}`
    toast.loading("Menyiapkan download...", { id: toastId })
    try {
      const res = await pesananService.struk(pesanan.id)
      const struk = res.data

      const [{ render }, fonts] = await Promise.all([
        import("takumi-pdf"),
        loadInvoiceFonts(),
      ])

      const bytes = await render(
        <InvoicePesananDocument data={struk} />,
        buildInvoiceRenderOptions(struk, fonts)
      )

      const blob = new Blob([bytes as unknown as ArrayBuffer], {
        type: "application/pdf",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      // Fall back to the pesanan id (not jumlah_paket, which is a quantity
      // and makes for a confusing filename) if nomor_struk is missing.
      const fileLabel = struk.nomor_struk
        ? String(struk.nomor_struk)
        : `pesanan-${pesanan.id}`
      a.download = `Invoice-${fileLabel}-${String(struk.created_at).slice(0, 10)}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      toast.success("Download berhasil", { id: toastId })
    } catch (e) {
      console.error("=== takumi-pdf render failure, full dump ===")
      console.error("typeof e:", typeof e)
      console.error("instanceof Error:", e instanceof Error)
      if (e instanceof Error) {
        console.error("message:", e.message)
        console.error("name:", e.name)
        console.error("stack:", e.stack)
        console.error("cause:", (e as { cause?: unknown }).cause)
      }
      try {
        console.error(
          "own properties:",
          JSON.stringify(e, Object.getOwnPropertyNames(e as object), 2)
        )
      } catch {
        console.error("could not stringify error object; raw dump:", e)
      }
      console.error(
        "constructor name:",
        (e as { constructor?: { name?: string } })?.constructor?.name
      )

      // Catatan: Ganti setError dengan fungsi state error di masing-masing file (jika ada)
      console.error("Gagal generate PDF:", e)
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

  const hasActiveFilters = searchInput !== "" || statuses.length > 0 || metodePembayaran.length > 0

  const {
    data: strukData,
    isLoading: strukLoading,
    isError: isStrukError,
    error: strukError,
    refetch: refetchStruk,
  } = useStruk(strukTarget?.id ?? null)

  const strukDialog = strukTarget ? (
    <Suspense
      fallback={
        <div className="flex h-[85vh] max-w-3xl flex-col gap-4 p-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      }
    >
      {isStrukError ? (
        <div className="flex h-[85vh] max-w-3xl flex-col items-center justify-center gap-3 p-6">
          <p className="text-sm text-destructive">
            Gagal memuat struk:{" "}
            {String((strukError as Error)?.message ?? "unknown error")}
          </p>
          <button
            onClick={() => refetchStruk()}
            className="rounded-md border px-3 py-1.5 text-sm"
          >
            Coba lagi
          </button>
        </div>
      ) : (
        <InvoicePreviewDialog
          data={strukData ?? null}
          open={!!strukTarget}
          onOpenChange={(next: boolean) => {
            if (!next) setStrukTarget(null)
          }}
          isLoading={strukLoading}
          onRefresh={() => refetchStruk()}
        />
      )}
    </Suspense>
  ) : null

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
        Deskrpsi="Kelola data pesanan catering — buat, edit, hapus, cetak struk."
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
