'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, ArrowUpRight, X } from 'lucide-react';
import { subscriptionApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface UsageWarningProps {
  onClose?: () => void;
}

export function UsageWarning({ onClose }: UsageWarningProps) {
  const [usageData, setUsageData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      const data = await subscriptionApi.getUsage();
      setUsageData(data);
    } catch (error) {
      console.error('Failed to fetch usage data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (isLoading || !isVisible || !usageData) {
    return null;
  }

  // Check if any usage is above 80%
  const isNearLimit = 
    usageData.limits.links.percentage >= 80 ||
    usageData.limits.visitors.percentage >= 80;

  // Check if any usage is at 100%
  const isAtLimit = 
    usageData.limits.links.percentage >= 100 ||
    usageData.limits.visitors.percentage >= 100;

  // Don't show warning for Premium users
  if (usageData?.plan?.tier === 'premium') {
    return null;
  }

  if (!isNearLimit && !isAtLimit) {
    return null;
  }

  const getWarningColor = () => {
    if (isAtLimit) return 'border-[#ff6363]/40 bg-[#141517] text-[#ededed]';
    return 'border-[#f59e0b]/40 bg-[#141517] text-[#ededed]';
  };

  const getWarningIcon = () => {
    if (isAtLimit) return 'text-[#ff6363]';
    return 'text-[#f59e0b]';
  };

  const getWarningTitle = () => {
    if (isAtLimit) return 'Usage Limit Reached';
    return 'Approaching Usage Limit';
  };

  const getWarningMessage = () => {
    if (isAtLimit) {
      return 'You have reached your monthly limit. Upgrade your plan to continue creating links and tracking visitors.';
    }
    return 'You are approaching your monthly usage limit. Consider upgrading your plan.';
  };

  return (
    <Card className={`border ${getWarningColor()}`}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2 sm:gap-3 flex-1">
            <AlertTriangle className={`h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0 ${getWarningIcon()}`} />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-xs sm:text-sm text-[#ededed] font-sans">
                {getWarningTitle()}
              </h4>
              <p className="text-xs text-[#8c8d91] mt-1 font-sans">
                {getWarningMessage()}
              </p>
              
              <div className="mt-2 sm:mt-3 space-y-2">
                {usageData.limits.links.percentage >= 80 && (
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#8c8d91] mb-1">
                      <span>Links Created</span>
                      <span className="text-right text-[#ededed] tabular-nums">{usageData.limits.links.current} / {usageData.limits.links.limit === -1 ? 'Unlimited' : usageData.limits.links.limit}</span>
                    </div>
                    <Progress 
                      value={usageData.limits.links.percentage} 
                      className="h-1.5 bg-[#1c1d20]" 
                    />
                  </div>
                )}
                
                {usageData.limits.visitors.percentage >= 80 && (
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#8c8d91] mb-1">
                      <span>Visitors Tracked</span>
                      <span className="text-right text-[#ededed] tabular-nums">{usageData.limits.visitors.current} / {usageData.limits.visitors.limit === null ? 'Unlimited' : usageData.limits.visitors.limit}</span>
                    </div>
                    <Progress 
                      value={usageData.limits.visitors.percentage} 
                      className="h-1.5 bg-[#1c1d20]" 
                    />
                  </div>
                )}
              </div>
              
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2">
                <Link href="/dashboard/subscription" className="w-full sm:w-auto">
                  <Button 
                    size="sm" 
                    className="w-full sm:w-auto min-h-[44px] text-xs font-mono bg-[#ff6363] hover:bg-[#ff4d4d] text-white"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5 mr-1.5" />
                    Upgrade Plan
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClose}
                  className="min-h-[44px] border-[#27282b] bg-[#1c1d20] hover:bg-[#25262a] text-[#8c8d91] hover:text-[#ededed] text-xs font-mono"
                >
                  <X className="h-3.5 w-3.5 mr-1.5" />
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


