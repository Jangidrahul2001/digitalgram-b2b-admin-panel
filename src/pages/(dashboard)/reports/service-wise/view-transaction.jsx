import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Receipt,
  Share2,
  Calendar,
  User,
  Smartphone,
  ShieldCheck,
  Activity,
  FileText,
  CreditCard,
  Zap,
  Tag,
  Layers,
  Microscope,
  Info,
  Printer,
  X
} from "@/components/icons";
import { PageLayout } from "../../../../components/layouts/page-layout";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { TransactionReceipt } from "../../../../components/shared/transaction-receipt";
import { useFetch } from "../../../../hooks/useFetch";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { formatToINR, formatDate } from "../../../../utils/helperFunction";
import { cn } from "../../../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingScreen } from "../../../../components/ui/loading-screen";

// --- Visible Components ---

const DetailItem = ({ label, value, icon: Icon, color = "indigo" }) => {
  const colors = {
    indigo: "text-[#2f35cd] bg-[#2f35cd]/8 border-[#2f35cd]/20",
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-200",
    rose: "text-rose-700 bg-rose-50 border-rose-200",
    amber: "text-amber-700 bg-amber-50 border-amber-200",
    slate: "text-slate-600 bg-slate-100 border-slate-200",
  };
  return (
    <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl transition-all hover:bg-white hover:shadow-sm group border border-slate-100/80 hover:border-slate-200">
      <div className={cn("h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center border shrink-0 transition-all group-hover:scale-105", colors[color])}>
        <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      </div>
      <div className="flex flex-col min-w-0 text-left">
        <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</span>
        <span
          className="text-[10px] sm:text-[12px] font-bold text-slate-800 tracking-tight truncate block"
          title={value || "---"}
        >
          {value || "---"}
        </span>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, subLabel, icon: Icon, variant = "blue" }) => {
  const bgColors = {
    blue: "from-blue-600 to-indigo-800 shadow-blue-500/10",
    emerald: "from-emerald-600 to-teal-700 shadow-emerald-500/10",
    rose: "from-rose-600 to-red-700 shadow-rose-500/10",
    dark: "from-slate-900/90 to-black shadow-slate-900/20",
  };
  return (
    <div className={cn("relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br shadow-md transition-transform hover:-translate-y-0.5 duration-300", bgColors[variant])}>
      <div className="absolute -top-1 -right-1 p-3 opacity-10 text-white">
        <Icon className="w-16 h-16 rotate-12" />
      </div>
      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-2 opacity-80">
          <Icon className="w-3 h-3 text-white" />
          <p className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</p>
        </div>
        <div className="text-left">
          <h3 className="text-xl font-black tracking-tighter tabular-nums leading-none mb-1">{value}</h3>
          <p className="text-[9px] font-bold opacity-70 uppercase tracking-widest line-clamp-1">{subLabel}</p>
        </div>
      </div>
    </div>
  );
};

// --- Page Main ---

