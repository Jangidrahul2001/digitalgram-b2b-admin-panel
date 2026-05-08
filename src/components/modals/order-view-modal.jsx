import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Hash, Activity, ShoppingCart, User, IndianRupee, MapPin } from "lucide-react";
import { Button } from "../ui/button";

// Elegant Details Modal for Ecommerce Orders
export function OrderViewModal({ isOpen, onClose, order, clickPosition, onStatusChange }) {
  if (!order || typeof document === 'undefined') return null;

  const [isUpdating, setIsUpdating] = useState(false);

  const displayStatus = (status) => {
    let colorClass = "bg-slate-100 text-slate-600";
    if (status === "Completed") colorClass = "bg-emerald-100 text-emerald-700 font-semibold";
    if (status === "Pending") colorClass = "bg-amber-100 text-amber-700 font-semibold";
    if (status === "Processing") colorClass = "bg-blue-100 text-blue-700 font-semibold";
    if (status === "Cancelled") colorClass = "bg-rose-100 text-rose-700 font-semibold";

    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] tracking-wider uppercase ${colorClass}`}>
        {status}
      </span>
    );
  };

  const handleUpdateStatus = (newStatus) => {
    setIsUpdating(true);
    // Simulate an API delay
    setTimeout(() => {
      onStatusChange(order.id, newStatus);
      setIsUpdating(false);
      onClose(); // Optional: Close modal after updating, or stay open
    }, 400);
  };

  // Calculate the exact origin coordinates of the click, relative to the viewport
  const originStyle = clickPosition?.x && clickPosition?.y
    ? { transformOrigin: `${clickPosition.x}px ${clickPosition.y}px` }
    : { transformOrigin: 'center center' };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              style={originStyle}
              initial={{ opacity: 0, scale: 0.1, y: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25, duration: 0.35 }}
              className="w-full max-w-3xl max-h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto border border-slate-100"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner ring-1 ring-indigo-100/50">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Order Summary</h3>
                    <p className="text-sm text-slate-500 font-medium mt-0.5 flex items-center gap-2">
                      OrderID: <span className="text-slate-700 font-mono tracking-wider">#{order.id}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      {displayStatus(order.status)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 shrink">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Details Card */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <User className="w-4 h-4 text-indigo-500" />
                      <h4 className="text-sm font-bold text-slate-800 tracking-wide">CUSTOMER INFO</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 mt-1">Name</p>
                        <p className="text-[15px] font-semibold text-slate-900">{order.user || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 mt-1">Shipping Details</p>
                        <p className="text-[13px] text-slate-600 leading-relaxed flex items-start gap-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                          No shipping address provided for this order yet.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Details Card */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <ShoppingCart className="w-4 h-4 text-emerald-500" />
                      <h4 className="text-sm font-bold text-slate-800 tracking-wide">ORDER DETAILS</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Product</p>
                          <p className="text-[14px] font-semibold text-slate-800">{order.product || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Quantity</p>
                          <p className="text-[15px] font-mono font-bold text-slate-800 bg-slate-100 inline-flex px-2 py-0.5 rounded-md">{order.quantity || 0}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-50">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Ordered At
                        </p>
                        <p className="text-sm font-medium text-slate-700 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 inline-flex">
                          {order.orderAt || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total & Action Status Strip */}
                <div className="mt-6 bg-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-slate-900/10">
                  <div className="flex items-center gap-6">
                    <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
                      <IndianRupee className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                      <p className="text-2xl font-bold tracking-tight text-white flex items-center">
                        {order.total}
                      </p>
                    </div>
                  </div>

                  <div className="w-full md:w-auto p-4 md:p-0 bg-white/5 md:bg-transparent rounded-xl border border-white/5 md:border-none flex flex-col items-start md:items-end gap-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Update Order Status</p>
                    <div className="flex flex-wrap gap-2">
                      {order.status !== "Completed" && (
                        <button
                          onClick={() => handleUpdateStatus("Completed")}
                          disabled={isUpdating}
                          className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-300 hover:text-emerald-200 text-sm font-semibold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2 group"
                        >
                          {isUpdating ? <Activity className="w-4 h-4 animate-spin" /> : <Hash className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />}
                          Mark Completed
                        </button>
                      )}
                      {order.status !== "Processing" && (
                        <button
                          onClick={() => handleUpdateStatus("Processing")}
                          disabled={isUpdating}
                          className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 text-blue-300 hover:text-blue-200 text-sm font-semibold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2 group"
                        >
                          {isUpdating ? <Activity className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />}
                          Process Order
                        </button>
                      )}
                      {order.status !== "Cancelled" && (
                        <button
                          onClick={() => handleUpdateStatus("Cancelled")}
                          disabled={isUpdating}
                          className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 hover:border-rose-500/50 text-rose-300 hover:text-rose-200 text-sm font-semibold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2 group"
                        >
                          {isUpdating ? <Activity className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />}
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
