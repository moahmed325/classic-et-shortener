import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 sm:h-9 w-full rounded-md border border-[#27282b] bg-[#141517] px-3 py-2 text-base sm:text-sm text-[#ededed] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#8c8d91] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#56c2ff] focus-visible:border-[#56c2ff] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
