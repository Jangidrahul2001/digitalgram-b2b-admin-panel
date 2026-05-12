"use client";
import React, { useEffect, useState } from "react";
import { DataTable } from "../../../../components/tables/data-table";
import { format } from "date-fns";
import {
  Check,
  Search,
  Plus,
  Banknote,
  CheckCircle2,
  XCircle,
  Clock,
  Landmark,
  User,
  CreditCard,
  Calendar as CalendarIcon,
} from "@/components/icons";
import { cn } from "../../../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { PageLayout } from "../../../../components/layouts/page-layout";
import StatusBadge from "../../../../components/ui/StatusBadge";
import { ActionButtons } from "../../../../components/ui/ActionButtons";
import { TableActions } from "../../../../components/shared/table-actions";
import { Select } from "../../../../components/ui/select";
import { CustomDualCalendar } from "../../../../components/ui/custom-dual-calendar";
import { useClickOutside } from "../../../../hooks/use-click-outside";
import { butteryDropdown } from "../../../../lib/animations";

// Dummy Data for visual demonstration
// import { usePayoutRequest } from "../../../../hooks/use-payout-request";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { useFetch } from "../../../../hooks/useFetch";
import { usePatch } from "../../../../hooks/usePatch";
import { PayoutBankRequestActionModal } from "../../../../components/modals/PayoutBankRequestActionModal";
import { toast } from "sonner";
import { handleValidationError } from "../../../../utils/helperFunction";
import { DateRangePicker } from "../../../../components/ui/date-range-picker";
import { FileImage } from "lucide-react";
import ImageModal from "../../../../components/ui/ImageModal";
import ClickToCopy from "../../../../components/ui/ClickToCopy";

