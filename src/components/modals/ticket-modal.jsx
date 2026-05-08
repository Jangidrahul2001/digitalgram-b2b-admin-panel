import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Hash,
  Activity,
  CreditCard,
  MessageSquare,
  CornerDownRight,
} from "lucide-react";
import { apiEndpoints } from "../../api/apiEndpoints";
import { useFetch } from "../../hooks/useFetch";
import { toast } from "sonner";
import {
  formatDate,
  handleValidationError,
} from "../../utils/helperFunction";
import { cn } from "../../lib/utils";

export function TicketModal({ isOpen, onClose, ticketId }) {
  const [ticket, setTicket] = useState();

  const { refetch: fetchTicket } = useFetch(
    `${apiEndpoints.fetchSupportTicketById}/${ticketId}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setTicket(data.data);
        }
      },
      onError: (error) => {
        toast.error(
          handleValidationError(error) || "Failed to fetch ticket details"
        );
      },
    },
    ticketId !== "",
  );

  if (!ticket || typeof document === "undefined") return null;

  const displayStatus = (status) => {
    const statusLower = status?.toLowerCase() || "";
    const styles = {
      pending: "bg-amber-50 text-amber-600 border-amber-100",
      resolved: "bg-emerald-50 text-emerald-600 border-emerald-100",
      closed: "bg-slate-50 text-slate-500 border-slate-100",
    };

    return (
      <span className={cn(
        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] border",
        styles[statusLower] || styles.closed
      )}>
        {status}
      </span>
    );
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-slate-950/20 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="w-full max-w-xl bg-white rounded-[2rem] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.15)] overflow-hidden pointer-events-auto border border-slate-100 flex flex-col"
            >
              {/* Minimal Header */}
              <div className="px-8 pt-8 pb-6 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] bg-amber-50 px-2 py-0.5 rounded-md">
                      Support Ticket
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      #{ticket?.ticketId}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    Request Details
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-90 border border-slate-100/50 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Minimal Body */}
              <div className="px-8 pb-8 space-y-8 flex-1 overflow-y-auto">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-8 border-y border-slate-100/80 py-8">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Hash className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Service Node</span>
                    </div>
                    <p className="text-[14px] font-bold text-slate-900 pl-5 uppercase tracking-tight">
                      {ticket?.serviceName || "N/A"}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Activity className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Resolution</span>
                    </div>
                    <div className="pl-5">
                      {displayStatus(ticket?.status)}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-400">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Ref ID</span>
                    </div>
                    <p className="text-[13px] font-bold text-slate-500 font-mono pl-5 truncate" title={ticket?.transactionId}>
                      {ticket?.transactionId || "N/A"}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Logged At</span>
                    </div>
                    <p className="text-[13px] font-bold text-slate-900 pl-5">
                      {formatDate(ticket?.createdAt) || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Message Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">User Message</span>
                  </div>
                  <div className="relative group pl-5">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-100 rounded-full group-hover:bg-amber-200 transition-colors"></div>
                    <div className="text-[14px] text-slate-600 leading-relaxed font-medium">
                      {ticket?.supportDetails || "No additional message provided for this ticket."}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Admin Remark</span>
                  </div>
                  <div className="relative group pl-5">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-100 rounded-full group-hover:bg-amber-200 transition-colors"></div>
                    <div className="text-[14px] text-slate-600 leading-relaxed font-medium">
                      {ticket?.adminRemark || "---"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-8 py-6 bg-slate-50/50 flex justify-end items-center gap-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic mr-auto">
                  Global Support Core
                </span>
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-slate-900 hover:bg-black text-white text-[12px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-slate-900/10 transition-all active:scale-95 cursor-pointer leading-none"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
