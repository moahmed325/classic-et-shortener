"use client"

import { useState, useEffect } from "react"
import { adminApi } from "@/lib/admin-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  MoreHorizontal,
  Plus,
  Edit,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
} from "lucide-react"

interface Subscription {
  id: string
  user_id: string
  user_name: string
  user_email: string
  plan_id: string
  plan_name: string
  tier: "free" | "pro" | "premium"
  status: "active" | "canceled" | "past_due" | "unpaid"
  billing_cycle: "monthly" | "yearly"
  amount: number
  currency: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

interface SubscriptionPlan {
  id: string
  name: string
  tier: "free" | "pro" | "premium"
  priceMonthly: number
  priceYearly: number
  features: string[]
  limits: {
    links_per_month: number
    api_requests_per_month: number
    custom_domains: number
    analytics_retention_days: number
    team_members: number
  }
  isPopular?: boolean
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [tierFilter, setTierFilter] = useState<string>("all")
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [isEditPlanDialogOpen, setIsEditPlanDialogOpen] = useState(false)
  const [isCreatePlanDialogOpen, setIsCreatePlanDialogOpen] = useState(false)

  // Plan creation form state
  const [newPlan, setNewPlan] = useState({
    name: "",
    tier: "pro" as "free" | "pro" | "premium",
    priceMonthly: 500,
    priceYearly: 5000,
    features: "Custom domains\nPriority support\nExtended analytics",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [subsRes, plansRes] = await Promise.all([
        adminApi.getSubscriptions(),
        adminApi.getSubscriptionPlans(),
      ])
      setSubscriptions((subsRes.subscriptions as any) || [])
      setPlans((plansRes.plans as any) || [])
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      !searchTerm ||
      sub.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.plan_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter
    const matchesTier = tierFilter === "all" || sub.tier === tierFilter
    return matchesSearch && matchesStatus && matchesTier
  })

  const handleCreatePlan = async () => {
    try {
      await adminApi.createSubscriptionPlan({
        name: newPlan.name,
        tier: newPlan.tier,
        priceMonthly: Number(newPlan.priceMonthly),
        priceYearly: Number(newPlan.priceYearly),
        features: newPlan.features.split("\n").filter((f) => f.trim()),
        limits: {
          links_per_month: newPlan.tier === "premium" ? -1 : 500,
          api_requests_per_month: 10000,
          custom_domains: newPlan.tier === "premium" ? 5 : 1,
          analytics_retention_days: 90,
          team_members: 1,
        },
        visitorCap: null,
        hasFullAnalytics: true,
        hasAdvancedCharts: true,
        hasPdfDownload: true,
      })
      setIsCreatePlanDialogOpen(false)
      fetchData()
    } catch (err) {
      console.error("Failed to create plan:", err)
      alert("Failed to create plan.")
    }
  }

  const handleUpdatePlan = async () => {
    if (!selectedPlan) return
    try {
      await adminApi.updateSubscriptionPlan(selectedPlan.id, {
        name: selectedPlan.name,
        tier: selectedPlan.tier,
        priceMonthly: selectedPlan.priceMonthly,
        priceYearly: selectedPlan.priceYearly,
        features: selectedPlan.features,
        limits: selectedPlan.limits,
      })
      setIsEditPlanDialogOpen(false)
      setSelectedPlan(null)
      fetchData()
    } catch (err) {
      console.error("Failed to update plan:", err)
      alert("Failed to update plan.")
    }
  }

