import { Badge } from "@/components/ui/fragments/shadcn-ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/fragments/shadcn-ui/card"
import { cn } from "@/lib/utils"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

export interface DataCard {
  title: string
  description: string
  value: number | number
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
          className={cn("@container/card py-5 bg-muted shadow-none", card.className)}
        >
          <CardContent className="flex items-center gap-3">
            <div className="flex aspect-square size-12 items-center justify-center rounded-2xl  border border-border bg-background p-2.5 text-primary">
              <HugeiconsIcon
                icon={card.icon}
                strokeWidth={2}
                className="size-8"
              />
            </div>
            <CardHeader className="w-full">
              <CardDescription>{card.title}</CardDescription>
              <CardTitle className="text-xl font-semibold @[250px]/card:text-2xl">
                {card.value}
              </CardTitle>
            </CardHeader>
          </CardContent>
          {/* <CardFooter className="flex-col items-start text-sm">
            <p className="line-clamp-1 font-medium">{card.description}</p>
            <p className="line-clamp-1 text-muted-foreground">
              Tambahkan data {card.label} lagi
            </p>
          </CardFooter> */}
        </Card>
      ))}
      {/* <Card className="@container/card">
        <CardHeader>
          <CardDescription>New Customers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1,234
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingDown />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Down 20% this period <TrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Acquisition needs attention
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Accounts</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            45,678
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong user retention <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Engagement exceed targets</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            4.5%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Steady performance increase <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Meets growth projections</div>
        </CardFooter>
      </Card> */}
    </div>
  )
}
