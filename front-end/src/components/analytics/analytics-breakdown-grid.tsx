'use client';

import { useState } from 'react';
import { 
  Compass, 
  Globe, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Chrome, 
  Globe2 
} from 'lucide-react';
import { HorizontalBar } from '@/components/ui/horizontal-bar';
import { AnalyticsBreakdown, BreakdownItem } from '@/lib/api';
import { countryCodeToName } from '@/lib/utils';

interface AnalyticsBreakdownGridProps {
  breakdown: AnalyticsBreakdown;
  isLoading?: boolean;
}

export function AnalyticsBreakdownGrid({ breakdown, isLoading }: AnalyticsBreakdownGridProps) {
  const [deviceTab, setDeviceTab] = useState<'devices' | 'browsers'>('devices');

  const getDeviceIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getCountryLabel = (code: string) => {
    if (code === 'Unknown') return 'Unknown Geolocation';
    return countryCodeToName(code) || code;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-md border border-[#27282b] bg-[#141517] p-4 animate-pulse space-y-3"
          >
            <div className="h-4 w-24 bg-[#1c1d20] rounded" />
            <div className="space-y-2">
              <div className="h-10 bg-[#1c1d20] rounded" />
              <div className="h-10 bg-[#1c1d20] rounded" />
              <div className="h-10 bg-[#1c1d20] rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const referrers = breakdown.referrers || [];
  const countries = breakdown.countries || [];
  const devices = breakdown.devices || [];
  const browsers = breakdown.browsers || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      {/* 1. Top Referrers */}
      <div className="rounded-md border border-[#27282b] bg-[#141517] p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#27282b]">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-[#56c2ff]" />
              <h4 className="text-xs font-mono font-semibold text-[#ededed]">Top Referrers</h4>
            </div>
            <span className="text-[11px] font-mono text-[#8c8d91]">
              {referrers.length} sources
            </span>
          </div>

          {referrers.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8c8d91] font-mono">
              No referral traffic recorded
            </div>
          ) : (
            <div className="space-y-2">
              {referrers.slice(0, 6).map((item) => (
                <HorizontalBar
                  key={item.name}
                  item={{
                    label: item.name,
                    value: item.count,
                    percentage: item.percentage,
                    icon: <Compass className="h-3.5 w-3.5" />,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Top Countries */}
      <div className="rounded-md border border-[#27282b] bg-[#141517] p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#27282b]">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#f59e0b]" />
              <h4 className="text-xs font-mono font-semibold text-[#ededed]">Top Countries</h4>
            </div>
            <span className="text-[11px] font-mono text-[#8c8d91]">
              {countries.length} locations
            </span>
          </div>

          {countries.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8c8d91] font-mono">
              No geographic clicks recorded
            </div>
          ) : (
            <div className="space-y-2">
              {countries.slice(0, 6).map((item) => (
                <HorizontalBar
                  key={item.name}
                  item={{
                    label: getCountryLabel(item.name),
                    value: item.count,
                    percentage: item.percentage,
                    sublabel: item.name !== 'Unknown' ? item.name : undefined,
                    icon: <Globe2 className="h-3.5 w-3.5" />,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Devices & Browsers (Switchable tabs) */}
      <div className="rounded-md border border-[#27282b] bg-[#141517] p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#27282b]">
            <div className="flex items-center gap-1.5 bg-[#1c1d20] border border-[#27282b] rounded p-0.5">
              <button
                type="button"
                onClick={() => setDeviceTab('devices')}
                className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                  deviceTab === 'devices'
                    ? 'bg-[#141517] text-[#ededed] font-semibold'
                    : 'text-[#8c8d91] hover:text-[#ededed]'
                }`}
              >
                Devices
              </button>
              <button
                type="button"
                onClick={() => setDeviceTab('browsers')}
                className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                  deviceTab === 'browsers'
                    ? 'bg-[#141517] text-[#ededed] font-semibold'
                    : 'text-[#8c8d91] hover:text-[#ededed]'
                }`}
              >
                Browsers
              </button>
            </div>

            <span className="text-[11px] font-mono text-[#8c8d91]">
              {deviceTab === 'devices' ? `${devices.length} types` : `${browsers.length} clients`}
            </span>
          </div>

          {deviceTab === 'devices' ? (
            devices.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8c8d91] font-mono">
                No device telemetry recorded
              </div>
            ) : (
              <div className="space-y-2">
                {devices.slice(0, 6).map((item) => (
                  <HorizontalBar
                    key={item.name}
                    item={{
                      label: item.name,
                      value: item.count,
                      percentage: item.percentage,
                      icon: getDeviceIcon(item.name),
                    }}
                  />
                ))}
              </div>
            )
          ) : browsers.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8c8d91] font-mono">
              No browser telemetry recorded
            </div>
          ) : (
            <div className="space-y-2">
              {browsers.slice(0, 6).map((item) => (
                <HorizontalBar
                  key={item.name}
                  item={{
                    label: item.name,
                    value: item.count,
                    percentage: item.percentage,
                    icon: <Chrome className="h-3.5 w-3.5" />,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
