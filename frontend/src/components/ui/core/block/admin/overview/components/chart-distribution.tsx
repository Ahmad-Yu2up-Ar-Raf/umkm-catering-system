"use client"

import * as React from "react"

import { Label, Pie, PieChart } from "recharts"

import type { ChartConfig } from "@/components/ui/fragments/shadcn-ui/chart"
import {
  Card,
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
import { cn } from "@/lib/utils"
import { distributionColors } from "../config/analytics-chart-config"
import { HugeiconsIcon } from "@hugeicons/react"
import { Chart01FreeIcons } from "@hugeicons/core-free-icons"

// ============================================
// TYPES
// ============================================

export interface DistributionData {
  name: string
  count: number
}

interface ChartDistributionProps {
  data: Array<DistributionData>
  chartConfig: ChartConfig
  title?: string
  description?: string
  nameKey?: string
  className?: string
  emptyMessage?: string
  footerDescription?: string
}

// ============================================
// COMPONENT
// ============================================

export function ChartDistribution({
  data,
  chartConfig,
  title = "Distribusi Data",
  description = "Top 5 distribusi",
  nameKey = "Data",
  className,
  emptyMessage = "data",
  footerDescription,
}: ChartDistributionProps) {
  // Calculate total
  const total = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.count, 0)
  }, [data])

  // Transform data untuk recharts dengan warna dinamis
  const chartData = React.useMemo(() => {
    return data.map((item, index) => ({
      name: item.name,
      count: item.count,
      fill: distributionColors[index % distributionColors.length],
      label: chartConfig[item.name]?.label || item.name,
      percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : "0",
    }))
  }, [data, chartConfig, total])

  // Get highest item
  const highest = chartData[0]

  // Empty state
  if (data.length === 0 || total === 0) {
    return (
      <Card className={cn("flex w-full flex-col", className)}>
        <CardHeader className="space-y-0 border-b py-3">
          <CardTitle className="line-clamp-1 text-base">{title}</CardTitle>
          <CardDescription className="line-clamp-1">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-[250px] flex-1 items-center justify-center pb-0">
          <div className="text-center text-muted-foreground">
            <HugeiconsIcon
              icon={Chart01FreeIcons}
              className="m-auto mb-3 size-8"
            />
            <p className="text-lg font-medium">Belum ada {emptyMessage}</p>
            <p className="text-sm">
              Tambah data untuk melihat distribusi {emptyMessage}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("flex w-full flex-col py-3 pt-3", className)}>
      <CardHeader className="gap-0 space-y-0 border-b px-5 py-3">
        <CardTitle className="line-clamp-1 text-base">{title}</CardTitle>
        <CardDescription className="line-clamp-1">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pt-0 pb-5">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square pt-0"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="name"
              innerRadius={50}
              strokeWidth={5}
            >
              {/* <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 32}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 10}
                          className="fill-muted-foreground"
                        >
                          {nameKey}
                        </tspan>
                      </text>
                    )
                  }
                }}
              /> */}
            </Pie>
            <ChartLegend
              formatter={(value) => (
                <span className="text-xs text-muted-foreground capitalize">
                  {chartConfig[value as keyof typeof chartConfig]?.label ||
                    value}
                </span>
              )}
              content={
                <ChartLegendContent
                  className="flex-wrap justify-center gap-x-3 gap-y-1 pt-2"
                  nameKey="name"
                  payload={chartData.map((item) => ({
                    value: item.name,
                    color: item.fill,
                  }))}
                />
              }
              className="flex-wrap gap-x-4 gap-y-2 px-5 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>

      {/* {footerDescription && (
        <CardFooter className="flex-col gap-2 text-sm pt-4">
          {highest && (
            <div className="flex items-center gap-2 font-medium leading-none">
              {highest.label} tertinggi dengan {highest.percentage}%
            </div>
          )}
          <div className="leading-none text-muted-foreground">
            {footerDescription}
          </div>
        </CardFooter>
      )} */}
    </Card>
  )
}
