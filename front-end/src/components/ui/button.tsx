import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 min-h-[44px] sm:min-h-0 active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#ff6363] text-white hover:bg-[#f85353] border border-[#ff6363]/80 shadow-none font-medium",
        destructive:
          "bg-[#ff6363]/10 text-[#ff6363] border border-[#ff6363]/30 hover:bg-[#ff6363]/20 shadow-none",
        outline:
          "border border-border-subtle bg-surface-1 text-text-primary hover:bg-surface-2 hover:text-text-primary shadow-none",
        secondary:
          "bg-surface-2 text-text-primary border border-border-subtle hover:bg-border-subtle shadow-none",
        ghost:
          "text-text-muted hover:text-text-primary hover:bg-surface-2",
        link:
          "text-[#56c2ff] underline-offset-4 hover:underline p-0 h-auto min-h-0",
      },
      size: {
        default: "h-11 sm:h-9 px-3.5 py-2",
        sm: "h-11 sm:h-8 rounded-md px-3 text-xs",
        lg: "h-12 sm:h-10 rounded-md px-6 text-base sm:text-sm",
        icon: "h-11 w-11 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:h-9 sm:w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
