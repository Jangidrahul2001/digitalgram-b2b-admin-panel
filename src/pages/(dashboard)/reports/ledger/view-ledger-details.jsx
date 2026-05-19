import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Clock,
  IndianRupee,
  User,
  Hash,
  Copy,
  Terminal,
  Activity,
  Download,
  ShieldCheck,
  Phone,
  Mail,
  ExternalLink,
  Globe,
  Monitor,
  Cpu,
  ArrowDownLeft,
  ArrowUpRight,
  Zap,
  FileText
} from "lucide-react";
import { PageLayout } from "../../../../components/layouts/page-layout";
import { Button } from "../../../../components/ui/button";
import { DataTable } from "../../../../components/tables/data-table";
import { cn } from "../../../../lib/utils";
import { toast } from "sonner";
import { useFetch } from "../../../../hooks/useFetch";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { formatToINR, formatDate } from "../../../../utils/helperFunction";

const TXN_DATA = {
  id: "8",
  amount: 948.00,
  status: "FAILED",
  txnType: "REFUND",
  serviceCategory: "UTILITY BILLS",
  date: "2026-03-10 10:05:57",
  details: {
    user: "User Name",
    txnType: "REFUND",
    service: "BBPS_JVVNL0000RAJ01",
    amount: 948.00,
    openingBalance: 2109.61,
    closingBalance: 3057.61,
    commission: 0.25,
    charges: 0.00,
    gst: 0.00,
    tds: 0.00,
    netAmount: 0.00,
    referenceId: "FUTS98DRD351O27C7Z570XM14V482611025",
    clientRefId: "N/A",
    utrNumber: "N/A",
    refund: "YES",
    remark: "BBPS Failed Refund",
    message: "Failed"
  },
  bbpsDetails: {
    txnRef: "REF-008123",
    requestId: "FUTS98DRD351O27C7Z570XM14V482611025",
    billerId: "JVVNL0000RAJ01",
    billAmount: 948.00,
    finalAmount: 0.00,
    status: "FAILED",
    error: "Provider Timeout"
  },
  flow: [
    { label: "Request Processed", status: "success", time: "10:05:50 AM" },
    { label: "Wallet Debited", status: "success", time: "10:05:52 AM" },
    { label: "Provider Timeout", status: "error", time: "10:05:57 AM" },
    { label: "Auto Refund Done", status: "success", time: "10:05:59 AM" }
  ],
  apiRequest: {
    plainText: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\r\n<billPaymentRequest>\r\n  <agentId>CC01RP68AGTBAA004669</agentId>\r\n  <billerAdhoc>true</billerAdhoc>\r\n  <agentDeviceInfo>\r\n  <requestId>FUTS98DRD351O27C7Z570XM14V482611025</requestId>\r\n</billPaymentRequest>",
    requestId: "FUTS98DRD351O27C7Z570XM14V482611025"
  },
  apiResponse: {
    responsecode: "204",
    errorInfo: {
      error: {
        errorcode: "E210",
        errormessage: "No fetch data found for given ref id."
      }
    }
  }
};


// --- Sub-Components ---

const BalancedCard = ({ children, className, title, icon: Icon, colorClass = "text-slate-800" }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className={cn(
      "bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full",
      className
    )}
  >
    {title && (
      <div className="px-5 py-4 sm:px-8 sm:py-5 border-b border-slate-200/50 flex items-center justify-between bg-slate-50/30 shrink-0">
        <div className="flex items-center gap-3 min-w-0 pr-4">
          {Icon && <Icon size={16} className={cn(colorClass, "shrink-0")} />}
          <h3 className={cn("text-[10px] font-bold uppercase tracking-[0.2em] truncate", colorClass)}>{title}</h3>
        </div>
        <div className="h-1.5 w-1.5 rounded-full bg-slate-200 shrink-0" />
      </div>
    )}
    <div className="p-3 sm:p-6 flex-1 flex flex-col justify-start">
      {children}
    </div>
  </motion.div>
);

