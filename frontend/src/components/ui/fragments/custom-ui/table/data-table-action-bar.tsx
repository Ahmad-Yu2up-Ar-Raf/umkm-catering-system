"use client"

import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { Separator } from "@/components/ui/fragments/shadcn-ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/fragments/shadcn-ui/tooltip"
import { cn } from "@/lib/utils"
// import type { Table } from "@tanstack/react-table";
import {  X } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AnimatePresence, motion } from "framer-motion"
import * as React from "react"
import * as ReactDOM from "react-dom"
import { Spinner } from "../../shadcn-ui/spinner"

interface DataTableActionBarProps extends React.ComponentProps<
  typeof motion.div
> {
  table: number[]
  setSelected: (value: React.SetStateAction<number[]>) => void
  visible?: boolean
  container?: Element | DocumentFragment | null
}

function DataTableActionBar({
  table,
  setSelected,
  visible: visibleProp,
  container: containerProp,
  children,
  className,
  ...props
}: DataTableActionBarProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useLayoutEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelected([])
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [table])

  const container =
    containerProp ?? (mounted ? globalThis.document?.body : null)

  if (!container) return null

  const visible = visibleProp ?? table.length > 0

  return ReactDOM.createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          role="toolbar"
          aria-orientation="horizontal"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className={cn(
            "pointer-events-auto fixed inset-x-0 bottom-6 z-50 mx-auto flex w-fit flex-wrap items-center justify-center gap-2 rounded-xl border bg-background p-2 text-foreground shadow-sm",
            className
          )}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    container
  )
}

interface DataTableActionBarActionProps extends React.ComponentProps<
  typeof Button
> {
  tooltip?: string
  isPending?: boolean
}

const DataTableActionBarAction = React.forwardRef<HTMLButtonElement, DataTableActionBarActionProps>(
  ({ size = "sm", tooltip, isPending, disabled, className, children, ...props }, ref) => {
    const trigger = (
      <Button
        ref={ref}
        variant="secondary"
        size={size}
        className={cn(
          "gap-1.5 border border-secondary bg-secondary/50 text-accent-foreground hover:bg-secondary/70 [&>svg]:size-3.5",
          size === "icon" ? "size-7" : "h-7",
          className
        )}
        disabled={disabled || isPending}
        {...props}
      >
        {isPending ? <Spinner /> : children}
      </Button>
    )

    if (!tooltip) return trigger

    return (
      <Tooltip>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent
          sideOffset={6}
          className="border bg-accent font-semibold text-foreground dark:bg-zinc-900 [&>span]:hidden"
        >
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    )
  }
)
DataTableActionBarAction.displayName = "DataTableActionBarAction"

interface DataTableActionBarSelectionProps {
  table: number[]
  setSelected: (value: React.SetStateAction<number[]>) => void
}

function DataTableActionBarSelection({
  table,
  setSelected,
}: DataTableActionBarSelectionProps) {
  const onClearSelection = React.useCallback(() => {
    setSelected([])
  }, [table])

  return (
    <div className="flex h-7 items-center rounded-xl border pr-1 pl-2.5">
      <span className="text-xs whitespace-nowrap">{table.length} selected</span>
      <Separator
        orientation="vertical"
        className="mr-1 ml-2 data-[orientation=vertical]:h-4"
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-5"
            onClick={onClearSelection}
          >
            <HugeiconsIcon icon={X} className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent
          sideOffset={10}
          className="flex items-center gap-2 border bg-accent px-2 py-1 font-semibold text-foreground dark:bg-zinc-900 [&>span]:hidden"
        >
          <p>Clear selection</p>
          <kbd className="rounded border bg-background px-1.5 py-px font-mono text-[0.7rem] font-normal text-foreground shadow-xs select-none">
            <abbr title="Escape" className="no-underline">
              Esc
            </abbr>
          </kbd>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export {
  DataTableActionBar,
  DataTableActionBarAction,
  DataTableActionBarSelection,
}