  const handleDeletePlan = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscription plan?")) return
    try {
      await adminApi.deleteSubscriptionPlan(id)
      fetchData()
    } catch (err) {
      console.error("Failed to delete plan:", err)
      alert("Failed to delete plan.")
    }
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "premium":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">
            Premium
          </span>
        )
      case "pro":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-[#56c2ff]/10 text-[#56c2ff] border border-[#56c2ff]/20">
            Pro
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-[#1c1d20] text-[#8c8d91] border border-[#27282b]">
            Free
          </span>
        )
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-[#5fc992]/10 text-[#5fc992] border border-[#5fc992]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5fc992]" />
            Active
          </span>
        )
      case "canceled":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-[#ff6363]/10 text-[#ff6363] border border-[#ff6363]/20">
            Canceled
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-[#1c1d20] text-[#8c8d91] border border-[#27282b]">
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
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#ededed]">Subscriptions & Plans</h1>
          <p className="text-xs sm:text-sm text-[#8c8d91] mt-0.5">Manage recurring memberships, tier pricing, and customer billing states.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchData}
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
          <div className="text-xs font-mono text-[#8c8d91]">Active Subscriptions</div>
          <div className="text-xl sm:text-2xl font-semibold font-mono tabular-nums text-[#ededed] mt-1">
            {subscriptions.filter((s) => s.status === "active").length}
          </div>
        </div>
        <div className="bg-[#141517] border border-[#27282b] rounded-lg p-3.5">
          <div className="text-xs font-mono text-[#8c8d91]">Pro Members</div>
          <div className="text-xl sm:text-2xl font-semibold font-mono tabular-nums text-[#56c2ff] mt-1">
            {subscriptions.filter((s) => s.tier === "pro" && s.status === "active").length}
          </div>
        </div>
        <div className="bg-[#141517] border border-[#27282b] rounded-lg p-3.5">
          <div className="text-xs font-mono text-[#8c8d91]">Premium Members</div>
          <div className="text-xl sm:text-2xl font-semibold font-mono tabular-nums text-[#f59e0b] mt-1">
            {subscriptions.filter((s) => s.tier === "premium" && s.status === "active").length}
          </div>
        </div>
        <div className="bg-[#141517] border border-[#27282b] rounded-lg p-3.5">
          <div className="text-xs font-mono text-[#8c8d91]">Configured Plans</div>
          <div className="text-xl sm:text-2xl font-semibold font-mono tabular-nums text-[#5fc992] mt-1">
            {plans.length}
          </div>
        </div>
      </div>

      <Tabs defaultValue="subscriptions" className="space-y-4">
        <div className="border-b border-[#27282b]">
          <TabsList className="bg-transparent p-0 gap-4 h-11">
            <TabsTrigger
              value="subscriptions"
              className="bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-[#ff6363] data-[state=active]:bg-transparent text-xs font-mono uppercase text-[#8c8d91] data-[state=active]:text-[#ededed] px-2 py-2 min-h-[44px]"
            >
              Active Members ({filteredSubscriptions.length})
            </TabsTrigger>
            <TabsTrigger
              value="plans"
              className="bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-[#ff6363] data-[state=active]:bg-transparent text-xs font-mono uppercase text-[#8c8d91] data-[state=active]:text-[#ededed] px-2 py-2 min-h-[44px]"
            >
              Tiers & Pricing Models ({plans.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Subscriptions Table */}
        <TabsContent value="subscriptions" className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-[#141517] border border-[#27282b] rounded-lg p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8d91]" />
              <Input
                placeholder="Search by customer name, email, or plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-[#1c1d20] border-[#27282b] text-base sm:text-sm text-[#ededed] focus:border-[#56c2ff] min-h-[44px]"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-[#1c1d20] p-1 rounded-md border border-[#27282b]">
                {(["all", "pro", "premium"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTierFilter(t)}
                    className={`px-2.5 py-1 text-xs font-mono uppercase rounded transition-colors min-h-[32px] ${
                      tierFilter === t
                        ? "bg-[#27282b] text-[#ededed] font-medium"
                        : "text-[#8c8d91] hover:text-[#ededed]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 bg-[#1c1d20] p-1 rounded-md border border-[#27282b]">
                {(["all", "active", "canceled"] as const).map((st) => (
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
          </div>

          {/* Table Container */}
          <div className="bg-[#141517] border border-[#27282b] rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-[#27282b] flex items-center justify-between text-xs font-mono text-[#8c8d91]">
              <span>Displaying {filteredSubscriptions.length} subscriptions</span>
              <span>Sticky Column: Member</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-[#27282b] bg-[#0c0d0e] text-[11px] font-mono uppercase text-[#8c8d91]">
                    <th className="sticky left-0 bg-[#0c0d0e] z-10 px-4 py-3 font-medium min-w-[200px]">
                      Member
                    </th>
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">Tier</th>
                    <th className="px-4 py-3 font-medium">Cycle</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Renewal</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27282b]">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-xs font-mono text-[#8c8d91]">
                        <RefreshCw className="w-4 h-4 mx-auto mb-2 animate-spin text-[#56c2ff]" />
                        Loading membership data...
                      </td>
                    </tr>
                  ) : filteredSubscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-xs font-mono text-[#8c8d91]">
                        No active subscriptions found matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredSubscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#1c1d20]/50 transition-colors">
                        {/* Sticky Left Column: Member */}
                        <td className="sticky left-0 bg-[#141517] z-10 px-4 py-3.5 whitespace-nowrap">
                          <div className="min-w-0 max-w-[220px]">
                            <div className="text-xs font-medium text-[#ededed] truncate">{sub.user_name || "User"}</div>
                            <div className="text-[11px] font-mono text-[#8c8d91] truncate">{sub.user_email}</div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap text-xs text-[#ededed] font-medium">
                          {sub.plan_name}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {getTierBadge(sub.tier)}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap text-xs font-mono text-[#8c8d91] uppercase">
                          {sub.billing_cycle || "monthly"}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {getStatusBadge(sub.status)}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap text-xs font-mono text-[#8c8d91]">
                          {sub.current_period_end
                            ? new Date(sub.current_period_end).toLocaleDateString()
                            : "Ongoing"}
                        </td>

                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-2 rounded-md hover:bg-[#1c1d20] text-[#8c8d91] hover:text-[#ededed] transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#141517] border-[#27282b] text-[#ededed]">
                              <DropdownMenuLabel className="text-xs text-[#8c8d91]">Options</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => alert(`Subscription ID: ${sub.id}`)}
                                className="text-xs min-h-[40px] cursor-pointer hover:bg-[#1c1d20]"
                              >
                                View ID
                              </DropdownMenuItem>
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

        {/* Tab 2: Pricing Plans */}
        <TabsContent value="plans" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-[#8c8d91]">Configure pricing tiers and features advertised across the dashboard.</p>
            <Dialog open={isCreatePlanDialogOpen} onOpenChange={setIsCreatePlanDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#ff6363] hover:bg-[#ff6363]/90 text-white text-xs font-medium min-h-[44px] px-3.5">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#141517] border-[#27282b] text-[#ededed] max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-base font-semibold">Create Subscription Plan</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-[#8c8d91]">Plan Name</Label>
                    <Input
                      value={newPlan.name}
                      onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                      placeholder="e.g., Pro Plan"
                      className="bg-[#1c1d20] border-[#27282b] text-base sm:text-sm text-[#ededed] min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-[#8c8d91]">Tier Category</Label>
                    <Select value={newPlan.tier} onValueChange={(val: any) => setNewPlan({ ...newPlan, tier: val })}>
                      <SelectTrigger className="bg-[#1c1d20] border-[#27282b] text-[#ededed] min-h-[44px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141517] border-[#27282b] text-[#ededed]">
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-[#8c8d91]">Monthly Price (ETB)</Label>
                      <Input
                        type="number"
                        value={newPlan.priceMonthly}
                        onChange={(e) => setNewPlan({ ...newPlan, priceMonthly: Number(e.target.value) })}
                        className="bg-[#1c1d20] border-[#27282b] text-base sm:text-sm font-mono text-[#ededed] min-h-[44px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-[#8c8d91]">Yearly Price (ETB)</Label>
                      <Input
                        type="number"
                        value={newPlan.priceYearly}
                        onChange={(e) => setNewPlan({ ...newPlan, priceYearly: Number(e.target.value) })}
                        className="bg-[#1c1d20] border-[#27282b] text-base sm:text-sm font-mono text-[#ededed] min-h-[44px]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-[#8c8d91]">Features (one per line)</Label>
                    <Textarea
                      value={newPlan.features}
                      onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value })}
                      className="bg-[#1c1d20] border-[#27282b] text-xs font-mono text-[#ededed] min-h-[80px]"
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setIsCreatePlanDialogOpen(false)} className="bg-[#1c1d20] border-[#27282b] text-[#ededed] min-h-[44px]">
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePlan} className="bg-[#ff6363] hover:bg-[#ff6363]/90 text-white min-h-[44px]">
                    Create Plan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-[#141517] border border-[#27282b] rounded-lg p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-[#ededed]">{plan.name}</h3>
                    {getTierBadge(plan.tier)}
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-bold font-mono tabular-nums text-[#ededed]">
                      {plan.priceMonthly === 0 ? "Free" : `${plan.priceMonthly.toLocaleString()} ETB`}
                    </div>
                    <div className="text-xs font-mono text-[#8c8d91] mt-0.5">
                      {plan.priceYearly === 0 ? "Forever free" : `${plan.priceYearly.toLocaleString()} ETB / yr`}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#27282b] space-y-1.5">
                    <div className="text-[11px] font-mono text-[#8c8d91] uppercase">Included Features:</div>
                    {plan.features?.map((feat, idx) => (
                      <div key={idx} className="text-xs text-[#ededed] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5fc992]" />
                        {feat}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-5 pt-3 border-t border-[#27282b] flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPlan(plan)
                      setIsEditPlanDialogOpen(true)
                    }}
                    className="bg-[#1c1d20] border-[#27282b] text-[#ededed] hover:bg-[#27282b] text-xs min-h-[38px]"
                  >
                    <Edit className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePlan(plan.id)}
                    className="text-[#ff6363] hover:bg-[#ff6363]/10 text-xs min-h-[38px]"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Plan Dialog */}
      {selectedPlan && (
        <Dialog open={isEditPlanDialogOpen} onOpenChange={setIsEditPlanDialogOpen}>
          <DialogContent className="bg-[#141517] border-[#27282b] text-[#ededed] max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">Edit Plan: {selectedPlan.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <Label className="text-xs text-[#8c8d91]">Plan Name</Label>
                <Input
                  value={selectedPlan.name}
                  onChange={(e) => setSelectedPlan({ ...selectedPlan, name: e.target.value })}
                  className="bg-[#1c1d20] border-[#27282b] text-base sm:text-sm text-[#ededed] min-h-[44px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-[#8c8d91]">Monthly Price (ETB)</Label>
                  <Input
                    type="number"
                    value={selectedPlan.priceMonthly}
                    onChange={(e) => setSelectedPlan({ ...selectedPlan, priceMonthly: Number(e.target.value) })}
                    className="bg-[#1c1d20] border-[#27282b] text-base sm:text-sm font-mono text-[#ededed] min-h-[44px]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-[#8c8d91]">Yearly Price (ETB)</Label>
                  <Input
                    type="number"
                    value={selectedPlan.priceYearly}
                    onChange={(e) => setSelectedPlan({ ...selectedPlan, priceYearly: Number(e.target.value) })}
                    className="bg-[#1c1d20] border-[#27282b] text-base sm:text-sm font-mono text-[#ededed] min-h-[44px]"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsEditPlanDialogOpen(false)} className="bg-[#1c1d20] border-[#27282b] text-[#ededed] min-h-[44px]">
                Cancel
              </Button>
              <Button onClick={handleUpdatePlan} className="bg-[#56c2ff] hover:bg-[#56c2ff]/90 text-black font-medium min-h-[44px]">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
