import { BarChart3, CheckCircle, Users, UserCheck, AlertCircle, Clock } from "@/components/icons"

export const analyticsData = [
    { label: "Total Transactions", value: "421,818", change: "+28%", icon: BarChart3, color: "bg-blue-500" },
    { label: "Success Volume", value: "₹ 391,120", change: "+17%", icon: CheckCircle, color: "bg-green-500" },
    { label: "Active Retailers", value: "320", change: "+42%", icon: Users, color: "bg-orange-500" },
    { label: "New Onboarding", value: "124", change: "+12%", icon: UserCheck, color: "bg-purple-500" },
    { label: "Failed Txns", value: "12", change: "-5%", icon: AlertCircle, color: "bg-red-500" },
    { label: "Pending KYCs", value: "5", change: "+2%", icon: Clock, color: "bg-yellow-500" },
]