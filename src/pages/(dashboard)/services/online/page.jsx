"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "../../../../components/ui/button";
import { Plus, Trash2, ExternalLink } from "@/components/icons";
import { DataTable } from "../../../../components/tables/data-table";
import { PageLayout } from "../../../../components/layouts/page-layout";
import { ConfirmationModal } from "../../../../components/modals/confirmation-modal";
import { cn } from "../../../../lib/utils";
import { useFetch } from "../../../../hooks/useFetch";
import { useDelete } from "../../../../hooks/useDelete";
import { toast } from "sonner";
import { handleValidationError } from "../../../../utils/helperFunction";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import StatusBadge from "../../../../components/ui/StatusBadge";
import { ActionButtons } from "../../../../components/ui/ActionButtons";
import ImageModal from "../../../../components/ui/ImageModal";

export default function OnlineServicesPage() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    images: []
  });

  const handleViewImage = (imageUrl) => {
    if (!imageUrl) {
      toast.error("No image available");
      return;
    }
    setImageModal({
      isOpen: true,
      images: [`${import.meta.env.VITE_API_URL}${imageUrl}`]
    });
  };

  const buildApiUrl = () => {
    let url = `${apiEndpoints.fetchOnlineService}?page=${pageIndex}&limit=${pageSize}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    return url;
  };

  const { refetch: fetchServices } = useFetch(
    buildApiUrl(),
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          setServices(data?.data);
          setTotalRecords(data?.pagination?.total || 0);
        }
        setIsLoading(false);
      },
      onError: (error) => {
        console.error("Error fetching services:", error);
        toast.error(handleValidationError(error) || "Failed to fetch services");
        setIsLoading(false);
      },
    },
    false
  );

  const { remove: deleteService } = useDelete(`${apiEndpoints.deleteOnlineService}/${selectedService?._id}`, {
    onSuccess: () => {
      toast.success("Service deleted successfully");
      fetchServices();
      setShowDeleteModal(false);
      setSelectedService(null);
      setIsUpdating(false);
    },
    onError: (error) => {
      toast.error(handleValidationError(error) || "Failed to delete service");
    },
  });

  useEffect(() => {
    fetchServices();
  }, [pageIndex, pageSize, search]);

  const handlePageChange = (newPageIndex, newPageSize) => {
    if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
      setIsLoading(true);
    }
  };

  const handleDeleteClick = (service) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (selectedService) {
      deleteService({ id: selectedService._id });
    }
  };

  // Define Columns for DataTable
  const columns = [
    {
      accessorKey: "index",
      header: "SR.NO.",
      headerClassName: "text-center",
      cell: ({ row, index }) => (
        <div className="flex items-center justify-center">
          <span className="font-semibold text-slate-600">
            {(pageIndex - 1) * pageSize + index + 1}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "serviceName",
      header: "SERVICE NAME",
      headerClassName: "text-center",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <span className="font-bold text-slate-900 whitespace-nowrap">{row.getValue("serviceName")}</span>
        </div>
      ),
    },
    {
      accessorKey: "serviceUrl",
      header: "SERVICE URL",
      headerClassName: "text-center",
      cell: ({ row }) => (
        <a
          href={row.getValue("serviceUrl")}
          target="_blank"
          rel="noreferrer"
          className="text-slate-500 hover:text-blue-600 font-medium flex items-center justify-center gap-1 transition-colors whitespace-nowrap"
        >
          {row.getValue("serviceUrl")}
          <ExternalLink className="w-3 h-3" />
        </a>
      ),
    },
    {
      accessorKey: "serviceImageUrl",
      header: "IMAGE",
      headerClassName: "text-center",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <div
            className="h-10 w-14 overflow-hidden rounded-sm flex items-center justify-center border border-slate-200 shadow-xs bg-slate-50/50 cursor-pointer"
            onClick={() => handleViewImage(row.getValue("serviceImageUrl"))}
            title="View Image"
          >
            <img
              src={`${import.meta.env.VITE_API_URL}${row.getValue("serviceImageUrl")}`}
              alt={row.original.serviceName}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.src = "https://placehold.co/60x40?text=IMG";
              }}
            />
          </div>
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "STATUS",
      headerClassName: "text-center",
      cell: ({ row }) => (
        <div className="flex items-center justify-center mt-1">
          <StatusBadge status={row.getValue("isActive") ? "active" : "inactive"} />
        </div>
      ),
    },
    {
      id: "actions",
      header: "ACTIONS",
      headerClassName: "text-center",
      cell: ({ row }) => (
        <ActionButtons
          onDelete={() => handleDeleteClick(row.original)}
          className="justify-center"
        />
      ),
    },
  ];

  return (
    <PageLayout
      title="Online Services"
      subtitle="Manage your external link services."
      actions={
        <div className="flex items-center gap-3">
          <Link to="/services/online/new">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
              <Button
                className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 rounded-xl px-6 h-9 md:h-10"
              >
                <Plus className="w-4 h-4 mr-2" /> Add More Service
              </Button>
            </motion.div>
          </Link>
        </div>
      }
    >
      <DataTable
        columns={columns}
        data={services}
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
        exportData={services}
        exportColumns={columns}
        fileName="Online_Services"
      />

      <ConfirmationModal
        isButtonDisabled={isUpdating}
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedService(null);
          setIsUpdating(false)
        }}
        onConfirm={() => { setIsUpdating(true); handleConfirmDelete() }}
        title="Delete Service"
        description={`Are you sure you want to delete "${selectedService?.serviceName}"? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive={true}
      />
      <ImageModal
        isOpen={imageModal.isOpen}
        onClose={() => setImageModal({ isOpen: false, images: [] })}
        images={imageModal.images}
      />
    </PageLayout>
  );
}
