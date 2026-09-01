"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useMemo } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/fragments/shadcn-ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/fragments/shadcn-ui/chart"
import { cn } from "@/lib/utils"
import type { TopPaket } from "../types/overview-type"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChartColumnFreeIcons } from "@hugeicons/core-free-icons"

interface ChartBarActiveProps {
  data: TopPaket[]
  title?: string
  description?: string
  footerText?: string
  subFooter?: string
  className?: string
}

const generateColors = (length: number): string[] => {
  const baseColors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ]
  return baseColors.slice(0, length).map((_, i) => baseColors[i % baseColors.length])
}

export function ChartBarActive({
  data,
  title = "Top 5 Paket Terlaris",
  description = "5 paket dengan pesanan terbanyak",
  footerText = "Berdasarkan total pesanan",
  subFooter = "Diurutkan dari yang terlaris",
  className,
}: ChartBarActiveProps) {
  const { chartData, chartConfig } = useMemo(() => {
    const colors = generateColors(data.length)
    const transformedData = data.map((item, index) => ({
      name: item.nama_paket,
      count: item.pesanan_count,
      fill: colors[index],
    }))

    const config: ChartConfig = {
      count: { label: "Pesanan" },
    }
    data.forEach((item, index) => {
      const key = `paket-${item.id}`
      config[key] = { label: item.nama_paket, color: colors[index] }
    })

    return { chartData: transformedData, chartConfig: config }
  }, [data])

  if (chartData.length === 0) {
    return (
      <Card className={cn("flex w-full flex-col shadow-none", className)}>
        <CardHeader className="space-y-0 border-b py-4">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-[250px] flex-1 items-center justify-center pb-0">
          <div className="text-center text-muted-foreground">
            <HugeiconsIcon icon={ChartColumnFreeIcons} className="m-auto mb-3 size-6" />
            <p className="text-lg font-medium">Belum ada data pesanan</p>
            <p className="text-sm">Pesanan akan muncul setelah ada transaksi</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("flex w-full flex-col shadow-none", className)}>
      <CardHeader className="space-y-0 border-b py-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-full w-full pt-6 pb-0">
        <ChartContainer className="h-[250px] w-full" config={chartConfig}>
          <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 12, right: 12 }}>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} hide />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              width={110}
              tickFormatter={(value: string) => (value.length > 14 ? `${value.slice(0, 14)}…` : value)}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent />} />
            <Bar
              dataKey="count"
              radius={[0, 8, 8, 0]}
              barSize={28}
              animationDuration={800}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col sr-only items-start gap-1 pt-4 text-sm">
        <div className="flex gap-2 leading-none font-medium">{footerText}</div>
        <div className="leading-none text-muted-foreground">{subFooter}</div>
      </CardFooter>
    </Card>
  )
}
