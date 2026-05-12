"use client";
import { toast } from "sonner";
import { Edit } from "lucide-react";
import {
  formatDate,
  handleValidationError,
} from "../../../../../utils/helperFunction";
import { Eye, Trash2 } from "@/components/icons";
import React, { useState, useEffect } from "react";
import { usePut } from "../../../../../hooks/usePut";
import { data, useNavigate } from "react-router-dom";
import { useFetch } from "../../../../../hooks/useFetch";
import { useDelete } from "../../../../../hooks/useDelete";
import { apiEndpoints } from "../../../../../api/apiEndpoints";
import { DataTable } from "../../../../../components/tables/data-table";
import { PageLayout } from "../../../../../components/layouts/page-layout";
import { ConfirmationModal } from "../../../../../components/modals/confirmation-modal";
import OfflineServiceRequestModal from "../../../../../components/modals/OfflineServiceRequestModal";
import OfflineServiceRequestStatusChangeModal from "../../../../../components/modals/OfflineServiceRequestStatusChangeModal";
import { cn } from "../../../../../lib/utils";
import StatusBadge from "../../../../../components/ui/StatusBadge";
import { ActionButtons } from "../../../../../components/ui/ActionButtons";

export default function OfflineServiceRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusChangeModalOpen, setStatusChangeModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const buildApiUrl = () => {
    let url = `${apiEndpoints?.offlineServiceRequest}?page=${pageIndex}&limit=${pageSize}`;
    if (searchQuery) {
      url += `&search=${encodeURIComponent(searchQuery)}`;
    }
    return url;
  };

  const { refetch: fetchRequests } = useFetch(
    buildApiUrl(),
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          setRequests(data?.data);
          setTotalRecords(data?.pagination?.total || 0);
          setIsLoading(false);
        }
      },
      onError: (error) => {
        console.error("Error fetching requests:", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    true,
  );

  const { remove: deleteRequest } = useDelete(
    `${apiEndpoints.offlineServiceRequestDelete}/${selectedRequestId}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message || "Request deleted successfully");
          fetchRequests();
        }
      },
      onError: (error) => {
        toast.error(handleValidationError(error) || "Failed to delete request");
      },
    },
  );

  useEffect(() => {
    fetchRequests();
  }, [pageIndex, pageSize, searchQuery]);

  const handlePageChange = (newPageIndex, newPageSize) => {
    if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
  };

  const handleDeleteClick = (requestId) => {
    setSelectedRequestId(requestId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    await deleteRequest({ id: selectedRequestId });
  };

  const handleCloseModal = () => {
    setSelectedRequestId(null);
    setModalOpen(false);
    setStatusChangeModalOpen(false);
  };

  const handleViewClick = (requestId) => {
    setSelectedRequestId(requestId);
    setModalOpen(true);
  };

  const { put: updateOfflineServiceRequestStatus } = usePut(
    apiEndpoints.updateOfflineServiceRequestStatus,
    {
      onSuccess: () => {
        toast.success(data.message || "Status updated Successfully");
        setStatusChangeModalOpen(false);
        setSelectedRequestId(null);
        fetchRequests();
      },
      onError: (error) => {
        toast.error(handleValidationError(error) || "Failed to update status");
      },
    },
  );

  const handleConfirmStatusChange = async (status, remark) => {
    updateOfflineServiceRequestStatus(selectedRequestId, { status, remark });
  };
  const columns = React.useMemo(
    () => [
      {
        accessorKey: "index",
        header: "SR.NO.",
        headerClassName: "text-center",
        cell: ({ row, index }) => (
          <div className="flex justify-center">
            {(pageIndex - 1) * pageSize + index + 1}
          </div>
        ),
      },
      {
        accessorKey: "fullName",
        header: "USER NAME",
        headerClassName: "text-center",
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-2">
            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
              {row.getValue("fullName")?.charAt(0)}
            </div>
            <span className="font-bold text-slate-900">
              {row.getValue("fullName")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "serviceName",
        header: "SERVICE NAME",
        headerClassName: "text-center",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span className="text-slate-700 font-medium capitalize">
              {row.getValue("serviceName")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "STATUS",
        headerClassName: "text-center",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <StatusBadge status={row.getValue("status")} />
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "SUBMITTED AT",
        headerClassName: "text-center",
        cell: ({ row }) => (
          <span className="text-slate-500 text-sm">
            {formatDate(row.getValue("createdAt"))}
          </span>
        ),
      },
      {
        id: "actions",
        header: "ACTIONS",
        headerClassName: "text-center",
        cell: ({ row }) => (
          <ActionButtons
            onView={() => handleViewClick(row.original._id)}
            onEdit={() => {
              setSelectedRequestId(row.original._id);
              setStatusChangeModalOpen(true);
            }}
            onDelete={() => handleDeleteClick(row.original._id)}
            className="justify-center"
          />
        ),
      },
    ],
    [pageIndex, pageSize],
  );

  return (
    <PageLayout
      title="Offline Services Requests"
      subtitle="Manage user requests for offline services."
      showBackButton={true}
      breadcrumbs={[
        { label: "Services", link: "/services/offline" },
        { label: "Offline Requests" }
      ]}
      className="max-w-[1600px] mx-auto"
    >
      <DataTable
        columns={columns}
        data={requests}
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
        exportData={requests}
        exportColumns={columns}
        fileName="Offline_Service_Requests"
      />

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Request"
        description="Are you sure you want to delete this offline service request? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />

      <OfflineServiceRequestModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        requestId={selectedRequestId}
      />

      <OfflineServiceRequestStatusChangeModal
        isOpen={statusChangeModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmStatusChange}
      />
    </PageLayout>
  );
}
