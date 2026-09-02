"use client"

// React Imports
import type { HTMLAttributes } from "react"

// Third-party Imports
import { format } from "date-fns"

import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { Calendar } from "@/components/ui/fragments/shadcn-ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/fragments/shadcn-ui/popover"

// Custom Hook
import { useDashboardFilters } from "../hooks/use-dashboard-filters"
import { HugeiconsIcon } from "@hugeicons/react"
import { CalendarIcon, XCircle } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

export function CalendarDateRangePicker({
  className,
}: HTMLAttributes<HTMLDivElement>) {
  const { dateRange, setDateRange, hasActiveFilters } = useDashboardFilters()

  // Handler untuk clear filter
  const handleClearFilter = async (event: React.MouseEvent) => {
    event.stopPropagation()
    await setDateRange(undefined)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-64 justify-start border-dashed bg-background p-5 text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            {hasActiveFilters ? (
              <div
                role="button"
                aria-label="Clear date filter"
                tabIndex={0}
                onClick={handleClearFilter}
                className="mr-2 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
              >
                <HugeiconsIcon icon={XCircle} className="h-4 w-4" />
              </div>
            ) : (
              <HugeiconsIcon
                icon={CalendarIcon}
                className="mr-2 h-4 w-4 text-primary"
              />
            )}

            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Filter periode</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