export default function TransactionDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const serviceId = searchParams.get("serviceId");

  // Get ID from state instead of params
  const id = location.state?.transactionId;

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const userId = searchParams.get("userId");

  const { data: response, isLoading, error } = useFetch(
    `${apiEndpoints.rechargeReportById}/${id}`,
    {},
    true
  );

  const transaction = React.useMemo(() => {
    if (!response || !response.success) return null;
    const directData = response.data;
    const bodyData = response;
    let candidate = null;
    if (Array.isArray(directData)) {
      candidate = directData;
    } else if (directData && Array.isArray(directData.data)) {
      candidate = directData.data;
    } else if (Array.isArray(bodyData)) {
      candidate = bodyData;
    } else if (typeof directData === 'object' && directData !== null) {
      if (directData._id === id || directData.id === id) return directData;
      candidate = directData;
    }

    if (Array.isArray(candidate)) {
      return candidate.find(t => (String(t._id) === String(id) || String(t.id) === String(id))) || candidate[0];
    }
    if (candidate && typeof candidate === 'object') return candidate;
    return null;
  }, [response, id]);

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!transaction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-10 bg-white rounded-3xl border border-slate-200 max-w-lg mx-auto mt-20 shadow-xl">
        <div className="h-20 w-20 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 mb-6 border border-slate-100 rotate-45">
          <Layers className="w-10 h-10 -rotate-45" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">No Buffer Found</h2>
        <Button onClick={() => navigate(-1)} className="mt-8 rounded-xl h-11 px-8 bg-[#2f35cd] text-white font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">Recall</Button>
      </div>
    );
  }

  const data = {
    amount: formatToINR(transaction?.amount || transaction?.transactionAmount),
    commission: formatToINR(transaction?.commission),
    tds: formatToINR(transaction?.tds),
    status: transaction?.status || "PENDING",
    name: transaction?.fullName || transaction?.name || "N/A",
    userId: transaction?.userName || transaction?.userId || "---",
    mobile: transaction?.mobileNumber || transaction?.mobileNo || "---",
    description: transaction?.description || "---",
    createdAt: transaction?.createdAt ? formatDate(transaction.createdAt) : "---",
    updatedAt: transaction?.updatedAt ? formatDate(transaction.updatedAt) : "---",
    operator: transaction?.operator || transaction?.serviceName || transaction?.service || "---"
  };

  const statusType = data.status.toLowerCase() === 'success' || data.status.toLowerCase() === 'active' ? 'success' :
    data.status.toLowerCase() === 'failed' || data.status.toLowerCase() === 'inactive' ? 'failed' : 'warning';

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard", {
      description: "Transaction details link is ready to share.",
      icon: <Share2 className="w-4 h-4 text-indigo-500" />,
    });
  };

  const receiptData = {
    id: transaction._id || transaction.id || id,
    amount: data.amount,
    status: data.status,
    date: data.createdAt.split(' ')[0],
    userId: data.userId,
    name: data.name,
    operatorMobile: `${data.operator} / ${data.mobile}`,
    commission: data.commission,
    tds: data.tds,
    description: data.description,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };

  return (
    <PageLayout
      title="Transaction Detail"
      subtitle="Universal settlement audit"
      showBackButton={true}
      actions={
        <div className="flex items-center gap-3">
          <Button onClick={handleShare} variant="outline" className="rounded-lg h-9 px-4 font-black text-[10px] text-slate-600 uppercase tracking-widest border-slate-200 hover:bg-slate-50 shadow-sm transition-all active:scale-95">
            <Share2 className="w-3.5 h-3.5 mr-2" /> Share
          </Button>
          <Button onClick={() => setIsReceiptModalOpen(true)} className="rounded-lg h-9 px-6 bg-[#2f35cd] text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/10 active:scale-95 transition-all">
            <Receipt className="w-3.5 h-3.5 mr-2" /> Receipt
          </Button>
        </div>
      }
    >
      <div className="w-full pb-20 space-y-5">

        {/* --- DYNAMIC HEADER TILES --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Amount" value={data.amount} subLabel="Recharge Value" icon={CreditCard} variant="dark" />
          <MetricCard label="Status" value={data.status} subLabel="Current Pool" icon={Activity} variant={statusType === 'success' ? "emerald" : statusType === 'failed' ? "rose" : "blue"} />
          <MetricCard label="Commission" value={data.commission} subLabel="Yield Earnt" icon={Zap} variant="blue" />
          <MetricCard label="TDS" value={data.tds} subLabel="Regulatory Tax" icon={ShieldCheck} variant="rose" />
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="w-full">
          <Card className="border border-slate-100 bg-white shadow-xs rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/10">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-[#2f35cd] rounded-lg flex items-center justify-center text-white shadow-sm">
                  <Microscope className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Transaction Audit</h3>
                  <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest text-left">Verified Log Information</p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                <DetailItem label="Date" value={data.createdAt.split(' ')[0]} icon={Calendar} color="indigo" />
                <DetailItem label="User ID" value={data.userId} icon={Tag} color="indigo" />
                <DetailItem label="Name" value={data.name} icon={User} color="indigo" />
                <DetailItem label="Operator / Mobile" value={`${data.operator} / ${data.mobile}`} icon={Smartphone} color="indigo" />
                <DetailItem label="Recharge Amount" value={data.amount} icon={CreditCard} color="indigo" />
                <DetailItem label="Commission" value={data.commission} icon={Zap} color="indigo" />
                <DetailItem label="TDS" value={data.tds} icon={ShieldCheck} color="rose" />
                <DetailItem label="Status" value={data.status} icon={Activity} color={statusType === 'success' ? "emerald" : "rose"} />
                <DetailItem label="Description" value={data.description} icon={FileText} color="slate" />
              </div>
            </div>
          </Card>
        </div>

        {/* --- SYSTEM FOOTER --- */}
        <div className="flex flex-col items-center gap-4 py-8 opacity-20 no-print">
          <div className="h-[1px] w-12 bg-slate-500" />
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-900">Secure Access Point</p>
        </div>

        {/* --- PROFESSIONAL RECEIPT MODAL --- */}
        {isReceiptModalOpen && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[99999] flex items-end justify-center p-4 sm:p-6 no-print">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReceiptModalOpen(false)}
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-md"
            />
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="bg-white w-full max-w-[480px] max-h-[90vh] sm:max-h-[85vh] rounded-t-[2.5rem] sm:rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden relative mb-0 sm:mb-8 flex flex-col"
            >
              <TransactionReceipt
                data={receiptData}
                onClose={() => setIsReceiptModalOpen(false)}
              />
            </motion.div>
          </div>,
          document.body
        )}

        {/* Hidden Print Wrapper (For window.print detection) */}
        <div className="hidden print:block print-receipt-wrapper">
          <TransactionReceipt data={receiptData} />
        </div>

      </div>
    </PageLayout>
  );
}
