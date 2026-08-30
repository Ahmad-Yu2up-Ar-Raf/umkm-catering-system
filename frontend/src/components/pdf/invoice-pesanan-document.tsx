"use client"

import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer"
import { InvoiceThemeProvider, useInvoiceTheme, rupiah, defaultInvoiceTheme } from "./invoice-theme.tsx"
import type { StrukPayload } from "@/components/ui/core/block/admin/pesanan/types/pesanan-types"

const styles = StyleSheet.create({
  page: {
    backgroundColor: defaultInvoiceTheme.colors.background,
    paddingTop: defaultInvoiceTheme.spacing.page.marginTop,
    paddingBottom: defaultInvoiceTheme.spacing.page.marginBottom,
    paddingHorizontal: defaultInvoiceTheme.spacing.page.marginLeft,
    minHeight: "100%",
    fontFamily: defaultInvoiceTheme.typography.body.fontFamily,
    fontSize: defaultInvoiceTheme.typography.body.fontSize,
    lineHeight: 1.6,
    color: defaultInvoiceTheme.colors.foreground,
  },
  section: {
    marginBottom: defaultInvoiceTheme.spacing.sectionGap,
  },
  muted: {
    color: defaultInvoiceTheme.colors.mutedForeground,
    fontSize: 9.5,
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: defaultInvoiceTheme.colors.border,
    marginVertical: 16,
  },
})

interface InvoicePesananDocumentProps {
  data: StrukPayload
}