export default function PayoutBankRequestPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [payoutRequest, setPayoutRequest] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    images: []
  })

  const [date, setDate] = useState({
    from: null,
    to: null,
  });

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    action: null,
    userName: "",
    bankName: "",
    accountNumber: "",
    id: null,
  });

  // Fetch Users for Filter
  const { refetch: fetchAllUsers } = useFetch(
    apiEndpoints.fetchAllUserWithoutPagination,
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          const userOptions = data?.data?.map(user => ({
            label: `${user?.fullName} (${user?.userName})`,
            shortLabel: user?.fullName,
            value: user?._id
          }));
          setUsers(userOptions);
        }
      }
    },
    true
  );

  const handleAction = (action, row) => {
    setModalConfig({
      isOpen: true,
      action,
      userName: row.original.fullName,
      bankName: row.original.bankName,
      accountNumber: row.original.accountNumber,
      id: row.original.id || row.original._id,
    });
  };

  const handleModalClose = () => {
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  const { patch: aproveAndRejectPayoutRequest } = usePatch({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Status updated successfully");
        refetchPayoutRequest();
      }
    },

    onError: (error) => {
      console.error("Error updating status:", error);
      toast.error(handleValidationError(error) || "Something went wrong");
    },
  });

  const handleModalConfirm = (action, reason) => {
    aproveAndRejectPayoutRequest(
      `${apiEndpoints.approveAndRejectPayoutRequest}/${modalConfig.id}`,
      {
        status: action,
        reason: reason,
      },
    );
  };

  const {
    refetch: refetchPayoutRequest,
  } = useFetch(
    `${apiEndpoints?.aepsPayoutRequest}?search=${searchQuery}&status=${statusFilter || ""}&page=${pageIndex}&limit=${pageSize}${selectedUser && selectedUser !== "" ? `&userId=${selectedUser}` : ""
    }${date.from ? `&startDate=${format(date.from, "yyyy-MM-dd")}` : ""}${date.to ? `&endDate=${format(date.to, "yyyy-MM-dd")}` : ""
    }`,
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
        setPayoutRequest(data?.data);
        setTotalRecords(data?.pagination?.totalRequests);
        setIsLoading(false);
        }
      },
      onError: (error) => {
        console.error("Error fetching payout request", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    false,
  );

  useEffect(() => {
    refetchPayoutRequest();
  }, [pageIndex, pageSize, searchQuery, statusFilter, selectedUser, date]);

  const handlePageChange = (newPageIndex, newPageSize) => {
    if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
  };

  const handleViewChequeImage = (chequeUrl) => {
    if (!chequeUrl) {
      toast.error("No payment proof available")
      return
    }

    // Handle both single image and array of images
    const images = [`${import.meta.env.VITE_API_URL}/${chequeUrl}`]
    setImageModal({
      isOpen: true,
      images: images
    })
  }

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "index",
        header: "SR.NO.",
        headerClassName: "text-center",
        cell: ({ row, index }) => (
          <div className="flex items-center justify-center gap-2">
            <span className="font-semibold text-slate-500 text-[13px]">
              {(pageIndex - 1) * pageSize + index + 1}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "fullName",
        header: "User Name",
        headerClassName: "text-center",
        cell: ({ row }) => {
          const userName = row.original.userName;
          return (
            <div className="flex flex-col items-center">
              <span className="text-slate-900 font-semibold text-[13px]">
                {row.getValue("fullName")}
              </span>
              <ClickToCopy className={"text-[11px] text-slate-400 font-medium tracking-tight cursor-pointer hover:text-slate-600 transition-colors"} text={userName}>
               {userName || "N/A"}
              </ClickToCopy>        
            </div>
          );
        },
      },
      {
        accessorKey: "bankName",
        header: "Bank Details",
        headerClassName: "text-center",
        cell: ({ row }) => {
          const accountNumber = row.original.accountNumber;
          return (
            <div className="flex flex-col items-center">
              <span className="text-slate-700 font-bold text-[13px]">
                {row.getValue("bankName")}
              </span>
              <ClickToCopy  text={accountNumber} className={"text-[11px] text-slate-400 font-mono tracking-tighter uppercase font-medium cursor-pointer hover:text-slate-600 transition-colors"}>
                  A/c: {accountNumber}
              </ClickToCopy>
             
            </div>
          );
        },
      },
      {
        accessorKey: "accountHolderName",
        header: "Account Holder",
        headerClassName: "text-center",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span className="text-slate-900 font-bold text-[13px]">
              {row.getValue("accountHolderName")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "ifscCode",
        header: "IFSC Code",
        headerClassName: "text-center",
        cell: ({ row }) => {
          const ifscCode = row.getValue("ifscCode");
          return (
            <div className="flex justify-center">
              <ClickToCopy className={"text-slate-600 font-medium bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 text-[12px] font-mono cursor-pointer hover:bg-slate-100 transition-colors cursor-pointer"} text={ifscCode}>
                {ifscCode || "N/A"}

              </ClickToCopy>
             
            </div>
          );
        },
      },
      {
        accessorKey: "chequeUrl",
        header: "Documents",
        headerClassName: "text-center",
        cell: ({ row }) => {
          const chequeImage = row.getValue("chequeUrl")

          return (
            <div className="flex justify-center">
              {chequeImage ? (
                <button
                  onClick={() => handleViewChequeImage(chequeImage)}
                  className="flex items-center justify-center p-1.5 text-slate-500 hover:text-slate-900 cursor-pointer transition-colors duration-200"
                  title="View Payment Proof"
                >
                  <FileImage className="h-5 w-5" strokeWidth={1.5} />
                </button>
              ) : (
                <div className="flex items-center justify-center p-1.5 text-slate-300">
                  <FileImage className="h-5 w-5" strokeWidth={1.5} />
                </div>
              )}
            </div>
          )
        }
      },
      {
        id: "actions",
        header: "Actions",
        headerClassName: "text-center",
        cell: ({ row }) => {
          const status = row.original.status?.toLowerCase();
          if (status === "approved" || status === "rejected") {
            return (
              <div className="flex justify-center">
                <StatusBadge status={status} />
              </div>
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
    [pageIndex, pageSize],
  );

  return (
    <PageLayout
      title="AEPS Payout Request"
      subtitle="Manage and approve bank payout requests securely."
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
            triggerClassName="h-9 md:h-10 min-w-[150px]"
            align="right"
          />
        </div>
      }
    >
      <div className="p-0">
        <DataTable
          columns={columns}
          data={payoutRequest}
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
          exportData={payoutRequest}
          fileName="Payout_Requests_Report"
        />
      </div>

      <PayoutBankRequestActionModal
        isOpen={modalConfig.isOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        action={modalConfig.action}
        userName={modalConfig.userName}
        bankName={modalConfig.bankName}
        accountNumber={modalConfig.accountNumber}
      />

      <ImageModal
        isOpen={imageModal.isOpen}
        onClose={() => setImageModal({ isOpen: false, images: [] })}
        images={imageModal.images}
      />
    </PageLayout>
  );
}
