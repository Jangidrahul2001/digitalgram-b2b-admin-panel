import React, { useState } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle2, XCircle } from "@/components/icons"
import { cn } from "../../lib/utils"

export function PayoutBankRequestActionModal({ isOpen, onClose, onConfirm, action, userName, bankName, accountNumber }) {
    const [reason, setReason] = useState("")

    const getActionDetails = () => {
        if (action === "approved") {
            return {
                color: "bg-emerald-600 hover:bg-emerald-700",
                label: "Approve Bank Request",
                icon: CheckCircle2,
                description: "Bank details will be approved for payout.",
                theme: {
                    main: "text-emerald-600",
                    bg: "bg-emerald-500",
                    border: "border-emerald-200",
                    shadow: "shadow-emerald-500/25",
                    light: "bg-emerald-50",
                    gradient: "from-emerald-500/20 to-emerald-500/0"
                }
            }
        }
        return {
            color: "bg-rose-600 hover:bg-rose-700",
            label: "Reject Bank Request",
            icon: XCircle,
            description: "User will be notified about the rejection.",
            theme: {
                main: "text-rose-600",
                bg: "bg-rose-500",
                border: "border-rose-200",
                shadow: "shadow-rose-500/25",
                light: "bg-rose-50",
                gradient: "from-rose-500/20 to-rose-500/0"
            }
        }
    }

    const details = getActionDetails()
    const Icon = details.icon
    const theme = details.theme

    const handleConfirm = () => {
        if (action === "rejected" && !reason.trim()) {
            return
        }
        onConfirm(action, reason)
        onClose()
        setReason("")
    }

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="relative z-10 w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden ring-1 ring-black/5"
                    >
                        <div className={`absolute top-0 inset-x-0 h-48 bg-gradient-to-b ${theme.gradient} opacity-50`} />
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-white opacity-20 blur-3xl rounded-full mix-blend-overlay pointer-events-none" />

                        <div className="relative flex items-center justify-between p-8 pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Payout Bank Request</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-sm font-medium text-slate-500">User:</p>
                                    <div className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                                        {userName || "N/A"}
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={onClose} 
                                className="flex items-center justify-center rounded-full h-10 w-10 bg-white/50 backdrop-blur hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="relative p-8 pt-2 space-y-6">
                            <div className="flex items-center gap-4 bg-white/60 p-4 rounded-2xl border border-slate-100 shadow-sm backdrop-blur-md">
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${theme.bg} text-white shadow-lg`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Action</p>
                                    <h3 className={`text-lg font-bold ${theme.main}`}>{details.label}</h3>
                                </div>
                            </div>

                            <div className="space-y-3 bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 font-medium">Bank Name:</span>
                                    <span className="text-slate-900 font-bold">{bankName || "N/A"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500 font-medium">Account Number:</span>
                                    <span className="text-slate-700 font-mono text-xs">{accountNumber || "N/A"}</span>
                                </div>
                            </div>

                            <div className={cn("p-4 rounded-2xl border bg-white/60", theme.border)}>
                                <div className="flex gap-3">
                                    <div className={cn("w-1 h-full absolute left-0 top-0 bottom-0 rounded-l-2xl", theme.bg)} />
                                    <div className="space-y-1">
                                        <p className={cn("text-xs font-bold uppercase tracking-wider opacity-80", theme.main)}>Summary</p>
                                        <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                            {details.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {action === "rejected" && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                                        Rejection Reason <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea 
                                        className={cn(
                                            "flex min-h-[100px] w-full rounded-2xl border bg-slate-50/50 px-4 py-3 text-sm transition-all resize-none",
                                            "placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:bg-white",
                                            theme.border,
                                            "focus-visible:ring-rose-500"
                                        )}
                                        placeholder="Enter reason for rejection..."
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="p-8 pt-0 flex items-center justify-between gap-4">
                            <span className="text-xs font-semibold text-slate-400 pl-1">
                                Press <kbd className="font-sans px-1.5 py-0.5 bg-slate-100 rounded-md border border-slate-200">Esc</kbd> to cancel
                            </span>
                            <div className="flex gap-3">
                                <button onClick={onClose} className="px-4 py-2 rounded-xl hover:bg-slate-100 text-slate-500 font-semibold transition-colors">
                                    Cancel
                                </button>
                                <button 
                                    className={cn("rounded-xl text-white px-8 py-2 font-bold transition-all hover:scale-[1.02] active:scale-[0.98]", details.color, theme.shadow, action === "rejected" && !reason.trim() ? "opacity-50 cursor-not-allowed" : "")}
                                    disabled={action === "rejected" && !reason.trim()}
                                    onClick={handleConfirm}
                                >
                                    {action === "approved" ? "Approve" : "Reject"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    )
}
