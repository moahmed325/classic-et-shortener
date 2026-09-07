'use client';

import { useState, useEffect } from 'react';
import { 
  Check, 
  ArrowUpRight, 
  CreditCard, 
  Loader2, 
  Sparkles, 
  ShieldCheck,
  Phone,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Kbd } from '@/components/ui/kbd';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { subscriptionApi } from '@/lib/api';

interface Plan {
  id: string;
  name: string;
  tier: 'free' | 'pro' | 'premium';
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  limits: {
    links_per_month: number;
    analytics_retention_days: number;
    team_members: number;
  };
}

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();

    // Check URL parameters for Chapa redirect returns
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const status = urlParams.get('status');
    const txRef = urlParams.get('tx_ref') || urlParams.get('txRef');

    if ((success === 'true' || status === 'success') && txRef) {
      verifyTransaction(txRef);
    }
  }, []);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const res = await subscriptionApi.getPlans();
      setPlans(res.plans);
    } catch (error: any) {
      toast({
        title: 'Error loading plans',
        description: error.message || 'Could not fetch subscription plans',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyTransaction = async (txRef: string) => {
    try {
      const result = await subscriptionApi.verifyTransaction(txRef);
      if (result.status === 'success') {
        toast({
          title: 'Subscription Activated',
          description: 'Your account has been upgraded successfully.',
        });
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch {
      // Verification handled on receipt page
    }
  };

  const handleUpgradeClick = (plan: Plan) => {
    if (plan.tier === user?.tier) return;
    setSelectedPlan(plan);
    setShowPhoneModal(true);
  };

  const handleProceedCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    const trimmedPhone = phoneNumber.trim();
    if (!trimmedPhone) {
      toast({
        title: 'Phone number required',
        description: 'Please enter your Ethiopian phone number (e.g., 0912345678).',
        variant: 'destructive',
      });
      return;
    }

    setIsUpgrading(true);
    try {
      const res = await subscriptionApi.initializePayment({
        planId: selectedPlan.id,
        billingCycle,
        phoneNumber: trimmedPhone,
      });

      const checkoutUrl = res.url || (res as any).checkoutUrl;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast({
          title: 'Checkout initialization failed',
          description: 'Could not generate payment gateway URL.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Upgrade error',
        description: error.message || 'Failed to initialize Chapa payment.',
        variant: 'destructive',
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const currentTier = user?.tier || 'free';

  // Fallback plans if API is booting
  const defaultPlans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      tier: 'free',
      priceMonthly: 0,
      priceYearly: 0,
      features: ['50 links/month', '7-day analytics retention', 'Standard redirect velocity', 'Basic QR codes'],
      limits: { links_per_month: 50, analytics_retention_days: 7, team_members: 1 },
    },
    {
      id: 'pro',
      name: 'Pro',
      tier: 'pro',
      priceMonthly: 199,
      priceYearly: 1990,
      features: ['1,000 links/month', '90-day analytics retention', 'Custom link slugs', 'Link expiration scheduling', 'Priority routing'],
      limits: { links_per_month: 1000, analytics_retention_days: 90, team_members: 3 },
    },
    {
      id: 'premium',
      name: 'Premium',
      tier: 'premium',
      priceMonthly: 499,
      priceYearly: 4990,
      features: ['Unlimited short links', '365-day raw telemetry retention', 'Custom branded shortcodes', 'Hourly click breakdown', 'Dedicated API key quotas'],
      limits: { links_per_month: -1, analytics_retention_days: 365, team_members: 10 },
    },
  ];

  const displayPlans = plans.length > 0 ? plans : defaultPlans;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header & Cycle Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#ededed] font-sans">
            Subscription Plans
          </h1>
          <p className="text-xs sm:text-sm text-[#8c8d91] font-sans mt-0.5">
            Transparent, quota-based tiers for creators, developers, and growing teams.
          </p>
        </div>

        {/* Monthly / Yearly Switch */}
        <div className="inline-flex items-center rounded-md border border-[#27282b] bg-[#141517] p-1 gap-1">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`min-h-[34px] px-3 text-xs font-mono rounded transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-[#1c1d20] text-[#ededed] border border-[#27282b]'
                : 'text-[#8c8d91] hover:text-[#ededed]'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`min-h-[34px] px-3 text-xs font-mono rounded transition-colors flex items-center gap-1.5 ${
              billingCycle === 'yearly'
                ? 'bg-[#1c1d20] text-[#ededed] border border-[#27282b]'
                : 'text-[#8c8d91] hover:text-[#ededed]'
            }`}
          >
            <span>Annual</span>
            <span className="text-[10px] text-[#5fc992] bg-[#5fc992]/10 px-1 py-0.2 rounded border border-[#5fc992]/20">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {displayPlans.map((plan) => {
          const isCurrent = plan.tier === currentTier;
          const price = billingCycle === 'monthly' ? plan.priceMonthly : Math.round(plan.priceYearly / 12);
          const isPremium = plan.tier === 'premium';
          const isPro = plan.tier === 'pro';

          return (
            <div
              key={plan.id || plan.tier}
              className={`relative rounded-md border p-5 sm:p-6 flex flex-col justify-between transition-colors bg-[#141517] ${
                isCurrent
                  ? 'border-[#5fc992]/50'
                  : isPremium
                  ? 'border-[#ff6363]/40'
                  : 'border-[#27282b] hover:border-[#383a3f]'
              }`}
            >
              <div>
                {/* Header Row: Tier + Current Badge */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-[#ededed] font-sans">
                    {plan.name}
                  </h3>

                  {isCurrent ? (
                    <Kbd className="bg-[#1c1d20] border-[#5fc992]/40 text-[#5fc992] text-[10px] uppercase font-mono px-2 py-0.5">
                      Current Plan
                    </Kbd>
                  ) : isPremium ? (
                    <span className="text-[10px] font-mono text-[#ff6363] uppercase tracking-wider">
                      Popular
                    </span>
                  ) : null}
                </div>

                {/* Price Display */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-2xl sm:text-3xl font-bold text-[#ededed] tabular-nums">
                      {price === 0 ? 'Free' : `${price} ETB`}
                    </span>
                    {price > 0 && (
                      <span className="text-xs text-[#8c8d91]">/ month</span>
                    )}
                  </div>
                  {billingCycle === 'yearly' && price > 0 && (
                    <p className="text-[11px] font-mono text-[#8c8d91] mt-0.5">
                      Billed annually ({plan.priceYearly} ETB/yr)
                    </p>
                  )}
                </div>

                {/* Feature List */}
                <div className="space-y-2.5 pt-3 border-t border-[#27282b] mb-6">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <Check className="h-3.5 w-3.5 text-[#5fc992] flex-shrink-0 mt-0.5" />
                      <span className="text-[#8c8d91] font-sans">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div>
                {isCurrent ? (
                  <Button
                    disabled
                    variant="outline"
                    className="w-full min-h-[44px] border-[#27282b] bg-[#1c1d20] text-[#8c8d91] text-xs font-mono cursor-default"
                  >
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleUpgradeClick(plan)}
                    className={`w-full min-h-[44px] text-xs font-mono font-medium transition-transform active:scale-[0.99] ${
                      isPremium
                        ? 'bg-[#ff6363] hover:bg-[#ff4d4d] text-white'
                        : 'bg-[#ededed] hover:bg-white text-black'
                    }`}
                  >
                    <span>Upgrade to {plan.name}</span>
                    <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chapa Phone Checkout Modal */}
      <Dialog open={showPhoneModal} onOpenChange={setShowPhoneModal}>
        <DialogContent className="border border-[#27282b] bg-[#141517] text-[#ededed] max-w-sm p-6 overscroll-contain">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-[#ededed]">
              Complete with Chapa
            </DialogTitle>
            <DialogDescription className="text-xs text-[#8c8d91] font-mono">
              Upgrading to {selectedPlan?.name} ({billingCycle === 'monthly' ? selectedPlan?.priceMonthly : selectedPlan?.priceYearly} ETB)
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleProceedCheckout} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="chapa-phone" className="text-xs font-mono text-[#8c8d91] flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                <span>Mobile Number (Telebirr / CBE)</span>
              </Label>
              <Input
                id="chapa-phone"
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0912345678"
                className="min-h-[44px] bg-[#1c1d20] border-[#27282b] text-base sm:text-sm text-[#ededed] font-mono focus-visible:ring-1 focus-visible:ring-[#56c2ff]"
              />
              <p className="text-[11px] text-[#8c8d91]">
                Payment will be processed securely via Chapa Financial Technologies.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPhoneModal(false)}
                className="min-h-[44px] border-[#27282b] bg-[#141517] hover:bg-[#1c1d20] text-[#ededed] text-xs font-mono px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpgrading}
                className="min-h-[44px] bg-[#ff6363] hover:bg-[#ff4d4d] text-white text-xs font-mono px-5"
              >
                {isUpgrading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  'Proceed to Payment'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
