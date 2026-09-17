"use client"

import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/fragments/shadcn-ui/table"
import { Badge } from "@/components/ui/fragments/shadcn-ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/fragments/shadcn-ui/card"
import { cn } from "@/lib/utils"
import { formatRupiah } from "@/components/ui/core/block/admin/pesanan/utils/pesanan-calculator"
import {
  getStatusPesananIcon,
  getStatusPesananLabel,
  getStatusPesananColor,
  getMetodePembayaranIcon,
  getMetodePembayaranLabel,
  getMetodePembayaranColor,
} from "@/components/ui/core/block/admin/pesanan/utils/pesanan-badge-utils"
import type { LatestPesanan } from "../types/overview-type"
import { useState } from "react"

/**
 * Latest-orders strip — simplified read-only table (no sorting, no selection,
 * no pagination, no actions). Maps directly over the 5 items from the API.
 * Cell styling mirrors pesanan-table.tsx.
 */
export function LatestOrders({ items }: { items: LatestPesanan[] }) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Pesanan Terbaru</CardTitle>
        <CardDescription>5 data pesanan terbaru</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <Table className="relative bg-transparent">
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="min-w-40">Nomor Struk</TableHead>

              <TableHead className="min-w-48">Pemesan</TableHead>

              <TableHead className="min-w-40">Paket</TableHead>

              <TableHead className="min-w-24">Jumlah</TableHead>

              <TableHead className="min-w-36">Total</TableHead>

              <TableHead className="min-w-32">Tanggal Acara</TableHead>
              <TableHead className="min-w-28">Status</TableHead>
              <TableHead className="min-w-28">Pembayaran</TableHead>

              <TableHead className="min-w-32">Dibuat</TableHead>

              <TableHead className="w-12 text-right">
                <span className="sr-only">Aksi</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((pesanan) => {
              return (
                <TableRow
                  key={pesanan.id}
                  className="group border-border transition-colors hover:bg-muted/40"
                >
                  <TableCell>
                    <code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-xs text-foreground">
                      {pesanan.nomor_struk}
                    </code>
                  </TableCell>

                  <TableCell>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {pesanan.nama_pemesan}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {pesanan.no_telepon}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="text-sm font-medium text-foreground">
                    {pesanan.paket?.nama_paket ?? "—"}
                  </TableCell>

                  <TableCell className="whitespace-nowrap tabular-nums">
                    {pesanan.jumlah_paket} porsi
                  </TableCell>

                  <TableCell className="font-medium whitespace-nowrap tabular-nums">
                    {formatRupiah(pesanan.total_harga)}
                  </TableCell>

                  <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                    {pesanan.tanggal_acara
                      ? format(new Date(pesanan.tanggal_acara), "dd MMM yyyy")
                      : "—"}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      size="sm"
                      icon={getStatusPesananIcon(pesanan.status_pesanan)}
                      className={cn(
                        "w-fit gap-1.5 shadow-none",
                        getStatusPesananColor(pesanan.status_pesanan)
                      )}
                    >
                      <span className="font-medium">
                        {getStatusPesananLabel(pesanan.status_pesanan)}
                      </span>
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      size="sm"
                      icon={getMetodePembayaranIcon(pesanan.metode_pembayaran)}
                      className={cn(
                        "w-fit gap-1.5 shadow-none",
                        getMetodePembayaranColor(pesanan.metode_pembayaran)
                      )}
                    >
                      <span className="font-medium">
                        {getMetodePembayaranLabel(pesanan.metode_pembayaran)}
                      </span>
                    </Badge>
                  </TableCell>

                  <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                    {pesanan.created_at
                      ? format(new Date(pesanan.created_at), "dd MMM yyyy")
                      : "—"}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
