import { BlurReveal } from "@/components/motion/blur-reveal"
import { ScrollRotatingVisual } from "@/components/ui/core/visual/scroll-rotating-visual"

/**
 * #profil — the founder/philosophy block.
 *
 * Motion:
 *  - The right-side hero object is a single top-down Tumpeng PNG that rotates
 *    continuously, tied 1:1 to the user's scroll through the section — handled
 *    by the reusable `ScrollRotatingVisual` (Framer `useScroll`/`useSpring`,
 *    `prefers-reduced-motion` → static).
 *  - Header + description reveal via the shared word-blur primitives.
 */
function AboutBlock() {
  return (
    <section
      id="profil"
      className="container content-center py-15 lg:py-0 lg:pt-30 lg:pb-30"
    >
      <div className="flex flex-col gap-11 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        {/* Teks Filosofi Us - Kiri */}
        <header className="flex w-full flex-1 flex-col gap-y-6 md:gap-y-9">
          {/* Judul */}
          <div className="flex w-full flex-col gap-y-1">
            <div>
              <p className="text-gold-deep mb-6 flex items-center gap-3.5 text-[11px] font-normal tracking-[0.28em] uppercase">
                <div aria-hidden="true" className="h-px w-10 bg-primary" />
                <BlurReveal as="span" className="text-primary" amount={0.3}>
                  Tentang Kami
                </BlurReveal>
              </p>
            </div>
            <h2 className="w-full font-serif text-4xl md:leading-14 lg:text-5xl">
              <BlurReveal
                as="span"
                className="block"
                stagger={0.08}
                amount={0.3}
              >
                Setiap perayaan
              </BlurReveal>
              <BlurReveal
                as="span"
                className="block font-accent text-primary italic"
                stagger={0.08}
                amount={0.3}
              >
                kisah Anda.
              </BlurReveal>
            </h2>
          </div>

          {/* Deskripsi - lebih singkat */}
          <BlurReveal
            as="p"
            className="text-sm leading-relaxed text-muted-foreground md:text-base md:text-[16px]"
            amount={0.3}
          >
            Sejak 2024, Catering Nusantara hadir dari dapur keluarga di Bogor,
            dimasak segar dengan sepenuh hati untuk Anda. Kami percaya hidangan
            terbaik itu penting.
          </BlurReveal>
        </header>

        {/* Kanan — the rotating Tumpeng hero object. */}
        <div className="flex w-full items-center justify-end lg:w-[50%]">
          <ScrollRotatingVisual
            imageSrc="/assets/images/about/tumpeng-from-top.png"
            alt="Tumpeng nasi kuning khas Nusantara dilihat dari atas"
            className="size-full md:h-[360px] md:w-[360px] lg:h-[400px] lg:w-[400px]"
          />
        </div>
      </div>
    </section>
  )
}

export default AboutBlock
