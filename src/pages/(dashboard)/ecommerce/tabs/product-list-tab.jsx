import React, { useEffect, useMemo, useState } from "react";
import { DataTable } from "../../../../components/tables/data-table";
import { TableActions } from "../../../../components/shared/table-actions";
import { Button } from "../../../../components/ui/button";
import { Edit, Trash2 } from "@/components/icons";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { useFetch } from "../../../../hooks/useFetch";
import { useDelete } from "../../../../hooks/useDelete";
import { handleValidationError } from "../../../../utils/helperFunction";
import { ConfirmationModal } from "../../../../components/modals/confirmation-modal";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../../lib/utils";
import { ActionButtons } from "../../../../components/ui/ActionButtons";

export function ProductListTab({
  selectedProductId,
  setSelectedProductId,
  handleTabChange,
}) {
  const [columnVisibility, setColumnVisibility] = useState({});
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { refetch: fetchProducts } = useFetch(
    `${apiEndpoints.fetchProducts}?page=${pageIndex}&limit=${pageSize}&search=${searchQuery}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setProducts(data.data);
          setTotalRecords(data.pagination.total);
        }
        setIsLoading(false);
      },
      onError: (error) => {
        console.error("Error fetching products:", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    false,
  );

  const { remove: deleteProduct } = useDelete(
    `${apiEndpoints.deleteProduct}/${selectedProductId}`,
    {
      onSuccess: () => {
        toast.success("Product deleted successfully");
        fetchProducts();
      },
      onError: (error) => {
        toast.error(handleValidationError(error) || "Failed to delete product");
      },
    },
  );

  useEffect(() => {
    fetchProducts();
  }, [pageIndex, pageSize, searchQuery]);

  const handlePageChange = (newPageIndex, newPageSize) => {
    if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
  };

  const handleDeleteClick = (productId) => {
    setSelectedProductId(productId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    await deleteProduct();
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "SR.NO.",
        center: true,
        cell: ({ row, index }) => (
          <div className="flex items-center justify-center">
            <span className="font-semibold text-slate-500 text-[13px]">
              {(pageIndex - 1) * pageSize + index + 1}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "Product Details",
        center: true,
        cell: ({ row }) => (
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-slate-900 font-bold text-[13px]">
              {row.getValue("name")}
            </span>
            <span className="text-[11px] text-slate-400 font-medium tracking-tight">
              Model: {row.original.model || "Standard"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "stock",
        header: "Stock",
        center: true,
        cell: ({ row }) => {
          const stock = Number(row.getValue("stock"));
          return (
            <div className="flex items-center justify-center">
              <span className={cn(
                "px-2 py-0.5 rounded-lg text-[11px] font-bold border",
                stock > 10
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-rose-50 text-rose-700 border-rose-100"
              )}>
                {stock} Units
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "price",
        header: "Base Price",
        center: true,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span className="font-medium text-slate-400 text-[12px] line-through decoration-slate-300">
              ₹{Number(row.getValue("price")).toLocaleString("en-IN")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "discount",
        header: "Offer",
        center: true,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <div className="inline-flex items-center px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[10px] font-bold uppercase tracking-wider">
              {row.original.discountType === "flat" ? "₹" : ""}
              {row.getValue("discount")}
              {row.original.discountType === "flat" ? "" : "%"} OFF
            </div>
          </div>
        ),
      },
      {
        accessorKey: "priceAfterDiscount",
        header: "Final Price",
        center: true,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span className="font-bold text-slate-900 text-[14px]">
              ₹{Number(row.getValue("priceAfterDiscount")).toLocaleString("en-IN")}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        center: true,
        cell: ({ row }) => (
          <ActionButtons
            onEdit={() => {
              setSelectedProductId(row.original._id);
              handleTabChange("product_update");
            }}
            onDelete={() => handleDeleteClick(row.original._id)}
          />
        ),
      },
    ],
    [pageIndex, pageSize, handleTabChange, setSelectedProductId],
  );

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        pageSize={pageSize}
        totalRecords={totalRecords}
        onPaginationChange={({ pageIndex, pageSize }) => {
          handlePageChange(pageIndex, pageSize);
          setIsLoading(true);
        }}
        onSearch={(val) => {
          setPageIndex(1);
          setSearchQuery(val);
        }}
        exportData={products}
        fileName="Product_List_Report"
      />

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  );
}
