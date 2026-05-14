import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../../lib/utils";
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
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Fingerprint,
  Cpu,
  Globe,
  Monitor,
  Search,
  IndianRupee,
  Copy,
  CreditCardIcon,
  IndianRupeeIcon,
  FunctionSquare,
  History,
  Phone,
  Mail,
  Hash,
  PhoneCall,
  Terminal
} from "lucide-react";
import { useFetch } from "../../../../hooks/useFetch";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { PageLayout } from "../../../../components/layouts/page-layout";
import { Skeleton } from "../../../../components/ui/skeleton";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { formatDate, formatToINR, handleValidationError } from "../../../../utils/helperFunction";
import { DataTable } from "../../../../components/tables/data-table";

const TXN_DATA = {
  id: "8",
  amount: 948.00,
  status: "FAILED",
  txnType: "REFUND",
  serviceCategory: "UTILITY BILLS",
  date: "2026-03-10 10:05:57",
  details: {
    user: "camlenio software (ID: )",
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
}


// --- Skeleton Components ---

const MetricCardSkeleton = () => (
  <div className="relative overflow-hidden rounded-2xl p-5 bg-slate-100">
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="w-3 h-3 rounded" />
        <Skeleton className="h-2 w-16" />
      </div>
      <div>
        <Skeleton className="h-6 w-20 mb-1" />
        <Skeleton className="h-2 w-24" />
      </div>
    </div>
  </div>
);

const DetailItemSkeleton = () => (
  <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border border-slate-100">
    <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg" />
    <div className="flex flex-col min-w-0 space-y-1">
      <Skeleton className="h-2 w-16" />
      <Skeleton className="h-3 w-24" />
    </div>
  </div>
);

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
        <span className="text-[10px] sm:text-[12px] font-bold text-slate-800 tracking-tight truncate">{value}</span>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, subLabel, icon: Icon, variant = "blue" }) => {
  const bgColors = {
    blue: "from-blue-600 to-indigo-800 shadow-blue-500/10",
    yellow: "from-amber-500 to-orange-600 shadow-amber-500/10",
    emerald: "from-emerald-600 to-teal-700 shadow-emerald-500/10",
    rose: "from-rose-600 to-red-700 shadow-rose-500/10",
    dark: "from-slate-900 to-black shadow-slate-900/20",
  };
  return (
    <div className={cn("relative overflow-hidden rounded-2xl p-5 text-white bg-linear-to-br shadow-md transition-transform hover:-translate-y-0.5 duration-300", bgColors[variant])}>
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

const objectToXML = (obj, rootName = "root") => {
  const buildXML = (data) => {
    // Array
    if (Array.isArray(data)) {
      return data
        .map((item) => `<item>${buildXML(item)}</item>\n`)
        .join("\n");
    }

    // Object
    if (typeof data === "object" && data !== null) {
      return Object.entries(data)
        .map(([key, value]) => {
          if (key === "billamount" && value) {
            value = value / 100;
          }
          return `<${key}>${buildXML(value)}</${key}>`;
        })
        .join("\n");
    }

    // Primitive values
    return data ?? "\n";
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
<${rootName}>
${buildXML(obj)}
</${rootName}>`;
};


export default function TransactionDetailPage() {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const service = location?.state?.apiKey || "aeps-aeps1";
  const transactionId = location?.state?.transactionId || "";
  // const [recieptModalData, setRecieptModalData] = useState({
  //   title: "", date: "", subTitleLabel: "", subTitleValue: "", receiptData: {}, isOpen: false
  // });

  const handleCopy = async (text) => {
    try {
      if (!text) return;

      // Convert object to formatted string
      const copyText =
        typeof text === "object"
          ? JSON.stringify(text, null, 2)
          : String(text);

      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(copyText);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = copyText;

        document.body.appendChild(textArea);
        textArea.select();

        document.execCommand("copy");

        document.body.removeChild(textArea);
      }

      toast.success("Copied to clipboard");
    } catch (error) {
      console.error("Copy failed:", error);
      toast.error("Failed to copy");
    }
  };

  const apiKeys = {
    "bbps-bbps1": "bbpsReport",
    "dmt-dmt1": "dmtReportById",
    "recharge-recharge1": "rechargeReportById",
    "xpress-payout-xpress-payout1": "xpressPayoutReportById",
    "aeps-aeps1": "aeps1ReportById",
    "aeps-aeps2": "aeps2ReportById",
    "aeps-payout-aeps-payout1": "aepsPayoutReportById",

  }

  // Fetch stats data
  const { refetch: refetchStatsData } = useFetch(
    `${apiEndpoints?.[apiKeys[service]]}/${transactionId}`,
    {
      onSuccess: (data) => {
        if (data && data.success && data?.data) {
          const temp = data?.data
          if (data && data?.data && data?.data.miniStatement && service === "aeps1") {
            const miniStatement = data?.data?.miniStatement?.map((transaction) => {
              const transactionType =
                transaction?.narration
                  ?.split(transaction.amount)?.[0]
                  ?.trim()
                  .match(/([DC])$/)?.[1] || "D";

              return {
                ...transaction,
                txnType: transactionType === "D" ? "Dr" : "Cr",
              };
            });
            temp.miniStatement = miniStatement
          }

          temp.txnStatus = temp?.txnStatus?.toLowerCase() || temp?.status?.toLowerCase()

          setData(temp);
          setIsLoading(false);
        }
      },

      onError: (error) => {
        setIsLoading(false);
        console.log("error in fetching details", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    apiKeys[service] && apiEndpoints?.[apiKeys[service]] && transactionId,
  );

  const columns = [
    {
      header: "SR.NO.",
      id: "index",
      center: true,
      cell: ({ row }) => <span className=" text-slate-500">{row.index + 1}</span>
    },
    { header: "Date", accessorKey: "date", center: true, className: " text-slate-800" },
    {
      header: "Transaction Type", accessorKey: "txnType", center: true, className: "text-slate-500 ", cell: ({ row }) => <div className={`${row.original.txnType === "Dr"
        ? "text-red-600"
        : "text-green-600"
        } whitespace-nowrap`}>  {row.original.txnType}
      </div>
    },
    { header: "Naration", accessorKey: "narration", center: true, className: " text-slate-500" },
    {
      header: "Amount",
      accessorKey: "amount",
      center: true,
      cell: ({ row }) => <span className={`${row.original.txnType === "Dr"
        ? "text-red-600"
        : "text-green-600"
        } whitespace-nowrap`}>  {row.original.txnType === "Dr" ? "- " : "+ "}
        {formatToINR(row.original.amount)}</span>
    },
  ];

  if (isLoading) {
    return (
      <PageLayout
        title="Transaction Detail"
        subtitle="Universal settlement audit"
        showBackButton={true}
      >
        <div className="w-full pb-20 space-y-5">
          {/* Metric Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </div>

          {/* Main Content Skeleton */}
          <div className="w-full">
            <Card className="border border-slate-100 bg-white shadow-xs rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/10">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-2 w-40" />
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 md:p-8">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <DetailItemSkeleton key={i} />
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (Object.keys(data).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-10 bg-white rounded-3xl border border-slate-200 max-w-lg mx-auto mt-20 shadow-xl">
        <div className="h-20 w-20 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 mb-6 border border-slate-100 rotate-45">
          <Layers className="w-10 h-10 -rotate-45" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">No Data Found</h2>
        <Button onClick={() => navigate(-1)} className="mt-8 rounded-xl h-11 px-8 bg-[#2f35cd] text-white font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">Recall</Button>
      </div>
    );
  }

  // const handleReceiptOpen = () => {
  //   if ((service === 'aeps-aeps1' || service === "aeps-aeps2") && (data.serviceType === "BALANCE-INQUIRY" || data.serviceType === "INQUIRY")) {
  //     setRecieptModalData({
  //       title: "Balance Enquiry",
  //       date: formatDate(data?.createdAt),
  //       subTitleLabel: "Available Balance",
  //       subTitleValue: formatToINR(data?.accountBalance),
  //       receiptData: {
  //         Bank: data?.bankName || "",
  //         "Aadhaar Number": data?.aadhaarNumber || "",
  //         "Transaction Id": data?.referenceId || "",
  //         status: data?.txnStatus?.toLowerCase() === "success" ? "Transaction Successful" : data?.txnStatus?.toLowerCase() === "pending" ? "Transaction Pending" : "Transaction Failed"
  //       },
  //       isOpen: true
  //     });
  //   }
  //   else if ((service === 'aeps-aeps1' || service === "aeps-aeps2") && data.serviceType === "MINI-STATEMENT") {
  //     setRecieptModalData({
  //       title: "Mini Statement",
  //       date: formatDate(data?.createdAt),
  //       receiptData: {
  //         Bank: data?.bankName || "",
  //         "Aadhaar Number": data?.aadhaarNumber || "",
  //         "Transaction Id": res?.data?.referenceId || "",
  //         miniStatement: miniStatement,
  //         status: data?.txnStatus?.toLowerCase() === "success" ? "Transaction Successful" : data?.txnStatus?.toLowerCase() === "pending" ? "Transaction Pending" : "Transaction Failed"
  //       },
  //       isOpen: true
  //     });
  //   }
  //   else if ((service === 'aeps-aeps1' || service === "aeps-aeps2") && data.serviceType === "CASH-WITHDRAW") {
  //     setRecieptModalData({
  //       title: "AEPs Withdrawal",
  //       date: formatDate(data?.createdAt),
  //       subTitleLabel: "amount",
  //       subTitleValue: formatToINR(data?.amount),
  //       receiptData: {
  //         Bank: data?.bankName || "",
  //         "Aadhaar Number": data?.aadhaarNumber || "",
  //         "Transaction Id": data?.referenceId || "",
  //         status: data?.txnStatus?.toLowerCase() === "success" ? "Transaction Successful" : data?.txnStatus?.toLowerCase() === "pending" ? "Transaction Pending" : "Transaction Failed"
  //       },
  //       isOpen: true
  //     });
  //   }
  //   else if (service === 'recharge-recharge1') {
  //     setRecieptModalData({
  //       title: "Recharge Sucessful",
  //       date: formatDate(data?.createdAt),
  //       subTitleLabel: "amount",
  //       subTitleValue: formatToINR(data?.amount),
  //       receiptData: {
  //         Operator: data?.operatorName || "",
  //         "Mobile Number": data?.mobileNumber || "",
  //         "Transaction Id": data?.referenceId || "",
  //         status: data?.txnStatus === "success" ? "Transaction Successful" : data?.txnStatus === "pending" ? "Transaction Pending" : "Transaction Failed"
  //       },
  //       isOpen: true
  //     });
  //   }
  //   else if (service === 'dmt-dmt1') {
  //     setRecieptModalData({
  //       title: "Transaction Successful",
  //       date: formatDate(data?.createdAt),
  //       subTitleLabel: "amount",
  //       subTitleValue: formatToINR(data?.amount),
  //       receiptData: {
  //         "Beneficiary Name": data?.beneficiaryName || "",
  //         "Beneficiary Account": data?.beneficiaryAccount || "",
  //         "Beneficiary Ifsc": data?.beneficiaryIfsc || "",
  //         "Transaction Id": data?.referenceId || "",
  //         status: data?.txnStatus?.toLowerCase() === "success" ? "Transaction Successful" : data?.txnStatus?.toLowerCase() === "pending" ? "Transaction Pending" : "Transaction Failed"
  //       },
  //       isOpen: true
  //     });
  //   }
  //   else if (service === 'aeps-payout-aeps-payout1') {
  //     setRecieptModalData({
  //       title: "Transaction Successful",
  //       date: formatDate(data?.createdAt),
  //       subTitleLabel: "amount",
  //       subTitleValue: formatToINR(data?.amount),
  //       receiptData: {
  //         "Beneficiary Name": data?.beneficiaryName || "",
  //         "Beneficiary Account": data?.bankAccount || "",
  //         "Beneficiary Ifsc": data?.ifsc || "",
  //         "Transaction Id": data?.referenceId || "",
  //         status: data?.txnStatus === "success" ? "Transaction Successful" : data?.txnStatus === "pending" ? "Transaction Pending" : "Transaction Failed"
  //       },
  //       isOpen: true
  //     });
  //   }
  //   else if (service === 'xpress-payout-xpress-payout1') {
  //     setRecieptModalData({
  //       title: "Transaction Successful",
  //       date: formatDate(data?.createdAt),
  //       subTitleLabel: "amount",
  //       subTitleValue: formatToINR(data?.amount),
  //       receiptData: {
  //         "Beneficiary Name": data?.beneficiaryName || "",
  //         "Beneficiary Account": data?.bankAccount || "",
  //         "Beneficiary Ifsc": data?.ifsc || "",
  //         "Transaction Id": data?.referenceId || "",
  //         status: data?.txnStatus === "success" ? "Transaction Successful" : data?.txnStatus === "pending" ? "Transaction Pending" : "Transaction Failed"
  //       },
  //       isOpen: true
  //     });
  //   }
  //   else if (service === 'bbps-bbps1') {
  //     setRecieptModalData({
  //       title: "Transaction Successful",
  //       date: formatDate(data?.createdAt),
  //       subTitleLabel: "amount",
  //       subTitleValue: formatToINR(data?.amount),
  //       receiptData: {
  //         "Category": data?.category || "",
  //         "Bill Number": data?.billNumber || "",
  //         "Customer Name": data?.customerName || "",
  //         "Customer Mobile": data?.customerMobile || "",
  //         "Transaction Id": data?.referenceId || "",
  //         status: "Transaction Successful"
  //       },
  //       isOpen: true
  //     });
  //   }
  // }

  return (
    <PageLayout
      title="Transaction Detail"
      subtitle="Universal settlement audit"
      showBackButton={true}
    // actions={
    //   <div className="flex items-center gap-3">
    //     {
    //       !["pending", "failed"].includes(data.txnStatus) &&
    //       <Button onClick={handleReceiptOpen} className="rounded-lg h-9 px-6 bg-[#2f35cd] text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/10 active:scale-95 transition-all">
    //         <Receipt className="w-3.5 h-3.5 mr-2" /> Receipt
    //       </Button>
    //     }
    //   </div>
    // }
    >


      <div className="w-full pb-20 space-y-5">

        {/* --- DYNAMIC HEADER TILES --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Amount" value={data.amount} subLabel="Recharge Value" icon={CreditCard} variant="dark" />
          <MetricCard label="Status" value={data.txnStatus} subLabel="Current Pool" icon={Activity} variant={data.txnStatus === 'success' ? "emerald" : data.txnStatus === 'failed' ? "rose" : "yellow"} />
          {data.commission !== undefined && <MetricCard label="Commission" value={data.commission} subLabel="Yield Earnt" icon={Zap} variant="blue" />}

          {data.charge !== undefined && <MetricCard label="Charge" value={data.charge} subLabel="Yield Earnt" icon={Zap} variant="rose" />}
          {data.gst !== undefined && <MetricCard label="GST" value={data.gst} subLabel="Regulatory Tax" icon={ShieldCheck} variant="blue" />}
          {data.tds !== undefined && <MetricCard label="TDS" value={data.tds} subLabel="Regulatory Tax" icon={ShieldCheck} variant="blue" />}
          {data.totalAmount !== undefined && <MetricCard label="Total Amount" value={data.totalAmount} subLabel="Total Amount" icon={ShieldCheck} variant="dark" />}
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
                {
                  data.createdAt &&
                  <DetailItem label="Date" value={formatDate(data.createdAt)} icon={Calendar} color="indigo" />
                }
                {
                  data.referenceId &&
                  <DetailItem label="Reference Id" value={data.referenceId} icon={Tag} color="indigo" />
                }

                {
                  data.serviceName &&
                  <DetailItem label="Service" value={data.serviceName} icon={Tag} color="indigo" />
                }
                {
                  data.serviceType &&
                  <DetailItem label="Category" value={data.serviceType} icon={Tag} color="indigo" />
                }
                {
                  data.operatorName &&
                  <DetailItem label="Operator " value={data.operatorName} icon={Smartphone} color="indigo" />
                }
                {
                  data.category &&
                  <DetailItem label="Category" value={data.category} icon={Tag} color="indigo" />
                }
                {
                  data.mobileNumber &&
                  <DetailItem label="Recharged Mobile Number" value={data.mobileNumber} icon={Smartphone} color="indigo" />
                }

                {
                  data.userName &&
                  <DetailItem label="User Name" value={data.userName} icon={Hash} color="indigo" />
                }
                {
                  data.fullName &&
                  <DetailItem label="Name" value={data.fullName} icon={User} color="indigo" />
                }
                {
                  data.email &&
                  <DetailItem label="Email" value={data.email} icon={Mail} color="indigo" />
                }
                {
                  data.phone &&
                  <DetailItem label="Phone" value={data.phone} icon={Phone} color="indigo" />
                }
                {
                  data.beneficiaryName &&
                  <DetailItem label="Beneficiary Name" value={data.beneficiaryName} icon={User} color="indigo" />
                }
                {
                  (data.beneficiaryAccount || data.bankAccount) &&
                  <DetailItem label="Beneficiary Account Number" value={data.beneficiaryAccount || data.bankAccount} icon={Tag} color="indigo" />
                }

                {
                  (data.beneficiaryIfsc || data.ifsc) &&
                  <DetailItem label="Beneficiary IFSC" value={data.beneficiaryIfsc || data.ifsc} icon={Tag} color="indigo" />
                }

                {
                  data.beneficiaryPhone &&
                  <DetailItem label="Beneficiary Phone" value={data.beneficiaryPhone} icon={PhoneCall} color="indigo" />
                }
                {
                  (data.customerName) &&
                  <DetailItem label="Customer Name" value={data.customerName} icon={User} color="indigo" />
                }

                {
                  data.customerMobile &&
                  <DetailItem label="Customer Phone" value={data.customerMobile} icon={PhoneCall} color="indigo" />
                }

                {
                  data.bankName &&
                  <DetailItem label="Bank Name" value={data.bankName} icon={CreditCard} color="indigo" />
                }
                {
                  data.accountBalance !== undefined &&
                  <DetailItem label="Account Balance" value={data.accountBalance} icon={IndianRupeeIcon} color="indigo" />
                }
                {
                  data.balance !== undefined &&
                  <DetailItem label="Account Balance" value={data.balance} icon={IndianRupeeIcon} color="indigo" />
                }
                {
                  data.billNumber &&
                  <DetailItem label="Bill Number" value={data.billNumber} icon={Tag} color="indigo" />
                }
                {
                  data.billDate !== undefined && data.billDate !== "" &&
                  <DetailItem label="Bill Date" value={formatDate(data.billDate)} icon={Calendar} color="indigo" />
                }
                {
                  data.billPeriod !== undefined &&
                  <DetailItem label="Bill Period" value={data.billPeriod} icon={Calendar} color="indigo" />
                }
                {
                  (data.message || data.description) &&
                  <DetailItem label="Description" value={data.message || data.description} icon={FileText} color="indigo" />
                }


              </div>
              {
                data.miniStatement && data.miniStatement.length > 0 &&
                <>
                  <div className="space-y-4 pt-4">

                    <div className="flex items-center gap-3 px-1">
                      <div className="h-6 w-1.5 bg-indigo-600 rounded-full" />
                      <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">
                        Mini Statement
                      </h2>
                    </div>
                    <DataTable
                      hidePagination={true}
                      columns={columns}
                      data={data.miniStatement}
                      isLoading={false}
                      showSearch={false}
                      showheaderAction={false}

                    />
                  </div>
                </>

              }


            </div>
          </Card>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="space-y-4 mt-4">
            {/* Request Terminal */}
            <div className="bg-slate-50 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 group">
              <div className="px-7 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5 pr-2">
                    <div className="h-2 w-2 rounded-full bg-slate-200" />
                    <div className="h-2 w-2 rounded-full bg-slate-200" />
                    <div className="h-2 w-2 rounded-full bg-slate-200" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 ml-2 flex items-center gap-2">
                    <Globe size={12} className="animate-pulse" /> Diagnostic Request
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleCopy(data.request)} className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-indigo-100 flex items-center gap-2">
                    <Copy size={11} /> Copy Payload
                  </motion.button>
                </div>
              </div>
              <div className="p-7 relative">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700"><Terminal size={80} className="text-indigo-600" /></div>
                <pre className="text-[12px] font-mono text-slate-600 overflow-auto custom-scrollbar leading-relaxed selection:bg-indigo-100 max-h-48">
                  <code className="block py-2">{objectToXML(data.request, service)}</code>
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
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-600 ml-2 flex items-center gap-2">
                    <Activity size={12} /> Server Response
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleCopy(data.response)} className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-rose-100 flex items-center gap-2">
                    <Copy size={11} /> Copy JSON
                  </motion.button>
                </div>
              </div>

              <div className="p-7">
                <pre className="text-[12px] font-mono text-slate-600 overflow-auto custom-scrollbar leading-relaxed selection:bg-rose-100 max-h-48">
                  <code className="block py-2">{objectToXML(data.response, service)}</code>
                </pre>
              </div>
            </div>
          </motion.div>
        </div>

        {/* --- SYSTEM FOOTER --- */}
        <div className="flex flex-col items-center gap-4 py-8 opacity-20 no-print">
          <div className="h-px w-12 bg-slate-500" />
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Secure Access Point</p>
        </div>

        {/* <AnimatePresence>
          {recieptModalData.isOpen &&
            <ReceiptModal
              title={recieptModalData.title}
              date={recieptModalData.date}
              subTitleLabel={recieptModalData.subTitleLabel}
              subTitleValue={recieptModalData.subTitleValue}
              receiptData={recieptModalData.receiptData}
              onClose={() => {
                setRecieptModalData({ title: "", date: "", subTitleLabel: "", subTitleValue: "", receiptData: {}, isOpen: false });

              }}
            />
          }
        </AnimatePresence> */}

      </div>
    </PageLayout>
  );
}
