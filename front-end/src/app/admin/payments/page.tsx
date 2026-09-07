"use client"

import { useEffect, useMemo, useState } from "react"
import { adminApi } from "@/lib/admin-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Download, MoreHorizontal, RefreshCw, Search, XCircle, CheckCircle, Clock, AlertTriangle, ShieldCheck } from "lucide-react"

interface Txn {
  id: string
  user_id: string
  user_name: string
  user_email: string
  plan_name: string
  tx_ref: string
  ref_id?: string
  amount: number
  currency: string
  billing_cycle: "monthly" | "yearly"
  status: "pending" | "success" | "failed" | "cancelled"
  created_at: string
  updated_at: string
}

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<Txn[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [verifyRef, setVerifyRef] = useState("")
  const [verifyResult, setVerifyResult] = useState<any | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [selectedTxn, setSelectedTxn] = useState<Txn | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await adminApi.getTransactions()
      setTransactions((res.transactions as any) || [])
    } catch (err) {
      console.error("Failed to fetch transactions:", err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesStatus = statusFilter === "all" || t.status === statusFilter
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        t.user_name?.toLowerCase().includes(q) ||
        t.user_email?.toLowerCase().includes(q) ||
        t.tx_ref?.toLowerCase().includes(q) ||
        t.plan_name?.toLowerCase().includes(q)
      return matchesStatus && matchesSearch
    })
  }, [transactions, statusFilter, search])

  const exportCsv = () => {
    const header = ["tx_ref", "user_name", "user_email", "plan_name", "amount", "currency", "status", "date"]
    const rows = filtered.map((t) => [
      t.tx_ref,
      t.user_name,
      t.user_email,
      t.plan_name,
      String(t.amount),
      t.currency,
      t.status,
      t.created_at,
    ])
    const csv = [header, ...rows].map((r) => r.map((v) => `"${(v || "").toString().replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `classic-et-transactions-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const refund = async (id: string) => {
    if (!confirm("Are you sure you want to mark this transaction as refunded?")) return
    try {
      await adminApi.refundTransaction(id)
      await load()
    } catch (err) {
      console.error("Refund failed:", err)
      alert("Failed to refund transaction.")
    }
  }

  const handleVerify = async () => {
    if (!verifyRef.trim()) return
    setVerifying(true)
    setVerifyResult(null)
    try {
      const res = await adminApi.verifyTransaction(verifyRef.trim())
      setVerifyResult(res)
    } catch (err: any) {
      setVerifyResult({ error: err.message || "Failed to verify payment with Chapa" })
    } finally {
      setVerifying(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono uppercase bg-[#5fc992]/10 text-[#5fc992] border border-[#5fc992]/20">
            <CheckCircle className="w-3 h-3" />
            Success
          </span>
        )
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono uppercase bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        )
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono uppercase bg-[#ff6363]/10 text-[#ff6363] border border-[#ff6363]/20">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono uppercase bg-[#1c1d20] text-[#8c8d91] border border-[#27282b]">
            <AlertTriangle className="w-3 h-3" />
            {status}
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#27282b] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#ededed]">Payments & Ledger</h1>
          <p className="text-xs sm:text-sm text-[#8c8d91] mt-0.5">Chapa transaction logs, payment verifications, and settlement accounting.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={exportCsv}
            className="bg-[#141517] border-[#27282b] hover:bg-[#1c1d20] text-[#ededed] text-xs font-mono h-10 min-h-[44px] px-3"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={load}
            disabled={loading}
            className="bg-[#141517] border-[#27282b] hover:bg-[#1c1d20] text-[#ededed] text-xs font-mono h-10 min-h-[44px] min-w-[44px] px-3"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#141517] border border-[#27282b] rounded-lg p-3.5">
          <div className="text-xs font-mono text-[#8c8d91]">Total Transactions</div>
          <div className="text-xl sm:text-2xl font-semibold font-mono tabular-nums text-[#ededed] mt-1">
            {transactions.length}
          </div>
        </div>
        <div className="bg-[#141517] border border-[#27282b] rounded-lg p-3.5">
          <div className="text-xs font-mono text-[#8c8d91]">Successful Settlements</div>
          <div className="text-xl sm:text-2xl font-semibold font-mono tabular-nums text-[#5fc992] mt-1">
            {transactions.filter((t) => t.status === "success").length}
          </div>
        </div>
        <div className="bg-[#141517] border border-[#27282b] rounded-lg p-3.5">
          <div className="text-xs font-mono text-[#8c8d91]">Pending Confirmation</div>
          <div className="text-xl sm:text-2xl font-semibold font-mono tabular-nums text-[#f59e0b] mt-1">
            {transactions.filter((t) => t.status === "pending").length}
          </div>
        </div>
        <div className="bg-[#141517] border border-[#27282b] rounded-lg p-3.5">
          <div className="text-xs font-mono text-[#8c8d91]">Failed / Expired</div>
          <div className="text-xl sm:text-2xl font-semibold font-mono tabular-nums text-[#ff6363] mt-1">
            {transactions.filter((t) => t.status === "failed" || t.status === "cancelled").length}
          </div>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <div className="border-b border-[#27282b]">
          <TabsList className="bg-transparent p-0 gap-4 h-11">
            <TabsTrigger
              value="list"
              className="bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-[#ff6363] data-[state=active]:bg-transparent text-xs font-mono uppercase text-[#8c8d91] data-[state=active]:text-[#ededed] px-2 py-2 min-h-[44px]"
            >
              Transactions Ledger
            </TabsTrigger>
            <TabsTrigger
              value="verify"
              className="bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-[#ff6363] data-[state=active]:bg-transparent text-xs font-mono uppercase text-[#8c8d91] data-[state=active]:text-[#ededed] px-2 py-2 min-h-[44px]"
            >
              Verify Tx Ref
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Ledger */}
        <TabsContent value="list" className="space-y-4">
          {/* Search & Status Filters */}
          <div className="bg-[#141517] border border-[#27282b] rounded-lg p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8d91]" />
              <Input
                placeholder="Search by user, email, tx_ref, plan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-[#1c1d20] border-[#27282b] text-base sm:text-sm text-[#ededed] focus:border-[#56c2ff] min-h-[44px]"
              />
            </div>
            <div className="flex items-center gap-1 bg-[#1c1d20] p-1 rounded-md border border-[#27282b]">
              {(["all", "success", "pending", "failed", "cancelled"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 text-xs font-mono uppercase rounded transition-colors min-h-[32px] ${
                    statusFilter === st
                      ? "bg-[#27282b] text-[#ededed] font-medium"
                      : "text-[#8c8d91] hover:text-[#ededed]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-[#141517] border border-[#27282b] rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-[#27282b] flex items-center justify-between text-xs font-mono text-[#8c8d91]">
              <span>Showing {filtered.length} transactions</span>
              <span>Sticky Column: Reference (tx_ref)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[780px]">
                <thead>
                  <tr className="border-b border-[#27282b] bg-[#0c0d0e] text-[11px] font-mono uppercase text-[#8c8d91]">
                    <th className="sticky left-0 bg-[#0c0d0e] z-10 px-4 py-3 font-medium min-w-[200px]">
                      Tx Ref
                    </th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Tier / Plan</th>
                    <th className="px-4 py-3 font-medium text-right">Amount (ETB)</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27282b]">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-xs font-mono text-[#8c8d91]">
                        <RefreshCw className="w-4 h-4 mx-auto mb-2 animate-spin text-[#56c2ff]" />
                        Loading transaction ledger...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-xs font-mono text-[#8c8d91]">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t) => (
                      <tr key={t.id} className="hover:bg-[#1c1d20]/50 transition-colors">
                        {/* Sticky Column: tx_ref */}
                        <td className="sticky left-0 bg-[#141517] z-10 px-4 py-3.5 whitespace-nowrap">
                          <span className="font-mono text-xs text-[#ededed] bg-[#1c1d20] px-2 py-1 rounded border border-[#27282b]">
                            {t.tx_ref}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="text-xs text-[#ededed] font-medium">{t.user_name || "Anonymous"}</div>
                          <div className="text-[11px] font-mono text-[#8c8d91]">{t.user_email}</div>
                        </td>

                        {/* Plan */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-[#1c1d20] text-[#ededed] border border-[#27282b]">
                            {t.plan_name} ({t.billing_cycle || "monthly"})
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-right font-mono tabular-nums text-xs font-semibold text-[#ededed]">
                          {t.amount?.toLocaleString()} {t.currency || "ETB"}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {getStatusBadge(t.status)}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs font-mono text-[#8c8d91]">
                          {t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-2 rounded-md hover:bg-[#1c1d20] text-[#8c8d91] hover:text-[#ededed] transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#141517] border-[#27282b] text-[#ededed]">
                              <DropdownMenuLabel className="text-xs text-[#8c8d91]">Txn Options</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedTxn(t)
                                  setIsDetailOpen(true)
                                }}
                                className="text-xs min-h-[40px] cursor-pointer hover:bg-[#1c1d20]"
                              >
                                View Details
                              </DropdownMenuItem>
                              {t.status === "success" && (
                                <DropdownMenuItem
                                  onClick={() => refund(t.id)}
                                  className="text-xs text-[#ff6363] min-h-[40px] cursor-pointer hover:bg-[#1c1d20]"
                                >
                                  Mark Refunded
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Verify Tool */}
        <TabsContent value="verify">
          <div className="bg-[#141517] border border-[#27282b] rounded-lg p-5 max-w-xl space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-[#ededed]">Direct Chapa Gateway Verification</h2>
              <p className="text-xs text-[#8c8d91] mt-0.5">
                Query the Chapa API directly to verify the status and settlement of a transaction reference.
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="tx_ref (e.g., tx-classic-1718000000)"
                value={verifyRef}
                onChange={(e) => setVerifyRef(e.target.value)}
                className="bg-[#1c1d20] border-[#27282b] text-base sm:text-sm font-mono text-[#ededed] focus:border-[#56c2ff] min-h-[44px]"
              />
              <Button
                onClick={handleVerify}
                disabled={verifying || !verifyRef.trim()}
                className="bg-[#ff6363] hover:bg-[#ff6363]/90 text-white min-h-[44px] px-4 font-mono text-xs"
              >
                {verifying ? "Querying..." : "Verify"}
              </Button>
            </div>

            {verifyResult && (
              <div className="p-4 bg-[#0c0d0e] border border-[#27282b] rounded-md font-mono text-xs text-[#ededed] space-y-2 overflow-x-auto">
                <div className="text-[#8c8d91] text-[10px] uppercase tracking-wider">Gateway Response:</div>
                <pre>{JSON.stringify(verifyResult, null, 2)}</pre>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      {selectedTxn && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="bg-[#141517] border-[#27282b] text-[#ededed] max-w-md font-mono text-xs">
            <DialogHeader>
              <DialogTitle className="text-sm font-sans font-semibold">Transaction Details</DialogTitle>
              <DialogDescription className="text-xs text-[#8c8d91]">{selectedTxn.tx_ref}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2.5 py-3 border-t border-b border-[#27282b]">
              <div className="flex justify-between">
                <span className="text-[#8c8d91]">Customer:</span>
                <span className="text-[#ededed]">{selectedTxn.user_name} ({selectedTxn.user_email})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c8d91]">Plan:</span>
                <span className="text-[#ededed]">{selectedTxn.plan_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c8d91]">Amount:</span>
                <span className="text-[#ededed] font-semibold">{selectedTxn.amount} {selectedTxn.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c8d91]">Status:</span>
                <span>{selectedTxn.status.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c8d91]">Reference ID:</span>
                <span className="text-[#ededed]">{selectedTxn.ref_id || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c8d91]">Created:</span>
                <span className="text-[#ededed]">{new Date(selectedTxn.created_at).toLocaleString()}</span>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsDetailOpen(false)} className="bg-[#1c1d20] border-[#27282b] text-[#ededed] min-h-[44px] w-full">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
