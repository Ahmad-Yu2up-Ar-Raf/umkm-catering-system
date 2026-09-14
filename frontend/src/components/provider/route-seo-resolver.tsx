"use client"

import { useEffect } from "react"
import { useLocation } from "react-router"

import { applySeo } from "@/hooks/use-seo"

/**
 * Per-ROUTE SEO defaults for the public SPA.
 *
 * Rendered BEFORE the <Outlet /> in LayoutWrapper, so on every route change
 * its effect runs FIRST and resets the document head to the current route's
 * defaults — clearing stale title/description/canonical from the previous
 * page. Pages that mount their own `useSeo` (e.g. the Paket Detail block)
 * then override with dynamic data (package name, description, thumbnail) in
 * the same commit, ending on their exact values.
 */
const ROUTE_DEFAULT_SEO: {
  match: RegExp
  title: string
  description: string
  noindex?: boolean
}[] = [
  {
    match: /^\/$/,
    title: "Katering Bogor | Nasi Box, Prasmanan & Tumpeng Mini",
    description:
      "Katering masakan rumahan di Bogor sejak 2024. Nasi box, prasmanan, snack box & tumpeng mini untuk pernikahan, kantor, dan acara keluarga. Pesan lewat WhatsApp.",
  },
  {
    // Slug-safe: router uses :id slugs, not numeric ids.
    match: /^\/paket\/[^/]+\/?$/,
    title: "Paket Catering",
    description:
      "Detail paket katering Catering Nusantara — menu, harga per porsi, dan fasilitas. Konsultasi & pemesanan via WhatsApp.",
  },
  {
    match: /^\/paket\/?$/,
    title: "Katalog Paket Catering",
    description:
      "Pilih paket katering — nasi box, prasmanan, snack box, hingga tumpeng mini. Konsultasi & pesan via WhatsApp.",
  },
  {
    match: /^\/galeri/,
    title: "Galeri Perayaan",
    description:
      "Dokumentasi perayaan yang kami layani — pernikahan, kantor, dan acara keluarga, dengan cita rasa Nusantara.",
  },
  {
    match: /^\/login\/?$/,
    title: "Masuk",
    description: "Login admin Catering Nusantara.",
    noindex: true,
  },
]

const FALLBACK_SEO: { title: string; description: string; noindex?: boolean } =
  {
    title: "Catering Nusantara",
    description:
      "Katering masakan rumahan di Bogor — nasi box, prasmanan, snack box, dan tumpeng mini.",
  }

export function RouteSeoResolver() {
  const { pathname } = useLocation()

  useEffect(() => {
    const route =
      ROUTE_DEFAULT_SEO.find((r) => r.match.test(pathname)) ?? FALLBACK_SEO
    applySeo({
      title: route.title,
      description: route.description,
      path: pathname,
      noindex: route.noindex,
    })
    // SPA pageviews — dynamic imports keep analytics out of the main bundle;
    // both are env-gated no-ops until their keys exist.
    void import("@/lib/posthog").then((m) => m.capturePageview(pathname))
    void import("@/lib/gtag").then((m) => m.pageviewGA(pathname))
  }, [pathname])

  return null
}
