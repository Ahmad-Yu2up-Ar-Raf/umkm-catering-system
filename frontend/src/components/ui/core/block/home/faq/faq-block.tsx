"use client"
import React from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/fragments/shadcn-ui/accordion"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Separator } from "@/components/ui/fragments/shadcn-ui/separator"
import { OriginButton } from "@/components/ui/fragments/custom-ui/button/cta-button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight } from "@hugeicons/core-free-icons"
const categories = [
  {
    id: "pemesanan-pengiriman",
    label: "Pemesanan & Pengiriman",
    description: "Minimum, area, waktu, & cara pesan",
  },
  {
    id: "layanan-acara",
    label: "Layanan & Acara",
    description: "Jenis acara & bentuk layanan",
  },
]

export function FaqsSection() {
  const [activeCategory, setActiveCategory] = React.useState(
    "pemesanan-pengiriman"
  )

  const filtered = faqs.filter((faq) => {
    const matchesCategory =
      activeCategory === "all" || faq.category === activeCategory
    return matchesCategory
  })

  const currentCategory = React.useMemo(
    () => categories.find((cat) => cat.id === activeCategory),
    [activeCategory]
  )

  return (
    <section className="container min-h-lvh content-center space-y-10 py-12 md:space-y-14 md:px-0">
      <header className="flex w-full flex-1 flex-col items-end gap-y-6 sm:flex-row sm:justify-between md:gap-y-9">
        <div className="flex w-full flex-col gap-y-1">
          <div>
            <p
              data-faq-eyebrow
              className="text-gold-deep mb-6 flex items-center gap-3.5 text-[11px] font-normal tracking-[0.28em] uppercase"
            >
              <div aria-hidden="true" className="h-px w-10 bg-primary" />
              <span className="text-primary">Pertanyaan Umum</span>
            </p>
          </div>
          <h2 className="w-full font-serif text-3xl md:text-4xl md:leading-14 lg:text-6xl">
            <span data-faq-title className=" ">
              Hal yang sering{" "}
            </span>
            <span
              data-faq-title
              className="clear-start block font-accent text-primary italic"
            >
              ditanyakan.
            </span>
          </h2>
        </div>

        <p
          data-faq-desc
          className="text-xs leading-relaxed text-muted-foreground sm:w-1/2 md:text-sm"
        >
          Semua yang perlu Anda tahu sebelum merayakan momen bersama kami — dari
          layanan dan menu hingga ketentuan biaya. Pilih topik yang Anda
          butuhkan.
        </p>
      </header>
      {/* <div className="flex flex-col items-center justify-center gap-4 px-4 py-16">
        <h2 className="font-mono text-4xl font-black text-balance md:text-5xl lg:font-black">
          FaQs
        </h2>
        <p className="text-muted-foreground">Your questions answered here.</p>
      </div> */}
      <div className="relative grid min-h-full grid-cols-6 py-12 md:grid-cols-4">
        <div className="sticky top-20 flex h-fit flex-col items-start gap-8 border-b pb-2 md:border-b-0">
          <div className="relative flex w-full flex-col border-b pb-10">
            {categories.map((cat, i) => (
              <Button
                className={cn(
                  "group spac relative m-0 h-fit w-full items-start justify-start bg-none pl-0 text-left transition-all duration-300 ease-out hover:bg-transparent",
                  activeCategory !== cat.id ? "mb-7" : "mb-8"
                )}
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                variant={"ghost"}
              >
                {activeCategory === cat.id && (
                  <motion.div
                    layoutId="active"
                    className="absolute inset-0 h-full w-[1.5px] rounded-xl bg-primary"
                  />
                )}

                {/* FIX: Hapus top-1/2 & -translate-y-1/2, ganti jadi self-center.
      Gua naikin group-hover:h-3 jadi h-4 biar animasinya lebih tegas,
      tapi kalau mau tetep h-3 juga aman! */}
                <div
                  id="hover-line"
                  className="h-0 w-[1.5px] self-center rounded-xl bg-primary opacity-30 transition-all duration-300 ease-out group-hover:h-4"
                />

                <span
                  className={cn(
                    "mt-1 mr-2.5 ml-2 h-full font-heading text-[12px] text-muted-foreground transition-all duration-300 ease-out",
                    activeCategory !== cat.id ? "opacity-40" : "text-primary"
                  )}
                >
                  {`0${i + 1}`}
                </span>

                <p className="leading-5">
                  <span
                    className={cn(
                      "text-sm text-foreground/80 transition-all duration-300 ease-out",
                      activeCategory !== cat.id && "opacity-40"
                    )}
                  >
                    {cat.label}
                  </span>
                  <span
                    className={cn(
                      "block text-[12px] font-light text-muted-foreground/80 transition-all duration-300 ease-out",
                      activeCategory !== cat.id && "hidden"
                    )}
                  >
                    {cat.description}
                  </span>
                </p>
              </Button>
            ))}
          </div>
          <div className=" space-y-7">
            <span
              className={cn(
                "block text-sm font-light text-muted-foreground/80 transition-all duration-300 ease-out"
              )}
            >
              Masih ada yang ingin ditanyakan?
            </span>
            <OriginButton
              intensity={0.8} // opsional, defaultnya 0.6
              range={120} // opsional, defaultnya 100

              className="group text-xs tracking-widest uppercase"
            >
              Tanya Via Whatsapp
              <HugeiconsIcon
                icon={ArrowRight}
                className="stroke-primtext-primary z-[9] size-4 fill-none transition-all duration-[800ms] ease-out group-hover:left-4 group-hover:translate-x-1 group-hover:stroke-white"
              />
            </OriginButton>
          </div>
        </div>
        <div className="col-span-3 h-fit pl-23">
          <Separator className="m-0 bg-border/60" />
          <Accordion
            className="w-full border-0 bg-transparent p-0"
            collapsible
            type="single"
          >
            {filtered.map((item) => (
              <AccordionItem
                className="border-b-0 py-5.5"
                key={item.id}
                value={item.id.toString()}
              >
                <AccordionTrigger className="px-4 font-sans text-lg hover:no-underline">
                  {item.title}
                </AccordionTrigger>

                <AccordionContent className="mt-6 h-fit pr-40 pb-3 font-sans text-sm leading-relaxed text-muted-foreground/70">
                  {item.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <Separator className="m-0 bg-border/60" />
        </div>
      </div>
    </section>
  )
}

const faqs = [
  {
    id: 1,
    category: "pemesanan-pengiriman",
    title: "How do I create my first project?",
    content:
      'Click the "New Project" button in your dashboard, choose a template or start from scratch, customize your project name and settings, and you\'ll be ready to start building in seconds.',
  },
  {
    id: 2,
    category: "pemesanan-pengiriman",
    title: "What are the system requirements?",
    content:
      "Efferd works on any modern web browser including Chrome, Firefox, Safari, and Edge. No special software installation is required—just visit our platform and log in.",
  },
  {
    id: 3,
    category: "layanan-acara",
    title: "Can I use Efferd for team collaboration?",
    content:
      "Absolutely! Invite team members, set role-based permissions, leave comments on components, and track changes in real-time. Our collaboration layanan-acara are built for teams of all sizes.",
  },
  {
    id: 4,
    category: "layanan-acara",
    title: "Is there a component library?",
    content:
      "Yes, Efferd includes a comprehensive library of pre-built, customizable components. You can also create your own reusable components and share them across your projects.",
  },
  {
    id: 5,
    category: "layanan-acara",
    title: "Do you support custom integrations?",
    content:
      "We support integrations with GitHub, GitLab, Figma, Slack, and major cloud providers. For custom integrations, contact our support team to discuss your needs.",
  },
]
