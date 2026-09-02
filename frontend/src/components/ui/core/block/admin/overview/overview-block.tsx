"use client"

import { SectionCards, type DataCard } from "./components/section-card"
import { FetchOverview } from "./hooks/use-overview-query"
import { OverviewSkeleton } from "./components/overview-skeleton"
import { useDashboardFilters } from "./hooks/use-dashboard-filters"
import {
  PackageIcon,
  ShoppingBag02Icon,
  Clock01Icon,
  Image01Icon,
} from "@hugeicons/core-free-icons"

import { ChartActivityTrends } from "./components/chart-activity-trends"
import { ChartBarActive } from "./components/chart-bar-active"
import { CalendarDateRangePicker } from "./components/date-range-picker"

function OverviewBlock() {
  const { dateRange } = useDashboardFilters()
  const { data, isLoading, isFetching, isError } = FetchOverview(dateRange)

  // All hooks MUST be above conditional returns (Rules of Hooks)
  const reports = data?.reports
  const activityTrends = reports?.countsByDate

  if (isError || (!isLoading && !reports)) {
    return (
      <section className="space-y-4 px-4 py-6 sm:px-8 lg:px-10">
        <div className="@container/main flex flex-1 flex-col gap-6">
          <header className="flex w-full flex-col border-b px-0 pb-7 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <h1 className="w-fit font-heading text-2xl text-neutral-900 lg:text-3xl dark:text-neutral-100">
                <span>Selamat</span> <span className="font-accent italic text-primary"> Datang</span>
              </h1>
              <p className="w-fit text-sm text-neutral-500 lg:text-base">Berikut rangkuman keseluruhan data</p>
            </div>
            <CalendarDateRangePicker />
          </header>
          <div className="flex w-full justify-center py-20 text-muted-foreground">Gagal memuat data overview.</div>
        </div>
      </section>
    )
  }

  const dataCards: DataCard[] = reports
    ? [
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
    : []

  const isRefetching = isFetching && !isLoading

  return (
    <section className="space-y-4 px-4 py-6 sm:px-8 lg:px-10">
      <div className="@container/main flex flex-1 flex-col gap-6">
        <header className="flex w-full flex-col border-b px-0 pb-7 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="w-fit font-heading text-2xl text-neutral-900 lg:text-3xl dark:text-neutral-100">
              <span>Selamat</span> <span className="font-accent italic text-primary"> Datang</span>
            </h1>
            <p className="w-fit text-sm text-neutral-500 lg:text-base">Berikut rangkuman keseluruhan data</p>
          </div>
          <CalendarDateRangePicker />
        </header>

        {isLoading ? (
          <OverviewSkeleton />
        ) : (
          <div className={isRefetching ? "pointer-events-none opacity-50 transition-opacity duration-200" : "transition-opacity duration-200"}>
            {/* Row 1: KPI Cards */}
            <div className="flex flex-col gap-4 md:gap-6">
              <SectionCards dataCards={dataCards} />
            </div>

            {/* Row 2: Activity trends + Top 5 */}
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
              <ChartActivityTrends
                className="lg:col-span-8"
                data={activityTrends || []}
                title="Tren Pesanan & Pendapatan"
                description="Pesanan dan pendapatan harian"
              />
              <ChartBarActive
                data={reports?.topPaket?.slice(0, 5) ?? []}
                title="Top 5 Paket Terlaris"
                description="Paket dengan pesanan terbanyak"
                footerText="Berdasarkan total pesanan"
                subFooter="Diurutkan dari yang terlaris"
                className="lg:col-span-4"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default OverviewBlock
