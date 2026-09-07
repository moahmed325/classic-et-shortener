import * as React from "react"
import { cn } from "@/lib/utils"

export interface HorizontalBarItem {
  id?: string
  label: string
  value: number
  percentage?: number
  icon?: React.ReactNode
  sublabel?: string
}

export interface HorizontalBarProps extends React.HTMLAttributes<HTMLDivElement> {
  item: HorizontalBarItem
  total?: number
  max?: number
  showPercentage?: boolean
  onClick?: () => void
}

export function HorizontalBar({
  item,
  total,
  max,
  showPercentage = true,
  className,
  onClick,
  ...props
}: HorizontalBarProps) {
  const percentage = item.percentage !== undefined
    ? item.percentage
    : max && max > 0
    ? Math.round((item.value / max) * 100)
    : total && total > 0
    ? Math.round((item.value / total) * 100)
    : 0

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-center rounded-md border border-[#27282b] bg-[#141517] p-2.5 transition-colors hover:bg-[#1c1d20] min-h-[44px]",
        onClick && "cursor-pointer active:scale-[0.99]",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {/* Background progress fill */}
      <div
        className="absolute inset-y-0 left-0 rounded-l-md bg-white/[0.04] transition-all duration-300 pointer-events-none"
        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
      />

      <div className="relative z-10 flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center space-x-2 min-w-0 pr-2">
          {item.icon && (
            <span className="flex-shrink-0 text-[#8c8d91] group-hover:text-[#ededed] transition-colors">
              {item.icon}
            </span>
          )}
          <span className="font-medium text-[#ededed] truncate">{item.label}</span>
          {item.sublabel && (
            <span className="text-xs text-[#8c8d91] truncate hidden sm:inline">
              {item.sublabel}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0 text-right font-mono">
          <span className="text-[#ededed] font-semibold tabular-nums">
            {item.value.toLocaleString()}
          </span>
          {showPercentage && (
            <span className="text-[11px] text-[#8c8d91] w-9 text-right tabular-nums">
              {percentage}%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
