"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../../../components/ui/button"
import { Label } from "../../../../components/ui/label"
import { MoveLeft, User, Package, Check, Loader2, Search, ArrowRight } from "@/components/icons"
import { motion } from "framer-motion"
import { PageTransition } from "../../../../components/ui/page-transition"
import { useFetch } from "../../../../hooks/useFetch"
import { usePost } from "../../../../hooks/usePost"
import { apiEndpoints } from "../../../../api/apiEndpoints"
import { toast } from "sonner"
import { handleValidationError } from "../../../../utils/helperFunction"

export default function UpgradeUserPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])

  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch packages using useFetch
  const { data: packagesData, isLoading: packagesLoading } = useFetch(
    apiEndpoints.fetchPackages,
    {
      onSuccess: (data) => {
        console.log("Packages fetched successfully:", data)
      },
      onError: (error) => {
        console.error("Error fetching packages:", error)
        toast.error(handleValidationError(error) || "Failed to load packages")
      }
    },
    true
  )

  // Fetch users using useFetch
  const { data: usersData, isLoading: usersLoading } = useFetch(
    apiEndpoints.fetchAllUserWithoutPagination,
    {
      onSuccess: (data) => {
        if (data.success) {
          setUsers(data.data || [])
        }
        console.log("Users fetched successfully:", data)
      },
      onError: (error) => {
        console.error("Error fetching users:", error)
        toast.error(handleValidationError(error) || "Failed to load users")
      }
    },
    true
  )

  // Use usePost for upgrade functionality
  const { post: upgradeUser } = usePost(apiEndpoints.upgradeUser || "/admin/user/upgrade", {
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`User upgraded to ${selectedPackage.name || selectedPackage.pkgName}`)
        navigate(-1)
      }
    },
    onError: (error) => {
      console.error("Upgrade failed", error)
      toast.error(handleValidationError(error) || "Upgrade failed")
    }
  })

  // Extract packages array from response
  const packages = packagesData?.data || []

  // Extract and map users array from response


  // Filter users based on search query
  const filteredUsers = searchQuery.trim()
    ? users.filter(user =>
      (user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
    : users

  const handleUpgrade = async (e) => {
    e.preventDefault()
    if (!selectedUser || !selectedPackage) return

    const userId = selectedUser.id || selectedUser._id
    const packageId = selectedPackage.id || selectedPackage._id

    await upgradeUser({
      userId,
      packageId
    })
  }

  return (
    <div className="min-h-screen w-full py-4 lg:py-8 px-4 space-y-8">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div onClick={() => navigate(-1)}>
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-slate-100 transition-colors">
              <MoveLeft className="h-5 w-5 text-slate-600" />
            </Button>
          </div>
          <div className="flex flex-col">
            <h1 className="text-[28px] font-bold tracking-tight text-slate-900 leading-none">Upgrade User</h1>
            <p className="text-slate-500 text-[14px] mt-1.5">Modify user package and permissions.</p>
          </div>
        </div>
      </div>

      {/* Upgrade Container */}
      <div className="w-full pb-8">
        <PageTransition>
          <div className="w-full bg-white/60 backdrop-blur-3xl border border-white shadow-xl shadow-slate-200/10 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row min-h-[500px]">

            {/* Left Side: User Selection */}
            <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-slate-100 p-8 flex flex-col gap-4 bg-slate-50/40">
              <div>
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1 block">1. Select User</Label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="w-full pl-11 pr-4 h-10 bg-white border border-slate-100 rounded-xl text-[13px] font-bold focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all placeholder:text-slate-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[400px] space-y-2 pr-2" data-lenis-prevent>
                {usersLoading ? (
                  <div className="text-center py-8 text-slate-500 text-sm flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading users...
                  </div>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map(user => {
                    const userId = user._id
                    const isSelected = selectedUser && (selectedUser._id === userId)

                    return (
                      <div
                        key={userId}
                        onClick={() => setSelectedUser(user)}
                        className={`p-2.5 px-3 rounded-2xl cursor-pointer border transition-all duration-300 flex items-center justify-between group ${isSelected ? 'bg-slate-900 border-slate-900 shadow-sm shadow-slate-900/20' : 'bg-white border-transparent hover:bg-white hover:border-slate-100 hover:shadow-sm'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {(user.fullName || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className={`text-[13px] font-bold ${isSelected ? 'text-white' : 'text-slate-800'}`}>{user.fullName}</p>
                            <p className={`text-[11px] font-medium ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    {searchQuery ? "No users found matching your search." : "No users found."}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Package Selection & Confirm */}
            <div className="w-full md:w-1/2 p-8 flex flex-col justify-between">
              <div>
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1 block">2. Choose New Package</Label>

                <div className="grid grid-cols-1 gap-3">
                  {packagesLoading ? (
                    <div className="text-center py-8 text-slate-400 text-sm flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading packages...
                    </div>
                  ) : packages.length > 0 ? (
                    packages.map((pkg) => {
                      const pkgId = pkg.id || pkg._id
                      const pkgName = pkg.name || pkg.pkgName || "Unknown Package"
                      const isSelected = selectedPackage && (selectedPackage.id === pkgId || selectedPackage._id === pkgId)

                      return (
                        <div
                          key={pkgId}
                          onClick={() => setSelectedPackage(pkg)}
                          className={`relative p-3.5 px-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center gap-4 ${isSelected ? 'border-orange-500 bg-orange-50/30' : 'border-slate-50 hover:border-slate-200 bg-white'}`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-orange-500' : 'border-slate-200'}`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                          </div>
                          <span className={`text-[13px] font-bold ${isSelected ? 'text-orange-900' : 'text-slate-700'}`}>{pkgName}</span>
                          {isSelected && (
                            <motion.div
                              layoutId="pkg-indicator"
                              className="absolute right-4 text-orange-500"
                            >
                              <Package className="w-4 h-4" />
                            </motion.div>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-sm">No packages available</div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100/80">
                <Button
                  onClick={handleUpgrade}
                  className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-bold shadow-lg shadow-slate-900/10 active:scale-95 transition-all duration-200"
                  disabled={!selectedUser || !selectedPackage}
                >
                  Confirm Upgrade
                  <ArrowRight className="ml-2 w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

          </div>
        </PageTransition>
      </div>
    </div>
  )
}
