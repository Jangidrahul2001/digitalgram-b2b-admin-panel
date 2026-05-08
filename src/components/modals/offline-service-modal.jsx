import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Settings,
  ClipboardList,
  Check,
  FileText,
  IndianRupee,
  Image as ImageIcon,
} from "@/components/icons";
import { apiEndpoints } from "../../api/apiEndpoints";
import { useFetch } from "../../hooks/useFetch";
import { toast } from "sonner";
import { handleValidationError } from "../../utils/helperFunction";
import { cn } from "../../lib/utils";

export function OfflineServiceModal({ isOpen, onClose, serviceId }) {
  const [service, setService] = useState();

  const { refetch: fetchService } = useFetch(
    `${apiEndpoints.fetchOfflineServiceById}/${serviceId}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setService(data.data);
        }
      },
      onError: (error) => {
        toast.error(
          handleValidationError(error) || "Failed to fetch service details",
        );
      },
    },
    false,
  );

  useEffect(() => {
    if (isOpen && serviceId) fetchService();
  }, [isOpen, serviceId]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", duration: 0.2, bounce: 0.2 }}
          className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50 bg-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-50 rounded-xl text-orange-500 border border-orange-100">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest">
                  Service Intelligence
                </h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">
                  Offline Configuration Details
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all border border-slate-200 active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-white custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Name Details */}
              <div className="space-y-5">
                <div className="relative group">
                  <div className="absolute -inset-px rounded-2xl bg-slate-200/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative p-5 rounded-2xl bg-white space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5 opacity-80">
                      <div className="w-1 h-3 rounded-full bg-orange-200" />
                      Core Identification
                    </label>
                    <p className="text-[15px] font-extrabold text-slate-800 leading-tight uppercase tracking-wide">
                      {service?.serviceName || "Untitled Service"}
                    </p>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-px rounded-2xl bg-emerald-100/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative p-5 rounded-2xl bg-emerald-50/10 space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                      <div className="w-1 h-3 rounded-full bg-orange-200" />
                      Financial Valuation
                    </label>
                    <div className="flex items-end gap-1">
                      <span className="text-[14px] font-black text-slate-600 mb-1">₹</span>
                      <p className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                        {service?.amount || "0"}
                        <span className="text-slate-400 text-sm font-bold">.00</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Preview */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">
                  Visual Identity
                </label>
                <div className="relative group aspect-video rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
                  {service?.serviceImageUrl ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}${service.serviceImageUrl}`}
                      alt={service.serviceName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-300">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-[10px] uppercase font-bold tracking-widest">No Image Asset</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description Block */}
            <div className="space-y-3 p-5 rounded-2xl bg-slate-50/50 border border-slate-100 italic">
              <div className="flex items-center gap-2 mb-1 px-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Service Narrative
                </span>
              </div>
              <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                {service?.description || "No service narrative provided for this offline offering."}
              </p>
            </div>

            <div className="h-px bg-slate-100 w-full" />

            {/* Requirements Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <h4 className="text-[13px] font-extrabold text-slate-800 uppercase tracking-widest">
                  Validation Requirements
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-1">
                {/* Documents Required */}
                <div className="space-y-4">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest inline-block border-b border-slate-100 pb-1 w-full">
                    Required Artifacts
                  </span>
                  <div className="space-y-2.5">
                    {service?.requiredDocuments?.length > 0 ? (
                      service.requiredDocuments.map((doc) => (
                        <div key={doc?._id} className="flex items-center gap-3 group">
                          <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-white shrink-0 shadow-sm transition-transform group-hover:scale-110">
                            <Check className="w-2.5 h-2.5 stroke-[4]" />
                          </div>
                          <p className="text-[12px] font-bold text-slate-700">{doc.label}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-[12px] text-slate-400 italic">No specific documents listed.</p>
                    )}
                  </div>
                </div>

                {/* Fields Required */}
                <div className="space-y-4">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest inline-block border-b border-slate-100 pb-1 w-full">
                    Structured Data Points
                  </span>
                  <div className="space-y-2.5">
                    {service?.requiredFields?.length > 0 ? (
                      service.requiredFields.map((field) => (
                        <div key={field?._id} className="flex items-center gap-3 group">
                          <div className="w-5 h-5 rounded-md border-2 border-slate-200 flex items-center justify-center text-slate-200 shrink-0 group-hover:border-slate-800 group-hover:text-slate-800 transition-colors">
                            <div className="w-1.5 h-1.5 rounded-full bg-current" />
                          </div>
                          <p className="text-[12px] font-bold text-slate-700">{field?.label}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-[12px] text-slate-400 italic">No data fields required.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 5px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(15, 23, 42, 0.05);
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(15, 23, 42, 0.1);
            }
          `}</style>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
