import * as React from "react"
import { cn } from "@/lib/utils"

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export function Kbd({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        "px-1.5 py-0.5 text-xs font-mono bg-[var(--kbd-bg)] border border-[var(--kbd-border)] rounded text-[var(--kbd-text)] inline-flex items-center shadow-none select-none tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  )
}
