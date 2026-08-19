import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

type compoenentProp = {
  Title: string
  Deskrpsi: string
  Icon: IconSvgElement
}

const HeaderDashboard = ({ Icon, Title, Deskrpsi }: compoenentProp) => {
  const firstSentence: string = Title.split(".")[0] || ""

  // 2. Split that sentence into individual words using a regex to handle spaces cleanly
  const words: string[] = firstSentence.trim().split(/\s+/)

  // 3. Extract the first and second words into two separate variables with type inference
  const [firstWord, secondWord] = words
  return (
    <div className="flex flex-row items-center gap-8 md:w-fit">
      <div className="flex aspect-square size-17 items-center justify-center rounded-2xl border border-border bg-background p-3.5 text-primary">
        <HugeiconsIcon icon={Icon} className="size-full text-primary" />
      </div>
      <div className="space-y-2">
        <h1 className="w-fit font-heading text-2xl text-neutral-900 lg:text-3xl dark:text-neutral-100">
          <span>{firstWord}</span>{" "}
          <span className="f font-accent text-primary italic">
            {secondWord}
          </span>
        </h1>
        <p className="w-fit text-sm text-neutral-500 lg:text-base">
          {Deskrpsi}
        </p>
      </div>
    </div>
  )
}

export default HeaderDashboard
