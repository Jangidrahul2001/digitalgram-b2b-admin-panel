import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, CheckCircle2 } from "@/components/icons";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Select } from "../ui/select";
import { cn } from "../../lib/utils";

export default function OfflineServiceRequestStatusChangeModal({
  isOpen,
  onClose,
  onConfirm,
  requestId,
}) {
  const [selectedStatus, setSelectedStatus] = useState("processing");
  const [remarks, setRemarks] = useState("");

  const statusOptions = [
    {
      value: "processing",
      label: "Processing",
      icon: Clock,
      color: "bg-blue-600 hover:bg-blue-700",
      description: "Request is being processed by the team.",
    },
    {
      value: "completed",
      label: "Completed",
      icon: CheckCircle2,
      color: "bg-emerald-600 hover:bg-emerald-700",
      description: "Request has been successfully completed.",
    },
  ];

  const currentDetails = statusOptions.find((s) => s.value === selectedStatus);
  const CurrentIcon = currentDetails.icon;

  const theme = {
    processing: {
      main: "text-blue-600",
      bg: "bg-blue-500",
      border: "border-blue-200",
      shadow: "shadow-blue-500/25",
      gradient: "from-blue-500/20 to-blue-500/0",
    },
    completed: {
      main: "text-emerald-600",
      bg: "bg-emerald-500",
      border: "border-emerald-200",
      shadow: "shadow-emerald-500/25",
      gradient: "from-emerald-500/20 to-emerald-500/0",
    },
  }[selectedStatus];

  const handleConfirm = () => {
    onConfirm(selectedStatus, remarks);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
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
            <div
              className={cn(
                "absolute top-0 inset-x-0 h-48 bg-gradient-to-b opacity-50 transition-colors duration-500",
                theme.gradient
              )}
            />

            <div className="relative flex items-center justify-between p-8 pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Update Status
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Offline Service Request
                </p>
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

            <div className="relative p-8 pt-2 space-y-6">
              <div className="space-y-2.5">
                <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  Select Status
                </Label>
                <Select
                  options={statusOptions}
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  placeholder="Choose status"
                  searchable={false}
                  className="h-12 rounded-2xl border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm"
                />
              </div>

              <div className="flex items-center gap-4 bg-white/80 p-5 rounded-3xl border border-slate-100 shadow-sm backdrop-blur-md transition-all duration-500">
                <div
                  className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all duration-500 scale-100 group-hover:scale-110",
                    theme.bg,
                    theme.shadow
                  )}
                >
                  <CurrentIcon className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                    Action Result
                  </p>
                  <h3 className={cn("text-xl font-black tracking-tight", theme.main)}>
                    {currentDetails.label}
                  </h3>
                </div>
              </div>

              <div
                className={cn(
                  "p-5 rounded-[1.5rem] border bg-white/60 relative overflow-hidden transition-all duration-500",
                  theme.border,
                )}
              >
                <div className="flex gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={cn("h-1.5 w-1.5 rounded-full", theme.bg)} />
                      <p className={cn("text-[10px] font-black uppercase tracking-widest opacity-80", theme.main)}>
                        Update Summary
                      </p>
                    </div>
                    <p className="text-[13px] font-bold text-slate-600 leading-relaxed pl-3.5">
                      {currentDetails.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                  Internal Remarks
                </Label>
                <div className="relative">
                  <textarea
                    className={cn(
                      "flex min-h-[110px] w-full rounded-[1.5rem] border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-bold transition-all resize-none custom-scrollbar",
                      "placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-4 focus:ring-offset-0 focus:bg-white focus:border-slate-300",
                      `focus:ring-${selectedStatus === 'processing' ? 'blue' : selectedStatus === 'completed' ? 'emerald' : 'red'}-500/5`,
                    )}
                    placeholder="Add detailed remarks about this status change..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="p-8 pt-0 flex items-center justify-between rounded gap-4">
              <span className="text-xs font-semibold text-slate-400 pl-1">
                Press{" "}
                <kbd className="font-sans px-1.5 py-0.5 bg-slate-100 rounded-md border border-slate-200">
                  Esc
                </kbd>{" "}
                to cancel
              </span>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="rounded-xl px-6 h-11 hover:bg-slate-100 text-slate-500 font-bold transition-all"
                >
                  Cancel
                </Button>
                <Button
                  className={cn(
                    "rounded-xl text-white px-8 h-11 font-black tracking-tight transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg",
                    currentDetails.color,
                    theme.shadow,
                  )}
                  onClick={handleConfirm}
                >
                  Update Now
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

