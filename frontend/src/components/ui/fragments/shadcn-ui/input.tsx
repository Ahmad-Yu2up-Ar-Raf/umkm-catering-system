"use client"

import * as React from "react"
import { cva } from "class-variance-authority"

import { Button } from "./button"
import type { VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { EyeIcon, EyeOff, X } from "@hugeicons/core-free-icons"

const inputVariants = cva(
  "h-9 w-full min-w-0 rounded-lg border border-border bg-background px-3 py-5 text-base transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50",

  {
    variants: {
      variant: {
        default:
          "border-border focus-visible:text-primary focus-visible:placeholder:text-primary",
        destructive: "border-destructive focus-visible:ring-destructive",
        ghost:
          "border-transparent bg-accent focus-visible:border-border focus-visible:bg-input",
      },
      size: {
        default: "h-9 px-3 py-2",
        sm: "h-8 px-2 py-1 text-xs",
        lg: "h-10 px-4 py-2",
        xl: "h-12 px-6 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface InputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  leftIcon?: IconSvgElement
  rightIcon?: React.ReactNode
  error?: boolean
  clearable?: boolean
  onClear?: () => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      type = "text",
      leftIcon,
      rightIcon,
      error,
      clearable,
      onClear,
      value,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [internalValue, setInternalValue] = React.useState(
      props.defaultValue || ""
    )

    // Create internal ref if no ref is provided
    const internalRef = React.useRef<HTMLInputElement>(null)
    const inputRef = ref || internalRef

    const inputVariant = error ? "destructive" : variant
    const isPassword = type === "password"
    const actualType = isPassword && showPassword ? "text" : type

    // Determine if this is a controlled component
    const isControlled = value !== undefined
    const inputValue = isControlled ? value : internalValue
    const showClearButton =
      clearable && inputValue && String(inputValue).length > 0

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalValue(e.target.value)
      }
      props.onChange?.(e)
    }

    const handleClear = () => {
      // Get reference to the input element
      const inputElement =
        typeof inputRef === "function" ? null : inputRef?.current

      if (inputElement) {
        // Set the input's value directly
        inputElement.value = ""

        // Create a proper synthetic event
        const event = new Event("input", { bubbles: true })
        Object.defineProperty(event, "target", {
          writable: false,
          value: inputElement,
        })

        // Dispatch the event to trigger onChange handlers
        inputElement.dispatchEvent(event)
      }

      // Update internal state for uncontrolled components
      if (!isControlled) {
        setInternalValue("")
      }

      // Call the onClear callback
      onClear?.()

      // Create synthetic React event for onChange
      if (props.onChange) {
        const syntheticEvent = {
          target: { value: "" },
          currentTarget: { value: "" },
          preventDefault: () => {},
          stopPropagation: () => {},
        } as React.ChangeEvent<HTMLInputElement>

        props.onChange(syntheticEvent)
      }
    }

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword)
    }
    return (
      <div className={cn("group relative w-full", className)}>
        {leftIcon && (
          <div className="absolute top-1/2 left-3 z-10 -translate-y-1/2 text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0">
            <HugeiconsIcon
              icon={leftIcon}
              className={cn(
                "transition-colors group-focus-within:text-primary" // <-- Tambah ini
              )}
            />
          </div>
        )}

        <input
          type={actualType}
          className={cn(
            inputVariants({ variant: inputVariant, size, className }),
            leftIcon && "pl-10",
            (rightIcon || isPassword || showClearButton) && "pr-10"
          )}
          ref={inputRef}
          {...(isControlled
            ? { value: inputValue }
            : { defaultValue: props.defaultValue })}
          onChange={handleInputChange}
          {...(({ defaultValue, ...rest }) => rest)(props)}
        />

        {/* Right side icons container */}
        {(rightIcon || isPassword || showClearButton) && (
          <div className="absolute top-1/2 right-0.5 z-10 flex -translate-y-1/2 items-center gap-1">
            {/* Custom right icon */}
            {rightIcon && (
              <div className="text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0">
                {rightIcon}
              </div>
            )}

            {/* Clear button */}
            {showClearButton && (
              <Button
                type="button"
                variant={"ghost"}
                onClick={handleClear}
                className="text-muted-foreground transition-colors hover:text-foreground [&_svg]:size-4 [&_svg]:shrink-0"
                tabIndex={-1}
              >
                <HugeiconsIcon icon={X} />
              </Button>
            )}

            {/* Password visibility toggle */}
            {isPassword && (
              <Button
                disabled={props.disabled}
                variant={"ghost"}
                type="button"
                onClick={togglePasswordVisibility}
                className="text-muted-foreground transition-colors hover:text-foreground [&_svg]:size-4 [&_svg]:shrink-0"
                tabIndex={-1}
              >
                {showPassword ? (
                  <HugeiconsIcon icon={EyeIcon} />
                ) : (
                  <HugeiconsIcon icon={EyeOff} />
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input, inputVariants }
