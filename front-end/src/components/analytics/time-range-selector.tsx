'use client';

import { Kbd } from '@/components/ui/kbd';

export type TimeRangeValue = '7' | '30' | '90' | '365';

interface TimeRangeSelectorProps {
  value: TimeRangeValue;
  onChange: (val: TimeRangeValue) => void;
  disabled?: boolean;
}

const RANGES: { label: string; value: TimeRangeValue; shortcut: string }[] = [
  { label: '7 Days', value: '7', shortcut: '7d' },
  { label: '30 Days', value: '30', shortcut: '30d' },
  { label: '90 Days', value: '90', shortcut: '90d' },
  { label: 'All Time', value: '365', shortcut: 'All' },
];

export function TimeRangeSelector({ value, onChange, disabled = false }: TimeRangeSelectorProps) {
  return (
    <div className="inline-flex items-center rounded-md border border-[#27282b] bg-[#141517] p-1 gap-1">
      {RANGES.map((range) => {
        const active = value === range.value;
        return (
          <button
            key={range.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(range.value)}
            className={`min-h-[36px] sm:min-h-[32px] px-2.5 py-1 text-xs font-mono rounded transition-colors flex items-center gap-1.5 focus:outline-none ${
              active
                ? 'bg-[#1c1d20] text-[#ededed] border border-[#27282b]'
                : 'text-[#8c8d91] hover:text-[#ededed] hover:bg-[#1c1d20]/50 border border-transparent'
            }`}
          >
            <span>{range.label}</span>
            <Kbd
              className={`text-[9px] px-1 py-0.2 ${
                active
                  ? 'bg-black/30 border-[#27282b] text-[#ededed]'
                  : 'bg-transparent border-transparent text-[#8c8d91]'
              }`}
            >
              {range.shortcut}
            </Kbd>
          </button>
        );
      })}
    </div>
  );
}
