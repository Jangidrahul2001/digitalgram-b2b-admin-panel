import { Users, UserPlus, UserCheck, Search, Clock, CheckCircle2, XCircle } from "@/components/icons"

export const userStats = [
    { label: "State Head", count: 6, percent: "(0.06%)", color: "text-purple-600", bg: "bg-purple-100", icon: Users },
    { label: "Master Distributor", count: 3, percent: "(0.03%)", color: "text-rose-600", bg: "bg-rose-100", icon: UserPlus },
    { label: "Distributor", count: 2, percent: "(0.02%)", color: "text-emerald-600", bg: "bg-emerald-100", icon: UserCheck },
    { label: "Retailer", count: 3, percent: "(0.03%)", color: "text-amber-600", bg: "bg-amber-100", icon: Search }, 
]

export const fundRequestStats = {
  approved: { label: "Approved Fund Request", count: 0, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", icon: CheckCircle2 },
  pending: { label: "Pending Fund Request", count: 0, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", icon: Clock },
  rejected: { label: "Reject Fund Request", count: 0, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", icon: XCircle },
  approvedAmount: { label: "Total Approved", ruppee:true, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", icon: CheckCircle2 },
  rejectedAmount: { label: "Total Rejected", ruppee:true, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", icon: XCircle },
}


export const statsData = [
  { label: "Total Users", value: "38", color: "bg-slate-900" },
  { label: "Active Users", value: "14", color: "bg-green-500" },
  { label: "Pending", value: "24", color: "bg-orange-500" }
]