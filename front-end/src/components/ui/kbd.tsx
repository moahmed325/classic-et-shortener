import * as React from "react"
import { cn } from "@/lib/utils"

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export function Kbd({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        "px-1.5 py-0.5 text-xs font-mono bg-[#1c1d20] border border-[#27282b] rounded text-[#ededed] inline-flex items-center shadow-none select-none tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  )
}
