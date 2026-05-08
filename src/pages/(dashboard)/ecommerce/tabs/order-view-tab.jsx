import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  User,
  IndianRupee,
  MapPin,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  X,
  CreditCard,
  MoveLeft,
  Sparkles,
  BoxSelect,
  ReceiptText,
  BadgeCheck,
  AlertCircle,
  ChevronRight,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useFetch } from "../../../../hooks/useFetch";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { formatDate } from "../../../../utils/helperFunction";
import { usePatch } from "../../../../hooks/usePatch";
import { toast } from "sonner";
import { handleValidationError } from "../../../../utils/helperFunction";
import { copyToClipboard } from "../../../../lib/export-utils";

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Pending: {
    color: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    pulse: true,
  },
  Processing: {
    color: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    pulse: true,
  },
  Completed: {
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    pulse: false,
  },
  Cancelled: {
    color: "bg-rose-100 text-rose-700 border-rose-200",
    dot: "bg-rose-400",
    pulse: false,
  },
};

// ── Timeline steps ────────────────────────────────────────────────────────────
const TIMELINE = [
  { key: "placed", label: "Order Placed", icon: ReceiptText, always: true },
  {
    key: "processing",
    label: "Processing",
    icon: Package,
    status: "Processing",
  },
  { key: "shipped", label: "Shipped", icon: Truck, status: "Shipped" },
  {
    key: "completed",
    label: "Delivered",
    icon: BadgeCheck,
    status: "Completed",
  },
];

function getTimelineState(currentStatus, stepStatus) {
  const order = ["pending", "processing", "shipped", "delivered"];
  if (!stepStatus) return "done";
  const currentIdx = order.indexOf(currentStatus);
  const stepIdx = order.indexOf(stepStatus);
  if (currentStatus === "cancelled")
    return stepIdx === 0 ? "done" : "cancelled";
  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "active";
  return "upcoming";
}

// ── Small helper components ───────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase border ${cfg.color}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${cfg.pulse ? "animate-pulse" : ""}`}
      />
      {status}
    </span>
  );
}

