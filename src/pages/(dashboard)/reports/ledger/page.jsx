import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../../lib/utils";
import { useFetch } from "../../../../hooks/useFetch";
import { Select } from "../../../../components/ui/select";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { DataTable } from "../../../../components/tables/data-table";
import { PageLayout } from "../../../../components/layouts/page-layout";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  IndianRupee,
  Zap,
  TrendingUp,
  TrendingDown
} from "@/components/icons";
import {
  formatDate,
  formatToINR,
  handleValidationError,
} from "../../../../utils/helperFunction";
import { DateRangePicker } from "../../../../components/ui/date-range-picker";
import ClickToCopy from "../../../../components/ui/ClickToCopy";
import { ActionButtons } from "../../../../components/ui/ActionButtons";
import { useNavigate } from "react-router-dom";
import ExpandableMessage from "../../../../components/ui/ExpandableMessage";




const StatCard = ({ label, count, amount, type, icon: Icon, subLabel1, subLabel2 }) => {

  const styles = {
    success: {
      gradient: "from-white to-emerald-50/40",
      border: "border-emerald-100 hover:border-emerald-200 hover:shadow-emerald-500/10",
      accent: "bg-emerald-500",
      bg: "bg-emerald-50/50",
      color: "text-emerald-600",
      icon: "emerald"
    },
    failed: {
      gradient: "from-white to-rose-50/40",
      border: "border-rose-100 hover:border-rose-200 hover:shadow-rose-500/10",
      accent: "bg-rose-500",
      bg: "bg-rose-50/50",
      color: "text-rose-600",
      icon: "rose"
    },
    pending: {
      gradient: "from-white to-amber-50/40",
      border: "border-amber-100 hover:border-amber-200 hover:shadow-amber-500/10",
      accent: "bg-amber-500",
      bg: "bg-amber-50/50",
      color: "text-amber-600",
      icon: "amber"
    },
    refund: {
      gradient: "from-white to-sky-50/40",
      border: "border-sky-100 hover:border-sky-200 hover:shadow-sky-500/10",
      accent: "bg-sky-500",
      bg: "bg-sky-50/50",
      color: "text-sky-600",
      icon: "sky"
    },
    commission: {
      gradient: "from-white to-indigo-50/40",
      border: "border-indigo-100 hover:border-indigo-200 hover:shadow-indigo-500/10",
      accent: "bg-indigo-500",
      bg: "bg-indigo-50/50",
      color: "text-indigo-600",
      icon: "indigo"
    },
    charges: {
      gradient: "from-white to-orange-50/40",
      border: "border-orange-100 hover:border-orange-200 hover:shadow-orange-500/10",
      accent: "bg-orange-500",
      bg: "bg-orange-50/50",
      color: "text-orange-600",
      icon: "orange"
    },
    credit: {
      gradient: "from-white to-teal-50/40",
      border: "border-teal-100 hover:border-teal-200 hover:shadow-teal-500/10",
      accent: "bg-teal-500",
      bg: "bg-teal-50/50",
      color: "text-teal-600",
      icon: "teal"
    },
    debit: {
      gradient: "from-white to-pink-50/40",
      border: "border-pink-100 hover:border-pink-200 hover:shadow-pink-500/10",
      accent: "bg-pink-500",
      bg: "bg-pink-50/50",
      color: "text-pink-600",
      icon: "pink"
    },
  }[type] || {
    gradient: "from-white to-slate-50/40",
    border: "border-slate-100 hover:border-slate-200 hover:shadow-slate-500/10",
    accent: "bg-slate-500",
    bg: "bg-slate-50/50",
    color: "text-slate-600",
    icon: "slate"
  };

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden group rounded-2xl border p-5 transition-all duration-300 shadow-sm cursor-default bg-linear-to-tr",
        styles.gradient,
        styles.border
      )}
    >
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 leading-none">
            {label}
          </span>
          <div className={cn(
            "p-2.5 rounded-xl shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-xs",
            styles.bg,
            styles.color
          )}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-3 mt-auto">
          {amount !== undefined ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-200/50 pb-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{subLabel1 || "Txn Count"}</span>
                <span className={cn("text-[17px] font-black leading-none", styles.color)}>{count}</span>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{subLabel2 || "Amount"}</span>
                <span className={cn("text-[17px] font-black leading-none", styles.color)}>{formatToINR(amount)}</span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{subLabel1 || "Value"}</span>
              <span className={cn("text-2xl font-black leading-none", styles.color)}>
                ₹{(count || 0).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Decorative background icon */}
      <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none rotate-12">
        <div className="scale-[4]">
          <Icon className={styles.color} />
        </div>
      </div>
    </motion.div>
  );
};

