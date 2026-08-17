"use client"

import { useRef } from "react"

import { ArrowRight } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { OriginButton } from "@/components/ui/fragments/custom-ui/button/cta-button"
import { gsap, useGSAP } from "@/components/motion/gsap"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { cn } from "@/lib/utils"

import { BUSINESS_NUMBER, getWhatsAppLink } from "@/lib/whatsapp"

/**
 * FAQ CTA — "Masih ada yang ingin ditanyakan?" with a WhatsApp action.
 *
 * Reveals on scroll: text line and the button rise in staggered, silky GSAP
 * motion. Rendered twice responsively (desktop sidebar / below the mobile
 * accordion), each mount owns its own ScrollTrigger.
 */
export function FaqCta({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      if (reduced || !ref.current) return

      const lines = gsap.utils.selector(ref.current)("[data-faq-cta-line]")
      gsap.fromTo(
        lines,
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 88%",
            once: true,
          },
        }
      )
    },
    { scope: ref }
  )

  return (
    <div
      ref={ref}
      data-faq-cta
      className={cn("flex flex-col items-start gap-6", className)}
    >
      <span
        data-faq-cta-line
        className="text-sm md:text-[13px] pl-1 font-light text-muted-foreground/80"
      >
        Masih ada yang ingin ditanyakan?
      </span>

      <OriginButton
        data-faq-cta-line
        href={getWhatsAppLink(
          BUSINESS_NUMBER,
          "Halo, saya ingin bertanya lebih lanjut mengenai layanan Anda."
        )}
        intensity={0.8}
        range={120}
        className="group text-xs tracking-widest uppercase"
      >
        Tanya Whatsapp
        <HugeiconsIcon
          icon={ArrowRight}
          className="size-4 fill-none transition-transform duration-700 ease-out group-hover:translate-x-1"
        />
      </OriginButton>
    </div>
  )
}
