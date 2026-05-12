"use client";

import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFetch } from "../../../../hooks/useFetch";
import { useDelete } from "../../../../hooks/useDelete";
import { motion } from "framer-motion";
import { Button } from "../../../../components/ui/button";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { Plus, Trash2, Eye, Edit, Check } from "@/components/icons";
import { DataTable } from "../../../../components/tables/data-table";
import { PageLayout } from "../../../../components/layouts/page-layout";
import { handleValidationError } from "../../../../utils/helperFunction";
import { ConfirmationModal } from "../../../../components/modals/confirmation-modal";
import { OfflineServiceModal } from "../../../../components/modals/offline-service-modal";
import { ActionButtons } from "../../../../components/ui/ActionButtons";
export default function OfflineServicesPage() {
  const navigate = useNavigate();
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [offlineServiceList, setOfflineServiceList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    serviceId: null,
  });

  const [viewModal, setViewModal] = useState({
    isOpen: false,
    serviceId: null,
  });

  const buildApiUrl = () => {
    let url = `${apiEndpoints?.fetchOfflineServices}?page=${pageIndex}&limit=${pageSize}`;
    if (searchQuery) {
      url += `&search=${encodeURIComponent(searchQuery)}`;
    }
    return url;
  };

  const { refetch: fetchOfflineServices } = useFetch(
    buildApiUrl(),
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          setOfflineServiceList(data?.data);
          setTotalRecords(data?.pagination?.total || 0);
          setIsLoading(false);
        }
      },
      onError: (error) => {
        console.error("Error fetching offline services:", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    false,
  );

  const { remove } = useDelete(
    apiEndpoints.deleteOfflineService + `/${deleteModal.serviceId}`,
    {
      onSuccess: (data) => {
        toast.success(data.message || "Service deleted successfully");
        fetchOfflineServices();
      },
      onError: (error) => {
        toast.error(handleValidationError(error) || "Failed to delete service");
      },
    },
  );

  useEffect(() => {
    fetchOfflineServices();
  }, [pageIndex, pageSize, searchQuery]);

  const handlePageChange = (newPageIndex, newPageSize) => {
    if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
  };

  const handleDeleteClick = (serviceId) => {
    setDeleteModal({ isOpen: true, serviceId });
  };

  const handleViewClick = (serviceId) => {
    setViewModal({ isOpen: true, serviceId });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.serviceId) {
      remove({ _id: deleteModal.serviceId });
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "SR.NO.",
        headerClassName: "text-center",
        cell: ({ row, index }) => (
          <div className="flex justify-center">
            {(pageIndex - 1) * pageSize + index + 1}
          </div>
        ),
      },
      {
        accessorKey: "serviceName",
        header: "SERVICE NAME",
        headerClassName: "text-center",
        cell: ({ row }) => (
          <span className="font-bold text-slate-900">
            {row.getValue("serviceName")}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: "AMOUNT",
        headerClassName: "text-center",
        cell: ({ row }) => (
          <span className="text-slate-600 font-medium">
            ₹ {row.getValue("amount")}
          </span>
        ),
      },
      {
        id: "actions",
        header: "ACTIONS",
        headerClassName: "text-center",
        cell: ({ row }) => (
          <ActionButtons
            onEdit={() =>
              navigate("/services/offline/new", {
                state: { _id: row.original._id, action: "edit" },
              })
            }
            onView={() => handleViewClick(row.original._id)}
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
      title="Offline Services"
      subtitle="Manage and configure your offline service offerings."
      actions={
        <div className="flex items-center gap-3">
          <Link to="/services/offline/requests">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm shadow-slate-900/20 rounded-xl px-6 h-9 md:h-10">
                <Check className="w-4 h-4 mr-2 " /> User Request
              </Button>
            </motion.div>
          </Link>
          <Link to="/services/offline/new">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm shadow-slate-900/20 rounded-xl px-6 h-9 md:h-10">
                <Plus className="w-4 h-4 mr-2" /> Add More Service
              </Button>
            </motion.div>
          </Link>
        </div>
      }
    >
      <DataTable
        columns={columns}
        data={offlineServiceList}
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
        exportData={offlineServiceList}
        exportColumns={columns}
        fileName="Offline_Services_List"
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, serviceId: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Service"
        description="Are you sure you want to delete this service? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />

      <OfflineServiceModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, serviceId: null })}
        serviceId={viewModal.serviceId}
      />
    </PageLayout>
  );
}
