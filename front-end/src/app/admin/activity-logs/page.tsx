"use client"

import { useState, useEffect } from "react"
import { adminApi } from "@/lib/admin-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  RefreshCw,
  Download,
  Activity,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

interface ActivityLog {
  id: string
  admin_user_id?: string
  admin_name?: string
  admin_email?: string
  user_id?: string
  user_name?: string
  user_email?: string
  action: string
  resource?: string
  resource_type?: string
  resource_id?: string
  details: string
  ip_address: string
  user_agent: string
  created_at: string
  log_type: "admin" | "user"
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [logTypeFilter, setLogTypeFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)

  useEffect(() => {
    fetchLogs()
  }, [currentPage, actionFilter, logTypeFilter])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      let allLogs: ActivityLog[] = []
      let totalCount = 0

      if (logTypeFilter === "all" || logTypeFilter === "admin") {
        try {
          const adminParams = {
            limit: 50,
            offset: (currentPage - 1) * 50,
            action: actionFilter !== "all" ? actionFilter : undefined,
          }
          const adminResponse = await adminApi.getActivityLogs(adminParams)
          if (adminResponse?.logs && Array.isArray(adminResponse.logs)) {
            const adminLogs = adminResponse.logs.map((log: any) => ({
              ...log,
              log_type: "admin" as const,
              resource: log.resource || "system",
            }))
            allLogs = [...allLogs, ...adminLogs]
            totalCount += adminResponse.total || adminLogs.length
          }
        } catch (error) {
          console.error("Failed to fetch admin logs:", error)
        }
      }

      if (logTypeFilter === "all" || logTypeFilter === "user") {
        try {
          const userResponse = await adminApi.getUserActivityLogs({
            limit: 50,
            offset: (currentPage - 1) * 50,
            action: actionFilter !== "all" ? actionFilter : undefined,
          })
          if (userResponse?.logs && Array.isArray(userResponse.logs)) {
            const userLogs = userResponse.logs.map((log: any) => ({
              ...log,
              log_type: "user" as const,
              resource: log.resource || "link",
            }))
            allLogs = [...allLogs, ...userLogs]
            totalCount += userResponse.total || userLogs.length
          }
        } catch (error) {
          console.error("Failed to fetch user logs:", error)
        }
      }

      allLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setLogs(allLogs)
      setTotalLogs(totalCount)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true
    const q = searchTerm.toLowerCase()
    return (
      (log.admin_name && log.admin_name.toLowerCase().includes(q)) ||
      (log.user_name && log.user_name.toLowerCase().includes(q)) ||
      (log.admin_email && log.admin_email.toLowerCase().includes(q)) ||
      (log.user_email && log.user_email.toLowerCase().includes(q)) ||
      (log.action && log.action.toLowerCase().includes(q)) ||
      (log.details && log.details.toLowerCase().includes(q)) ||
      (log.ip_address && log.ip_address.includes(q))
    )
  })

  const handleExport = () => {
    const headers = ["Timestamp", "Type", "Actor", "Email", "Action", "Resource", "Details", "IP Address"]
    const rows = filteredLogs.map((log) => [
      log.created_at,
      log.log_type,
      log.log_type === "admin" ? log.admin_name : log.user_name,
      log.log_type === "admin" ? log.admin_email : log.user_email,
      log.action,
      log.resource || "unknown",
      log.details,
      log.ip_address,
    ])
    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell || ""}"`).join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `classic-et-audit-logs-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getActionBadge = (action: string) => {
    if (action.includes("create") || action.includes("add")) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#5fc992]/10 text-[#5fc992] border border-[#5fc992]/20">{action}</span>
    }
    if (action.includes("delete") || action.includes("remove") || action.includes("fail")) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#ff6363]/10 text-[#ff6363] border border-[#ff6363]/20">{action}</span>
    }
    if (action.includes("update") || action.includes("edit")) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#56c2ff]/10 text-[#56c2ff] border border-[#56c2ff]/20">{action}</span>
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#1c1d20] text-[#8c8d91] border border-[#27282b]">{action}</span>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#27282b] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#ededed]">Activity & Audit Logs</h1>
          <p className="text-xs sm:text-sm text-[#8c8d91] mt-0.5">Immutable audit trail of administrator and user actions across classic.et.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            className="bg-[#141517] border-[#27282b] hover:bg-[#1c1d20] text-[#ededed] text-xs font-mono h-10 min-h-[44px] px-3"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={fetchLogs}
            disabled={loading}
            className="bg-[#141517] border-[#27282b] hover:bg-[#1c1d20] text-[#ededed] text-xs font-mono h-10 min-h-[44px] min-w-[44px] px-3"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#141517] border border-[#27282b] rounded-lg p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8d91]" />
          <Input
            placeholder="Filter logs by actor, action, resource, or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-[#1c1d20] border-[#27282b] text-base sm:text-sm text-[#ededed] focus:border-[#56c2ff] min-h-[44px]"
          />
        </div>
        <div className="flex items-center gap-1 bg-[#1c1d20] p-1 rounded-md border border-[#27282b]">
          {(["all", "admin", "user"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setLogTypeFilter(type)}
              className={`px-3 py-1 text-xs font-mono uppercase rounded transition-colors min-h-[32px] ${
                logTypeFilter === type
                  ? "bg-[#27282b] text-[#ededed] font-medium"
                  : "text-[#8c8d91] hover:text-[#ededed]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#141517] border border-[#27282b] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#27282b] flex items-center justify-between text-xs font-mono text-[#8c8d91]">
          <span>Displaying {filteredLogs.length} audit entries</span>
          <span>Sticky Column: Actor</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[#27282b] bg-[#0c0d0e] text-[11px] font-mono uppercase text-[#8c8d91]">
                <th className="sticky left-0 bg-[#0c0d0e] z-10 px-4 py-3 font-medium min-w-[200px]">
                  Actor / Initiator
                </th>
                <th className="px-4 py-3 font-medium">Scope</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium min-w-[240px]">Details</th>
                <th className="px-4 py-3 font-medium">IP Address</th>
                <th className="px-4 py-3 font-medium text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27282b]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs font-mono text-[#8c8d91]">
                    <RefreshCw className="w-4 h-4 mx-auto mb-2 animate-spin text-[#56c2ff]" />
                    Fetching system audit entries...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs font-mono text-[#8c8d91]">
                    No activity logs recorded.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const actorName = log.log_type === "admin" ? log.admin_name : log.user_name
                  const actorEmail = log.log_type === "admin" ? log.admin_email : log.user_email
                  return (
                    <tr key={log.id} className="hover:bg-[#1c1d20]/50 transition-colors">
                      {/* Sticky Left Column: Actor */}
                      <td className="sticky left-0 bg-[#141517] z-10 px-4 py-3 whitespace-nowrap">
                        <div className="min-w-0 max-w-[200px]">
                          <div className="text-xs font-medium text-[#ededed] truncate">
                            {actorName || "Unknown Actor"}
                          </div>
                          <div className="text-[11px] font-mono text-[#8c8d91] truncate">
                            {actorEmail || "no-email"}
                          </div>
                        </div>
                      </td>

                      {/* Scope */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                          log.log_type === "admin"
                            ? "bg-[#ff6363]/10 text-[#ff6363] border border-[#ff6363]/20"
                            : "bg-[#1c1d20] text-[#8c8d91] border border-[#27282b]"
                        }`}>
                          {log.log_type}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>

                      {/* Details */}
                      <td className="px-4 py-3">
                        <div className="text-xs text-[#ededed] max-w-[320px] min-w-0 truncate" title={log.details}>
                          {log.details || "—"}
                        </div>
                      </td>

                      {/* IP */}
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-[#8c8d91]">
                        {log.ip_address || "127.0.0.1"}
                      </td>

                      {/* Timestamp */}
                      <td className="px-4 py-3 whitespace-nowrap text-right font-mono text-xs text-[#8c8d91]">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
