import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-mono font-medium tracking-tight transition-colors focus:outline-none focus:ring-1 focus:ring-[#56c2ff] select-none",
  {
    variants: {
      variant: {
        default:
          "border-[#5fc992]/25 bg-[#5fc992]/10 text-[#5fc992]",
        secondary:
          "border-border-subtle bg-surface-2 text-text-primary",
        destructive:
          "border-[#ff6363]/25 bg-[#ff6363]/10 text-[#ff6363]",
        warning:
          "border-[#f59e0b]/25 bg-[#f59e0b]/10 text-[#f59e0b]",
        cyan:
          "border-[#56c2ff]/25 bg-[#56c2ff]/10 text-[#56c2ff]",
        outline:
          "border-border-subtle text-text-muted bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
