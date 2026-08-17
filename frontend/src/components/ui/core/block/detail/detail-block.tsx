"use client"

import { useEffect } from "react"
import { MotionConfig } from "framer-motion"

import { useDetailStore } from "@/store/detail-store"
import { useSeo } from "@/hooks/use-seo"

import { FetchPaketDetail } from "./hooks/use-detail-query"
import { toDetailViewModel } from "./utils/detail-view-model"
import { DetailContent } from "./components/detail-content"
import { DetailSkeleton } from "./components/detail-skeleton"
import { DetailNotFound } from "./components/detail-not-found"
import { DetailError } from "./components/detail-error"

/**
 * Paket Detail — orchestrator (sitemap #3.1).
 *
 * Data: one TanStack Query (`["paket","detail",id]`) → view model → the
 * presentational components. No business logic in JSX.
 *
 * State router: loading → DetailSkeleton · invalid/404 → DetailNotFound ·
 * API error → DetailError (retry) · success → DetailContent.
 *
 * Chrome gate (contract §16.3 — deterministic, no timers):
 *  (1) RESET — `ready=false` the moment the route/id changes (mount included),
 *      so a stale flag from a previous paket never flashes CTA/Footer under
 *      the next paket's skeleton.
 *  (2) UNGATE — `ready=true` only when the CURRENT id's query has settled
 *      (`isLoading` false covers success, 404, errors and invalid ids — every
 *      terminal/visible state; the footer is the escape hatch there).
 *
 * SEO: `useSeo` with loading / real / not-found titles (§24).
 */
export function PaketDetailBlock({ id }: { id: string }) {
  const query = FetchPaketDetail(id)
  const setReady = useDetailStore((s) => s.setReady)

  // (1) reset — chrome hidden the instant the route/id changes (mount included).
  useEffect(() => {
    setReady(false)
  }, [id, setReady])

  // (2) un-gate — only when this id's query has settled.
  const settled = !query.isLoading
  useEffect(() => {
    setReady(settled)
  }, [settled, setReady])

  const isNotFound = query.isNotFound

  useSeo({
    title: query.data
      ? query.data.nama_paket
      : isNotFound
        ? "Paket tidak ditemukan"
        : "Paket Catering",
    description:
      query.data?.deskripsi?.slice(0, 160) ??
      "Detail paket katering Catering Nusantara — menu, harga per porsi, dan fasilitas.",
    path: `/paket/${id}`,
    image: query.data?.thumbnail ?? undefined,
  })

  if (query.isLoading) {
    return <DetailSkeleton />
  }

  if (isNotFound) {
    return (
      <MotionConfig reducedMotion="user">
        <DetailNotFound />
      </MotionConfig>
    )
  }

  if (query.isError || !query.data) {
    return (
      <MotionConfig reducedMotion="user">
        <DetailError onRetry={() => query.refetch()} />
      </MotionConfig>
    )
  }

  const vm = toDetailViewModel(query.data)

  return (
    <MotionConfig reducedMotion="user">
      <DetailContent vm={vm} />
    </MotionConfig>
  )
}

export default PaketDetailBlock
