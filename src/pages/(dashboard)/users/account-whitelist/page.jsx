"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { DataTable } from "../../../../components/tables/data-table";
import { PageLayout } from "../../../../components/layouts/page-layout";
import { Select } from "../../../../components/ui/select";
import { cn } from "../../../../lib/utils";
import { toast } from "sonner";
import { CheckCircle2, File, XCircle } from "lucide-react";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { handleValidationError } from "../../../../utils/helperFunction";
import { useFetch } from "../../../../hooks/useFetch";
import { usePatch } from "../../../../hooks/usePatch";
import { AccountWhitelistActionModal } from "../../../../components/modals/AccountWhitelistActionModal";
import { DateRangePicker } from "../../../../components/ui/date-range-picker";
import StatusBadge from "../../../../components/ui/StatusBadge";
import { ActionButtons } from "../../../../components/ui/ActionButtons";
import { Button } from "../../../../components/ui/button";
import ImageModal from "../../../../components/ui/ImageModal";
import ClickToCopy from "../../../../components/ui/ClickToCopy"

export default function AccountWhitelistPage() {
  const [columnVisibility, setColumnVisibility] = useState({});
  const [search, setSearch] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [whiteListRequest, setWhiteListRequest] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const [users, setUsers] = useState([]);

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

  const [date, setDate] = useState({
    from: null,
    to: null,
  });

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    action: null,
    userName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    id: null,
  });

  const { refetch: fetchWhiteListRequest } = useFetch(
    `${apiEndpoints.whiteListRequest}?page=${pageIndex}&limit=${pageSize}&search=${search}${statusFilter && statusFilter !== "all" ? `&status=${statusFilter}` : ""
    }${selectedUser && selectedUser !== "all" ? `&userId=${selectedUser}` : ""}${date.from ? `&startDate=${format(date.from, "yyyy-MM-dd")}` : ""
    }${date.to ? `&endDate=${format(date.to, "yyyy-MM-dd")}` : ""}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setWhiteListRequest(data.data);
          setTotalRecords(data.pagination?.total || 0);
        }
        setIsLoading(false);
      },
      onError: (error) => {
        console.error("Error fetching whiteList request :", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    false,
  );

  useEffect(() => {
    fetchWhiteListRequest();
  }, [pageIndex, pageSize, search, statusFilter, selectedUser, date]);

  const { patch: approveRejectWhitelistRequest } = usePatch({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Status updated successfully");
        fetchWhiteListRequest();
      }
    },
    onError: (error) => {
      console.error("Error updating whitelist status:", error);
      toast.error(handleValidationError(error) || "Something went wrong");
    },
  });

  const handlePageChange = (newPageIndex, newPageSize) => {
    if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
  };

  const handleAction = (action, row) => {
    setModalConfig({
      isOpen: true,
      action,
      userName: row.original.fullName || row.original.accountHolderName || "",
      accountNumber: row.original.accountNumber || "",
      ifscCode: row.original.ifscCode || "",
      bankName: row.original.bankName || "",
      id: row.original._id || row.original.id,
    });
  };

  const handleModalClose = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const handleModalConfirm = (action, reason) => {
    approveRejectWhitelistRequest(
      `${apiEndpoints.approveAndRejectWhitelistRequest}/${modalConfig.id}`,
      { status: action, reason },
    );
  };

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "sn",
        header: "SN",
        cell: ({ row }) => (
          <span className="text-slate-500 font-bold text-[13px]">{row.index + 1}</span>
        ),
      },
      {
        accessorKey: "accountNumber",
        header: "ACCOUNT NUMBER",
        center: true,
        cell: ({ row }) => {
          const accNo = row.getValue("accountNumber");
          return (
            <ClickToCopy text={accNo} className={"text-slate-600 font-semibold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-[12px] font-mono cursor-pointer hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95 inline-block"}>
              {accNo}
            </ClickToCopy>
          );
        },
      },
      {
        accessorKey: "ifscCode",
        header: "IFSC CODE",
        cell: ({ row }) => {
          const ifsc = row.getValue("ifscCode");
          return (
            <ClickToCopy text={ifsc} className={"text-slate-600 font-semibold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-[12px] font-mono cursor-pointer hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95 inline-block"}>
              {ifsc}
            </ClickToCopy>

          );
        },
      },
      {
        accessorKey: "accountHolderName",
        header: "ACCOUNT HOLDER",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-slate-900 font-bold text-[13px]">
              {row.getValue("accountHolderName")}
            </span>
            <span className="text-[11px] text-slate-400 font-medium tracking-tight">
              {row.original.userName || "N/A"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "bankName",
        header: "BANK NAME",
        cell: ({ row }) => (
          <span className="text-slate-500 font-medium text-[13px]">{row.getValue("bankName")}</span>
        ),
      },
      {
        header: "Documents",
        center: true,
        cell: ({ row }) => (
          <div className="flex flex-col gap-1.5 py-1 items-center">
            <button
              onClick={() => { setSelectedFile(`${import.meta.env.VITE_API_URL}${row.original.chequeImageUrl}`); setImageModalOpen(true); }}
              className="flex cursor-pointer items-center justify-center gap-1.5 text-[9px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors bg-blue-50/50 px-3 py-1 rounded-lg border border-blue-100/50 w-fit"
            >
              <File size={12} strokeWidth={3} /> View Cheque
            </button>
            <button
              onClick={() => { setSelectedFile(`${import.meta.env.VITE_API_URL}${row.original.passbookOrBankStatementUrl}`); setImageModalOpen(true); }}
              className="flex cursor-pointer items-center justify-center gap-1.5 text-[9px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors bg-blue-50/50 px-3 py-1 rounded-lg border border-blue-100/50 w-fit"
            >
              <File size={12} strokeWidth={3} /> View Statement
            </button>
          </div>
        ),
      },

      {
        id: "actions",
        header: "ACTIONS",
        cell: ({ row }) => {
          const status = row.original.status;

          if (status === "approved" || status === "rejected") {
            return (
              <StatusBadge status={row.original.status || "pending"} />
            );
          }

          return (
            <ActionButtons
              onApprove={() => handleAction("approved", row)}
              onReject={() => handleAction("rejected", row)}
            />
          );
        },
      },
    ],
    [users],
  );

  return (
    <PageLayout
      title="Account Whitelist Requests"
      subtitle="Manage and verify user bank accounts for whitelisting."
      actions={
        <div className="flex flex-wrap xl:flex-nowrap items-center gap-2 sm:gap-3 w-full xl:w-auto">
          <div className="flex-1 md:w-full lg:flex-1 xl:flex-initial min-w-[140px] xl:min-w-[160px]">
            <Select
              placeholder="Select User"
              value={selectedUser}
              onChange={(val) => setSelectedUser(val)}
              options={[{ label: "All Users", value: "" }, ...users]}
              className="h-9 md:h-10 bg-white! border-slate-200 rounded-xl shadow-xs text-slate-700 font-medium w-full text-[12px]"
            />
          </div>

          <div className="flex-1 md:w-full lg:flex-1 xl:flex-initial min-w-[130px] xl:min-w-[140px]">
            <Select
              placeholder="Select Status"
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { label: "All Requests", value: "" },
                { label: "Pending", value: "pending" },
                { label: "Approved", value: "approved" },
                { label: "Rejected", value: "rejected" },
              ]}
              searchable={false}
              className="h-9 md:h-10 bg-white! border-slate-200 rounded-xl shadow-xs text-slate-700 font-medium w-full text-[12px]"
            />
          </div>

          <DateRangePicker
            date={date}
            setDate={setDate}
            className="w-full md:w-full lg:w-full xl:w-auto"
            triggerClassName="h-9 md:h-10 min-w-[150px] border-slate-200 rounded-xl shadow-xs text-slate-600 font-medium"
          />
        </div>
      }
    >
      <DataTable
        columns={columns}
        data={whiteListRequest}
        isLoading={isLoading}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        pageSize={pageSize}
        totalRecords={totalRecords}
        onPaginationChange={({ pageIndex, pageSize }) => {
          handlePageChange(pageIndex, pageSize);
          setIsLoading(true);
        }}
        onSearch={(val) => setSearch(val)}
        exportData={whiteListRequest}
        exportColumns={columns}
        fileName="Account_Whitelist_Requests"
      />

      {/* Approve / Reject Modal */}
      <AccountWhitelistActionModal
        isOpen={modalConfig.isOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        action={modalConfig.action}
        userName={modalConfig.userName}
        accountNumber={modalConfig.accountNumber}
        ifscCode={modalConfig.ifscCode}
        bankName={modalConfig.bankName}
      />
      <ImageModal
        images={[selectedFile]}
        isOpen={imageModalOpen}
        onClose={() => {
          setImageModalOpen(false);
          setSelectedFile(null);
        }}
      />
    </PageLayout>
  );
}
