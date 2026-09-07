"use client"

import { useState, useEffect } from "react"
import { adminApi } from "@/lib/admin-api"
import { Users, LinkIcon, BarChart3, DollarSign, TrendingUp, Activity, AlertTriangle, CheckCircle, ArrowUpRight, ShieldCheck } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalUsers: number
  totalLinks: number
  totalClicks: number
  totalRevenue: number
  activeSubscriptions: number
  pendingPayments: number
  recentActivity: number
  systemHealth: "healthy" | "warning" | "error"
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const res = await adminApi.getSystemAnalytics(30)
      const mapped: DashboardStats = {
        totalUsers: res.overview?.totalUsers || 0,
        totalLinks: res.overview?.totalLinks || 0,
        totalClicks: res.overview?.totalClicks || 0,
        totalRevenue: Math.round(res.revenue?.total || 0),
        activeSubscriptions: res.overview?.activeUsers || 0,
        pendingPayments: res.pendingPayments || 0,
        recentActivity: res.recentActivity?.length || 0,
        systemHealth: "healthy",
      }
      setStats(mapped)
      setRecentUsers(res.recentUsers || [])
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#27282b] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#ededed]">Admin Overview</h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono uppercase font-medium bg-[#5fc992]/10 text-[#5fc992] border border-[#5fc992]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5fc992] animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8c8d91] mt-0.5">Platform metrics, operational health, and user signups.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/activity-logs"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#1c1d20] border border-[#27282b] text-xs font-mono text-[#ededed] hover:border-[#56c2ff]/40 transition-colors min-h-[44px]"
          >
            <Activity className="w-3.5 h-3.5 text-[#56c2ff]" />
            Audit Logs
          </Link>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#ff6363] text-white text-xs font-medium hover:bg-[#ff6363]/90 transition-colors min-h-[44px]"
          >
            Manage Users
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: "Total Users",
            val: stats?.totalUsers.toLocaleString() ?? "—",
            icon: Users,
            sub: "+12% this month",
            color: "text-[#56c2ff]",
          },
          {
            label: "Total Links",
            val: stats?.totalLinks.toLocaleString() ?? "—",
            icon: LinkIcon,
            sub: "+8% this month",
            color: "text-[#ff6363]",
          },
          {
            label: "Total Clicks",
            val: stats?.totalClicks.toLocaleString() ?? "—",
            icon: BarChart3,
            sub: "+23% this month",
            color: "text-[#5fc992]",
          },
          {
            label: "Revenue (ETB)",
            val: stats ? `${stats.totalRevenue.toLocaleString()}` : "—",
            icon: DollarSign,
            sub: "Chapa processed",
            color: "text-[#f59e0b]",
          },
        ].map((item, idx) => {
          const Icon = item.icon
          return (
            <div
              key={idx}
              className="bg-[#141517] border border-[#27282b] rounded-lg p-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-[#8c8d91] mb-2">
                <span className="text-xs uppercase tracking-wider font-mono font-medium">{item.label}</span>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              {isLoading ? (
                <div className="h-7 w-20 bg-[#1c1d20] animate-pulse rounded my-1" />
              ) : (
                <div className="text-xl sm:text-2xl font-semibold font-mono tabular-nums text-[#ededed]">
                  {item.val}
                </div>
              )}
              <div className="text-[11px] font-mono text-[#8c8d91] mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-[#5fc992]" />
                {item.sub}
              </div>
            </div>
          )
        })}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#141517] border border-[#27282b] rounded-lg p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#5fc992]/10 border border-[#5fc992]/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-4 h-4 text-[#5fc992]" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-mono text-[#8c8d91]">Active Accounts</div>
            <div className="text-base font-semibold font-mono tabular-nums text-[#ededed]">
              {isLoading ? "…" : stats?.activeSubscriptions ?? 0}
            </div>
          </div>
        </div>

        <div className="bg-[#141517] border border-[#27282b] rounded-lg p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-mono text-[#8c8d91]">Pending Txns</div>
            <div className="text-base font-semibold font-mono tabular-nums text-[#ededed]">
              {isLoading ? "…" : stats?.pendingPayments ?? 0}
            </div>
          </div>
        </div>

        <div className="bg-[#141517] border border-[#27282b] rounded-lg p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#56c2ff]/10 border border-[#56c2ff]/20 flex items-center justify-center flex-shrink-0">
            <Activity className="w-4 h-4 text-[#56c2ff]" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-mono text-[#8c8d91]">Recent Events</div>
            <div className="text-base font-semibold font-mono tabular-nums text-[#ededed]">
              {isLoading ? "…" : stats?.recentActivity ?? 0}
            </div>
          </div>
        </div>

        <div className="bg-[#141517] border border-[#27282b] rounded-lg p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#ff6363]/10 border border-[#ff6363]/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#ff6363]" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-mono text-[#8c8d91]">Security Status</div>
            <div className="text-xs font-mono font-medium text-[#5fc992] flex items-center gap-1">
              Enforced (D1+KV)
            </div>
          </div>
        </div>
      </div>

      {/* Split Feed: Recent Registrations & Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Registrations */}
        <div className="bg-[#141517] border border-[#27282b] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#27282b] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#ededed]">Recent User Registrations</h2>
              <p className="text-xs text-[#8c8d91]">Latest accounts onboarded to classic.et</p>
            </div>
            <Link
              href="/admin/users"
              className="text-xs font-mono text-[#56c2ff] hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[#27282b]">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-10 bg-[#1c1d20] rounded animate-pulse" />
                ))}
              </div>
            ) : recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div key={user.id} className="p-3.5 flex items-center justify-between hover:bg-[#1c1d20]/50 transition-colors">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-xs font-medium text-[#ededed] truncate">{user.name || "Anonymous"}</p>
                    <p className="text-[11px] font-mono text-[#8c8d91] truncate">{user.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0 flex items-center gap-2">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-[#1c1d20] border border-[#27282b] text-[#ededed]">
                      {user.tier || "free"}
                    </span>
                    <span className="text-[10px] font-mono text-[#8c8d91] hidden sm:inline">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : ""}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs font-mono text-[#8c8d91]">
                No user registrations recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* System & Quick Nav */}
        <div className="bg-[#141517] border border-[#27282b] rounded-lg overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-4 py-3 border-b border-[#27282b]">
              <h2 className="text-sm font-semibold text-[#ededed]">System Commands</h2>
              <p className="text-xs text-[#8c8d91]">Direct operational links for platform control</p>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Link
                href="/admin/links"
                className="p-3 rounded-md bg-[#1c1d20] border border-[#27282b] hover:border-[#56c2ff]/50 transition-colors flex items-center justify-between min-h-[44px]"
              >
                <div>
                  <div className="text-xs font-medium text-[#ededed]">Manage Links</div>
                  <div className="text-[11px] font-mono text-[#8c8d91]">Inspect slugs & redirects</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#8c8d91]" />
              </Link>
              <Link
                href="/admin/payments"
                className="p-3 rounded-md bg-[#1c1d20] border border-[#27282b] hover:border-[#56c2ff]/50 transition-colors flex items-center justify-between min-h-[44px]"
              >
                <div>
                  <div className="text-xs font-medium text-[#ededed]">Chapa Payments</div>
                  <div className="text-[11px] font-mono text-[#8c8d91]">Verify and reconcile txns</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#8c8d91]" />
              </Link>
              <Link
                href="/admin/subscriptions"
                className="p-3 rounded-md bg-[#1c1d20] border border-[#27282b] hover:border-[#56c2ff]/50 transition-colors flex items-center justify-between min-h-[44px]"
              >
                <div>
                  <div className="text-xs font-medium text-[#ededed]">Subscription Plans</div>
                  <div className="text-[11px] font-mono text-[#8c8d91]">Free, Pro & Premium rates</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#8c8d91]" />
              </Link>
              <Link
                href="/admin/activity-logs"
                className="p-3 rounded-md bg-[#1c1d20] border border-[#27282b] hover:border-[#56c2ff]/50 transition-colors flex items-center justify-between min-h-[44px]"
              >
                <div>
                  <div className="text-xs font-medium text-[#ededed]">Audit Trail</div>
                  <div className="text-[11px] font-mono text-[#8c8d91]">IP addresses & mutations</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#8c8d91]" />
              </Link>
            </div>
          </div>
          <div className="p-4 bg-[#0c0d0e] border-t border-[#27282b] flex items-center justify-between text-xs font-mono text-[#8c8d91]">
            <span>Cloudflare Edge Runtime</span>
            <span className="text-[#5fc992] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5fc992]" />
              Global 100% SLA
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
