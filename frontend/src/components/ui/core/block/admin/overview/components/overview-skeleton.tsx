"use client"

import { Skeleton } from "@/components/ui/fragments/shadcn-ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/fragments/shadcn-ui/card"

export function OverviewSkeleton() {
  return (
    <section className="space-y-4 px-4 py-6 sm:px-8 lg:px-10">
      <div className="@container/main flex flex-1 flex-col gap-6">
        <header className="flex w-full flex-col border-b px-0 pb-7 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </header>

        {/* Row 1: 4 KPI cards — outer block skeletons, h matches SectionCards @container/card py-5 */}
        <div className="grid grid-cols-2 gap-4 @5xl/main:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="py-5 shadow-none">
              <CardContent className="flex items-center gap-3">
                <Skeleton className="size-12 shrink-0 rounded-2xl" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Row 2: Main trend (8 cols, h-[350px]) + Top 5 bar (4 cols, h-[350px]) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <Card className="shadow-none lg:col-span-8">
            <CardHeader className="border-b py-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-2 h-3 w-56" />
            </CardHeader>
            <CardContent className="pt-6">
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card className="shadow-none lg:col-span-4">
            <CardHeader className="border-b py-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-2 h-3 w-40" />
            </CardHeader>
            <CardContent className="pt-6">
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>

        {/* Row 3: 3 distribution pies — equal h-[320px] block cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="shadow-none">
              <CardHeader className="border-b py-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-2 h-3 w-40" />
              </CardHeader>
              <CardContent className="pt-6">
                <Skeleton className="mx-auto aspect-square max-h-[250px] w-full max-w-[250px] rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