function SectionCard({
  icon: Icon,
  title,
  iconBg = "bg-slate-100",
  iconColor = "text-slate-500",
  children,
  className = "",
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${className}`}
    >
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-50">
        <div
          className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}
        >
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

function InfoRow({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span
        className={`text-sm font-semibold ${accent ? "text-indigo-600 text-base" : "text-slate-800"}`}
      >
        {value}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function OrderViewTab({ orderId, handleTabChange }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [order, setOrder] = useState({});
  const [currentStatus, setCurrentStatus] = useState("processing");
  const [copied, setCopied] = useState(false);

  const { refetch: fetchOrderById } = useFetch(
    `${apiEndpoints.fetchOrderById}/${orderId}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setOrder(data.data);
          setCurrentStatus(data.data?.orderStatus || "processing");
        }
      },
      onError: (error) => {
        toast.error(handleValidationError(error) || "Failed to fetch Order");
      },
    },
    false,
  );

  const { patch: updateStatus } = usePatch({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Status updated successfully");
        fetchOrderById();
        setIsUpdating(false);
      }
    },
    onError: (error) => {
      console.error("Error updating status:", error);
      toast.error(handleValidationError(error) || "Something went wrong");
      setIsUpdating(false);
    },
  });

  useEffect(() => {
    if (orderId) {
      fetchOrderById();
    }
  }, [fetchOrderById, orderId]);

  if (!order?._id) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
          <ShoppingCart className="w-7 h-7 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-700">No Order Selected</h3>
        <p className="text-sm text-slate-400 mt-1 mb-5">
          Please select an order from the list
        </p>
        <Button
          onClick={() => handleTabChange("order_list")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5"
        >
          Return to Orders
        </Button>
      </div>
    );
  }

  const txnId = order.transactionId || "TXNIDX676";

  const handleUpdateStatus = (newStatus) => {
    if (isUpdating || newStatus === currentStatus) return;
    setIsUpdating(true);
    updateStatus(`${apiEndpoints.updateOrderStatus}/${order._id}`, {
      orderStatus: newStatus,
    });
  };

  const handleCopy = () => {
    copyToClipboard(txnId, "Transaction ID copied").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleTabChange("order_list")}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center transition-all shadow-sm group"
          >
            <MoveLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Order Details
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                Order
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(order?.createdAt) || ""}
              </span>
            </div>
          </div>
        </div>
        <StatusBadge status={currentStatus} />
      </div>

      {/* ── Order Timeline ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-4 right-4 top-4 h-0.5 bg-slate-100 z-0" />
          <div
            className="absolute left-4 top-4 h-0.5 bg-indigo-400 z-0 transition-all duration-700"
            style={{
              width:
                currentStatus === "cancelled"
                  ? "0%"
                  : currentStatus === "pending"
                    ? "0%"
                    : currentStatus === "processing"
                      ? "33%"
                      : currentStatus === "shipped"
                        ? "66%"
                        : "100%",
            }}
          />
          {TIMELINE.map((step, i) => {
            const state = getTimelineState(currentStatus, step.status);
            const Icon = step.icon;
            return (
              <div
                key={step.key}
                className="flex flex-col items-center gap-2 z-10 flex-1"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500
                  ${
                    state === "done"
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : state === "active"
                        ? "bg-white border-indigo-500 text-indigo-600 shadow-[0_0_0_4px_rgba(99,102,241,0.12)]"
                        : state === "cancelled"
                          ? "bg-slate-100 border-slate-200 text-slate-300"
                          : "bg-white border-slate-200 text-slate-300"
                  }`}
                >
                  {state === "done" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span
                  className={`text-[11px] font-semibold text-center leading-tight
                  ${
                    state === "done"
                      ? "text-indigo-600"
                      : state === "active"
                        ? "text-slate-800"
                        : "text-slate-300"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols */}
        <div className="lg:col-span-2 space-y-5">
          {/* Order Items */}
          <SectionCard
            icon={ShoppingCart}
            title="Items in this Order"
            iconBg="bg-indigo-50"
            iconColor="text-indigo-500"
          >
            <div className="p-6">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden flex-shrink-0 shadow-sm">
                  <img
                    src={`${import.meta.env.VITE_API_URL}${order?.p?.productImageUrl}`}
                    alt={order?.p?.name || "product"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full mb-1.5">
                        <Sparkles className="w-2.5 h-2.5" /> Physical Good
                      </span>
                      <h4 className="text-base font-bold text-slate-900">
                        {order?.p?.name || "Unknown Product"}
                      </h4>
                      <p className="text-sm text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {order?.p?.description || "Unknown Product"}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-slate-900">
                        ₹{order?.p?.priceAfterDiscount}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">per unit</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <BoxSelect className="w-3 h-3" />
                      Qty:{" "}
                      <span className="text-slate-800 font-bold">
                        {order.quantity || 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                      <CheckCircle2 className="w-3 h-3" /> Verified & Sealed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Payment Summary */}
          <SectionCard
            icon={IndianRupee}
            title="Payment Summary"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-500"
          >
            <div className="px-6 py-2">
              <InfoRow
                label="Subtotal"
                value={`₹${order?.p?.priceAfterDiscount * order.quantity}`}
              />
              <InfoRow
                label="Shipping"
                value={`₹${order.shippingCharge || 0}`}
              />
              <InfoRow label="Tax" value={`₹${order.gst || 0}`} />
              <div className="flex items-center justify-between py-4">
                <span className="text-sm font-bold text-slate-800">
                  Total Amount
                </span>
                <span className="text-xl font-black text-indigo-600">
                  ₹{order.grandTotal}
                </span>
              </div>
            </div>

            {/* Payment method row */}
            <div className="mx-6 mb-6 rounded-xl bg-gradient-to-r from-slate-50 to-slate-50/60 border border-slate-100 p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 bg-gradient-to-br from-blue-600 to-blue-800 rounded-md flex items-center justify-center shadow-sm">
                  <span className="text-white text-[9px] font-black tracking-widest">
                    VISA
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">
                    Payment Method
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    •••• •••• •••• 4242
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 font-medium mb-0.5">
                  Transaction ID
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-semibold text-slate-700">
                    {txnId}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                    title="Copy"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Customer Details */}
          <SectionCard
            icon={User}
            title="Customer Details"
            iconBg="bg-violet-50"
            iconColor="text-violet-500"
          >
            <div className="p-5">
              {/* Avatar row */}
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-50">
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-600 text-base shadow-sm">
                    {order.fullName
                      ? order.fullName.charAt(0).toUpperCase()
                      : "N"}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {order.fullName || "N/A"}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {order.email || "N/A"}
                  </p>
                </div>
                <button className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-indigo-50 hover:border-indigo-200 transition-colors group">
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-500" />
                </button>
              </div>

              {/* Address */}
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <MapPin className="w-3 h-3 text-rose-400" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Shipping Address
                  </span>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {order?.shippingAddress?.name || ""},<br />
                    {order?.shippingAddress?.address || ""},<br />
                    {order?.shippingAddress?.city || ""},
                    {order?.shippingAddress?.state || ""}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Update Status */}
          <SectionCard
            icon={Truck}
            title="Update Status"
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
          >
            <div className="p-5 space-y-2.5">
              {/* Current status indicator */}
              <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100 mb-4">
                <span className="text-xs text-slate-500 font-medium">
                  Current Status
                </span>
                <StatusBadge status={currentStatus} />
              </div>

              {currentStatus === "shipped" && (
                <button
                  onClick={() => handleUpdateStatus("delivered")}
                  disabled={isUpdating}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-200 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-semibold text-emerald-700">
                      Mark as delivered
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}

              {currentStatus === "processing" && (
                <button
                  onClick={() => handleUpdateStatus("shipped")}
                  disabled={isUpdating}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-blue-100 bg-blue-50 hover:bg-blue-100 hover:border-blue-200 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold text-blue-700">
                      Mark as Shipped
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}

              {currentStatus !== "cancelled" &&
                currentStatus !== "delivered" && (
                  <button
                    onClick={() => handleUpdateStatus("cancelled")}
                    disabled={isUpdating}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-rose-100 bg-rose-50 hover:bg-rose-100 hover:border-rose-200 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2.5">
                      <X className="w-4 h-4 text-rose-400" />
                      <span className="text-sm font-semibold text-rose-600">
                        Cancel Order
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-rose-300 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}

              {isUpdating && (
                <div className="flex items-center justify-center gap-2 py-2 text-xs text-slate-400">
                  <div className="w-3 h-3 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
                  Updating status...
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
