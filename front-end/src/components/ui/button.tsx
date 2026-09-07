import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#56c2ff] focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 min-h-[44px] sm:min-h-0 active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#ff6363] text-white hover:bg-[#f85353] border border-[#ff6363]/80 shadow-none font-medium",
        destructive:
          "bg-[#ff6363]/10 text-[#ff6363] border border-[#ff6363]/30 hover:bg-[#ff6363]/20 shadow-none",
        outline:
          "border border-[#27282b] bg-[#141517] text-[#ededed] hover:bg-[#1c1d20] hover:text-white shadow-none",
        secondary:
          "bg-[#1c1d20] text-[#ededed] border border-[#27282b] hover:bg-[#27282b] shadow-none",
        ghost:
          "text-[#8c8d91] hover:text-[#ededed] hover:bg-[#1c1d20]",
        link:
          "text-[#56c2ff] underline-offset-4 hover:underline p-0 h-auto min-h-0",
      },
      size: {
        default: "h-11 sm:h-9 px-3.5 py-2",
        sm: "h-11 sm:h-8 rounded-md px-3 text-xs",
        lg: "h-12 sm:h-10 rounded-md px-6 text-base sm:text-sm",
        icon: "h-11 w-11 sm:h-9 sm:w-9 p-0",
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
