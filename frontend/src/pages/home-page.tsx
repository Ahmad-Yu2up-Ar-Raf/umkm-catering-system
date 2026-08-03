import { HeroBlock } from "@/components/ui/core/block/home/hero-block"
import { Preloader } from "@/components/motion/preloader"

function HomePage() {
  return (
    <>
      <Preloader />
      <main>
        <HeroBlock />
      </main>
    </>
  )
}

export default HomePage
