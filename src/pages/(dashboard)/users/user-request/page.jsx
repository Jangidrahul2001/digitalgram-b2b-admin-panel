import React, { useState, useEffect } from "react";
import { DataTable } from "../../../../components/tables/data-table";
import { PageLayout } from "../../../../components/layouts/page-layout";
import { ConfirmationModal } from "../../../../components/modals/confirmation-modal";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { toast } from "sonner";
import { useFetch } from "../../../../hooks/useFetch";
import { AlertCircle, Check, UserCheck, XCircle } from "lucide-react";
import { usePatch } from "../../../../hooks/usePatch";
import { handleValidationError } from "../../../../utils/helperFunction";
import { Button } from "../../../../components/ui/button";
import { ManageServicesModal } from "../../../../components/modals/manage-services-modal";
import { Select } from "../../../../components/ui/select";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [filter, setfilter] = useState({ status: null });

  const buildApiUrl = () => {
    let url = `${apiEndpoints?.fetchUserRequests}?page=${pageIndex}&limit=${pageSize}&status=${filter?.status || ""}`;
    if (searchQuery) {
      url += `&search=${encodeURIComponent(searchQuery)}`;
    }
    return url;
  };

  const { refetch: fetchUsersRequest } = useFetch(
    buildApiUrl(),
    {
      onSuccess: (data) => {
        if (data.success) {

          setUsers(data.data);
          setTotalRecords(data.pagination.total || 0);
          setIsLoading(false);
        }
      },
      onError: (error) => {
        console.error("Error fetching roles:", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    false, // auto fetch on mount
  );

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setApproveModalOpen(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const { patch: updateUserRequestStatus } = usePatch({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "Status updated successfully");
        setApproveModalOpen(false);
        setRejectModalOpen(false);
        fetchUsersRequest();
      }
    },
    onError: (error) => {
      console.error("Failed to approve Request:", error);
      toast.error(handleValidationError(error) || "Something went wrong");
    },
  });

  const onConfirmApprove = async () => {
    setProcessing(true);
    try {
      updateUserRequestStatus(
        `${apiEndpoints.updateUserRequest}/${selectedRequest.id}`,
        { status: "approved" },
      );
    } catch (error) {
      toast.error(handleValidationError(error) || "Something went wrong");
    } finally {
      setProcessing(false);
    }
  };

  const onConfirmReject = async () => {
    if (!rejectReason.trim()) {
      toast.error(handleValidationError(error) || "Something went wrong");
      return;
    }
    setProcessing(true);
    try {
      updateUserRequestStatus(
        `${apiEndpoints.updateUserRequest}/${selectedRequest.id}`,
        { status: "rejected", reason: rejectReason },
      );
    } catch (error) {
      toast.error(handleValidationError(error) || "Something went wrong");
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    fetchUsersRequest();
  }, [pageIndex, pageSize, statusFilter, searchQuery]);

  const handlePageChange = (newPageIndex, newPageSize) => {
    if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
  };

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "index",
        header: "SR.NO.",
        cell: ({ row, index }) => (
          <span className="font-semibold text-slate-500 text-[13px]">
            {(pageIndex - 1) * pageSize + index + 1}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "FULL NAME",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 text-[13px]">
              {`${row.original.firstName} ${row.original.lastName}` || "N/A"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-slate-600 font-medium text-[13px]">
              {row.getValue("email") || "N/A"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "phone",
        header: "PHONE NUMBER",
        cell: ({ row }) => (
          <span className="text-slate-500 font-medium text-[13px]">
            {row.getValue("phone") || "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "role",
        header: "ROLE",
        cell: ({ row }) => (
          <span className="font-bold text-slate-700 text-[11px] px-2.5 py-1 bg-slate-100/80 rounded-md capitalize">
            {row.getValue("role")}
          </span>
        ),
      },

      {
        id: "actions",
        header: "ACTIONS",
        cell: ({ row }) => {
          const { status, reason } = row.original;

          if (status === "approved") {
            return (
              <div className="flex justify-center">
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-bold border border-emerald-100 flex items-center gap-1.5 ">
                  <Check className="h-3.5 w-3.5 stroke-[3px]" />
                  APPROVED
                </span>
              </div>
            );
          }

          if (status === "rejected") {
            return (
              <div className="flex justify-center">
                <div className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-[11px] font-bold border border-red-100 flex items-center gap-1.5 shadow-sm">
                  <XCircle className="h-3.5 w-3.5 stroke-[2px]" />
                  REJECTED
                </div>
              </div>
            );
          }

          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => handleApprove(row.original)}
                className="h-8 px-4 border-emerald-200 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1.5 text-xs"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReject(row.original)}
                className="h-8 px-4 border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1.5 text-xs"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </Button>
            </div>
          );
        },
      },
    ],
    [handleApprove, handleReject, pageIndex, pageSize],
  );

  return (
    <PageLayout title="User Request" subtitle="Manage user requests."
      actions={
        <div className="flex flex-wrap xl:flex-nowrap items-center gap-2 sm:gap-3 w-full xl:w-auto">
          <div className="flex-1 md:w-full lg:flex-1 xl:flex-initial min-w-[140px] xl:min-w-[160px]">
            <Select
              placeholder="Select Status"
              value={filter.status}
              onChange={(val) => setfilter({ ...filter, status: val })}
              options={[
                { label: "All Requests", value: "" },
                { label: "Pending", value: "pending" },
                { label: "Approved", value: "approved" },
                { label: "Rejected", value: "rejected" },]}
              className="h-9 md:h-10 bg-white! border-slate-200 rounded-xl shadow-xs text-slate-700 font-medium w-full text-[12px]"
            />
          </div>




        </div>
      } >
      <DataTable
        columns={columns}
        data={users}
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
        exportData={users}
        exportColumns={columns}
        fileName="User_Requests_Export"
      />

      {/* Approve Confirmation Modal */}
      <ConfirmationModal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        onConfirm={onConfirmApprove}
        title="Approve User Request"
        description={`Are you sure you want to approve the User Request for ${selectedRequest?.name}? `}
        confirmText={processing ? "Approving..." : "Confirm Approval"}
      />

      {/* Reject Modal with Reason Input */}
      <ConfirmationModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={onConfirmReject}
        title="Reject User Request"
        description={`Please provide a reason for rejecting the Request of ${selectedRequest?.name}. This reason will be shared with the user.`}
        confirmText={processing ? "Rejecting..." : "Reject Request"}
        isDestructive={true}
      >
        <div className="mt-5 space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
            Rejection Reason
          </label>
          <div className="relative group">
            <AlertCircle className="absolute top-3.5 left-3.5 w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
            <textarea
              className="w-full min-h-[120px] bg-slate-50 border border-slate-200 rounded-2xl p-4 pl-10 text-sm focus:outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500 focus:bg-white transition-all placeholder:text-slate-400 font-medium resize-none"
              placeholder="e.g. Identity document is unclear or expired..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <p className="text-[10px] text-slate-400 ml-1 font-medium italic">
            Make sure the reason is clear and helpful for the user.
          </p>
        </div>
      </ConfirmationModal>

      <ManageServicesModal
        isOpen={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        user={selectedUser}
      />
    </PageLayout>
  );
}
