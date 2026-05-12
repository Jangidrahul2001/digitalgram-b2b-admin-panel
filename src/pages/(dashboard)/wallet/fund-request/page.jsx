"use client";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Clock1, Eye, Check, FileImage, CheckCircle2, Clock, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { cn } from "../../../../lib/utils";
import { usePatch } from "../../../../hooks/usePatch";
import { useFetch } from "../../../../hooks/useFetch";
import { Select } from "../../../../components/ui/select";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import ImageModal from "../../../../components/ui/ImageModal";
import { Skeleton } from "../../../../components/ui/skeleton";
import { DataTable } from "../../../../components/tables/data-table";
import { PageLayout } from "../../../../components/layouts/page-layout";
import { fetchAdminWallet } from "../../../../store/slices/walletSlice";
import { FundRequestActionModal } from "../../../../components/modals/FundRequestActionModal";
import { formatDate, formatToINR, handleValidationError } from "../../../../utils/helperFunction";
import { DateRangePicker } from "../../../../components/ui/date-range-picker";
import { ActionButtons } from "../../../../components/ui/ActionButtons";
import StatusBadge from "../../../../components/ui/StatusBadge";
import ExpandableMessage from "../../../../components/ui/ExpandableMessage";
import ClickToCopy from "../../../../components/ui/ClickToCopy";


