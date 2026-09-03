"use client"

import { Skeleton } from "@/components/ui/fragments/shadcn-ui/skeleton"
import { Card } from "@/components/ui/fragments/shadcn-ui/card"

export function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Row 1: 4 KPI cards — pure block skeletons */}
      <div className="grid grid-cols-2 gap-4 @5xl/main:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-[130px] rounded-2xl p-0 shadow-none">
            <Skeleton className="h-full w-full rounded-xl" />
          </Card>
        ))}
      </div>

      {/* Row 2: Main charts — 8-col + 4-col pure blocks */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="h-[400px] p-0 rounded-2xl shadow-none lg:col-span-8">
          <Skeleton className="h-full w-full rounded-2xl" />
        </Card>
        <Card className="h-[400px] p-0 rounded-2xl shadow-none lg:col-span-4">
          <Skeleton className="h-full w-full rounded-2xl" />
        </Card>
      </div>
    </div>
  )
}
