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
  DialogTrigger,
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
import { Kbd } from "@/components/ui/kbd"
import { Search, Plus, MoreHorizontal, Edit, Trash2, RefreshCw, UserCheck, Shield, ExternalLink } from "lucide-react"
import { adminApi } from "@/lib/admin-api"

interface AdminUser {
  id: string
  email: string
  name: string
  tier: "free" | "pro" | "premium"
  subscription_status: "active" | "canceled" | "past_due" | "unpaid"
  email_verified: boolean
  created_at: string
  updated_at: string
  links_count?: number
  last_login?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [tierFilter, setTierFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // New user form state
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    password: "",
    tier: "free" as const,
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, tierFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const res = await adminApi.getUsers()
      setUsers(res.users as any)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (tierFilter !== "all") {
      filtered = filtered.filter((user) => user.tier === tierFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.subscription_status === statusFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleCreateUser = async () => {
    try {
      if (!newUser.email || !newUser.name || !newUser.password || !newUser.tier) {
        alert("Please fill in all required fields")
        return
      }

      await adminApi.createUser({
        email: newUser.email,
        name: newUser.name,
        password: newUser.password,
        tier: newUser.tier,
      })

      setNewUser({
        email: "",
        name: "",
        password: "",
        tier: "free",
      })

      await fetchUsers()
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error("Failed to create user:", error)
      alert("Failed to create user. Please try again.")
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    try {
      await adminApi.updateUser(selectedUser.id, {
        name: selectedUser.name,
        email: selectedUser.email,
        tier: selectedUser.tier,
        subscriptionStatus: selectedUser.subscription_status,
      })
      await fetchUsers()
      setIsEditDialogOpen(false)
      setSelectedUser(null)
    } catch (error) {
      console.error("Failed to update user:", error)
      alert("Failed to update user. Please try again.")
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      await adminApi.deleteUser(selectedUser.id)
      await fetchUsers()
      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
    } catch (error) {
      console.error("Failed to delete user:", error)
      alert("Failed to delete user. Please try again.")
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
      case "past_due":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">
            Past Due
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
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#ededed]">User Directory</h1>
          <p className="text-xs sm:text-sm text-[#8c8d91] mt-0.5">Inspect user accounts, manage subscription tiers, and control platform access.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchUsers}
            disabled={isLoading}
            className="bg-[#141517] border-[#27282b] hover:bg-[#1c1d20] text-[#ededed] text-xs font-mono h-10 min-h-[44px] min-w-[44px] px-3"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#ff6363] hover:bg-[#ff6363]/90 text-white text-xs font-medium h-10 min-h-[44px] px-4">
                <Plus className="mr-1.5 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#141517] border-[#27282b] text-[#ededed] max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">Create New User</DialogTitle>
                <DialogDescription className="text-xs text-[#8c8d91]">Provision a new user account with credentials.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3.5 py-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#8c8d91]">Full Name</Label>
                  <Input
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="bg-[#1c1d20] border-[#27282b] text-base sm:text-sm text-[#ededed] focus:border-[#56c2ff] min-h-[44px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#8c8d91]">Email Address</Label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="user@example.com"
                    className="bg-[#1c1d20] border-[#27282b] text-base sm:text-sm text-[#ededed] focus:border-[#56c2ff] min-h-[44px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#8c8d91]">Temporary Password</Label>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="••••••••"
                    className="bg-[#1c1d20] border-[#27282b] text-base sm:text-sm text-[#ededed] focus:border-[#56c2ff] min-h-[44px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#8c8d91]">Subscription Tier</Label>
                  <Select value={newUser.tier} onValueChange={(val: any) => setNewUser({ ...newUser, tier: val })}>
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
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="bg-[#1c1d20] border-[#27282b] text-[#ededed] min-h-[44px]">
                  Cancel
                </Button>
                <Button onClick={handleCreateUser} className="bg-[#ff6363] hover:bg-[#ff6363]/90 text-white min-h-[44px]">
                  Create Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#141517] border border-[#27282b] rounded-lg p-3.5">
          <div className="text-xs font-mono text-[#8c8d91]">Total Users</div>
          <div className="text-xl sm:text-2xl font-semibold font-mono tabular-nums text-[#ededed] mt-1">
            {users.length}
          </div>
        </div>
        <div className="bg-[#141517] border border-[#27282b] rounded-lg p-3.5">
          <div className="text-xs font-mono text-[#8c8d91]">Free Tier</div>
          <div className="text-xl sm:text-2xl font-semibold font-mono tabular-nums text-[#ededed] mt-1">
            {users.filter((u) => u.tier === "free").length}
          </div>
        </div>
        <div className="bg-[#141517] border border-[#27282b] rounded-lg p-3.5">
          <div className="text-xs font-mono text-[#8c8d91]">Pro Tier</div>
          <div className="text-xl sm:text-2xl font-semibold font-mono tabular-nums text-[#56c2ff] mt-1">
            {users.filter((u) => u.tier === "pro").length}
          </div>
        </div>
        <div className="bg-[#141517] border border-[#27282b] rounded-lg p-3.5">
          <div className="text-xs font-mono text-[#8c8d91]">Premium Tier</div>
          <div className="text-xl sm:text-2xl font-semibold font-mono tabular-nums text-[#f59e0b] mt-1">
            {users.filter((u) => u.tier === "premium").length}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar with Kbd Chips */}
      <div className="bg-[#141517] border border-[#27282b] rounded-lg p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8d91]" />
          <Input
            placeholder="Search by user name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-[#1c1d20] border-[#27282b] text-base sm:text-sm text-[#ededed] focus:border-[#56c2ff] min-h-[44px]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Status chips */}
          <div className="flex items-center gap-1 bg-[#1c1d20] p-1 rounded-md border border-[#27282b]">
            {(["all", "free", "pro", "premium"] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier)}
                className={`px-2.5 py-1 text-xs font-mono uppercase rounded transition-colors min-h-[32px] ${
                  tierFilter === tier
                    ? "bg-[#27282b] text-[#ededed] font-medium"
                    : "text-[#8c8d91] hover:text-[#ededed]"
                }`}
              >
                {tier}
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

      {/* Horizontal Scroll Data Table Container */}
      <div className="bg-[#141517] border border-[#27282b] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[#27282b] flex items-center justify-between text-xs font-mono text-[#8c8d91]">
          <span>Displaying {filteredUsers.length} users</span>
          <span>Sticky Column: User / Email</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#27282b] bg-[#0c0d0e] text-[11px] font-mono uppercase text-[#8c8d91]">
                <th className="sticky left-0 bg-[#0c0d0e] z-10 px-4 py-3 font-medium min-w-[220px]">
                  User
                </th>
                <th className="px-4 py-3 font-medium">Tier</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Verified</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27282b]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs font-mono text-[#8c8d91]">
                    <RefreshCw className="w-4 h-4 mx-auto mb-2 animate-spin text-[#56c2ff]" />
                    Querying user accounts...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs font-mono text-[#8c8d91]">
                    No users matching criteria found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#1c1d20]/50 transition-colors">
                    {/* Sticky Identifier Column */}
                    <td className="sticky left-0 bg-[#141517] z-10 px-4 py-3.5">
                      <div className="min-w-0 max-w-[200px] sm:max-w-[260px]">
                        <div className="font-medium text-xs text-[#ededed] truncate">{user.name || "Unnamed"}</div>
                        <div className="text-[11px] font-mono text-[#8c8d91] truncate">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getTierBadge(user.tier)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getStatusBadge(user.subscription_status)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {user.email_verified ? (
                        <span className="text-[11px] font-mono text-[#5fc992] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5fc992]" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-[#8c8d91]">Unverified</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs font-mono text-[#8c8d91]">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 rounded-md hover:bg-[#1c1d20] text-[#8c8d91] hover:text-[#ededed] transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#141517] border-[#27282b] text-[#ededed]">
                          <DropdownMenuLabel className="text-xs text-[#8c8d91]">User Options</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setIsEditDialogOpen(true)
                            }}
                            className="text-xs min-h-[40px] cursor-pointer hover:bg-[#1c1d20]"
                          >
                            <Edit className="w-3.5 h-3.5 mr-2 text-[#56c2ff]" />
                            Edit Account
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[#27282b]" />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="text-xs text-[#ff6363] min-h-[40px] cursor-pointer hover:bg-[#1c1d20]"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            Delete Account
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

      {/* Edit User Dialog */}
      {selectedUser && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-[#141517] border-[#27282b] text-[#ededed] max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">Edit User: {selectedUser.email}</DialogTitle>
              <DialogDescription className="text-xs text-[#8c8d91]">Update account profile and tier limits.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3.5 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-[#8c8d91]">Name</Label>
                <Input
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                  className="bg-[#1c1d20] border-[#27282b] text-base sm:text-sm text-[#ededed] min-h-[44px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[#8c8d91]">Email</Label>
                <Input
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  className="bg-[#1c1d20] border-[#27282b] text-base sm:text-sm text-[#ededed] min-h-[44px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[#8c8d91]">Tier</Label>
                <Select value={selectedUser.tier} onValueChange={(val: any) => setSelectedUser({ ...selectedUser, tier: val })}>
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
              <div className="space-y-1.5">
                <Label className="text-xs text-[#8c8d91]">Subscription Status</Label>
                <Select value={selectedUser.subscription_status} onValueChange={(val: any) => setSelectedUser({ ...selectedUser, subscription_status: val })}>
                  <SelectTrigger className="bg-[#1c1d20] border-[#27282b] text-[#ededed] min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141517] border-[#27282b] text-[#ededed]">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                    <SelectItem value="past_due">Past Due</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="bg-[#1c1d20] border-[#27282b] text-[#ededed] min-h-[44px]">
                Cancel
              </Button>
              <Button onClick={handleUpdateUser} className="bg-[#56c2ff] hover:bg-[#56c2ff]/90 text-black font-medium min-h-[44px]">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete User Dialog */}
      {selectedUser && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-[#141517] border-[#27282b] text-[#ededed] max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-[#ff6363]">Delete User Account?</DialogTitle>
              <DialogDescription className="text-xs text-[#8c8d91]">
                This will delete user <span className="font-mono text-[#ededed]">{selectedUser.email}</span> and cascade delete their links and analytics records. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="bg-[#1c1d20] border-[#27282b] text-[#ededed] min-h-[44px]">
                Cancel
              </Button>
              <Button onClick={handleDeleteUser} className="bg-[#ff6363] hover:bg-[#ff6363]/90 text-white min-h-[44px]">
                Confirm Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
