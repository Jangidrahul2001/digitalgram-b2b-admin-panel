import React, { useEffect, useMemo, useState } from "react";
import { DataTable } from "../../../../components/tables/data-table";
import { TableActions } from "../../../../components/shared/table-actions";
import { Button } from "../../../../components/ui/button";
import { Eye, Edit } from "@/components/icons";
import { useFetch } from "../../../../hooks/useFetch";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { formatDate } from "../../../../utils/helperFunction";
import { ActionButtons } from "../../../../components/ui/ActionButtons";

export function OrderListTab({ handleTabChange, setSelectedOrderId }) {
  const [columnVisibility, setColumnVisibility] = useState({});
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const { refetch: fetchOrders } = useFetch(
    `${apiEndpoints.fetchOrders}?page=${pageIndex}&limit=${pageSize}&search=${searchQuery}`,
    {
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          setOrders(data?.data || []);
          setTotalRecords(data?.pagination?.total);
        }
        setIsLoading(false);
      },
      onError: (error) => {
        console.error("Error fetching orders:", error);
        setIsLoading(false);
      },
    },
    false,
  );
  useEffect(() => {
    fetchOrders();
  }, [pageIndex, pageSize, searchQuery]);

  const handlePageChange = (newPageIndex, newPageSize) => {
    if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrderId(order._id);
    handleTabChange("order_view");
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "index",
        header: "SR. No.",
        cell: ({ row, index }) => (
          <div className="flex items-center gap-2 pl-2">
            <span className="font-semibold text-slate-500 text-[13px]">
              {(pageIndex - 1) * pageSize + index + 1}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "fullName",
        header: "Customer",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-slate-900 font-bold text-[13px]">
              {row.getValue("fullName")}
            </span>
            <span className="text-[11px] text-slate-400 font-medium tracking-tight">
              ID: {row.original._id?.slice(-8).toUpperCase()}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "productName",
        header: "Product Ordered",
        cell: ({ row }) => (
          <span className="text-slate-600 font-medium text-[13px] truncate max-w-[180px] block">
            {row.getValue("productName")}
          </span>
        ),
      },
      {
        accessorKey: "quantity",
        header: "Qty",
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span className="h-6 w-6 flex items-center justify-center rounded-lg bg-slate-50 text-slate-900 font-bold text-[11px] border border-slate-100">
              {row.getValue("quantity")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "grandTotal",
        header: "Total Amount",
        cell: ({ row }) => (
          <span className="font-bold text-slate-900 text-[14px]">
            ₹{Number(row.getValue("grandTotal")).toLocaleString("en-IN")}
          </span>
        ),
      },
      {
        accessorKey: "orderStatus",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("orderStatus")?.toLowerCase();

          const styles = {
            completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
            pending: "bg-amber-50 text-amber-700 border-amber-100",
            processing: "bg-indigo-50 text-indigo-700 border-indigo-100",
            cancelled: "bg-rose-50 text-rose-700 border-rose-100",
          };

          const dots = {
            completed: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]",
            pending: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]",
            processing: "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]",
            cancelled: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]",
          };

          return (
            <div className="flex justify-start">
              <div className={`
                inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all
                ${styles[status] || "bg-slate-50 text-slate-600 border-slate-100"}
              `}>
                <div className={`
                  h-1.5 w-1.5 rounded-full animate-pulse
                  ${dots[status] || "bg-slate-400"}
                `} />
                {status}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-[12px] text-slate-500 font-medium whitespace-nowrap">
            {formatDate(row.getValue("createdAt"))}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <ActionButtons onView={()=>handleViewOrder(row.original)} viewTitle="View Order" />  
         
        ),
      },
    ],
    [pageIndex, pageSize, handleViewOrder],
  );


  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={orders}
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
        exportData={orders}
        fileName="Order_History_Report"
      />
    </div>
  );
}
