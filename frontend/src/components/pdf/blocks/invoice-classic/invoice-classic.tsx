import { KeyValue } from "@/components/pdf/key-value/key-value"
import { PageFooter } from "@/components/pdf/page-footer/page-footer"
import { PageHeader } from "@/components/pdf/page-header/page-header"
import { PdfImage } from "@/components/pdf/pdf-image/pdf-image"
import { Section } from "@/components/pdf/section/section"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/pdf/table/table"
import { Text } from "@/components/pdf/text/text"
import {
  PdfcnThemeProvider,
  usePdfcnTheme,
} from "@/components/pdf/theme-provider"
import { View, StyleSheet, Document, Page } from "@/lib/pdf-primitives"
import type { PdfcnTheme } from "../../types/theme-types"

import type { InvoiceClassicData } from "./invoice-classic.types"

function rupiah(value: number | string | null | undefined): string {
  const num = Number(value ?? 0)
  if (!Number.isFinite(num)) return "Rp0"
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num)
}

const InvoiceClassicContent = ({ data }: { data: InvoiceClassicData }) => {
  const theme = usePdfcnTheme()

  // Page owns the full sheet: brand bg painted here edge-to-edge, with a
  // single 42pt inset. pdfcn lengths are points → ×96/72 in Takumi CSS,
  // so 42pt renders as 56px ≈ 1.5cm on A4. The Takumi render margin is 0
  // (see invoice-pdf.tsx) — any other value is an unpainted white frame.
  const styles = StyleSheet.create({
    page: {
      backgroundColor: theme.colors.background,
      boxSizing: "border-box",
      minHeight: 841,
      padding: 42,
      position: "relative",
    },
  })

  const hasExtras =
    data.extras.menuTambahan.length > 0 ||
    data.extras.detailTambahan.length > 0

  return (
    <Document title={`Invoice ${data.invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        <PageHeader
          variant="logo-left"
          logo={
            <PdfImage
              src={data.logo ?? "/assets/logo/favicon-96x96.png"}
              width={48}
              height={48}
              style={{ margin: 0 }}
            />
          }
          title={data.companyName}
          subtitle={data.subtitle}
          rightText={data.invoiceNumber}
          rightSubText={`Jatuh tempo: ${data.dueDate}`}
          style={{ marginBottom: 0 }}
        />
        <Section noWrap spacing="sm" style={{ flexDirection: "row" }}>
          <View style={{ flex: 1, paddingRight: 15 }}>
            <Text
              style={{ fontSize: 9, fontWeight: "bold", marginBottom: 2 }}
              color="mutedForeground"
              transform="uppercase"
              noMargin
            >
              Dari
            </Text>
            <Text noMargin variant="xs">
              {data.companyName}
            </Text>
            <Text noMargin variant="xs">
              {data.companyAddress}
            </Text>
            <Text noMargin variant="xs">
              {data.companyEmail}
            </Text>
          </View>
          <View style={{ flex: 1, paddingRight: 15 }}>
            <Text
              style={{ fontSize: 9, fontWeight: "bold", marginBottom: 2 }}
              color="mutedForeground"
              transform="uppercase"
              noMargin
            >
              Ditagihkan Kepada
            </Text>
            <Text noMargin variant="xs">
              {data.billTo.name}
            </Text>
            <Text noMargin variant="xs">
              {data.billTo.address}
            </Text>
            <Text noMargin variant="xs">
              {data.billTo.phone}
            </Text>
            {data.billTo.email ? (
              <Text noMargin variant="xs">
                {data.billTo.email}
              </Text>
            ) : null}
          </View>
          <View style={{ flex: 1, paddingRight: 15 }}>
            <Text
              style={{ fontSize: 9, fontWeight: "bold", marginBottom: 2 }}
              color="mutedForeground"
              transform="uppercase"
              noMargin
            >
              Pembayaran
            </Text>
            <Text noMargin variant="xs">
              {data.paymentTerms.method}
            </Text>
            <Text noMargin variant="xs">
              {data.paymentTerms.reference}
            </Text>
            <Text noMargin variant="xs">
              {data.paymentTerms.dueDate}
            </Text>
          </View>
        </Section>
        <Table variant="grid" zebraStripe>
          <TableHeader>
            <TableRow header>
              <TableCell>Paket</TableCell>
              <TableCell align="center" width={45}>
                Qty
              </TableCell>
              <TableCell align="center" width={80}>
                Harga Satuan
              </TableCell>
              <TableCell align="right" width={80}>
                Subtotal
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((item, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: struk rows have no stable id
              <TableRow key={index}>
                <TableCell>{item.description}</TableCell>
                <TableCell align="center" width={45}>{`${item.quantity}`}</TableCell>
                <TableCell align="center" width={80}>
                  {rupiah(item.unitPrice)}
                </TableCell>
                <TableCell align="right" width={80}>
                  {rupiah(item.quantity * item.unitPrice)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {hasExtras ? (
          <Section spacing="sm">
            {data.extras.menuTambahan.map((item, i) => (
              <View
                // biome-ignore lint/suspicious/noArrayIndexKey: free-text extras have no stable id
                key={`m-${i}`}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text noMargin variant="xs" color="mutedForeground">
                  {`Menu Tambahan ${i + 1}`}
                </Text>
                <Text noMargin variant="xs">
                  {item}
                </Text>
              </View>
            ))}
            {data.extras.detailTambahan.map((item, i) => (
              <View
                // biome-ignore lint/suspicious/noArrayIndexKey: free-text extras have no stable id
                key={`d-${i}`}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text noMargin variant="xs" color="mutedForeground">
                  {`Tambahan ${i + 1}`}
                </Text>
                <Text noMargin variant="xs">
                  {item}
                </Text>
              </View>
            ))}
          </Section>
        ) : null}
        <Section
          noWrap
          spacing="sm"
          style={{ flexDirection: "row", marginTop: 16 }}
        >
          <View style={{ marginLeft: "auto", width: 220 }}>
            <KeyValue
              size="sm"
              dividerThickness={1}
              items={[
                {
                  key: "Subtotal",
                  value: rupiah(data.summary.subtotal),
                },
                {
                  key: "Biaya Tambahan",
                  value: rupiah(data.summary.biayaTambahan),
                },
                {
                  key: "Total",
                  keyStyle: { fontSize: 12, fontWeight: "bold" },
                  value: rupiah(data.summary.total),
                  valueStyle: { fontSize: 12, fontWeight: "bold" },
                },
              ]}
              divided
            />
          </View>
        </Section>
        {data.notes ? (
          <Section spacing="sm">
            <Text
              style={{ fontSize: 9, fontWeight: "bold", marginBottom: 2 }}
              color="mutedForeground"
              transform="uppercase"
              noMargin
            >
              Catatan
            </Text>
            <Text noMargin variant="xs">
              {data.notes}
            </Text>
          </Section>
        ) : null}
        <PageFooter
          leftText="Terima kasih — Catering Nusantara"
          rightText={data.invoiceNumber}
          sticky
          pagePadding={25}
        />
      </Page>
    </Document>
  )
}

export const InvoiceClassicDocument = ({
  theme,
  data,
}: {
  theme?: PdfcnTheme
  data: InvoiceClassicData
}) => (
  <PdfcnThemeProvider theme={theme}>
    <InvoiceClassicContent data={data} />
  </PdfcnThemeProvider>
)
