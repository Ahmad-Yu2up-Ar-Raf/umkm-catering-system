import React from "react"

import { cn } from "@/lib/utils"
import { BlurReveal } from "@/components/motion/blur-reveal"
import { Link } from "react-router"
import Logo from "@/components/svg/app-logo-svg"

type StickyFooterProps = React.ComponentProps<"footer">

const footerColumns = [
  {
    title: "Solusi",
    links: [
      { name: "Nasi Box Premium", to: "/paket" },
      { name: "Prasmanan Pernikahan", to: "/paket" },
      { name: "Tumpeng Mini Syukuran", to: "/paket" },
      { name: "Coffee Break", to: "/paket" },
      { name: "Snack Box", to: "/paket" },
    ],
  },
  {
    title: "Layanan",
    links: [
      { name: "Catering Bogor", to: "/paket" },
      { name: "Area Sentul & Depok", to: "/paket" },
      { name: "Jakarta & Bekasi", to: "/paket" },
      { name: "Konsultasi Menu", to: "/kontak" },
      { name: "Custom Order", to: "/kontak" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { name: "Tentang Kami", to: "/profil" },
      { name: "FAQ & Ketentuan", to: "/faq" },
      { name: "Cara Pemesanan", to: "/cara-pemesanan" },
      { name: "Hubungi WhatsApp", to: "https://wa.me/6287870306031" },
    ],
  },
]

export default function SiteFooter({ className, ...props }: StickyFooterProps) {
  return (
    <footer
      className={cn(
        "relative z-50 min-h-lvh w-full content-center bg-muted py-20",
        className
      )}
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      {...props}
    >
      <div className="fixed bottom-0 z-50 h-full w-full">
        {/* Add padding-bottom on mobile to account for navbar height (min-h-[9svh]) */}
        <div
          className={cn(
            "z-99999999999999999 sticky z-50 container flex h-full flex-col justify-end"
          )}
        >
          <div className="grid grid-cols-2 gap-5 border-b pb-6 sm:gap-8 md:grid-cols-4 md:pb-15 lg:flex lg:grid-cols-4 lg:justify-between">
            {/* Kolom logo dan deskripsi */}
            <BlurReveal
              amount={1}
              duration={0.8}
              stagger={0.08}
              className="col-span-2 lg:col-span-1 lg:w-54"
            >
              <div className="group mb-10 flex items-center space-x-2 transition-transform">
                <Link
                  to="/"
                  className="size-10 transition-transform duration-300 group-hover:scale-105 group-hover:brightness-110 sm:size-5 md:size-8 lg:size-10"
                >
                  <Logo className="lg:size-12" />
                </Link>
              </div>
              <p className="text- mb-3 text-sm leading-relaxed text-foreground/60 md:mb-6 md:text-sm">
                Menghadirkan kelezatan autentik Nusantara dengan standar
                kualitas tinggi untuk setiap momen istimewa Anda.
              </p>
            </BlurReveal>

            {/* Kolom navigasi */}
            {footerColumns.map((col, i) => (
              <BlurReveal
                key={col.title}
                amount={1}
                duration={0.8}
                delay={0.1 + i * 0.05}
                stagger={0.08}
              >
                <h4 className="mb-4 font-semibold md:text-lg">{col.title}</h4>
                <ul className="space-y-2 md:space-y-3">
                  {col.links.map((text) => (
                    <li key={text.name}>
                      <Link
                        to={text.to}
                        className="text-xs text-foreground/60 transition hover:text-foreground"
                      >
                        {text.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </BlurReveal>
            ))}
          </div>

          {/* Judul besar tengah */}
          <BlurReveal amount={0.3} duration={1} delay={0.3} stagger={0.1}>
            <div className="flex h-fit w-full items-center justify-center">
              <h1 className="relative h-30 bg-linear-to-b from-yellow-950/35 to-background bg-clip-text text-center text-[24lvw] tracking-[-0.10em] text-transparent select-none lg:h-75 lg:text-[15.4em]">
                Nusantara
              </h1>
            </div>
          </BlurReveal>
        </div>
      </div>
    </footer>
  )
}
