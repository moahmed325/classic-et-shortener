"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Edit, Trash2, ExternalLink, Copy, Check, RefreshCw, BarChart3, LinkIcon } from "lucide-react"
import { adminApi } from "@/lib/admin-api"

interface AdminLink {
  id: string
  user_id: string
  user_name: string
  user_email: string
  original_url: string
  short_code: string
  custom_domain?: string
  title?: string
  description?: string
  is_active: boolean
  expires_at?: string
  click_count: number
  created_at: string
  updated_at: string
}

export default function LinksPage() {
  const [links, setLinks] = useState<AdminLink[]>([])
  const [filteredLinks, setFilteredLinks] = useState<AdminLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedLink, setSelectedLink] = useState<AdminLink | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetchLinks()
  }, [])

  useEffect(() => {
    filterLinks()
  }, [links, searchTerm, statusFilter])

  const fetchLinks = async () => {
    try {
      setIsLoading(true)
      const res = await adminApi.getLinks()
      setLinks(res.links as any)
    } catch (error) {
      console.error("Failed to fetch links:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterLinks = () => {
    let filtered = links

    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (link) =>
          link.short_code.toLowerCase().includes(q) ||
          link.original_url.toLowerCase().includes(q) ||
          (link.title && link.title.toLowerCase().includes(q)) ||
          (link.user_email && link.user_email.toLowerCase().includes(q)),
      )
    }

    if (statusFilter === "active") {
      filtered = filtered.filter((l) => l.is_active)
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((l) => !l.is_active)
    }

    setFilteredLinks(filtered)
  }

  const handleCopy = (link: AdminLink) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://classic.et"
    const fullUrl = `${origin}/${link.short_code}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedId(link.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleToggleStatus = async (link: AdminLink) => {
    try {
      await adminApi.updateLink(link.id, {
        isActive: !link.is_active,
      })
      await fetchLinks()
    } catch (err) {
      console.error("Failed to toggle link status:", err)
    }
  }

  const handleUpdateLink = async () => {
    if (!selectedLink) return
    try {
      await adminApi.updateLink(selectedLink.id, {
        title: selectedLink.title,
        isActive: selectedLink.is_active,
      })
      await fetchLinks()
      setIsEditDialogOpen(false)
      setSelectedLink(null)
    } catch (err) {
      console.error("Failed to update link:", err)
      alert("Failed to update link.")
    }
  }

  const handleDeleteLink = async () => {
    if (!selectedLink) return
    try {
      await adminApi.deleteLink(selectedLink.id)
      await fetchLinks()
      setIsDeleteDialogOpen(false)
      setSelectedLink(null)
    } catch (err) {
      console.error("Failed to delete link:", err)
      alert("Failed to delete link.")
    }
  }

  const totalClicks = links.reduce((sum, l) => sum + (l.click_count || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#27282b] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#ededed]">Link Management</h1>
          <p className="text-xs sm:text-sm text-[#8c8d91] mt-0.5">Audit short codes, redirect destinations, and manage link lifecycles.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchLinks}
            disabled={isLoading}
            className="bg-[#141517] border-[#27282b] hover:bg-[#1c1d20] text-[#ededed] text-xs font-mono h-10 min-h-[44px] min-w-[44px] px-3"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#141517] border border-[#27282b] rounded-lg p-3.5">
          <div className="text-xs font-mono text-[#8c8d91]">Total Links</div>
          <div className="text-xl sm:text-2xl font-semibold font-mono tabular-nums text-[#ededed] mt-1">
            {links.length}
          </div>
        </div>
        <div className="bg-[#141517] border border-[#27282b] rounded-lg p-3.5">
          <div className="text-xs font-mono text-[#8c8d91]">Active Links</div>
          <div className="text-xl sm:text-2xl font-semibold font-mono tabular-nums text-[#5fc992] mt-1">
            {links.filter((l) => l.is_active).length}
          </div>
        </div>
        <div className="bg-[#141517] border border-[#27282b] rounded-lg p-3.5">
          <div className="text-xs font-mono text-[#8c8d91]">Inactive / Expired</div>
          <div className="text-xl sm:text-2xl font-semibold font-mono tabular-nums text-[#f59e0b] mt-1">
            {links.filter((l) => !l.is_active).length}
          </div>
        </div>
        <div className="bg-[#141517] border border-[#27282b] rounded-lg p-3.5">
          <div className="text-xs font-mono text-[#8c8d91]">Aggregated Clicks</div>
          <div className="text-xl sm:text-2xl font-semibold font-mono tabular-nums text-[#56c2ff] mt-1">
            {totalClicks.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#141517] border border-[#27282b] rounded-lg p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8d91]" />
          <Input
            placeholder="Search by slug, title, destination URL, or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-[#1c1d20] border-[#27282b] text-base sm:text-sm text-[#ededed] focus:border-[#56c2ff] min-h-[44px]"
          />
        </div>
        <div className="flex items-center gap-1 bg-[#1c1d20] p-1 rounded-md border border-[#27282b]">
          {(["all", "active", "inactive"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-mono uppercase rounded transition-colors min-h-[32px] ${
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

      {/* Horizontal Scroll Data Table */}
      <div className="bg-[#141517] border border-[#27282b] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#27282b] flex items-center justify-between text-xs font-mono text-[#8c8d91]">
          <span>Displaying {filteredLinks.length} links</span>
          <span>Sticky Column: Short Slug</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[780px]">
            <thead>
              <tr className="border-b border-[#27282b] bg-[#0c0d0e] text-[11px] font-mono uppercase text-[#8c8d91]">
                <th className="sticky left-0 bg-[#0c0d0e] z-10 px-4 py-3 font-medium min-w-[180px]">
                  Slug / Shortcode
                </th>
                <th className="px-4 py-3 font-medium min-w-[240px]">Destination URL</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium text-right">Clicks</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27282b]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs font-mono text-[#8c8d91]">
                    <RefreshCw className="w-4 h-4 mx-auto mb-2 animate-spin text-[#56c2ff]" />
                    Loading links...
                  </td>
                </tr>
              ) : filteredLinks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs font-mono text-[#8c8d91]">
                    No links found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-[#1c1d20]/50 transition-colors">
                    {/* Sticky Left Column: Shortcode */}
                    <td className="sticky left-0 bg-[#141517] z-10 px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-medium text-[#ededed] bg-[#1c1d20] px-2 py-1 rounded border border-[#27282b]">
                          /{link.short_code}
                        </span>
                        <button
                          onClick={() => handleCopy(link)}
                          className="p-1 rounded hover:bg-[#1c1d20] text-[#8c8d91] hover:text-[#ededed] transition-colors min-h-[32px] min-w-[32px] inline-flex items-center justify-center"
                          title="Copy short link"
                        >
                          {copiedId === link.id ? (
                            <Check className="w-3.5 h-3.5 text-[#5fc992]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Destination */}
                    <td className="px-4 py-3.5">
                      <div className="max-w-[260px] min-w-0">
                        {link.title && (
                          <div className="text-xs font-medium text-[#ededed] truncate">{link.title}</div>
                        )}
                        <a
                          href={link.original_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-mono text-[#8c8d91] hover:text-[#56c2ff] truncate flex items-center gap-1 block"
                        >
                          <span className="truncate">{link.original_url}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="text-xs text-[#ededed]">{link.user_name || "User"}</div>
                      <div className="text-[10px] font-mono text-[#8c8d91]">{link.user_email}</div>
                    </td>

                    {/* Clicks */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right font-mono tabular-nums text-xs font-semibold text-[#ededed]">
                      {link.click_count?.toLocaleString() || 0}
                    </td>

                    {/* Status with Toggle Button (Min 44px touch target) */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(link)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono uppercase min-h-[36px] transition-colors ${
                          link.is_active
                            ? "bg-[#5fc992]/10 text-[#5fc992] border border-[#5fc992]/20 hover:bg-[#5fc992]/20"
                            : "bg-[#27282b] text-[#8c8d91] border border-[#27282b] hover:text-[#ededed]"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${link.is_active ? "bg-[#5fc992]" : "bg-[#8c8d91]"}`} />
                        {link.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>

                    {/* Created */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs font-mono text-[#8c8d91]">
                      {link.created_at ? new Date(link.created_at).toLocaleDateString() : "—"}
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
                          <DropdownMenuLabel className="text-xs text-[#8c8d91]">Link Options</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedLink(link)
                              setIsEditDialogOpen(true)
                            }}
                            className="text-xs min-h-[40px] cursor-pointer hover:bg-[#1c1d20]"
                          >
                            <Edit className="w-3.5 h-3.5 mr-2 text-[#56c2ff]" />
                            Edit Destination
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[#27282b]" />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedLink(link)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="text-xs text-[#ff6363] min-h-[40px] cursor-pointer hover:bg-[#1c1d20]"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            Delete Link
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

      {/* Edit Link Dialog */}
      {selectedLink && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-[#141517] border-[#27282b] text-[#ededed] max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">Edit Link: /{selectedLink.short_code}</DialogTitle>
              <DialogDescription className="text-xs text-[#8c8d91]">Modify destination URL and active redirect status.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3.5 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-[#8c8d91]">Title (Optional)</Label>
                <Input
                  value={selectedLink.title || ""}
                  onChange={(e) => setSelectedLink({ ...selectedLink, title: e.target.value })}
                  placeholder="Campaign Title"
                  className="bg-[#1c1d20] border-[#27282b] text-base sm:text-sm text-[#ededed] min-h-[44px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[#8c8d91]">Destination URL</Label>
                <Input
                  value={selectedLink.original_url}
                  onChange={(e) => setSelectedLink({ ...selectedLink, original_url: e.target.value })}
                  placeholder="https://example.com/target"
                  className="bg-[#1c1d20] border-[#27282b] text-base sm:text-sm text-[#ededed] min-h-[44px]"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLink({ ...selectedLink, is_active: !selectedLink.is_active })}
                  className={`px-3 py-2 rounded text-xs font-mono min-h-[44px] flex items-center gap-2 border ${
                    selectedLink.is_active
                      ? "bg-[#5fc992]/10 text-[#5fc992] border-[#5fc992]/30"
                      : "bg-[#1c1d20] text-[#8c8d91] border-[#27282b]"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${selectedLink.is_active ? "bg-[#5fc992]" : "bg-[#8c8d91]"}`} />
                  {selectedLink.is_active ? "Active Redirect" : "Disabled Redirect"}
                </button>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="bg-[#1c1d20] border-[#27282b] text-[#ededed] min-h-[44px]">
                Cancel
              </Button>
              <Button onClick={handleUpdateLink} className="bg-[#56c2ff] hover:bg-[#56c2ff]/90 text-black font-medium min-h-[44px]">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Link Dialog */}
      {selectedLink && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-[#141517] border-[#27282b] text-[#ededed] max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-[#ff6363]">Delete Link /{selectedLink.short_code}?</DialogTitle>
              <DialogDescription className="text-xs text-[#8c8d91]">
                This will delete the shortcode and prevent any further redirection. Historical click records will be unlinked.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="bg-[#1c1d20] border-[#27282b] text-[#ededed] min-h-[44px]">
                Cancel
              </Button>
              <Button onClick={handleDeleteLink} className="bg-[#ff6363] hover:bg-[#ff6363]/90 text-white min-h-[44px]">
                Confirm Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
