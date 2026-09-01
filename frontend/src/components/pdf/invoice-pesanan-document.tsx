"use client"

import "takumi-pdf"

import type { StrukPayload } from "@/components/ui/core/block/admin/pesanan/types/pesanan-types"

function rupiah(value: number | string | null | undefined): string {
  const num = Number(value ?? 0)
  if (!Number.isFinite(num)) return "Rp0"
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num)
}

function formatTanggal(dateStr: string | null | undefined): string {
  if (!dateStr) return "-"
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return "-"
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

interface InvoicePesananDocumentProps {
  data: StrukPayload
}

export function InvoicePesananDocument({ data }: InvoicePesananDocumentProps) {
  const safe = {
    nomor_struk: String(data?.nomor_struk ?? "-"),
    nama_pemesan: String(data?.nama_pemesan ?? "-"),
    no_telepon: String(data?.no_telepon ?? "-"),
    alamat: data?.alamat ? String(data.alamat) : null,
    paket: String(data?.paket ?? "-"),
    jumlah_paket: Number(data?.jumlah_paket ?? 0),
    tanggal_acara: data?.tanggal_acara ? String(data.tanggal_acara) : null,
    harga_paket_satuan: String(data?.harga_paket_satuan ?? "0"),
    detail_tambahan: Array.isArray(data?.detail_tambahan) ? data.detail_tambahan : [],
    menu_tambahan: Array.isArray((data as unknown as { menu_tambahan?: unknown })?.menu_tambahan)
      ? ((data as unknown as { menu_tambahan: string[] }).menu_tambahan as string[])
      : [],
    biaya_tambahan: String(data?.biaya_tambahan ?? "0"),
    total_harga: String(data?.total_harga ?? "0"),
    catatan: data?.catatan ? String(data.catatan) : null,
    created_at: String(data?.created_at ?? new Date().toISOString()),
  }

  const subtotal = safe.jumlah_paket * Number(safe.harga_paket_satuan)

  return (
    <div tw="flex flex-col bg-[#F4F1E8] px-12 pt-12 pb-14 text-[11px] leading-[1.6] text-[#3A352E]">
      {/* Header */}
      <div tw="mb-7 flex flex-row justify-between">
        <div tw="flex flex-col">
          <span tw="text-[24px] font-bold text-[#8C5A2B]">Catering Nusantara</span>
          <span tw="mt-[2px] text-[9px] text-[#7A7365]">STRUK PEMBELIAN</span>
        </div>
        <div tw="flex flex-col items-end text-right">
          <span tw="text-[14px] font-bold">{safe.nomor_struk}</span>
          <span tw="text-[9px] text-[#7A7365]">{formatTanggal(safe.created_at)}</span>
        </div>
      </div>

      {/* Bill To */}
      <div tw="mb-7 flex flex-row justify-between">
        <div tw="flex flex-col">
          <span tw="text-[9.5px] text-[#7A7365]">Ditagihkan kepada</span>
          <span tw="text-[11px] font-medium">{safe.nama_pemesan}</span>
          <span tw="text-[9.5px] text-[#7A7365]">{safe.no_telepon}</span>
          {safe.alamat && (
            <span tw="mt-1 max-w-[260px] text-[9.5px] text-[#7A7365]">{safe.alamat}</span>
          )}
        </div>
        {safe.tanggal_acara && (
          <div tw="flex flex-col items-end text-right">
            <span tw="text-[9.5px] text-[#7A7365]">Tanggal Acara</span>
            <span tw="text-[11px] font-medium">{formatTanggal(safe.tanggal_acara)}</span>
          </div>
        )}
      </div>

      {/* Items Table */}
      <div tw="mb-4 flex flex-col">
        {/* Header row */}
        <div tw="flex flex-row bg-[#8C5A2B] px-2 py-2">
          <div tw="flex flex-1 p-2">
            <span tw="text-[10px] font-bold text-[#FAF7EF]">Paket</span>
          </div>
          <div tw="flex w-[60px] justify-center p-2">
            <span tw="text-[10px] font-bold text-[#FAF7EF]">Qty</span>
          </div>
          <div tw="flex w-[100px] justify-end p-2">
            <span tw="text-[10px] font-bold text-[#FAF7EF]">Harga Satuan</span>
          </div>
          <div tw="flex w-[100px] justify-end p-2">
            <span tw="text-[10px] font-bold text-[#FAF7EF]">Subtotal</span>
          </div>
        </div>

        {/* Data row — break-inside-avoid ensures row never splits across pages */}
        <div tw="flex flex-row break-inside-avoid border-b border-[#DDD6C6]">
          <div tw="flex flex-1 border-b border-[#DDD6C6] p-2">
            <span tw="text-[10px]">{safe.paket}</span>
          </div>
          <div tw="flex w-[60px] justify-center border-b border-[#DDD6C6] p-2">
            <span tw="text-center text-[10px]">{String(safe.jumlah_paket)}</span>
          </div>
          <div tw="flex w-[100px] justify-end border-b border-[#DDD6C6] p-2">
            <span tw="text-right text-[10px]">{rupiah(safe.harga_paket_satuan)}</span>
          </div>
          <div tw="flex w-[100px] justify-end border-b border-[#DDD6C6] p-2">
            <span tw="text-right text-[10px]">{rupiah(subtotal)}</span>
          </div>
        </div>
      </div>

      {/* Extras — menu pilihan + detail manual */}
      {safe.menu_tambahan.length > 0 && (
        <div tw="mb-2 flex flex-col gap-1">
          {safe.menu_tambahan.map((item, i) => (
            <div key={`m-${i}`} tw="flex flex-row justify-between">
              <span tw="text-[10px] text-[#7A7365]">Menu Tambahan {i + 1}</span>
              <span tw="text-right text-[10px] font-bold">{String(item ?? "-")}</span>
            </div>
          ))}
        </div>
      )}
      {safe.detail_tambahan.length > 0 && (
        <div tw="mb-7 flex flex-col gap-1">
          {safe.detail_tambahan.map((item, i) => (
            <div key={i} tw="flex flex-row justify-between">
              <span tw="text-[10px] text-[#7A7365]">Tambahan {i + 1}</span>
              <span tw="text-right text-[10px] font-bold">{String(item ?? "-")}</span>
            </div>
          ))}
        </div>
      )}

      <div tw="my-4 h-px w-full bg-[#DDD6C6]" />

      {/* Totals — keep together so block never splits */}
      <div tw="flex flex-row justify-end break-inside-avoid">
        <div tw="flex w-[55%] flex-col gap-1">
          <div tw="flex flex-row justify-between">
            <span tw="text-[10px] text-[#7A7365]">Biaya Tambahan</span>
            <span tw="text-right text-[10px] font-bold">{rupiah(safe.biaya_tambahan)}</span>
          </div>
          <div tw="flex flex-row justify-between">
            <span tw="text-[10px] text-[#7A7365]">Total Harga</span>
            <span tw="text-right text-[12px] font-bold text-[#8C5A2B]">{rupiah(safe.total_harga)}</span>
          </div>
        </div>
      </div>

      {safe.catatan && (
        <div tw="mt-7 flex flex-col break-inside-avoid">
          <span tw="text-[9.5px] text-[#7A7365]">Catatan</span>
          <span tw="text-[10px]">{safe.catatan}</span>
        </div>
      )}

      {/* Informasi Pembayaran — distinct block, matches invoice palette */}
      <div tw="mt-7 flex flex-col break-inside-avoid rounded-lg border border-[#DDD6C6] bg-[#FAF7EF] p-4">
        <span tw="text-[11px] font-bold text-[#8C5A2B]">Informasi Pembayaran</span>
        <span tw="mt-1 text-[9px] text-[#7A7365]">
          Silakan lakukan pembayaran melalui transfer bank berikut:
        </span>
        <div tw="mt-3 flex flex-col gap-1">
          <div tw="flex flex-row justify-between">
            <span tw="text-[10px] text-[#7A7365]">Bank BCA</span>
            <span tw="text-right text-[10px] font-bold">123456789 a.n Catering Nusantara</span>
          </div>
          <div tw="flex flex-row justify-between">
            <span tw="text-[10px] text-[#7A7365]">Bank Mandiri</span>
            <span tw="text-right text-[10px] font-bold">987654321 a.n Catering Nusantara</span>
          </div>
        </div>
        <span tw="mt-2 text-[8.5px] italic text-[#7A7365]">
          Mohon konfirmasi pembayaran via WhatsApp setelah transfer.
        </span>
      </div>

      {/* Footer */}
      <div tw="mt-6 flex flex-row justify-between border-t border-[#DDD6C6] pt-4">
        <span tw="text-[9px] text-[#7A7365]">Terima kasih — Catering Nusantara</span>
        <span tw="text-[9px] text-[#7A7365]">{safe.nomor_struk}</span>
      </div>
    </div>
  )
}