const fundRequestStats = {
  approved: { label: "Approved Fund Request", count: 0, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", icon: CheckCircle2 },
  pending: { label: "Pending Fund Request", count: 0, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", icon: Clock },
  rejected: { label: "Reject Fund Request", count: 0, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", icon: XCircle },
  approvedAmount: { label: "Total Approved", ruppee: true, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", icon: CheckCircle2 },
  rejectedAmount: { label: "Total Rejected", ruppee: true, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", icon: XCircle },
}


export default function FundRequestPage() {
  const dispatch = useDispatch();
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [fundRequest, setFundRequest] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [statusFilter, setStatusFilter] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [fundRequestStatsData, setFundRequestStatsData] = useState([]);
  const [selectedFundRequest, setSelectedFundRequest] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false)

  const [date, setDate] = useState({
    from: null,
    to: null,
  });

  // Fetch Users for Filter
  const { refetch: fetchAllUsers } = useFetch(
    apiEndpoints.fetchAllUserWithoutPagination,
    {
      onSuccess: (data) => {
        if (data.success) {
          const userOptions = data.data.map(user => ({
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

  const { refetch: refetchFundRequestList } = useFetch(
    `${apiEndpoints.fetchFundRequest}?status=${statusFilter || ""}&search=${searchQuery}&page=${pageIndex}&limit=${pageSize}${selectedUser && selectedUser !== "" ? `&userId=${selectedUser}` : ""
    }${date.from ? `&startDate=${format(date.from, "yyyy-MM-dd")}` : ""}${date.to ? `&endDate=${format(date.to, "yyyy-MM-dd")}` : ""
    }`,
    {
      onSuccess: (data) => {
        if (data.success) {
          console.log("> fundRequestPage > fetchFundRequestList", data)
          setFundRequest(data.data);
          setTotalRecords(data.pagination.total);
        }
        setIsLoading(false);
      },
      onError: (error) => {
        console.error("Error fetching fund request", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    false,
  );

  const { refetch: refetchFundStats } = useFetch(
    `${apiEndpoints.fetchFundStats}?search=${searchQuery}${selectedUser && selectedUser !== "" ? `&userId=${selectedUser}` : ""}${date.from ? `&startDate=${format(date.from, "yyyy-MM-dd")}` : ""
    }${date.to ? `&endDate=${format(date.to, "yyyy-MM-dd")}` : ""}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          console.log("> fundRequestPage > fetchFundStats", data)
          const temp = Object?.keys(data?.data || {})?.map((key) => ({
            count: data?.data?.[key],
            key,
          }));
          setFundRequestStatsData(temp);
        }
        setIsLoading(false);
      },
      onError: (error) => {
        console.error("Error fetching fund stats", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    false,
  );

  const { patch: updateRequest } = usePatch({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Status updated successfully");
        setStatusModalOpen(false);
        setSelectedFundRequest(null);
        refetchFundStats();
        refetchFundRequestList();
        dispatch(fetchAdminWallet());
        setStatusModalOpen(false)
        setIsUpdating(false)
      }
    },
    onError: (error) => {
      setIsUpdating(false)
      console.error("Error updating status:", error);
      toast.error(handleValidationError(error) || "Something went wrong");
    },
  });

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "index",
        header: "SR.NO.",
        cell: ({ row, index }) => (
          <div className="flex items-center justify-center gap-2">

            <span className="font-semibold text-slate-500 text-[13px]">
              {(pageIndex - 1) * pageSize + index + 1}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "paymentProof",
        header: "Payment Proof",
        cell: ({ row, index }) => (
          <div className="flex items-center justify-center gap-2">
            <div
              className="text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
              onClick={() => {
                setSelectedFundRequest(row.original);
                setImageModalOpen(true);
              }}
            >
              <FileImage className="h-5 w-5" />
            </div>
          </div>
        ),
      },

      {
        accessorKey: "paymentDate",
        header: "Payment Date",
        cell: ({ row }) => (
          <span className="text-slate-600 font-medium text-[13px] whitespace-nowrap">
            {formatDate(row.getValue("paymentDate"))}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Request Date",
        cell: ({ row }) => (
          <span className="text-slate-600 font-medium text-[13px] whitespace-nowrap">
            {formatDate(row.getValue("createdAt"))}
          </span>
        ),
      },
      {
        accessorKey: "fullName",
        header: "User",
        center: true,
        cell: ({ row }) => (
          <div className="flex flex-col items-center " >
            <span className="text-slate-900 font-semibold text-[13px]">
              {row.getValue("fullName") || "N/A"}
            </span>
            <ClickToCopy text={row.original.userName} className={"text-[11px] text-center text-slate-400 font-medium tracking-tight truncate cursor-pointer hover:text-slate-600 transition-colors"}>
              {row.original.userName}
            </ClickToCopy>
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <span className="text-slate-900 font-bold text-[14px]">
            ₹{Number(row.getValue("amount")).toLocaleString("en-IN")}
          </span>
        ),
      },
      {
        accessorKey: "utrNumber",
        header: "UTR Number",
        cell: ({ row }) => {
          const utr = row.getValue("utrNumber");
          return (

            <ClickToCopy text={utr} className="whiteSpace-nowrap text-slate-600 font-semibold bg-slate-50 border border-slate-200 px-2.5 py-1 font-mono text-[11px] rounded-lg  cursor-pointer hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95 " >
              {utr}
            </ClickToCopy>


          );
        },
      },
      {
        header: "Rejection Reason",
        accessorKey: "rejectionReason",
        cell: ({ row }) => {
          const text = row.original.rejectionReason || "---";
          return <ExpandableMessage text={text} />;
        }
      },

      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const status = row.original.status?.toLowerCase();

          if (status === "pending") {
            return (
              <ActionButtons
                onApprove={() => {
                  setSelectedFundRequest(row.original);
                  setSelectedAction("approve");
                  setStatusModalOpen(true);
                }}
                onReject={() => {
                  setSelectedFundRequest(row.original);
                  setSelectedAction("reject");
                  setStatusModalOpen(true);
                }}
              />
            );
          }

          if (status === "approved" || status === "rejected") {
            return (
              <div className="flex justify-center">
                <StatusBadge status={status} />
              </div>
            );
          }

          return (
            <div className="flex justify-center">
              <StatusBadge status="pending" />
            </div>
          );
        },
      },

    ],
    [pageIndex, pageSize, selectedUser, date],
  );

  useEffect(() => {
    refetchFundStats();
  }, [pageIndex, pageSize, searchQuery, selectedUser, date]);

  useEffect(() => {
    refetchFundRequestList();
  }, [pageIndex, pageSize, statusFilter, searchQuery, selectedUser, date]);

  const handlePageChange = (newPageIndex, newPageSize) => {
    if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
  };

  const handleConfirmAction = (action, reason) => {
    if (action === "approve") {
      updateRequest(
        `${apiEndpoints.approveFundRequest}/${selectedFundRequest?._id}`,
        { action },
      );
    } else {
      updateRequest(
        `${apiEndpoints.rejectFundRequest}/${selectedFundRequest?._id}`,
        { rejectionReason: reason, action },
      );
    }
  };

  return (
    <>
      <ImageModal
        isOpen={imageModalOpen}
        images={[
          `${import.meta.env.VITE_API_URL}${selectedFundRequest?.paymentProof}`,
        ]}
        title="Payment proof"
        onClose={() => {
          setImageModalOpen(false);
          setSelectedFundRequest(null);
        }}
      />
      <FundRequestActionModal
        disableButton={isUpdating}
        isOpen={statusModalOpen}
        onClose={() => { setStatusModalOpen(false); setIsUpdating(false) }}
        onConfirm={(action, reason) => { setIsUpdating(true); handleConfirmAction(action, reason); }}
        action={selectedAction}
        userName={selectedFundRequest?.fullName}
        amount={selectedFundRequest?.amount}
        utrNumber={selectedFundRequest?.utrNumber}
      />
      <PageLayout
        title="Fund Request"
        subtitle="Manage and track wallet fund requests."
        actions={
          <div className="flex flex-wrap xl:flex-nowrap items-center gap-2 sm:gap-3 w-full xl:w-auto">
            <div className="flex-1 md:w-full lg:flex-1 xl:flex-initial min-w-[140px] xl:min-w-[160px]">
              <Select
                placeholder="Select User"
                options={[{ label: "All Users", value: "" }, ...users]}
                value={selectedUser}
                onChange={setSelectedUser}
                className="h-9 md:h-10 bg-white! border-slate-200 rounded-xl shadow-xs text-slate-700 font-medium w-full text-[12px]"
              />
            </div>

            <div className="flex-1 md:w-full lg:flex-1 xl:flex-initial min-w-[130px] xl:min-w-[140px]">
              <Select
                placeholder="Select Status"
                options={[
                  { label: "All Requests", value: "" },
                  { label: "Pending", value: "pending" },
                  { label: "Approved", value: "approved" },
                  { label: "Rejected", value: "rejected" },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                className="h-9 md:h-10 bg-white! border-slate-200 rounded-xl shadow-xs text-slate-700 font-medium w-full text-[12px]"
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {isLoading && fundRequestStatsData.length === 0 ? (
            Object.keys(fundRequestStats).map((key) => (
              <div
                key={key}
                className={`p-4 rounded-2xl border ${fundRequestStats[key]?.border} bg-white shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex items-center justify-between h-[108px] transition-all`}
              >
                <div className="flex-1">
                  <p className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest mb-1.5">
                    {fundRequestStats[key]?.label}
                  </p>
                  <Skeleton className="h-9 w-20 rounded-lg bg-slate-100" />
                </div>
                <div className={`p-3 rounded-xl ${fundRequestStats[key]?.bg} opacity-50`}>
                  <Skeleton className="h-6 w-6 rounded-full bg-slate-200" />
                </div>
              </div>
            ))
          ) : (
            Object.keys(fundRequestStats).map((key) => {
              const stat = fundRequestStatsData.find(s => s.key === key) || { count: 0 };
              const config = fundRequestStats[key];
              const Icon = config?.icon || Clock1;
              const isRuppee = fundRequestStats?.[key]?.ruppee || false;

              let displayCount = isRuppee ? formatToINR(stat.count) : stat.count || 0;


              return (
                <div
                  key={key}
                  className={`p-4 rounded-2xl border ${config?.border} bg-white shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex items-center justify-between h-[108px] hover:shadow-md transition-all group`}
                >
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <p className="text-slate-600 text-[10px] font-extrabold uppercase tracking-widest truncate">
                      {config?.label}
                    </p>
                    <div className="relative group">
                      <h3 className="text-2xl font-bold  tracking-tight truncate">
                        {displayCount}
                      </h3>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-100 text-slate-900 text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {displayCount}
                      </div>
                    </div>

                  </div>
                  <div
                    className={cn(
                      "p-2.5 rounded-[0.9rem] transition-all group-hover:scale-110 shrink-0",
                      config?.bg,
                      config?.color
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Table Container */}
        <div className="p-0">
          <DataTable
            columns={columns}
            data={fundRequest}
            isLoading={isLoading}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
            pageSize={pageSize}
            totalRecords={totalRecords}
            onPaginationChange={({ pageIndex, pageSize }) => {
              handlePageChange(pageIndex, pageSize);
              setIsLoading(true);
            }}
            onSearch={(val) => setSearchQuery(val)}
            exportData={fundRequest}
            fileName="Fund_Requests_Report"
          />
        </div>
      </PageLayout>
    </>
  );
}
