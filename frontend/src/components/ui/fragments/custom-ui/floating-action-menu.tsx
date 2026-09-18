"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/fragments/shadcn-ui/button"
import { cn } from "@/lib/utils"

export interface FloatingActionOption {
  label: string
  onClick: () => void
  icon?: IconSvgElement
  disabled?: boolean
}

interface FloatingActionMenuProps {
  options: FloatingActionOption[]
  className?: string
}

/** Mobile-only floating create/export menu. Desktop uses toolbar buttons. */
export function FloatingActionMenu({
  options,
  className,
}: FloatingActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={cn("fixed right-4 bottom-6 z-50 md:hidden", className)}>
      <Button
        type="button"
        aria-label={isOpen ? "Tutup menu aksi" : "Buka menu aksi"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="size-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
      >
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className="flex"
        >
          <HugeiconsIcon icon={Add01Icon} className="size-6" />
        </motion.span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10, y: 10, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 10, y: 10, filter: "blur(10px)" }}
            transition={{
              duration: 0.6,
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.1,
            }}
            className="absolute right-0 bottom-14 mb-2"
          >
            <div className="flex flex-col items-end gap-2">
              {options.map((option, index) => (
                <motion.div
                  key={option.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Button
                    type="button"
                    size="sm"
                    disabled={option.disabled}
                    onClick={() => {
                      setIsOpen(false)
                      option.onClick()
                    }}
                    className="flex items-center gap-2 rounded-xl border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-md hover:bg-muted"
                  >
                    {option.icon && (
                      <HugeiconsIcon icon={option.icon} className="size-4" />
                    )}
                    <span className="text-xs font-medium">{option.label}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
