"use client"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/fragments/shadcn-ui/card"

// import { Heart, ShoppingCart, Star } from "lucide-react"
import { Heart, ShoppingCart, Star } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/fragments/shadcn-ui/badge"
import { Link } from "react-router"
import MediaItem from "@/components/ui/fragments/custom-ui/media-item"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/fragments/shadcn-ui/tooltip"
import { ProductsSchema } from "@/lib/validations/index.t"

import React from "react"

import { cn } from "@/lib/utils"

import {
  getCategoryColor,
  getCategoryIcon,
} from "@/lib/utils/products/category-utils"
import { CategoryProductsStatus } from "@/config/enums/CategoryProductsStatus"
import { HugeiconsIcon } from "@hugeicons/react"
// import { handleCart } from "@/lib/actions/cart-action"
// import { handleWhishlist } from "@/lib/actions/whishlis-actions"

type ProductProps = {
  Product: ProductsSchema
  className?: string
  isWhistlist?: boolean | null

  label?: string
  index?: number
}

export function ProductCard({
  Product,
  className,
  index,
  label,
  isWhistlist,
  ...props
}: ProductProps & React.HTMLAttributes<HTMLDivElement>) {
  const [loading, setLoading] = React.useState(false)
  const Price = Product.formatted_price

  const showcase_images = Product.showcase_images

  const category = Product.category as CategoryProductsStatus
  const IconProduct = getCategoryIcon(category)
  const ColorProduct = getCategoryColor(category)
  return (
    <Card
      className={cn(
        "m-auto h-full w-full max-w-sm gap-4 border-0 bg-background p-0 shadow-none dark:bg-background"
      )}
      {...props}
    >
      <CardContent
        className={cn(
          "group relative min-h-[16em] overflow-hidden rounded-xl bg-background px-0 md:min-h-[21em]",
          className
        )}
      >
        <Badge
          //   icon={IconProduct}
          variant="outline"
          className={cn(
            "absolute top-2.5 left-2.5 z-30 rounded-xl bg-primary/80 text-[9px] font-semibold text-primary-foreground capitalize md:text-xs",
            ColorProduct
          )}
        >
          {category}
        </Badge>

        <CardAction className="absolute right-0 bottom-0 flex h-full flex-col justify-between pt-1.5 md:pt-0">
          <Tooltip>
            <TooltipTrigger
            //   onClick={() => {
            //     handleWhishlist({ setLoading: setLoading, Product: Product })
            //   }}
            >
              <Button
                size={"sm"}
                variant={"ghost"}
                className={cn(
                  "z-40 rounded-full px-0 hover:bg-destructive md:py-5",

                  Product.is_whislisted
                    ? "transition-all duration-300 ease-out hover:text-destructive [&_svg]:fill-destructive hover:[&_svg]:fill-none hover:[&_svg]:text-accent"
                    : ""
                )}
              >
                <HugeiconsIcon
                  icon={Heart}

                  className={cn(
                    "border-white transition-all duration-300 ease-out",

                    Product.is_whislisted
                      ? "size-6 text-destructive"
                      : "size-5 text-white"
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {Product.is_whislisted
                  ? "Remove from Whistlist"
                  : "Add to whishlist"}
              </p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
            //   onClick={() => {
            //     handleCart({ setLoading: setLoading, Product: Product })
            //   }}
            >
              <Button className="relative z-40 size-11 rounded-full text-white lg:size-12">
                <HugeiconsIcon icon={ShoppingCart} className="size-5.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add to cart</p>
            </TooltipContent>
          </Tooltip>
        </CardAction>
        <div className="absolute right-0 bottom-0 z-30 size-14.5 lg:size-16">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 62 62"
            className="relative z-20"
          >
            <path
              d="M 36 10 L 52 10 C 57.523 10 62 5.523 62 0 L 62 62 L 0 62 C 5.523 62 10 57.523 10 52 L 10 36 C 10 21.641 21.641 10 36 10 Z"
              fill="var(--background)"
            />
          </svg>
        </div>

        <Link
          to={`/`}

          className="absolute h-full w-full cursor-zoom-in"
        >
          <MediaItem
            webViewLink={`${Product.cover_image}`}

            className={cn(
              "h-full w-full rounded-xl object-cover object-center opacity-100 transition-all duration-300 ease-out",

              showcase_images &&
                showcase_images.length > 0 &&
                "group-hover:opacity-0"
            )}
          />
        </Link>
        <Link to={"/"} className="absolute h-full w-full">
          {showcase_images && showcase_images.length > 0 && (
            <MediaItem
              webViewLink={`${showcase_images[0]}`}

              className="h-full w-full rounded-xl object-cover object-center opacity-0 transition-all duration-300 ease-out group-hover:opacity-100"
            />
          )}
        </Link>
      </CardContent>
      <Link className="space-y-4 lg:space-y-4" to={`/`}>
        <CardHeader className="bg-background py-0 pr-2.5 pl-0">
          <Tooltip>
            <TooltipTrigger className="w-fit">
              <Badge
                variant={"outline"}
                className="w-fit border-0 p-0 text-accent-foreground lg:text-sm"
              >
                <HugeiconsIcon
                  icon={Star}
                  className="size-4 fill-primary text-primary"
                />{" "}
                <span className="font-medium">
                  4.5
                  {/* {Product.reviews_avg_star_rating != null
                    ? Math.round(Product.reviews_avg_star_rating! * 10) / 10
                    : 0.0} */}
                </span>
                <span className="">455</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Average Rating</p>
            </TooltipContent>
          </Tooltip>
          <CardTitle className="line-clamp-2 leading-6 font-medium tracking-tight lg:text-lg">
            {Product.name}{" "}
          </CardTitle>
          {/* <CardDescription>
          Enter your email bel ow to login to your account
        </CardDescription> */}
        </CardHeader>

        <CardFooter className="bg-background p-0 text-left">
          <div className="flex flex-col">
            <h1 className="text-left font-medium">{Price}</h1>
            <p className="line-clamp-1 text-xs text-accent-foreground/90 md:text-sm">
              20 Sold{" "}
            </p>
          </div>
        </CardFooter>
      </Link>
    </Card>
  )
}
