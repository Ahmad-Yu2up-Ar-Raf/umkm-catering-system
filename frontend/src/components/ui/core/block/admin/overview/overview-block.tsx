"use client"

import { SectionCards, type DataCard } from "./components/section-card"
import { FetchOverview } from "./hooks/use-overview-query"
import { Spinner } from "@/components/ui/fragments/shadcn-ui/spinner"
import {
  PackageIcon,
  ShoppingBag02Icon,
  Clock01Icon,
  Image01Icon,
} from "@hugeicons/core-free-icons"

import { ChartDistribution } from "./components/chart-distribution"
import { pesananStatusChartConfig } from "./config/analytics-chart-config"
import { ChartActivityTrends } from "./components/chart-activity-trends"
import { useMonitorClock } from "@/hooks/use-monitor-clock"

function OverviewBlock() {
  const { data, isLoading, isError } = FetchOverview()
  const activityTrends = data?.reports.countsByDate
//   const { jam, tanggal } = useMonitorClock()

  if (isLoading) {
    return (
      <div className="flex min-h-dvh w-full content-center items-center justify-center py-20">
        <Spinner className="size-10 text-primary" />
      </div>
    )
  }

  if (isError || !data?.reports) {
    return (
      <div className="flex w-full justify-center py-20 text-muted-foreground">
        Gagal memuat data overview.
      </div>
    )
  }

  const reports = data.reports

  const dataCards: DataCard[] = [
    {
      title: "Total Paket",
      description: "Jumlah paket aktif",
      value: reports.totalPaket,
      icon: PackageIcon,
      label: "Paket",
    },
    {
      title: "Total Pesanan",
      description: "Total riwayat pesanan",
      value: reports.totalPesanan,
      icon: ShoppingBag02Icon,
      label: "Pesanan",
    },
    {
      title: "Pesanan Pending",
      description: "Perlu konfirmasi",
      value: reports.totalPesananPending,
      icon: Clock01Icon,
      label: "Pending",
    },
    {
      title: "Galeri Acara",
      description: "Dokumentasi event",
      value: reports.totalGaleri,
      icon: Image01Icon,
      label: "Galeri",
    },
  ]

  const pesananStatusData = Object.entries(
    reports.pesananStatusCount || {}
  ).map(([key, value]) => ({
    name: key,
    count: value as number,
  }))

  return (
    <section className="space-y-4 px-10 py-6">
      <div className="@container/main flex flex-1 flex-col gap-6">
        <header className="m-auto flex w-full flex-col border-b px-0 pb-7 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="w-fit font-heading text-2xl text-neutral-900 lg:text-3xl dark:text-neutral-100">
              <span>Selamat</span>{" "}
              <span className="f font-accent text-primary italic">Datang</span>
            </h1>
            <p className="w-fit text-sm text-neutral-500 lg:text-base">
              Berikut ini rangkuman keseluruhan data
            </p>
          </div>

          {/* <div className="hidden text-right md:block">
            <div className="text-3xl font-black tracking-tight text-primary">
              {jam}
            </div>
            <div className="mt-1 text-lg font-bold tracking-wider text-muted-foreground uppercase">
              {tanggal}
            </div>
          </div> */}
        </header>

        {/* --- STATS CARDS --- */}
        <div className="flex flex-col gap-4 md:gap-6">
          <SectionCards dataCards={dataCards} />
        </div>

        {/* --- CHARTS GRID --- */}
        <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4">
          <ChartActivityTrends
            className="col-span-3"
            data={activityTrends || []}
            title="Tren Pesanan & Pendapatan"
            description="Pesanan dan pendapatan harian"
          />
          <ChartDistribution
            data={pesananStatusData}
            chartConfig={pesananStatusChartConfig}
            title="Status Pesanan"
            description="Distribusi status hari ini"
            nameKey="Pesanan"
            emptyMessage="status pesanan"
          />
        </div>
      </div>
    </section>
  )
}

export default OverviewBlock