const DetailRow = ({ label, value, icon: Icon, color = "text-slate-700" }) => (
  <div className="flex items-center justify-between py-3.5 border-b border-slate-50 last:border-none group gap-3">
    <div className="flex items-center gap-3 shrink-0 min-w-0">
      <div className="h-8 w-8 rounded-xl bg-slate-50 flex shrink-0 items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
        {Icon ? <Icon size={14} /> : <div className="h-1 w-1 rounded-full bg-current" />}
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest break-words">{label}</p>
    </div>
    <div className="flex items-center justify-end gap-3 flex-1 min-w-0">
      <p className={cn("flex-1 min-w-0 text-[13px] font-bold tracking-tight text-right break-all sm:break-words", color)} title={typeof value === 'string' ? value : undefined}>{value || "---"}</p>
    </div>
  </div>
);

export default function LedgerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [columnVisibility, setColumnVisibility] = useState({});

  // Prefer data from navigation state if available
  const stateData = location.state?.data;

  const { data: response, isLoading: isFetching } = useFetch(
    `${apiEndpoints.allLedgerEntry}?id=${id}`,
    {},
    !stateData
  );

  const ledgerItem = React.useMemo(() => {
    if (stateData) return stateData;
    if (!response || !response.success) return null;
    const items = response.data?.data || response.data || [];
    if (Array.isArray(items)) {
      return items.find(item => item._id === id) || items[0];
    }
    return items;
  }, [response, id, stateData]);

  const isLoading = !ledgerItem && isFetching;

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ height: [15, 30, 15], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
              className="w-2 bg-indigo-600 rounded-full"
            />
          ))}
        </div>
        <p className="mt-8 text-[11px] font-bold text-slate-500 uppercase tracking-[0.4em]">Retrieving Audit Log...</p>
      </div>
    );
  }

  if (!ledgerItem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <XCircle className="w-16 h-16 text-slate-200 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Audit File Not Found</h2>
        <Button onClick={() => navigate(-1)} className="mt-8 rounded-xl bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-widest px-8">Return to Central</Button>
      </div>
    );
  }




  const columns = React.useMemo(
    () => [
      {
        header: "SL.NO",
        accessorKey: "slNo",
        center: true,
        cell: ({ row }) => (
          <div className="flex items-center justify-center min-w-[60px]">
            <span className="font-bold text-slate-700 text-[13px] tabular-nums">{row.index + 1}</span>
          </div>
        )
      },
      {
        header: "TRANSACTION AMOUNT",
        accessorKey: "txnAmount",
        center: true,
        cell: ({ row }) => <span className="font-bold text-slate-700 text-[13px] tabular-nums">{formatToINR(row.original.txnAmount)}</span>
      },
      {
        accessorKey: "commission",
        header: "COMMISSION (+)",
        center: true,
        cell: ({ row }) => <span className="font-bold text-emerald-600 text-[13px] tabular-nums">+ {formatToINR(row.original.commission)}</span>
      },
      {
        accessorKey: "charges",
        header: "CHARGES (-)",
        center: true,
        cell: ({ row }) => <span className="font-bold text-rose-500 text-[13px] tabular-nums">- {formatToINR(row.original.charges)}</span>
      },
      {
        accessorKey: "gst",
        header: "GST",
        center: true,
        cell: ({ row }) => <span className="font-bold text-slate-400 text-[12px] tabular-nums">{formatToINR(row.original.gst)}</span>
      },
      {
        accessorKey: "tds",
        header: "TDS",
        center: true,
        cell: ({ row }) => <span className="font-bold text-slate-400 text-[12px] tabular-nums">{formatToINR(row.original.tds)}</span>
      },
      {
        accessorKey: "closingBalance",
        header: "POST-TXN BALANCE",
        center: true,
        cell: ({ row }) => (
          <div className="px-3 py-1 rounded-lg bg-indigo-50/50 inline-block">
            <span className="font-bold text-indigo-600 text-sm tabular-nums">{formatToINR(row.original.closingBalance)}</span>
          </div>
        )
      }
    ],
  );

  return (
    <PageLayout
      title="Transaction Audit Console"
      subtitle={`Global Reference: ${ledgerItem.referenceId}`}
      showBackButton
      className="max-w-[1600px] mx-auto py-4"
    >
      <div className="space-y-6 px-2 sm:px-6">

        {/* Section 1: Top Professional Header */}
        <div className="w-full bg-white rounded-[2.5rem] p-5 min-[1160px]:p-8 2xl:p-10 flex flex-col min-[1160px]:flex-row items-stretch min-[1160px]:items-center justify-between gap-6 shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          {/* Amount & Status */}
          <div className="flex items-center gap-4 xl:gap-6 shrink-0 w-full min-[1160px]:w-auto min-w-0 relative z-10">
            <div className="h-12 w-12 xl:h-14 2xl:h-16 min-w-[2.5rem] xl:min-w-[3rem] 2xl:min-w-[3.5rem] shrink-0 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 transition-transform group-hover:scale-110 duration-500">
              <IndianRupee className="w-6 h-6 xl:w-7 2xl:w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] xl:text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-1 xl:mb-2 truncate">Transaction Amount</p>
              <div className="flex flex-wrap sm:flex-nowrap items-baseline sm:items-center gap-3">
                <h2 className="text-2xl xl:text-3xl 2xl:text-4xl font-bold text-slate-900 tracking-tightest leading-none truncate">
                  <span className="text-slate-300 mr-1 xl:mr-2">₹</span>
                  {(ledgerItem.txnAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h2>
                <span className={cn(
                  "px-2.5 py-1 rounded-lg text-[9px] xl:text-[10px] font-bold uppercase shrink-0 self-start sm:self-auto shadow-sm",
                  ledgerItem.status === 'failed' || ledgerItem.status === 'FAILED'
                    ? "bg-rose-50 text-rose-600 border border-rose-100"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                )}>
                  {ledgerItem.status}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full h-px min-[1160px]:w-px min-[1160px]:h-16 bg-slate-100 min-[1160px]:bg-slate-100/30 shrink-0" />

          {/* Metrics */}
          <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-3 2xl:flex 2xl:flex-row 2xl:flex-wrap items-start 2xl:items-center gap-6 2xl:gap-x-0 2xl:gap-y-4 2xl:justify-between pb-2 2xl:pb-0">
            {[
              { label: "Service", value: ledgerItem.serviceName, color: "text-slate-600" },
              { label: "Category", value: ledgerItem.serviceCategory, color: "text-slate-600" },
              { label: "Type", value: ledgerItem.type, color: "text-indigo-500" },
              { label: "Charges", value: formatToINR(ledgerItem.charges), color: "text-rose-400" },
              { label: "Commission", value: formatToINR(ledgerItem.commission), color: "text-emerald-400" },
              { label: "GST", value: formatToINR(ledgerItem.gst), color: "text-amber-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex flex-col gap-1.5 2xl:px-4 2xl:border-r 2xl:border-slate-100 last:border-0 min-w-0 max-w-full">
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest leading-none mb-0.5">{label}</p>
                <p className={cn("text-[12px] font-bold break-all whitespace-normal leading-relaxed", color)}>{value || "---"}</p>
              </div>
            ))}
          </div>

          <div className="w-full h-px min-[1160px]:w-px min-[1160px]:h-16 bg-slate-100 min-[1160px]:bg-slate-100/30 shrink-0" />

          {/* Actions */}
          <div className="w-full min-[1160px]:w-auto shrink-0">
            <Button
              onClick={() => window.print()}
              className="w-full min-[1160px]:w-auto h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 
                text-white font-bold text-xs gap-2 transition-transform active:scale-95 
                shadow-xl shadow-indigo-900/10"
            >
              <Download size={16} /> Print Receipt
            </Button>
          </div>
        </div>

        {/* Section 2: Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <BalancedCard title="Account Identity" icon={User} colorClass="text-indigo-600">
            <div className="space-y-2">
              <DetailRow label="User Name" value={ledgerItem.userName} icon={User} color="text-slate-800" />
              <DetailRow label="User ID" value={ledgerItem.userId} icon={Hash} color="text-slate-800" />
              <DetailRow label="Balance Before" value={formatToINR(ledgerItem.openingBalance)} icon={IndianRupee} color="text-slate-600" />
              <DetailRow label="Balance After" value={formatToINR(ledgerItem.closingBalance)} icon={IndianRupee} color="text-indigo-600" />
            </div>
          </BalancedCard>

          <BalancedCard title="Technical Audit" icon={ShieldCheck} colorClass="text-indigo-600">
            <div className="space-y-1">
              <div className="flex items-center justify-between py-3 border-b border-slate-50 group gap-2">
                <div className="flex items-center gap-3 shrink-0 min-w-0">
                  <div className="h-8 w-8 rounded-xl bg-slate-50 flex shrink-0 items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <Hash size={14} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest break-words">Global Ref ID</p>
                </div>
                <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3 min-w-0">
                  <p className="flex-1 min-w-0 text-right text-[11px] font-mono font-bold tracking-tight text-slate-800 break-all" title={ledgerItem.referenceId}>{ledgerItem.referenceId}</p>
                  <button onClick={() => handleCopy(ledgerItem.referenceId)} className="text-slate-300 hover:text-indigo-600 transition-colors shrink-0"><Copy size={13} /></button>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-slate-50 group gap-2">
                <div className="flex items-center gap-3 shrink-0 min-w-0">
                  <div className="h-8 w-8 rounded-xl bg-slate-50 flex shrink-0 items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <Activity size={14} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest break-words">Operation ID</p>
                </div>
                <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3 min-w-0">
                  <p className="flex-1 min-w-0 text-right text-[11px] font-mono font-bold tracking-tight text-slate-800" title={ledgerItem._id}>{ledgerItem._id}</p>
                  <button onClick={() => handleCopy(ledgerItem._id)} className="text-slate-300 hover:text-indigo-600 transition-colors shrink-0"><Copy size={13} /></button>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 group gap-2">
                <div className="flex items-center gap-3 shrink-0 min-w-0">
                  <div className="h-8 w-8 rounded-xl bg-slate-50 flex shrink-0 items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <Clock size={14} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest break-words">Timestamp</p>
                </div>
                <p className="flex-1 text-right text-[12px] font-bold text-slate-800">{formatDate(ledgerItem.date)}</p>
              </div>
            </div>
          </BalancedCard>
        </div>

        {/* Section 3: Financial Precision Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Financial Precision</h3>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <DataTable
              columns={columns}
              data={[ledgerItem]}
              hidePagination={true}
              noPadding={true}
              isLoading={isLoading}
              columnVisibility={columnVisibility}
              setColumnVisibility={setColumnVisibility}
              onSearch={() => { }}
              exportData={ledgerData => { }}
              className="border-none shadow-none"
            />
          </div>
        </div>

        {/* Section 4: Transaction Flow (Timeline) */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="space-y-4">
          {/* Request Terminal */}
          <div className="bg-slate-50 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 group">
            <div className="px-7 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5 pr-2">
                  <div className="h-2 w-2 rounded-full bg-slate-200" />
                  <div className="h-2 w-2 rounded-full bg-slate-200" />
                  <div className="h-2 w-2 rounded-full bg-slate-200" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-indigo-600 ml-2 flex items-center gap-2">
                  <Globe size={12} className="animate-pulse" /> Diagnostic Request
                </span>
              </div>
              <div className="flex items-center gap-4">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleCopy(TXN_DATA.apiRequest.plainText)} className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all border border-indigo-100 flex items-center gap-2">
                  <Copy size={11} /> Copy Payload
                </motion.button>
              </div>
            </div>
            <div className="p-7 relative">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700"><Terminal size={80} className="text-indigo-600" /></div>
              <pre className="text-[12px] font-mono text-slate-600 overflow-auto custom-scrollbar leading-relaxed selection:bg-indigo-100 max-h-48">
                <code className="block py-2">{TXN_DATA.apiRequest.plainText}</code>
              </pre>
            </div>
          </div>

          {/* Response Terminal */}
          <div className="bg-slate-50 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 relative group">
            <div className="px-7 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5 pr-2">
                  <div className="h-2 w-2 rounded-full bg-slate-200" />
                  <div className="h-2 w-2 rounded-full bg-slate-200" />
                  <div className="h-2 w-2 rounded-full bg-slate-200" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-rose-600 ml-2 flex items-center gap-2">
                  <Activity size={12} /> Server Response
                </span>
              </div>
              <div className="flex items-center gap-4">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleCopy(JSON.stringify(TXN_DATA.apiResponse, null, 2))} className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all border border-rose-100 flex items-center gap-2">
                  <Copy size={11} /> Copy JSON
                </motion.button>
              </div>
            </div>

            <div className="p-7">
              <pre className="text-[12px] font-mono text-slate-600 overflow-auto custom-scrollbar leading-relaxed selection:bg-rose-100 max-h-48">
                <code className="block py-2">{JSON.stringify(TXN_DATA.apiResponse, null, 2)}</code>
              </pre>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="flex items-center justify-center py-8 opacity-20 mt-4">
          <div className="flex items-center gap-4">
            <ShieldCheck size={20} className="text-slate-400" />
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em]">Encrypted Audit Log - Internal Use Only</p>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
        }
      `}} />
    </PageLayout>
  );
}
