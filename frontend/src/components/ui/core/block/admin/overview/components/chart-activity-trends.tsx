"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import type { ChartConfig } from "@/components/ui/fragments/shadcn-ui/chart"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/fragments/shadcn-ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/fragments/shadcn-ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/fragments/shadcn-ui/select"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChartAnalysisFreeIcons } from "@hugeicons/core-free-icons"
import type { CountsByDate } from "../types/overview-type"

interface ChartActivityTrendsProps {
  data: Array<CountsByDate>
  className?: string
  title?: string
  description?: string
}

// ============================================
// CHART CONFIG — Catering: pesanan + pendapatan (replaces antrian/pasien)
// ============================================
const chartConfig = {
  count: {
    label: "Jumlah",
  },
  pesanan: {
    label: "Pesanan",
    color: "var(--chart-1)",
  },
  pendapatan: {
    label: "Pendapatan",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

// ============================================
// COMPONENT
// ============================================
export function ChartActivityTrends({
  data,
  className,
  title = "Tren Aktivitas",
  description = "Data antrian, destinasi, dan artikel per hari",
}: ChartActivityTrendsProps) {
  // 1. MODIFIKASI: Mengubah default state menjadi "all"
  const [timeRange, setTimeRange] = React.useState("all")

  // Filter data berdasarkan rentang waktu
  const filteredData = React.useMemo(() => {
    if (data.length === 0) return []

    // 2. MODIFIKASI: Jika milih "all", langsung kembalikan semua data tanpa difilter tanggalnya
    if (timeRange === "all") return data

    // Ambil tanggal terbaru dari data untuk filter berbasis hari/bulan
    const dates = data.map((item) => new Date(item.date))
    const latestDate = new Date(Math.max(...dates.map((d) => d.getTime())))

    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }

    const startDate = new Date(latestDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    return data.filter((item) => {
      const date = new Date(item.date)
      return date >= startDate && date <= latestDate
    })
  }, [data, timeRange])

  // Hitung total untuk summary angka di atas chart
  const totals = React.useMemo(
    () => ({
      pesanan: filteredData.reduce((acc, curr) => acc + curr.pesanan, 0),
      pendapatan: filteredData.reduce((acc, curr) => acc + curr.pendapatan, 0),
    }),
    [filteredData]
  )

  // Empty state
  if (data.length === 0) {
    return (
      <Card className={cn("grid pt-0", className)}>
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-7.5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle className="line-clamp-1">{title}</CardTitle>
            <CardDescription className="line-clamp-1">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="h-full min-h-[300px] content-center px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="aspect-auto min-h-[250px] w-full content-center text-center text-muted-foreground">
            <HugeiconsIcon
              icon={ChartAnalysisFreeIcons}
              className="m-auto mb-3 size-6"
            />
            <p className="text-lg font-medium">Belum ada data aktivitas</p>
            <p className="text-sm">Data akan muncul setelah ada aktivitas</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("grid pt-0 shadow-none", className)}>
      <CardHeader className="flex items-center justify-between gap-2 space-y-0 border-b px-6 py-7 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="line-clamp-1">{title}</CardTitle>
          <CardDescription className="line-clamp-1">
            {description}
          </CardDescription>
        </div>

        <CardAction className="flex items-center gap-7">
          {/* Summary Stats */}
          <div className="items-center sr-only gap-4 text-sm md:flex">
            <div className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: "var(--chart-1)" }}
              />
              <span className="text-muted-foreground">Pesanan:</span>
              <span className="font-medium">{totals.pesanan}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: "var(--chart-2)" }}
              />
              <span className="text-muted-foreground">Pendapatan:</span>
              <span className="font-medium">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 0,
                }).format(totals.pendapatan)}
              </span>
            </div>
          </div>

          {/* Time Range Selector */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="sm:ml-auto text-xs"
              aria-label="Pilih rentang waktu"
            >
              {/* 3. MODIFIKASI: Mengubah placeholder default jadi Semua Waktu */}
              <SelectValue placeholder="Semua Waktu" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              {/* 4. MODIFIKASI: Menambahkan opsi item "all" di baris paling atas */}
              <SelectItem value="all" className="rounded-lg">
                Semua Waktu
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg">
                3 bulan terakhir
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                30 hari terakhir
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                7 hari terakhir
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="h-full min-h-[300px] content-center px-2 pt-4 shadow-none sm:px-6 sm:pt-6">
        {filteredData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-full max-h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillAntrian" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient
                  id="fillDestinations"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--chart-2)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-2)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("id-ID", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />

              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value as string).toLocaleDateString(
                        "id-ID",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    }}
                    indicator="dot"
                  />
                }
              />

              <Area
                dataKey="pesanan"
                type="monotone"
                fill="url(#fillAntrian)"
                stroke="var(--chart-1)"
                strokeWidth={2}
                stackId="a"
              />

              <Area
                dataKey="pendapatan"
                type="monotone"
                fill="url(#fillDestinations)"
                stroke="var(--chart-2)"
                strokeWidth={2}
                stackId="a"
              />

              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="aspect-auto min-h-[250px] w-full content-center text-center text-muted-foreground">
            <HugeiconsIcon
              icon={ChartAnalysisFreeIcons}
              className="m-auto mb-3 size-6"
            />
            <p className="text-lg font-medium">Tidak ada data</p>
            <p className="text-sm">Pilih rentang waktu yang berbeda</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
