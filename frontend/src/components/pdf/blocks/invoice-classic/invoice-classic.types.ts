export interface InvoiceClassicBillTo {
  name: string
  address: string
  phone: string
  email?: string
}

export interface InvoiceClassicItem {
  description: string
  quantity: number
  unitPrice: number
}

export interface InvoiceClassicSummary {
  subtotal: number
  /** Biaya tambahan di luar subtotal paket (server-authoritative). */
  biayaTambahan: number
  /** Grand total — always the server-computed total_harga, never recalculated. */
  total: number
}

export interface InvoiceClassicPaymentTerms {
  /** Tanggal acara (id-ID display string). */
  dueDate: string
  /** Label metode pembayaran, e.g. "Transfer Bank". */
  method: string
  /** Referensi dokumen, e.g. nomor struk. */
  reference: string
}

export interface InvoiceClassicData {
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  companyName: string
  subtitle: string
  companyAddress: string
  companyEmail: string
  logo?: string
  billTo: InvoiceClassicBillTo
  items: InvoiceClassicItem[]
  /** Menu/detail tambahan tanpa harga — rendered as free-text rows. */
  extras: {
    menuTambahan: string[]
    detailTambahan: string[]
  }
  summary: InvoiceClassicSummary
  paymentTerms: InvoiceClassicPaymentTerms
  notes?: string
}
