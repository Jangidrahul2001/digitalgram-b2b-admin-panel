import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useLocation, Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "../../../../components/ui/button";
import { Select } from "../../../../components/ui/select";
import { DataTable } from "../../../../components/tables/data-table";
import { PageLayout } from "../../../../components/layouts/page-layout";
import { Skeleton } from "../../../../components/ui/skeleton";

import {
  Receipt, FileText, Eye, ShieldCheck, CheckCircle2,
  XCircle, Clock, IndianRupee, Calendar as CalendarIcon
} from "@/components/icons";
import { useFetch } from "../../../../hooks/useFetch";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import {
  formatDate,
  formatToINR,
  handleValidationError,
} from "../../../../utils/helperFunction";
import { cn } from "../../../../lib/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";
import { DateRangePicker } from "../../../../components/ui/date-range-picker";
import ClickToCopy from "../../../../components/ui/ClickToCopy";
import StatusBadge from "../../../../components/ui/StatusBadge";
import { ActionButtons } from "../../../../components/ui/ActionButtons";

const StatCard = ({ label, count, amount, type, icon: Icon, subLabel1, subLabel2 }) => {

  const styles = {
    success: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-100", text: "text-emerald-700" },
    failed: { bg: "bg-rose-50", icon: "text-rose-600", border: "border-rose-100", text: "text-rose-700" },
    pending: { bg: "bg-amber-50", icon: "text-amber-600", border: "border-amber-100", text: "text-amber-700" },
    commission: { bg: "bg-indigo-50", icon: "text-indigo-600", border: "border-indigo-100", text: "text-indigo-700" },
  }[type];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        "p-5 rounded-2xl bg-white border shadow-sm transition-all duration-300",
        styles.border
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("p-2.5 rounded-xl", styles.bg)}>
          <Icon className={cn("w-5 h-5", styles.icon)} />
        </div>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      </div>
      <div>
        {amount !== undefined ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-tight">{subLabel1 || "Total Count"}</span>
              <span className={cn("text-lg font-black", styles.text)}>{count}</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-tight">{subLabel2 || "Total Amount"}</span>
              <span className={cn("text-lg font-black", styles.text)}>{amount}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-transparent pb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-tight">{subLabel1 || "Total Earned"}</span>
              <span className={cn("text-2xl font-black", styles.text)}>{count}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const StatCardSkeleton = () => (
  <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="w-9 h-9 rounded-xl" />
      <Skeleton className="h-3 w-24" />
    </div>
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <Skeleton className="h-2 w-16" />
        <Skeleton className="h-5 w-8" />
      </div>
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-2 w-20" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  </div>
);

export default function ServiceWiseReportPage() {
  const navigate = useNavigate();
  const [columnVisibility, setColumnVisibility] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [statsData, setStatsData] = useState({})

  // Filter states
  const [selectedUser, setSelectedUser] = useState("");
  const [search, setSearch] = useState("");

  // Date Picker States
  const [date, setDate] = useState({
    from: null,
    to: null,
  });

  // Fetch users for dropdown
  const { data: usersData } = useFetch(
    apiEndpoints.fetchAllUserWithoutPagination,
    {},
    true,
    false,
  );

  const location = useLocation();
  const service = new URLSearchParams(location.search).get("service");
  const pipeline = new URLSearchParams(location.search).get("pipeline");
  const apiKey = `${service}-${pipeline}`


  // Build query parameters
  const buildQueryParams = useCallback(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
    };

    if (date?.from) params.from = format(date.from, "yyyy-MM-dd");
    if (date?.to) params.to = format(date.to, "yyyy-MM-dd");
    if (!selectedUser || selectedUser === "all") {
      params.userId = "";
    } else {
      params.userId = selectedUser;
    }

    return params;
  }, [currentPage, pageSize, selectedUser, date]);

  const serviceNames = {
    "recharge": "Recharge",
    "dmt": "Money Transfer",
    "bbps": "Bill Payments",
    "aeps": "AEPs",
    "xpress-payout": "Xpress Payout",
    "aeps-payout": "Aeps Payout",
  }

  const apiKeys = {
    "bbps-bbps1": "bbpsReport",
    "dmt-dmt1": "cashbackReport",
    "recharge-recharge1": "rechargeReport",
    "xpress-payout-xpress-payout1": "",
    "aeps-aeps1": "",
    "aeps-aeps2": "",
    "aeps-payout-aeps-payout1": "",

  }

  const statsApiKey = {
    "bbps-bbps1": "bbpsStats",
    "dmt-dmt1": "cashbackReport",
    "recharge-recharge1": "rechargeStats",
    "xpress-payout-xpress-payout1": "",
    "aeps-aeps1": "",
    "aeps-aeps2": "",
    "aeps-payout-aeps-payout1": "",


  }


  // Fetch service-wise report data
  const {
    data: reportResponse,
    error,
    refetch,
    isLoading: reportLoading
  } = useFetch(
    apiEndpoints?.[apiKeys?.[apiKey]],
    {
      onError: (error) =>
        console.error("Failed to fetch service report:", error),
    },
    false,
    true,
  );

  const {
    error: statsError,
    refetch: refetchStatsData,
    isLoading: reportStatsLoading
  } = useFetch(
    apiEndpoints?.[statsApiKey?.[apiKey]],
    {
      onSuccess: (data) => {
        if (data.success) {
          setStatsData(data.data)
        }

      },
      onError: (error) => {
        console.error("Failed to fetch service report:", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      }
    },
    true,

  );

  // Fetch data when serviceId changes
  useEffect(() => {
    if (service) {
      const params = buildQueryParams();
      refetch(params);
    }
  }, [service, buildQueryParams, refetch]);

  // Process users data for dropdown
  const userOptions = useMemo(() => {
    const allUserOption = { label: "All Users", shortLabel: "All Users", value: "all" };

    if (usersData?.success && usersData?.data) {
      return [
        allUserOption,
        ...usersData.data.map((user) => ({
          label: `${user.fullName} (${user.userName})`.toLowerCase(),
          shortLabel: (user.fullName || user.userName).toLowerCase(),
          value: user._id,
        }))
      ];
    }
    return [allUserOption];
  }, [usersData]);


  // Process report data
  const { reportData, totalRecords } = useMemo(() => {
    if (!reportResponse?.success || !reportResponse?.data) {
      return { reportData: [], totalRecords: 0 };
    }

    return {
      reportData: Array.isArray(reportResponse.data) ? reportResponse.data : (reportResponse.data.data || []),
      totalRecords:
        reportResponse.pagination?.total ||
        reportResponse.total ||
        reportResponse.totalRecords ||
        reportResponse.data?.totalRecords ||
        reportResponse.data?.length ||
        0,
    };
  }, [reportResponse]);


  const handleSearch = () => {
    setCurrentPage(1);
    const params = buildQueryParams();
    refetch(params);
  };

  const handleReset = () => {
    setDate({ from: null, to: null });
    setSelectedUser("");
    setCurrentPage(1);
  };

  const handlePaginationChange = ({ pageIndex }) => {
    setCurrentPage(pageIndex);
  };

  const filterActions = (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-[180px]">
        <Select
          placeholder="Select User"
          options={userOptions}
          value={selectedUser}
          onChange={(val) => {
            setSelectedUser(val);
            setCurrentPage(1);
          }}
          className="h-9 md:h-10 border-slate-200 rounded-xl text-sm font-bold"
        />
      </div>

      {/* Premium Date Range Picker */}
      <DateRangePicker
        date={date}
        setDate={setDate}
        onApply={handleSearch}
        onReset={handleReset}
        triggerClassName="h-9 md:h-10 min-w-[150px] border-slate-200 rounded-xl shadow-xs text-slate-600 font-medium"
        align="right"
      />
    </div>
  );

  // Dynamic Columns Configuration
  const columns = useMemo(() => {
    const baseColumns = [
      {
        id: "srNo",
        header: "SR NO.",
        center: true,
        cell: ({ row, index }) => (
          <span className="font-semibold text-[13px] text-slate-600">
            {(currentPage - 1) * pageSize + index + 1}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "DATE",
        center: true,
        cell: ({ row }) => (
          <span className="text-slate-600 font-medium whitespace-nowrap">
            {formatDate(row.getValue("createdAt"))}
          </span>
        ),
      },
      {
        id: "nameUserId",
        header: "NAME & USER ID",
        center: true,
        cell: ({ row }) => (
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center gap-1">
              <span className="font-semibold text-[13px] text-slate-900 capitalize">
                {row.original.fullName || row.original.name || row.original.userName}
              </span>
              {row.original.kycStatus === "approved" && <ShieldCheck className="w-3 h-3 text-emerald-500" />}
            </div>
            <ClickToCopy text={row.original.userId} className={"text-[11px] text-slate-500  mt-0.5"}>
            
                ({row.original.userName})
              
            </ClickToCopy>
          </div>
        ),
      },
      {
        accessorKey: "referenceId",
        header: "REFERENCE ID",
        center: true,
        cell: ({ row }) => (
          <ClickToCopy text={row.getValue("referenceId")}>
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-[11px] font-extrabold text-slate-900 whitespace-nowrap border border-slate-200">
              {row.getValue("referenceId")}
            </span>
          </ClickToCopy>
        ),
      },
      {
        accessorKey: "amount",
        header: "TRANSACTION AMOUNT",
        center: true,
        cell: ({ row }) => (
          <span className="text-slate-900 font-bold">
            {formatToINR(row.getValue("amount"))}
          </span>
        ),
      },
      {
        accessorKey: "commission",
        header: "COMMISSION",
        center: true,
        cell: ({ row }) => (
          <span className="text-slate-500 text-xs font-medium">
            {formatToINR(row.getValue("commission"))}
          </span>
        ),
      },

      {
        accessorKey: "tds",
        header: "TDS",
        center: true,
        cell: ({ row }) => (
          <span className="text-slate-500 text-xs font-medium">
            {formatToINR(row.getValue("tds"))}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "STATUS",
        center: true,
        cell: ({ row }) => {
          return <StatusBadge status={row.getValue("status")?.toLowerCase() || "pending"} />;
        }
      },
      {
        id: "actions",
        header: "VIEW",
        center: true,
        cell: ({ row }) => (
          <ActionButtons onView={() => navigate(`/transactions`, { state: { transactionId: row.original._id } })} />
        ),
      },
    ];

    return baseColumns;
  }, [currentPage, pageSize]);

  return (
    <PageLayout
      title={service ? `${serviceNames[service] || service.toUpperCase()} Report` : "Service Wise Report"}
      subtitle={service ? `Viewing reports for technical services.` : "Detailed breakdown of transactions and earnings."}
      actions={service ? filterActions : null}
    >
      {!service ? (
        <div className="flex flex-col items-center justify-center p-20 min-h-[400px] bg-white rounded-[2rem] border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Select a Service</h3>
          <p className="text-slate-400 text-sm max-w-[280px] text-center mt-2 font-medium">
            Please choose a service from the sidebar dropdown to view its detailed report.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 font-sans">
          {/* Stats Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportStatsLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <StatCard
                  label="Total Success"
                  count={statsData?.totalSuccess?.count}
                  amount={formatToINR(statsData?.totalSuccess?.amount)}
                  type="success"
                  icon={CheckCircle2}
                />
                <StatCard
                  label="Total Pending"
                  count={statsData?.totalPending?.count}
                  amount={formatToINR(statsData?.totalPending?.amount)}
                  type="pending"
                  icon={Clock}
                />
                <StatCard
                  label="Total Failed"
                  count={statsData?.totalFailed?.count}
                  amount={formatToINR(statsData?.totalFailed?.amount)}
                  type="failed"
                  icon={XCircle}
                />
                <StatCard
                  label="Commission Overview"
                  count={statsData?.commissionOverview?.totalDays}
                  amount={formatToINR(statsData?.commissionOverview?.totalCommission)}
                  type="commission"
                  subLabel1="Total Days"
                  subLabel2="Total Commission"
                  icon={IndianRupee}
                />
              </>
            )}
          </div>

          {/* Results Section */}
          <div className="p-0">
            <DataTable
              columns={columns}
              data={reportData}
              isLoading={reportLoading}
              onSearch={setSearch}
              searchValue={search}
              exportData={reportData}
              exportColumns={columns}
              fileName={`Service_Report_${service}`}
              columnVisibility={columnVisibility}
              setColumnVisibility={setColumnVisibility}
              onPaginationChange={handlePaginationChange}
              totalRecords={totalRecords}
              pageSize={pageSize}
            />
          </div>
        </div>
      )}
    </PageLayout>
  );
}
