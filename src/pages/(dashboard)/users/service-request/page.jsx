import React, { useState, useEffect } from "react";
import { DataTable } from "../../../../components/tables/data-table";
import { PageLayout } from "../../../../components/layouts/page-layout";
import { ConfirmationModal } from "../../../../components/modals/confirmation-modal";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { toast } from "sonner";
import { useFetch } from "../../../../hooks/useFetch";
import { Check, UserPlus, XCircle } from "lucide-react";
import { usePatch } from "../../../../hooks/usePatch";
import { formatDate, handleValidationError } from "../../../../utils/helperFunction";
import { Button } from "../../../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Select } from "../../../../components/ui/select";
import { Textarea } from "../../../../components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../../../../components/ui/dropdown-menu";
import StatusBadge from "../../../../components/ui/StatusBadge";
import ClickToCopy from "../../../../components/ui/ClickToCopy";
export default function ServiceRequestsPage() {
  const [serviceRequests, setServiceRequests] = useState([]);
  const navigate = useNavigate();
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
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState({ service: null });
  const [serviceList, setServiceList] = useState([]);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const services = {
    aeps: "AEPS",
    dmt: "DMT",
    bbps: "Bill Payment",
    recharge: "Mobile Recharge"
  }

  const buildApiUrl = () => {
    let url = `${apiEndpoints?.serviceRequest}?page=${pageIndex}&limit=${pageSize}&service=${filter?.service || ""}`;
    if (searchQuery) {
      url += `&search=${encodeURIComponent(searchQuery)}`;
    }
    return url;
  };

  const { refetch: fetchUsersRequest } = useFetch(
    buildApiUrl(),
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          setServiceRequests(data?.data);
          setTotalRecords(data?.pagination?.total || 0);
          setIsLoading(false);
        }
      },
      onError: (error) => {
        console.error("Error fetching service request:", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    false,
  );

  const { refetch: fetchServices } = useFetch(
    `${apiEndpoints?.fetchServices}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          const temp = data?.data?.map((item) => ({
            label: item.label,
            value: item._id
          }))
          setServiceList(temp)
        }
      },
      onError: (error) => {
        console.error("Error fetching service:", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    true,
  );

  const { patch: rejectServiceRequest } = usePatch({
    onSuccess: () => {
      toast.success("Service request rejected successfully");
      setRejectModalOpen(false);
      setRejectionReason("");
      setSelectedRequest(null);
      setProcessing(false);
      fetchUsersRequest();
    },
    onError: (error) => {
      toast.error(handleValidationError(error) || "Failed to reject request");
      setProcessing(false);
    }
  });

  useEffect(() => {
    fetchUsersRequest();
  }, [pageIndex, pageSize, statusFilter, searchQuery, filter.service]);

  const handlePageChange = (newPageIndex, newPageSize) => {
    if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
  };

  const handleApprove = (row) => {
    const userId = row.original.userId || row.original.id;
    navigate(`/users/${userId}`, { state: { tab: "services" } });
  };

  const handleReject = (row) => {
    setSelectedRequest(row.original);
    setRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }

    setProcessing(true);
    try {
      await rejectServiceRequest(`${apiEndpoints?.rejectServiceRequest}/${selectedRequest._id}`, {
        status: "rejected",
        rejectionReason: rejectionReason.trim()
      });
    } catch (error) {
      console.error("Rejection failed:", error);
    }
  };

  const renderActionCell = ({ row }) => {
    const status = row.original.status?.toLowerCase();

    if (status === "assigned" || status === "approved" || status === "rejected") {
      return (
        <div className="flex justify-center">
          <StatusBadge status={status} />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2">
        <Button
          size="sm"
          onClick={() => handleApprove(row)}
          className="h-8 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1.5 group text-xs"
        >
          <UserPlus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          Assign
        </Button>
        <Button
          size="sm"
          onClick={() => handleReject(row)}
          className="h-8 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1.5 group text-xs"
        >
          <XCircle className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          Reject
        </Button>
      </div>
    );
  };

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "index",
        header: "ID",
        cell: ({ row, index }) => (
          <span className="font-semibold text-slate-500 text-[13px]">
            {(pageIndex - 1) * pageSize + index + 1}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "DATE",
        cell: ({ row }) => {
          return (
            <span className="text-slate-500 font-medium text-[13px]">
              {formatDate(row.getValue("createdAt"))}
            </span>
          )
        },
      },
      {
        accessorKey: "fullName",
        header: "FULL NAME",
        cell: ({ row }) => (
          <div className="flex flex-col items-center">
            <span className="font-semibold text-slate-900 text-[13px]">
              {row.getValue("fullName")}
            </span>
            <ClickToCopy text={row.original.userName}>
              <span className="text-[11px] text-center text-slate-500 font-medium hover:text-slate-700 cursor-pointer transition-colors inline-block mt-0.5">
                ( {row.original.userName} )
              </span>
            </ClickToCopy>
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
        accessorKey: "pipelineCode",
        header: "PIPELINE",
        cell: ({ row }) => (
          <span className="capitalize font-medium text-slate-600 text-[13px]">
            {row.getValue("pipelineCode") || "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "serviceName",
        header: "SERVICE",
        cell: ({ row }) => (
          <span className="capitalize font-medium text-slate-600 text-[13px]">
            {services[row.getValue("serviceName")] || row.getValue("serviceName") || "N/A"}
          </span>
        ),
      },
      {
        header: "Rejection Reason",
        accessorKey: "rejectionReason",
        cell: ({ row }) => {
          const text = row.original.rejectionReason || "---";
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <div className="max-w-[150px] md:max-w-[200px] truncate cursor-pointer group">
                  <span className="text-[11px] font-medium text-slate-400 capitalize whitespace-nowrap transition-colors duration-200 group-hover:text-indigo-600">
                    {text}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="max-w-[300px] p-3 bg-white border border-slate-200/60 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] rounded-xl z-[100]"
              >
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Full Description</p>
                  <p className="text-[11px] font-medium text-slate-600 leading-relaxed break-words">
                    {text}
                  </p>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
      },

      {
        id: "actions",
        header: "ACTIONS",
        cell: renderActionCell,
      },
    ],
    [pageIndex, pageSize],
  );

  return (
    <PageLayout title="Service Request" subtitle="Manage service requests."
      actions={
        <div className="flex flex-wrap xl:flex-nowrap items-center gap-2 sm:gap-3 w-full xl:w-auto">
          <div className="flex-1 md:w-full lg:flex-1 xl:flex-initial min-w-[140px] xl:min-w-[160px]">
            <Select
              placeholder="Select service"
              value={filter.service}
              onChange={(val) => setFilter({ ...filter, service: val })}
              options={serviceList}
              className="h-9 md:h-10 bg-white! border-slate-200 rounded-xl shadow-xs text-slate-700 font-medium w-full text-[12px]"
            />
          </div>
        </div>
      }>
      <DataTable
        columns={columns}
        data={serviceRequests}
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
        exportData={serviceRequests}
        exportColumns={columns}
        fileName="Service_Requests_Export"
      />

      <ConfirmationModal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setRejectionReason("");
          setSelectedRequest(null);
        }}
        onConfirm={confirmReject}
        title="Reject Service Request"
        description="Please provide a reason for rejecting this service request."
        confirmText="Reject Request"
        cancelText="Cancel"
        isDestructive={true}
        isButtonDisabled={processing}
      >
        <div className="mt-4">
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full p-2"
          />
        </div>
      </ConfirmationModal>
    </PageLayout>
  );
}