export default function LedgerReportPage() {
  const navigate = useNavigate();
  const [columnVisibility, setColumnVisibility] = useState({});
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [users, setUsers] = useState([]);
  const [ledgerData, setLedgerData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Stats state
  const [stats, setStats] = useState({
    success: { count: 0, amount: 0 },
    pending: { count: 0, amount: 0 },
    failed: { count: 0, amount: 0 },
    refund: { count: 0, amount: 0 },
    commission: 0,
    charges: 0,
    totalCredit: 0,
    totalDebit: 0,
  });

  // Filter states
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [date, setDate] = useState({
    from: null,
    to: null,
  });

  // Fetch users for dropdown
  const { refetch: fetchAllUsers } = useFetch(
    apiEndpoints.fetchAllUserWithoutPagination,
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          const userOptions = data?.data.map(user => ({
            label: `${user.fullName} (${user.userName})`,
            shortLabel: user.fullName,
            value: user._id
          }));
          setUsers(userOptions);
        }
      }
    },
    true
  );

  // Fetch ledger data
  const { refetch: refetchLedger } = useFetch(
    `${apiEndpoints.allLedgerEntry}?page=${pageIndex}&limit=${pageSize}${selectedUser && selectedUser !== "" ? `&userId=${selectedUser}` : ""
    }${date.from ? `&from=${format(date.from, "yyyy-MM-dd")}` : ""}${date.to ? `&to=${format(date.to, "yyyy-MM-dd")}` : ""
    }${selectedStatus ? `&status=${selectedStatus}` : ""}`,
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          setLedgerData(data?.data?.data || data?.data || []);
          setTotalRecords(data?.data?.totalRecords || data?.pagination?.total || 0);

          // Optionally update stats if available in response
          if (data?.data?.stats) {
            setStats(data?.data?.stats);
          }
        }
        setIsLoading(false);
      },
      onError: (error) => {
        console.error("Error fetching ledger:", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    false
  );

  useEffect(() => {
    refetchLedger();
  }, [pageIndex, pageSize, selectedUser, selectedStatus, date]);

  const handlePageChange = (newPageIndex, newPageSize) => {
    if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
  };

  const columns = React.useMemo(
    () => [
      {
        header: "SR.NO.",
        accessorKey: "id",
        center: true,
        cell: ({ row, index }) => <span className="text-[12px] font-bold text-slate-600">{(pageIndex - 1) * pageSize + index + 1}</span>
      },
      {
        header: "Date",
        accessorKey: "createdAt",
        center: true,
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5 whitespace-nowrap">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{formatDate(row.original.createdAt)}</span>
          </div>
        )
      },
      {
        header: "User Details",
        accessorKey: "fullName",
        center: true,
        cell: ({ row }) => (
          <div className="flex flex-col whitespace-nowrap justify-center items-center">
            <div className="flex gap-1.5">
              <span className="font-semibold text-[13px] text-slate-900">
                {row.original.fullName}
              </span>
            </div>
            <ClickToCopy text={row.original.userName}>
              <span className="text-[11px] text-slate-500 font-medium tracking-tight hover:text-slate-700 transition-colors cursor-pointer inline-block mt-0.5">
                ( {row.original.userName} )
              </span>
            </ClickToCopy>
          </div>
        ),
      },
      {
        header: "SERVICES NAME",
        accessorKey: "serviceType",
        center: true,
        cell: ({ row }) => <span className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{row.original.serviceType || "---"}</span>
      },
      {
        header: "SERVICES CATEGORY",
        accessorKey: "serviceCategory",
        center: true,
        cell: ({ row }) => <span className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{row.original.serviceCategory || "---"}</span>
      },
      {
        header: "REF ID",
        accessorKey: "referenceId",
        center: true,
        cell: ({ row }) => (
        <ClickToCopy text={row.original.referenceId} className="bg-indigo-50/50 px-2 whitespace-nowrap py-1 rounded-lg border border-indigo-100/50">
          <span className="text-[11px] font-bold text-indigo-600 font-mono tracking-tight">
            {row.original.referenceId}
          </span>
        </ClickToCopy>
        )
      },
      {
        header: "Entry Type",
        accessorKey: "entryType",
        cell: ({ row }) => <span className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{row.original.entryType || "---"}</span>
      },
      {
        header: "OPENING BAL",
        accessorKey: "openingBalance",
        center: true,
        cell: ({ row }) => <span className="text-[13px] font-bold text-slate-800">{formatToINR(row.original.openingBalance)}</span>
      },
      {
        header: "TXN AMOUNT",
        accessorKey: "amount",
        center: true,
        cell: ({ row }) => <span className={`text-[14px] font-bold ${row.original.type === "debit" ? "text-rose-500" : "text-emerald-500"}`}>{formatToINR(row.original.amount)}</span>
      },
      {
        header: "COMMISSION",
        accessorKey: "commission",
        center: true,
        cell: ({ row }) => <span className="text-[13px] font-semibold text-slate-700">{formatToINR(row.original.commission)}</span>
      },
      {
        header: "CHARGES",
        accessorKey: "charges",
        center: true,
        cell: ({ row }) => <span className="text-[13px] font-semibold text-slate-700">{formatToINR(row.original.totalCharges)}</span>
      },
      {
        header: "GST",
        accessorKey: "gst",
        center: true,
        cell: ({ row }) => <span className="text-[13px] font-bold text-slate-800">{formatToINR(row.original.gstAmount)}</span>
      },
      {
        header: "TDS",
        accessorKey: "tds",
        center: true,
        cell: ({ row }) => <span className="text-[13px] font-bold text-slate-800">{formatToINR(row.original.tdsAmount)}</span>
      },


      {
        header: "CLOSING BAL",
        accessorKey: "closingBalance",
        center: true,
        cell: ({ row }) => <span className="text-[13px] font-bold text-slate-800">{formatToINR(row.original.closingBalance)}</span>
      },
      {
        header: "TYPE",
        accessorKey: "type",
        center: true,
        cell: ({ row }) => <span className={`text-[13px] font-bold capitalize ${row.original.type === "debit" ? "text-rose-500" : "text-emerald-500"}`}>{row.original.type}</span>
      },

      {
        header: "MESSAGE",
        accessorKey: "description",
        center: true,
        cell: ({ row }) => <ExpandableMessage text={row.original.description} />
      },
      // {
      //   header: "ACTION",
      //   accessorKey: "action",
      //   center: true,
      //   cell: ({ row }) => (
      //     <ActionButtons
      //       onView={() => row.original?._id && navigate(`/reports/ledger/details/${row.original._id}`, { state: { data: row.original } })}
      //     />
      //   )
      // },
    ],
    [pageIndex, pageSize],
  );

  return (
    <PageLayout
      title="Wallet Ledger"
      subtitle="Comprehensive view of wallet balance history and transactions."
      actions={
        <div className="flex flex-wrap xl:flex-nowrap items-center gap-2 sm:gap-3 w-full xl:w-auto">
          <div className="flex-1 md:w-full lg:flex-1 xl:flex-initial min-w-[140px] xl:min-w-[160px]">
            <Select
              placeholder="Select User"
              value={selectedUser}
              onChange={(val) => setSelectedUser(val)}
              options={[{ label: "All Users", value: "" }, ...users]}
              className="h-9 md:h-10 bg-white border-slate-200 rounded-xl shadow-xs text-slate-700 font-medium w-full text-[12px]"
            />
          </div>

          <div className="flex-1 md:w-full lg:flex-1 xl:flex-initial min-w-[140px] xl:min-w-[160px]">
            <Select
              placeholder="Select Status"
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
              options={[
                { label: "All Status", value: "" },
                { label: "Success", value: "success" },
                { label: "Pending", value: "pending" },
                { label: "Failed", value: "failed" },
                { label: "Refund", value: "refund" },
              ]}
              className="h-9 md:h-10 bg-white border-slate-200 rounded-xl shadow-xs text-slate-700 font-medium w-full text-[12px]"
            />
          </div>

          <DateRangePicker
            date={date}
            setDate={setDate}
            className="w-full md:w-full lg:w-full xl:w-auto"
            triggerClassName="h-9 md:h-10 min-w-[150px] border-slate-200 rounded-xl shadow-xs text-slate-600 font-medium"
            align="right"
          />
        </div>
      }
    >
      <div className="flex flex-col gap-8">
        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2">
          {/* <StatCard
            label="Total Success"
            count={stats.success.count}
            amount={stats.success.amount}
            type="success"
            icon={CheckCircle2}
          />
          <StatCard
            label="Total Pending"
            count={stats.pending.count}
            amount={stats.pending.amount}
            type="pending"
            icon={Clock}
          />
          <StatCard
            label="Total Failed"
            count={stats.failed.count}
            amount={stats.failed.amount}
            type="failed"
            icon={XCircle}
          />
          <StatCard
            label="Total Refund"
            count={stats.refund.count}
            amount={stats.refund.amount}
            type="refund"
            icon={RefreshCw}
          /> */}

          <StatCard
            label="Total Commission"
            count={stats.commission}
            type="commission"
            subLabel1="Total Earned"
            icon={IndianRupee}
          />
          <StatCard
            label="Total Charges"
            count={stats.charges}
            type="charges"
            subLabel1="Total Paid"
            icon={Zap}
          />
          <StatCard
            label="Total Credit"
            count={stats.totalCredit}
            type="credit"
            subLabel1="Total Amount"
            icon={TrendingUp}
          />
          <StatCard
            label="Total Debit"
            count={stats.totalDebit}
            type="debit"
            subLabel1="Total Amount"
            icon={TrendingDown}
          />
        </div>

        {/* Ledger Table */}
        <div className="p-0">
          <DataTable
            columns={columns}
            data={ledgerData}
            isLoading={isLoading}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
            pageSize={pageSize}
            totalRecords={totalRecords}
            onPaginationChange={({ pageIndex, pageSize }) => {
              handlePageChange(pageIndex, pageSize);
              setIsLoading(true);
            }}
            onSearch={() => { }}
            exportData={ledgerData}
            fileName="Wallet_Ledger_Report"
          />
        </div>
      </div>
    </PageLayout>
  );
}
