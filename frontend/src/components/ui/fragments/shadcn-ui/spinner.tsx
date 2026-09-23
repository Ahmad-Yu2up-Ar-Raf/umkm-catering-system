import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { LoaderCircleIcon } from "@hugeicons/core-free-icons"

function Spinner({ className, ...props }: Omit<React.ComponentProps<"svg">, "width" | "height">) {
  return (
    <HugeiconsIcon icon={LoaderCircleIcon} strokeWidth={2} data-slot="spinner" role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...(props as Record<string, unknown>)} />
  )
}

export { Spinner }
