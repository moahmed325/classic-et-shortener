'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, 
  ArrowLeft, 
  Printer, 
  ExternalLink,
  ShieldCheck,
  Receipt as ReceiptIcon,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Kbd } from '@/components/ui/kbd';
import { subscriptionApi } from '@/lib/api';

interface TransactionData {
  plan: string;
  amount: number;
  reference: string;
  status: string;
  currency?: string;
}

export default function ReceiptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const txRef = searchParams.get('tx_ref');

  useEffect(() => {
    if (!txRef) {
      setError('No transaction reference found');
      setLoading(false);
      return;
    }

    verifyTransaction(txRef);
  }, [txRef]);

  const verifyTransaction = async (reference: string) => {
    try {
      const verify = await subscriptionApi.verifyTransaction(reference);

      // Poll for ref_id saved by callback_url
      const start = Date.now();
      let refId: string | null = null;
      let status: string | null = null;
      while (Date.now() - start < 15000) {
        const res = await subscriptionApi.getRefByTxRef(reference);
        refId = res.refId;
        status = res.status;
        if (refId) break;
        await new Promise((r) => setTimeout(r, 1500));
      }

      setTransactionData({
        plan: 'Premium Subscription',
        amount: Number((verify as any)?.amount ?? 0),
        reference: refId || reference,
        status: ((status as any) || verify?.status || 'success').toString().toUpperCase(),
        currency: (verify as any)?.currency || 'ETB',
      });
    } catch (err) {
      setError('Failed to verify transaction status');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-[#ff6363]" />
        <p className="text-xs font-mono text-text-muted">
          Verifying payment transaction status with Chapa...
        </p>
      </div>
    );
  }

  if (error || !transactionData) {
    return (
      <div className="max-w-md mx-auto my-12 rounded-md border border-[#ff6363]/40 bg-surface-1 p-6 text-center space-y-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff6363]/10 text-[#ff6363] mx-auto">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-text-primary">Payment Incomplete</h2>
          <p className="text-xs text-text-muted font-mono mt-1">
            {error || 'Could not verify transaction with the payment gateway.'}
          </p>
        </div>
        <Link href="/dashboard/subscription">
          <Button className="min-h-[44px] bg-[#ff6363] hover:bg-[#ff4d4d] text-white text-xs font-mono w-full">
            Return to Subscriptions
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 my-6">
      {/* Minimalist Transaction Slip */}
      <div className="rounded-md border border-border-subtle bg-surface-1 p-6 sm:p-8 space-y-6">
        {/* Slip Header */}
        <div className="flex items-start justify-between border-b border-border-subtle pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-text-primary">
                classic.et
              </span>
              <Badge className="bg-[#5fc992]/10 border border-[#5fc992]/30 text-[#5fc992] text-[10px] font-mono uppercase">
                Paid
              </Badge>
            </div>
            <p className="text-xs text-text-muted font-mono mt-0.5">
              Official Electronic Receipt
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-text-muted block">
              {new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="text-[10px] font-mono text-text-muted block">
              {new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Transaction Details Table */}
        <div className="space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between py-1 border-b border-border-subtle">
            <span className="text-text-muted">Transaction Ref</span>
            <span className="text-text-primary select-all font-semibold">
              {transactionData.reference}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-border-subtle">
            <span className="text-text-muted">Plan Subscription</span>
            <span className="text-text-primary">
              {transactionData.plan}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-border-subtle">
            <span className="text-text-muted">Payment Gateway</span>
            <span className="text-text-primary">
              Chapa (Telebirr / CBE)
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-border-subtle">
            <span className="text-text-muted">Status</span>
            <span className="text-[#5fc992] font-semibold">
              {transactionData.status}
            </span>
          </div>

          {/* Amount Row */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-bold text-text-primary">Total Paid</span>
            <span className="text-base sm:text-lg font-bold text-text-primary tabular-nums">
              {transactionData.amount} {transactionData.currency}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border-subtle">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex-1 min-h-[44px] border-border-subtle bg-surface-2 hover:bg-surface-2/80 text-text-primary text-xs font-mono"
          >
            <Printer className="mr-1.5 h-3.5 w-3.5 text-text-muted" />
            Print Receipt
          </Button>

          <Link href="/dashboard" className="flex-1">
            <Button
              className="w-full min-h-[44px] bg-[#ff6363] hover:bg-[#ff4d4d] text-white text-xs font-mono font-medium"
            >
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