function InvoicePesananContent({ data }: { data: StrukPayload }) {
  const theme = useInvoiceTheme()
  const tanggal = new Date(data.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const subtotal = Number(data.jumlah_paket) * Number(data.harga_paket_satuan)
  const biayaTambahan = Number(data.biaya_tambahan)
  const total = subtotal + biayaTambahan

  return (
    <View style={styles.page}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 28 }}>
        <View>
          <Text style={{ fontFamily: defaultInvoiceTheme.typography.heading.fontFamily, fontSize: 24, fontWeight: defaultInvoiceTheme.typography.heading.fontWeight, color: theme.colors.primary }}>
            Catering Nusantara
          </Text>
          <Text style={{ fontSize: 9, color: theme.colors.mutedForeground, marginTop: 2 }}>
            STRUK PEMBELIAN
          </Text>
        </View>
        <View style={{ textAlign: "right" }}>
          <Text style={{ fontSize: 14, fontWeight: 700, fontFamily: defaultInvoiceTheme.typography.heading.fontFamily }}>
            {data.nomor_struk}
          </Text>
          <Text style={{ fontSize: 9, color: theme.colors.mutedForeground }}>
            {tanggal}
          </Text>
        </View>
      </View>

      {/* Bill To */}
      <View style={styles.section}>
        <Text style={styles.muted}>Ditagihkan kepada</Text>
        <Text style={{ fontSize: 11 }}>{data.nama_pemesan}</Text>
        <Text style={styles.muted}>{data.no_telepon}</Text>
      </View>

      {/* Items Table */}
      <View style={{ marginBottom: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", backgroundColor: defaultInvoiceTheme.colors.primary, padding: 8 }}>
          <View style={{ flex: 1, padding: 8 }}>
            <Text style={{ color: defaultInvoiceTheme.colors.primaryForeground, fontWeight: 700, fontFamily: defaultInvoiceTheme.typography.heading.fontFamily, fontSize: 10 }}>
              Paket
            </Text>
          </View>
          <View style={{ width: 60, padding: 8, textAlign: "center" }}>
            <Text style={{ color: defaultInvoiceTheme.colors.primaryForeground, fontWeight: 700, fontFamily: defaultInvoiceTheme.typography.heading.fontFamily, fontSize: 10 }}>
              Qty
            </Text>
          </View>
          <View style={{ width: 100, padding: 8, textAlign: "right" }}>
            <Text style={{ color: defaultInvoiceTheme.colors.primaryForeground, fontWeight: 700, fontFamily: defaultInvoiceTheme.typography.heading.fontFamily, fontSize: 10 }}>
              Harga Satuan
            </Text>
          </View>
          <View style={{ width: 100, padding: 8, textAlign: "right" }}>
            <Text style={{ color: defaultInvoiceTheme.colors.primaryForeground, fontWeight: 700, fontFamily: defaultInvoiceTheme.typography.heading.fontFamily, fontSize: 10 }}>
              Subtotal
            </Text>
          </View>
        </View>

        {/* Row */}
        <View style={{ flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: defaultInvoiceTheme.colors.border }}>
          <View style={{ flex: 1, padding: 8, borderBottomWidth: 0.5, borderBottomColor: defaultInvoiceTheme.colors.border }}>
            <Text style={{ fontSize: 10 }}>{data.paket ?? "-"}</Text>
          </View>
          <View style={{ width: 60, padding: 8, textAlign: "center", borderBottomWidth: 0.5, borderBottomColor: defaultInvoiceTheme.colors.border }}>
            <Text style={{ fontSize: 10 }}>{data.jumlah_paket}</Text>
          </View>
          <View style={{ width: 100, padding: 8, textAlign: "right", borderBottomWidth: 0.5, borderBottomColor: defaultInvoiceTheme.colors.border }}>
            <Text style={{ fontSize: 10 }}>{rupiah(data.harga_paket_satuan)}</Text>
          </View>
          <View style={{ width: 100, padding: 8, textAlign: "right", borderBottomWidth: 0.5, borderBottomColor: defaultInvoiceTheme.colors.border }}>
            <Text style={{ fontSize: 10 }}>{rupiah(subtotal)}</Text>
          </View>
        </View>
      </View>

      {/* Extras */}
      {data.detail_tambahan && data.detail_tambahan.length > 0 && (
        <View style={{ marginBottom: 28 }}>
          {data.detail_tambahan.map((item, i) => (
            <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={{ color: defaultInvoiceTheme.colors.mutedForeground, fontSize: 10 }}>
                Tambahan {i + 1}
              </Text>
              <Text style={{ fontWeight: 700, fontSize: 10, textAlign: "right" }}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ borderBottomWidth: 0.5, borderBottomColor: defaultInvoiceTheme.colors.border, marginVertical: 16 }} />

      {/* Totals */}
      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <View style={{ width: "55%" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
            <Text style={{ color: defaultInvoiceTheme.colors.mutedForeground, fontSize: 10 }}>Biaya Tambahan</Text>
            <Text style={{ fontWeight: 700, fontSize: 10, textAlign: "right" }}>
              {rupiah(biayaTambahan)}
            </Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
            <Text style={{ color: defaultInvoiceTheme.colors.mutedForeground, fontSize: 10 }}>Total Harga</Text>
            <Text style={{ fontWeight: 700, fontSize: 12, color: defaultInvoiceTheme.colors.primary, textAlign: "right" }}>
              {rupiah(total)}
            </Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
            <Text style={{ color: defaultInvoiceTheme.colors.mutedForeground, fontSize: 10 }}>Status</Text>
            <Text style={{ fontWeight: 700, fontSize: 10, textAlign: "right" }}>
              {data.status_pesanan.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {data.catatan && (
        <View style={{ marginBottom: 28 }}>
          <Text style={{ color: defaultInvoiceTheme.colors.mutedForeground, fontSize: 9.5 }}>Catatan</Text>
          <Text>{data.catatan}</Text>
        </View>
      )}

      {/* Footer */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 24, paddingTop: 16, borderTopWidth: 0.5, borderTopColor: defaultInvoiceTheme.colors.border }}>
        <Text style={{ fontSize: 9, color: defaultInvoiceTheme.colors.mutedForeground }}>
          Terima kasih — Catering Nusantara
        </Text>
        <Text style={{ fontSize: 9, color: defaultInvoiceTheme.colors.mutedForeground }}>
          {data.nomor_struk}
        </Text>
      </View>
    </View>
  )
}

interface InvoicePesananDocumentProps {
  data: StrukPayload
}

export function InvoicePesananDocument({ data }: InvoicePesananDocumentProps) {
  return (
    <InvoiceThemeProvider theme={defaultInvoiceTheme}>
      <Document title={`Invoice ${data.nomor_struk}`}>
        <Page size="A4" style={styles.page}>
          <InvoicePesananContent data={data} />
        </Page>
      </Document>
    </InvoiceThemeProvider>
  )
}