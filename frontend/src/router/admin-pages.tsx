import { lazy, Suspense } from "react"
import type { ReactNode } from "react"

import { RouteFallback } from "@/router/public-routes"

// P4 perf: admin routes are code-split so public visitors never download
// recharts/admin JS. This file exports components only (react-refresh rule);
// the route table lives in ./index.tsx.
export const DashboardPage = lazy(() => import("@/pages/admin/dashboard-page"))
export const MasterPaketPage = lazy(
  () => import("@/pages/admin/master-paket-page")
)
export const MasterGaleriPage = lazy(
  () => import("@/pages/admin/master-galeri-page")
)
export const MasterPesananPage = lazy(
  () => import("@/pages/admin/master-pesanan-page")
)
export const TestimoniPage = lazy(
  () => import("@/pages/admin/testimoni-page")
)

export function AdminSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>
}
