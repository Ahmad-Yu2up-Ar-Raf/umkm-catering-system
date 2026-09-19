import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/fragments/shadcn-ui/card"
import { cn } from "@/lib/utils"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import type { ReactNode } from "react"

export interface DataCard {
  title: string
  description: string
  value: number | string | ReactNode
  icon: IconSvgElement
  label?: string
  className?: string
}

type componentsProps = {
  dataCards: DataCard[]
}

export function SectionCards({ dataCards }: componentsProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-4", `@5xl/main:grid-cols-4`)}>
      {dataCards.map((card, index) => (
        <Card
          key={index}
          className={cn(
            "@container/card relative overflow-hidden bg-muted p-0 py-5 shadow-none",
            card.className
          )}
        >
          <CardContent className="flex flex-col gap-3 overflow-hidden md:flex-row md:items-center md:gap-5">
            <div className="absolute right-1 bottom-2 flex aspect-square size-8 items-center justify-center rounded-2xl border-0 border-border bg-background p-2.5 text-primary opacity-55 md:relative md:bottom-0 md:size-12 md:border md:opacity-100">
              <HugeiconsIcon
                icon={card.icon}
                strokeWidth={2}
                className="size-5 md:size-8"
              />
            </div>
            <CardHeader className="w-full p-0">
              <CardDescription className="text-xs">
                {card.title}
              </CardDescription>
              <CardTitle className="space-x-2 text-xl font-medium @[250px]/card:text-2xl">
                <span>{card.value}</span>

                <span className="sr-only font-accent font-thin text-primary italic">
                  {card.label}
                </span>
              </CardTitle>
            </CardHeader>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
