import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShieldCheck, ShieldAlert, Shield, AlertCircle } from "@/components/icons"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { cn } from "../../lib/utils"
import { toast } from "sonner"

export function KYCActionModal({ isOpen, onClose, onConfirm, currentStatus, userName, sectionStatus }) {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  const [remarks, setRemarks] = useState("")
  // Calculate stats from sectionStatus props
  const stats = sectionStatus ? Object.values(sectionStatus).reduce((acc, status) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, { approved: 0, rejected: 0, pending: 0 }) : { approved: 0, rejected: 0, pending: 0 };

  // Determine Action automatically
  let derivedAction = 'pending';
  const totalSections = sectionStatus ? Object.keys(sectionStatus).length : 0;

  if (stats.approved === totalSections && totalSections > 0) {
    derivedAction = 'approved';
  } else if (stats.rejected >= 1 && stats.rejected <= 3) {
    derivedAction = 're-kyc';
  } else if (stats.rejected === 4) {
    derivedAction = 'rejected';
  }

  const getActionDetails = (act) => {
    switch (act) {
      case "approved":
        return {
          color: "bg-emerald-600 hover:bg-emerald-700",
          lightColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
          label: "Approve KYC",
          icon: ShieldCheck,
          description: "User will have full access to all services."
        }
      case "rejected":
        return {
          color: "bg-rose-600 hover:bg-rose-700",
          lightColor: "bg-rose-50 text-rose-700 border-rose-200",
          label: "Reject KYC",
          icon: ShieldAlert,
          description: "User will be notified to re-submit all documents."
        }
      case "re-kyc":
        return {
          color: "bg-orange-500 hover:bg-orange-600",
          lightColor: "bg-orange-50 text-orange-700 border-orange-200",
          label: "Request Re-KYC",
          icon: AlertCircle,
          description: "User will be notified to correct specific sections."
        }
      case "proceed": // Legacy/Fallback
        return {
          color: "bg-blue-600 hover:bg-blue-700",
          lightColor: "bg-blue-50 text-blue-700 border-blue-200",
          label: "Proceed Application",
          icon: Shield,
          description: "Move application to the next verification stage."
        }
      default:
        return {
          color: "bg-slate-900", // Default disable look?
          lightColor: "bg-slate-50",
          label: "Update Status",
          icon: Shield,
          description: "Please review sections to determine action."
        }
    }
  }

  const currentDetails = getActionDetails(derivedAction)
  const CurrentIcon = currentDetails.icon

  // Dynamic theme colors
  const theme = {
    approved: { main: "text-emerald-600", bg: "bg-emerald-500", border: "border-emerald-200", shadow: "shadow-emerald-500/25", light: "bg-emerald-50", gradient: "from-emerald-500/20 to-emerald-500/0" },
    rejected: { main: "text-rose-600", bg: "bg-rose-500", border: "border-rose-200", shadow: "shadow-rose-500/25", light: "bg-rose-50", gradient: "from-rose-500/20 to-rose-500/0" },
    "re-kyc": { main: "text-orange-600", bg: "bg-orange-500", border: "border-orange-200", shadow: "shadow-orange-500/25", light: "bg-orange-50", gradient: "from-orange-500/20 to-orange-500/0" },
    proceed: { main: "text-blue-600", bg: "bg-blue-500", border: "border-blue-200", shadow: "shadow-blue-500/25", light: "bg-blue-50", gradient: "from-blue-500/20 to-blue-500/0" },
    pending: { main: "text-slate-600", bg: "bg-slate-500", border: "border-slate-200", shadow: "shadow-slate-500/25", light: "bg-slate-50", gradient: "from-slate-500/20 to-slate-500/0" }
  }[derivedAction] || theme.approved;

  // Handle Confirm: Map 're-kyc' to 'rejected' for backend usually, or keep customizable. 
  // Assuming backend takes 'rejected' for both partial and full.
  const handleConfirmAction = () => {

    const statusToSend = derivedAction;
    if ((statusToSend === "rejected" || statusToSend === "re-kyc") && !remarks.trim()) return toast.error("Please provide a reason for rejection");

    if (derivedAction === 'pending' && stats.rejected === 0 && stats.approved === 0) {
      onClose();
      return;
    }
    onConfirm(statusToSend, remarks)
    onClose()


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
            {/* Decorative Gradient Background */}
            <div className={`absolute top-0 inset-x-0 h-48 bg-gradient-to-b ${theme.gradient} opacity-50`} />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white opacity-20 blur-3xl rounded-full mix-blend-overlay pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-center justify-between p-8 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Status Update</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-medium text-slate-500">Target User:</p>
                  <div className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                    {userName}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full h-10 w-10 bg-white/50 backdrop-blur hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="relative p-8 pt-2 space-y-8">

              {/* Action Summary (Replaces Tabs) */}
              <div className="flex items-center gap-2 bg-white/60 p-4 rounded-2xl border border-slate-100 shadow-sm backdrop-blur-md">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${theme.bg} text-white shadow-lg`}>
                  <CurrentIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Action</p>
                  <h3 className={`text-lg font-bold ${theme.main}`}>{currentDetails.label}</h3>
                </div>
              </div>

              {/* Description & Inputs */}
              <div className="space-y-4">
                {(derivedAction === 'rejected' || derivedAction === 're-kyc') ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Section Breakdown</p>
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                        {stats.rejected} Rejected, {stats.approved} Approved
                      </span>
                    </div>
                    <div className="bg-slate-50/80 rounded-2xl p-4 space-y-2 border border-slate-100 max-h-[160px] overflow-y-auto custom-scrollbar">
                      {sectionStatus ? Object.entries(sectionStatus).map(([key, status]) => (
                        <div key={key} className="flex items-center justify-between text-sm group">
                          <span className="capitalize text-slate-600 font-medium group-hover:text-slate-900 transition-colors">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${status === 'approved'
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                            : status === 'rejected'
                              ? 'bg-rose-50 border-rose-100 text-rose-600'
                              : 'bg-slate-100 border-slate-200 text-slate-400'
                            }`}>
                            {status === 'approved' && <ShieldCheck className="w-3 h-3" />}
                            {status === 'rejected' && <ShieldAlert className="w-3 h-3" />}
                            <span className="capitalize">{status || 'Pending'}</span>
                          </div>
                        </div>
                      )) : (
                        <p className="text-sm text-slate-500 italic">No section data available</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={cn("p-4 rounded-2xl border bg-white/60", theme.border)}>
                    <div className="flex gap-3">
                      <div className={cn("w-1 h-full absolute left-0 top-0 bottom-0 rounded-l-2xl", theme.bg)} />
                      <div className="space-y-1">
                        <p className={cn("text-xs font-bold uppercase tracking-wider opacity-80", theme.main)}>Summary</p>
                        <p className="text-sm font-medium text-slate-700 leading-relaxed">
                          {currentDetails.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {derivedAction !== 'approved' && (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Admin Remarks</Label>
                    <textarea
                      className={cn(
                        "flex min-h-[100px] w-full rounded-2xl border bg-slate-50/50 px-4 py-3 text-sm transition-all resize-none",
                        "placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:bg-white",
                        theme.border,
                        `focus-visible:${theme.main.replace('text-', 'ring-')}`
                      )}
                      placeholder={derivedAction === 're-kyc' ? "Specify corrections needed..." : "Reason for rejection..."}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 pt-0 flex items-center justify-between gap-4">
              <span className="text-xs font-semibold text-slate-400 pl-1">
                Press <kbd className="font-sans px-1.5 py-0.5 bg-slate-100 rounded-md border border-slate-200">Esc</kbd> to cancel
              </span>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={onClose} className="rounded-xl hover:bg-slate-100 text-slate-500 font-semibold">Cancel</Button>
                <Button
                  className={cn("rounded-xl text-white px-8 font-bold transition-all hover:scale-[1.02] active:scale-[0.98]", theme.bg, theme.shadow)}
                  // Disable update if no decision made (pending)
                  disabled={derivedAction === 'pending'}
                  onClick={handleConfirmAction}
                >
                  {currentDetails.label}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
