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
const ROUTE_DEFAULT_SEO: { match: RegExp; title: string; description: string }[] = [
  {
    match: /^\/$/,
    title: "Katering Bogor | Nasi Box, Prasmanan & Tumpeng Mini",
    description:
      "Katering masakan rumahan di Bogor sejak 2024. Nasi box, prasmanan, snack box & tumpeng mini untuk pernikahan, kantor, dan acara keluarga. Pesan lewat WhatsApp.",
  },
  {
    match: /^\/paket\/\d+$/,
    title: "Paket Catering",
    description:
      "Detail paket katering Catering Nusantara — menu, harga per porsi, dan fasilitas. Konsultasi & pemesanan via WhatsApp.",
  },
  {
    match: /^\/paket$/,
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
    match: /^\/kontak$/,
    title: "Kontak",
    description:
      "Hubungi Catering Nusantara via WhatsApp — konsultasi menu, harga, dan pemesanan.",
  },
  {
    match: /^\/login$/,
    title: "Masuk",
    description: "Login admin Catering Nusantara.",
  },
]

const FALLBACK_SEO = {
  title: "Catering Nusantara",
  description:
    "Katering masakan rumahan di Bogor — nasi box, prasmanan, snack box, dan tumpeng mini.",
}

export function RouteSeoResolver() {
  const { pathname } = useLocation()

  useEffect(() => {
    const route =
      ROUTE_DEFAULT_SEO.find((r) => r.match.test(pathname)) ?? FALLBACK_SEO
    applySeo({ title: route.title, description: route.description, path: pathname })
  }, [pathname])

  return null
}
