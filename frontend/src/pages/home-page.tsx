import { useState } from "react"

import { HeroBlock } from "@/components/ui/core/block/home/hero/hero-block"
import { Preloader } from "@/components/motion/preloader"
import FilosofiBlock from "@/components/ui/core/block/home/about/about-block"
import { FaqsSection } from "@/components/ui/core/block/home/faq/faq-block"

const PRELOADER_FLAG = "hasSeenPreloader"

/** Run-once-per-session gate — read lazily at mount so a repeat visit never
 *  flashes the curtain (no useEffect, no paint of a preloader that will be skipped). */
function hasSeenPreloader(): boolean {
  try {
    return sessionStorage.getItem(PRELOADER_FLAG) === "1"
  } catch {
    return false // storage unavailable → play the curtain; never break the load
  }
}

function HomePage() {
  const [preloaderDone, setPreloaderDone] = useState(() => hasSeenPreloader())

  return (
    <>
      {!preloaderDone && (
        <Preloader
          onComplete={() => {
            try {
              sessionStorage.setItem(PRELOADER_FLAG, "1")
            } catch {
              /* no-op */
            }
            setPreloaderDone(true)
          }}
        />
      )}
      <main>
        {/* <HeroBlock preloaderDone={preloaderDone} />
        <FilosofiBlock /> */}
        <FaqsSection />
      </main>
    </>
  )
}

export default HomePage
