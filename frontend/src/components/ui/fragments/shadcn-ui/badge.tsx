"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

const badgeVariants = cva(
  "flex items-center justify-center gap-1.5 rounded-[calc(var(--radius)-4px)] border text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "g-primary border-transparent shadow-sm/2 focus-visible:ring-ring",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground focus-visible:ring-ring",
        destructive:
          "text-destructive-foreground border-transparent bg-destructive shadow-sm/2 focus-visible:ring-destructive",
        outline:
          "border-border text-foreground shadow-sm/2 focus-visible:ring-ring",
        ghost: "border-transparent text-foreground focus-visible:ring-ring",
      },
      size: {
        sm: "h-5 px-2",
        default: "h-6 px-2.5",
        lg: "h-7 px-3 text-sm",
        icon: "h-6 w-6 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: IconSvgElement
  iconPosition?: "left" | "right"
}

function Badge({
  className,
  variant,
  size,
  icon: Icon,
  iconPosition = "left",
  children,
  ...props
}: BadgeProps) {
  const iconSize = size === "sm" ? 12 : size === "lg" ? 14 : 12

  return (
    <span
      className={cn(
        badgeVariants({ variant, size }),
        "w-fit rounded-xl text-accent-foreground",
        className
      )}
      {...props}
    >
      {Icon && iconPosition === "left" && (
        <HugeiconsIcon icon={Icon} size={iconSize} className="shrink-0" />
      )}
      {children}
      {Icon && iconPosition === "right" && (
        <HugeiconsIcon icon={Icon} size={iconSize} className="shrink-0" />
      )}
    </span>
  )
}

export { Badge, badgeVariants }
