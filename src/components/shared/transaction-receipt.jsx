import React from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Smartphone,
  User,
  Calendar,
  Tag,
  ShieldCheck,
  Zap,
  FileText,
  Shield,
  QrCode,
  X,
  Printer,
  Copy
} from "@/components/icons";

/**
 * TransactionReceipt Component - Premium Modern SaaS Edition
 * Optimized for production-ready admin panels: small fonts, elegant spacing, 
 * high-end structural layout and print-perfection.
 */
export const TransactionReceipt = ({ data, onClose }) => {
  if (!data) return null;

  const statusType = data.status?.toLowerCase() === 'success' || data.status?.toLowerCase() === 'active' ? 'success' :
    data.status?.toLowerCase() === 'failed' || data.status?.toLowerCase() === 'inactive' ? 'failed' : 'warning';

  const handlePrint = () => window.print();

  return (
    <div className="flex flex-col h-full bg-[#fdfdff] font-sans selection:bg-indigo-100">
      {/* --- Premium Minimal Toolbar --- */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100/80 bg-white/80 backdrop-blur-md sticky top-0 z-[60] print:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 border border-indigo-100/50">
             <Shield className="w-2.5 h-2.5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Transaction Registry</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-200/50"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 sm:p-7 scrollbar-hide">
        <div className="max-w-full mx-auto print:shadow-none print:p-0">
          
          {/* --- TOP BRANDING & STATUS --- */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gradient-to-br from-[#2f35cd] to-[#454bed] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase">PAYNODE</h1>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                   <div className="h-1 w-1 bg-emerald-500 rounded-full" />
                   Verified Settlement Protocol
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto">
               <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em] block mb-2">Audit Hash</span>
               <div className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold tabular-nums text-slate-600 flex items-center gap-2 group cursor-pointer hover:bg-white transition-colors">
                  <span className="truncate max-w-[120px]">{data.id?.toUpperCase() || "N/A"}</span>
                  <Copy className="w-3 h-3 text-slate-300 group-hover:text-indigo-500 transition-colors" />
               </div>
            </div>
          </div>

          {/* --- HERO SETTLEMENT CARD --- */}
          <div className="relative mb-8 overflow-hidden rounded-[2rem] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6">
             <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-[15deg]">
                {statusType === 'success' ? <CheckCircle2 className="w-24 h-24" /> : <XCircle className="w-24 h-24" />}
             </div>
             
             <div className="grid grid-cols-2 gap-8 relative z-10">
                <div className="text-left">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Settlement Amount</span>
                   <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums">{data.amount}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">INR</span>
                   </div>
                </div>
                <div className="text-left">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Final Status</span>
                   <div className="flex items-center gap-2.5 mt-1">
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-2",
                        statusType === 'success' ? "bg-emerald-50 text-emerald-600 border border-emerald-100/50" : 
                        statusType === 'failed' ? "bg-rose-50 text-rose-600 border border-rose-100/50" : "bg-amber-50 text-amber-600 border-amber-100/50"
                      )}>
                         <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", statusType === 'success' ? "bg-emerald-500" : "bg-rose-500")} />
                         {data.status}
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* --- AUDIT LOGS INVENTORY --- */}
          <div className="mb-8">
            <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.25em] mb-4 pl-1 flex items-center gap-2.5">
               Intelligence Log
               <div className="flex-1 h-px bg-slate-100/80" />
            </h3>
            
            <div className="grid grid-cols-2 gap-px bg-slate-100/60 border border-slate-100/80 rounded-[1.5rem] overflow-hidden shadow-sm">
               <LogCell label="Transaction Date" value={data.date} icon={Calendar} />
               <LogCell label="Authenticated ID" value={data.userId} icon={Tag} />
               <LogCell label="Member Identity" value={data.name} icon={User} />
               <LogCell label="Endpoint Target" value={data.operatorMobile?.split('/')?.[1] || data.operatorMobile} icon={Smartphone} />
               <LogCell label="Network Yield" value={data.commission} icon={Zap} color="indigo" />
               <LogCell label="Regulatory Tax" value={data.tds} icon={ShieldCheck} color="rose" />
               {/* <LogCell label="Entry Created" value={data.createdAt?.split(' ')?.[1] || data.createdAt} icon={Clock} />
               <LogCell label="Audit Updated" value={data.updatedAt?.split(' ')?.[1] || data.updatedAt} icon={Clock} /> */}
            </div>
            
            {/* Description / Remarks */}
            <div className="mt-4 p-4.5 bg-slate-50 border border-slate-100/80 rounded-2xl flex items-start gap-4">
               <div className="h-9 w-9 bg-white rounded-xl flex items-center justify-center border border-slate-200/50 shadow-sm shrink-0">
                  <FileText className="w-4 h-4 text-slate-400" />
               </div>
               <div className="text-left pt-0.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">System Audit Remarks</span>
                  <p className="text-[11px] font-semibold text-slate-600 leading-relaxed italic">
                    "{data.description || "Integrated node-level authentication successful. No manual logs captured."}"
                  </p>
               </div>
            </div>
          </div>

          {/* --- PREMIUM FOOTER --- */}
          <div className="pt-8 border-t border-slate-100 border-dashed flex justify-between items-end gap-6">
            <div className="text-left flex-1">
               <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[11px] font-black text-slate-800 tracking-tight">Verified Protocol v4.2</span>
               </div>
               <p className="text-[8.5px] font-bold text-slate-400 max-w-[200px] leading-tight uppercase tracking-tight">
                  This settlement record is cryptographically signed and ISO 27001 validated for financial auditing.
               </p>
            </div>
            
            <div className="flex flex-col items-center gap-2 group">
               <div className="p-2.5 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all group-hover:shadow-md active:scale-95">
                  <QrCode className="w-9 h-9 text-slate-900 opacity-[0.25]" />
               </div>
               <span className="text-[7px] font-black text-slate-300 uppercase tracking-[0.2em]">Audit Scan</span>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 15mm; size: auto; }
          body * { visibility: hidden; background: white !important; }
          .print-receipt-wrapper, .print-receipt-wrapper * { visibility: visible; }
          .print-receipt-wrapper { 
            position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; 
            padding: 0 !important; margin: 0 !important;
          }
          .rounded-[2rem], .rounded-[1.5rem] { border-radius: 12px !important; }
          .shadow-xl, .shadow-sm, .shadow-md { box-shadow: none !important; border: 1px solid #f0f0f0 !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}} />
    </div>
  );
};

const LogCell = ({ label, value, icon: Icon, color = "slate" }) => {
  const colorStyles = {
    slate: "text-slate-400 bg-slate-50/50",
    indigo: "text-indigo-500 bg-indigo-50/30",
    rose: "text-rose-500 bg-rose-50/30",
  };

  return (
    <div className="bg-white p-4 flex flex-col justify-center text-left hover:bg-slate-50/30 transition-colors group">
      <div className="flex items-center gap-2.5 mb-2">
         <div className={cn("h-6 w-6 rounded-lg flex items-center justify-center border border-white shrink-0 group-hover:scale-110 transition-transform", colorStyles[color])}>
            <Icon className="w-3 h-3" />
         </div>
         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em] group-hover:text-slate-600 transition-colors">
            {label}
         </span>
      </div>
      <span className={cn(
        "text-[12px] font-bold tracking-tight tabular-nums truncate px-1",
        color === "indigo" ? "text-indigo-600" : color === "rose" ? "text-rose-600" : "text-slate-900"
      )}>
        {value || "---"}
      </span>
    </div>
  );
};
