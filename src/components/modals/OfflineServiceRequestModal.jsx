import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Image, ExternalLink, Download } from "@/components/icons";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { useFetch } from "../../hooks/useFetch";
import { apiEndpoints } from "../../api/apiEndpoints";
import { cn } from "../../lib/utils";

const OfflineServiceRequestModal = ({ isOpen, onClose, requestId }) => {
  const [requestData, setRequestData] = useState({});

  const { refetch: fetchOfflineServiceRequestData } = useFetch(
    `${apiEndpoints.fetchOfflineServiceRequestData}/${requestId}`,
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          setRequestData(data?.data);
        }
      },
      onError: (error) => {
        console.error("Failed to fetch service details", error);
      },
    },
    false,
  );

  useEffect(() => {
    if (requestId && isOpen) fetchOfflineServiceRequestData();
  }, [requestId, isOpen]);

  if (typeof document === "undefined") return null;

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
            initial={{ scale: 0.9, opacity: 0}}
            animate={{ scale: 1, opacity: 1}}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative z-10 w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden ring-1 ring-black/5 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="relative px-8 py-6 border-b border-slate-100 bg-white shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">
                      Request Details
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                        Offline Service
                      </span>
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                        ID: #{requestId?.toString().substring(0, 8)}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full h-10 w-10 hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30 space-y-8 custom-scrollbar">
              {/* Field Data Section */}
              {requestData?.fieldData?.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Submission Details
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requestData.fieldData.map((field) => (
                      <div
                        key={field.fieldId}
                        className="bg-white p-5 rounded-[1.5rem] border border-slate-200/60 shadow-sm hover:border-slate-300/80 transition-all group"
                      >
                        <Label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2 px-0.5">
                          {field.label}
                        </Label>
                        <div className="text-[15px] font-bold text-slate-800 wrap-break-word line-clamp-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100 group-hover:bg-white transition-colors">
                          {field.value || "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Documents Section */}
              {requestData?.documentData?.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Required Documents
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requestData.documentData.map((doc) => {
                      const isPdf = doc.fileUrl?.toLowerCase().endsWith(".pdf");
                      const fullUrl = `${import.meta.env.VITE_API_URL}${doc.fileUrl}`;

                      return (
                        <div
                          key={doc.documentId}
                          className="bg-white p-5 rounded-[1.5rem] border border-slate-200/60 shadow-sm overflow-hidden"
                        >
                          <Label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-3 px-0.5">
                            {doc.label}
                          </Label>

                          <div className="relative group aspect-video rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all hover:border-indigo-400">
                            {isPdf ? (
                              <div className="flex flex-col items-center gap-3 p-6 text-center">
                                <div className="h-14 w-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-sm">
                                  <FileText className="w-8 h-8" />
                                </div>
                                <span className="text-xs font-bold text-slate-600">PDF Document</span>
                              </div>
                            ) : (
                              <img
                                src={fullUrl}
                                alt={doc.label}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => {
                                  e.target.src = "https://placehold.co/400x300?text=File+Not+Found";
                                }}
                              />
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                              <a
                                href={fullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-10 px-4 rounded-xl bg-white text-slate-900 text-xs font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-xl"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                View Full
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Verification required before approval
              </span>
              <Button
                onClick={onClose}
                className="rounded-xl px-8 bg-slate-900 text-white font-bold h-11 shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95"
              >
                Done
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default OfflineServiceRequestModal;
